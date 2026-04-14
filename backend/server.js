require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const SupportTicket = require('./models/SupportTicket');
const Investment = require('./models/Investment');
const Trade = require('./models/Trade');

const app = express();
const PORT = process.env.PORT || 5000;
const AUTH_SECRET = process.env.AUTH_SECRET || 'tradilink-local-secret';
let isDatabaseReady = false;

const editableUserFields = [
  'fullName',
  'email',
  'role',
  'status',
  'mainBalance',
  'interestBalance',
  'totalDeposit',
  'totalEarn',
  'totalInvest',
  'totalPayout',
  'totalTicket',
  'totalReferralBonus',
  'lastReferralBonus',
  'referralCode',
  'referralCount',
];

const INVESTMENT_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    minimum: 5000,
    minInvestment: 5000,
    maxInvestment: 120000,
    returnRateLabel: '150% Daily',
    durationDays: 30,
    roi: '+150% ROI',
  },
  {
    id: 'beginner-plan',
    name: 'Beginner Plan',
    minimum: 2000,
    minInvestment: 2000,
    maxInvestment: 25000,
    returnRateLabel: '16% Daily',
    durationDays: 25,
    roi: '+16% ROI',
  },
  {
    id: 'standard-plan',
    name: 'Standard Plan',
    minimum: 25000,
    minInvestment: 25000,
    maxInvestment: 100000,
    returnRateLabel: '2.5% Daily',
    durationDays: 60,
    roi: '+2.5% ROI',
  },
  {
    id: 'business-plan',
    name: 'Business Plan',
    minimum: 100000,
    minInvestment: 100000,
    maxInvestment: 1000000,
    returnRateLabel: '3.1% Daily',
    durationDays: 60,
    roi: '+3.1% ROI',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    minimum: 35000,
    minInvestment: 35000,
    maxInvestment: 250000,
    returnRateLabel: '25% Daily',
    durationDays: 40,
    roi: '+25% ROI',
  },
];

const MARKET_BASELINES = {
  pair: 'BTCUSDT',
  timeframe: '30m',
  exchange: 'Binance',
  basePrice: 71403.18,
  baseVolume: 180,
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in environment variables');
} else {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      isDatabaseReady = true;
      console.log('Successfully connected to MongoDB Cluster');
    })
    .catch((err) => {
      isDatabaseReady = false;
      console.error('Error connecting to MongoDB:', err.message);
    });
}

mongoose.connection.on('connected', () => {
  isDatabaseReady = true;
});

mongoose.connection.on('disconnected', () => {
  isDatabaseReady = false;
  console.error('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  isDatabaseReady = false;
  console.error('MongoDB connection error:', err.message);
});

function ensureDatabaseConnection(req, res, next) {
  if (!isDatabaseReady) {
    return res.status(503).json({
      message: 'Database is unavailable. Check your MongoDB connection and server logs.',
    });
  }

  next();
}

function encodeToken(payload) {
  const serializedPayload = JSON.stringify(payload);
  const base64Payload = Buffer.from(serializedPayload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(base64Payload)
    .digest('base64url');

  return `${base64Payload}.${signature}`;
}

function decodeToken(token) {
  const [base64Payload, signature] = token.split('.');

  if (!base64Payload || !signature) {
    throw new Error('Invalid token structure');
  }

  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(base64Payload)
    .digest('base64url');

  if (signature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));

  if (payload.exp < Date.now()) {
    throw new Error('Token expired');
  }

  return payload;
}

function createAuthToken(user) {
  return encodeToken({
    sub: user._id.toString(),
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24,
  });
}

function createReferralCodeSeed(fullName = '', email = '') {
  const baseName = fullName.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4);
  const baseEmail = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4);
  const base = (baseName || baseEmail || 'TG').padEnd(4, 'X');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${base}${random}`;
}

async function generateUniqueReferralCode(fullName, email) {
  let referralCode = createReferralCodeSeed(fullName, email);

  while (await User.exists({ referralCode })) {
    referralCode = createReferralCodeSeed(fullName, email);
  }

  return referralCode;
}

async function ensureUserReferralCode(user) {
  if (user.referralCode) {
    return user.referralCode;
  }

  user.referralCode = await generateUniqueReferralCode(user.fullName, user.email);
  await user.save();
  return user.referralCode;
}

async function findReferrerByIdentifier(identifier) {
  const normalizedIdentifier = String(identifier || '').trim();

  if (!normalizedIdentifier) {
    return null;
  }

  let referrer = await User.findOne({
    referralCode: normalizedIdentifier.toUpperCase(),
  });

  if (referrer) {
    return referrer;
  }

  if (mongoose.Types.ObjectId.isValid(normalizedIdentifier)) {
    referrer = await User.findById(normalizedIdentifier);
  }

  return referrer;
}

function serializeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    mainBalance: user.mainBalance,
    interestBalance: user.interestBalance,
    totalDeposit: user.totalDeposit,
    totalEarn: user.totalEarn,
    totalInvest: user.totalInvest,
    totalPayout: user.totalPayout,
    totalTicket: user.totalTicket,
    totalReferralBonus: user.totalReferralBonus,
    lastReferralBonus: user.lastReferralBonus,
    referralCode: user.referralCode || '',
    referralCount: user.referralCount || 0,
    linkedWallets: Array.isArray(user.linkedWallets)
      ? user.linkedWallets.map((wallet, index) => ({
          id: wallet._id || `${wallet.provider || 'wallet'}-${index}`,
          provider: wallet.provider || '',
          walletLabel: wallet.walletLabel || '',
          walletAddress: wallet.walletAddress || '',
          status: wallet.status || 'connected',
          connectedAt: wallet.connectedAt || null,
        }))
      : [],
    createdAt: user.createdAt,
  };
}

function createReference(prefix) {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${timestamp}-${random}`;
}

function formatLivePrice(value, decimals = 2, prefix = '') {
  return `${prefix}${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function createMarketOverviewSnapshot() {
  const now = new Date();
  const minuteSeed = Math.floor(now.getTime() / 10000);
  const chart = [];
  let previousClose =
    MARKET_BASELINES.basePrice +
    Math.sin(minuteSeed / 3) * 140 +
    Math.cos(minuteSeed / 5) * 55;

  for (let index = 0; index < 10; index += 1) {
    const candleSeed = minuteSeed - (9 - index);
    const open = previousClose;
    const close =
      open +
      Math.sin(candleSeed / 2.4) * 48 +
      Math.cos(candleSeed / 1.7) * 26;
    const high = Math.max(open, close) + 34 + (Math.abs(Math.sin(candleSeed)) * 42);
    const low = Math.min(open, close) - 28 - (Math.abs(Math.cos(candleSeed)) * 36);
    const labelDate = new Date(now.getTime() - (9 - index) * 30 * 60 * 1000);

    chart.push({
      label: labelDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      open: Number(open.toFixed(2)),
      close: Number(close.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
    });

    previousClose = close;
  }

  const latest = chart[chart.length - 1];
  const first = chart[0];
  const changePercent = (((latest.close - first.open) / first.open) * 100).toFixed(2);
  const ethPrice = 2193.13 + Math.sin(minuteSeed / 4) * 18;
  const eurUsd = 1.0814 + Math.sin(minuteSeed / 8) * 0.0024;
  const gbpUsd = 1.2642 + Math.cos(minuteSeed / 7) * 0.0021;
  const aapl = 195.1 + Math.sin(minuteSeed / 5) * 2.4;
  const tsla = 850.2 + Math.cos(minuteSeed / 6) * 12.6;

  return {
    pairs: [
      { symbol: 'BTC/USDT', price: formatLivePrice(latest.close, 2, '$'), accent: 'btc' },
      { symbol: 'ETH/USDT', price: formatLivePrice(ethPrice, 2, '$'), accent: 'eth' },
      { symbol: 'EUR/USD', price: formatLivePrice(eurUsd, 4), accent: 'fx' },
      { symbol: 'GBP/USD', price: formatLivePrice(gbpUsd, 4), accent: 'fx' },
      { symbol: 'AAPL', price: formatLivePrice(aapl, 2), accent: 'stock' },
      { symbol: 'TSLA', price: formatLivePrice(tsla, 2), accent: 'stock' },
    ],
    chart,
    summary: {
      pair: MARKET_BASELINES.pair,
      timeframe: MARKET_BASELINES.timeframe,
      exchange: MARKET_BASELINES.exchange,
      volume: `BTC ${(MARKET_BASELINES.baseVolume + Math.abs(Math.sin(minuteSeed / 3)) * 24).toFixed(0)}`,
      lastPrice: formatLivePrice(latest.close, 2),
      change: `${Number(changePercent) >= 0 ? '+' : ''}${changePercent}%`,
      open: formatLivePrice(latest.open, 2),
      high: formatLivePrice(latest.high, 2),
      low: formatLivePrice(latest.low, 2),
      close: formatLivePrice(latest.close, 2),
    },
  };
}

function serializeTransaction(transaction) {
  return {
    id: transaction._id,
    type: transaction.type,
    status: transaction.status,
    amount: transaction.amount,
    method: transaction.method,
    direction: transaction.direction,
    reference: transaction.reference,
    details: transaction.details,
    purpose: transaction.purpose || 'general',
    planId: transaction.planId || '',
    planName: transaction.planName || '',
    createdAt: transaction.createdAt,
  };
}

function serializeTicket(ticket) {
  return {
    id: ticket._id,
    department: ticket.department,
    subject: ticket.subject,
    priority: ticket.priority,
    message: ticket.message,
    status: ticket.status,
    reference: ticket.reference,
    createdAt: ticket.createdAt,
  };
}

function serializeReferralUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
  };
}

function serializeInvestment(investment) {
  return {
    id: investment._id,
    planId: investment.planId,
    planName: investment.planName,
    amount: investment.amount,
    minAmount: investment.minAmount,
    maxAmount: investment.maxAmount,
    returnRateLabel: investment.returnRateLabel,
    fundingMethod: investment.fundingMethod || '',
    fundingReference: investment.fundingReference || '',
    projectedDailyReturn: investment.projectedDailyReturn,
    durationDays: investment.durationDays,
    status: investment.status,
    createdAt: investment.createdAt,
  };
}

function serializeTrade(trade) {
  return {
    id: trade._id,
    asset: trade.asset,
    amount: trade.amount,
    leverage: trade.leverage,
    expiration: trade.expiration,
    side: trade.side,
    status: trade.status,
    createdAt: trade.createdAt,
  };
}

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = decodeToken(token);
    const user = await User.findById(payload.sub).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User session is invalid' });
    }

    await ensureUserReferralCode(user);
    req.authUser = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.authUser.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}

app.get('/api/health', (req, res) => {
  res.status(isDatabaseReady ? 200 : 503).json({
    ok: isDatabaseReady,
    database: isDatabaseReady ? 'connected' : 'disconnected',
  });
});

app.post('/api/signup', ensureDatabaseConnection, async (req, res) => {
  try {
    const { fullName, email, password, referralCode } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    let referrer = null;

    if (referralCode) {
      referrer = await findReferrerByIdentifier(referralCode);

      if (!referrer) {
        return res.status(400).json({ message: 'Referral link is invalid or expired' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      referralCode: await generateUniqueReferralCode(fullName, normalizedEmail),
      referredBy: referrer?._id || null,
    });

    await newUser.save();

    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 },
      });
    }

    res.status(201).json({
      message: 'Account created successfully',
      token: createAuthToken(newUser),
      user: serializeUser(newUser),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

app.post('/api/login', ensureDatabaseConnection, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await ensureUserReferralCode(user);

    res.status(200).json({
      message: 'Login successful',
      token: createAuthToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/users/:id', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const isSameUser = req.authUser._id.toString() === requestedUserId;
    const isAdmin = req.authUser.role === 'admin';

    if (!isSameUser && !isAdmin) {
      return res.status(403).json({ message: 'You cannot view this account' });
    }

    const user = await User.findById(requestedUserId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await ensureUserReferralCode(user);

    res.status(200).json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

app.put('/api/users/:id/wallets', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const isSameUser = req.authUser._id.toString() === requestedUserId;
    const isAdmin = req.authUser.role === 'admin';

    if (!isSameUser && !isAdmin) {
      return res.status(403).json({ message: 'You cannot update this account' });
    }

    const { action, provider, walletLabel, walletAddress, walletId } = req.body;
    const normalizedAction = String(action || 'add').trim().toLowerCase();

    const user = await User.findById(requestedUserId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!Array.isArray(user.linkedWallets)) {
      user.linkedWallets = [];
    }

    if (normalizedAction === 'remove') {
      if (!walletId) {
        return res.status(400).json({ message: 'Wallet identifier is required for removal' });
      }

      user.linkedWallets = user.linkedWallets.filter(
        (wallet) => wallet._id?.toString() !== String(walletId),
      );

      await user.save();

      return res.status(200).json({
        message: 'Wallet connection removed successfully',
        user: serializeUser(user),
      });
    }

    const normalizedProvider = String(provider || '').trim();
    const normalizedLabel = String(walletLabel || '').trim();
    const normalizedAddress = String(walletAddress || '').trim();

    if (!normalizedProvider || !normalizedAddress) {
      return res.status(400).json({ message: 'Provider and wallet address are required' });
    }

    const alreadyLinked = user.linkedWallets.some(
      (wallet) =>
        wallet.provider?.toLowerCase() === normalizedProvider.toLowerCase() &&
        wallet.walletAddress?.toLowerCase() === normalizedAddress.toLowerCase(),
    );

    if (alreadyLinked) {
      return res.status(409).json({ message: 'This wallet is already linked to your account' });
    }

    user.linkedWallets.unshift({
      provider: normalizedProvider,
      walletLabel: normalizedLabel || `${normalizedProvider} wallet`,
      walletAddress: normalizedAddress,
      status: 'connected',
      connectedAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      message: 'Wallet connected successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Wallet update error:', error);
    res.status(500).json({ message: 'Server error updating wallets' });
  }
});

app.get('/api/referrals', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.authUser._id })
      .sort({ createdAt: -1 })
      .select('fullName email status createdAt');

    res.status(200).json({
      referrals: referrals.map(serializeReferralUser),
    });
  } catch (error) {
    console.error('List referrals error:', error);
    res.status(500).json({ message: 'Server error while loading referrals' });
  }
});

app.get('/api/investment-plans', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const plans = INVESTMENT_PLANS.map((plan) => ({
      ...plan,
      potentialReturn: Number((plan.minimum * (parseFloat(plan.returnRateLabel) / 100)).toFixed(2)),
    }));

    res.status(200).json({ plans });
  } catch (error) {
    console.error('List investment plans error:', error);
    res.status(500).json({ message: 'Server error while loading investment plans' });
  }
});

app.get('/api/investments', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.authUser._id }).sort({ createdAt: -1 });

    res.status(200).json({
      investments: investments.map(serializeInvestment),
    });
  } catch (error) {
    console.error('List investments error:', error);
    res.status(500).json({ message: 'Server error while loading investments' });
  }
});

app.get('/api/market-overview', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    res.status(200).json(createMarketOverviewSnapshot());
  } catch (error) {
    console.error('Market overview error:', error);
    res.status(500).json({ message: 'Server error while loading market overview' });
  }
});

app.get('/api/trades', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.authUser._id }).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      trades: trades.map(serializeTrade),
    });
  } catch (error) {
    console.error('List trades error:', error);
    res.status(500).json({ message: 'Server error while loading trades' });
  }
});

app.post('/api/trades', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const { asset, amount, leverage, expiration, side } = req.body;

    if (!asset || !amount || !side) {
      return res.status(400).json({ message: 'Asset, amount, and side are required' });
    }

    const trade = await Trade.create({
      user: req.authUser._id,
      asset: String(asset).trim(),
      amount: Number(amount),
      leverage: String(leverage || '').trim(),
      expiration: String(expiration || '').trim(),
      side: String(side).trim().toLowerCase(),
      status: 'pending',
    });

    res.status(201).json({
      message: `${trade.asset} ${trade.side.toUpperCase()} order placed successfully`,
      trade: serializeTrade(trade),
    });
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ message: 'Server error while placing trade' });
  }
});

app.post('/api/investment-plans/subscribe', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const { planId, amount } = req.body;
    const selectedPlan = INVESTMENT_PLANS.find((plan) => plan.id === String(planId || '').trim());
    const normalizedAmount = Number(amount);

    if (!selectedPlan) {
      return res.status(404).json({ message: 'Investment plan not found' });
    }

    if (!Number.isFinite(normalizedAmount)) {
      return res.status(400).json({ message: 'Enter a valid investment amount' });
    }

    if (
      normalizedAmount < selectedPlan.minInvestment ||
      normalizedAmount > selectedPlan.maxInvestment
    ) {
      return res.status(400).json({
        message: `Amount must be between $${selectedPlan.minInvestment.toLocaleString()} and $${selectedPlan.maxInvestment.toLocaleString()}`,
      });
    }

    const projectedDailyReturn = Number(
      (normalizedAmount * (parseFloat(selectedPlan.returnRateLabel) / 100)).toFixed(2),
    );

    const investment = await Investment.create({
      user: req.authUser._id,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      amount: normalizedAmount,
      minAmount: selectedPlan.minInvestment,
      maxAmount: selectedPlan.maxInvestment,
      returnRateLabel: selectedPlan.returnRateLabel,
      projectedDailyReturn,
      durationDays: selectedPlan.durationDays,
      status: 'pending',
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.authUser._id,
      {
        $inc: { totalInvest: normalizedAmount },
      },
      { new: true },
    ).select('-password');

    res.status(201).json({
      message: `${selectedPlan.name} joined successfully`,
      investment: serializeInvestment(investment),
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error('Join investment plan error:', error);
    res.status(500).json({ message: 'Server error while joining investment plan' });
  }
});

app.get('/api/transactions', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.authUser._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      transactions: transactions.map(serializeTransaction),
    });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ message: 'Server error while loading transactions' });
  }
});

app.post('/api/deposits', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const { amount, method, details, purpose, planId } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ message: 'Amount and method are required' });
    }

    const normalizedPurpose = String(purpose || 'general').trim().toLowerCase();
    const selectedPlan =
      normalizedPurpose === 'investment-plan'
        ? INVESTMENT_PLANS.find((plan) => plan.id === String(planId || '').trim())
        : null;

    if (normalizedPurpose === 'investment-plan' && !selectedPlan) {
      return res.status(404).json({ message: 'Selected investment plan was not found' });
    }

    if (
      selectedPlan &&
      (Number(amount) < selectedPlan.minInvestment || Number(amount) > selectedPlan.maxInvestment)
    ) {
      return res.status(400).json({
        message: `Funding amount must be between $${selectedPlan.minInvestment.toLocaleString()} and $${selectedPlan.maxInvestment.toLocaleString()} for ${selectedPlan.name}`,
      });
    }

    const transaction = await Transaction.create({
      user: req.authUser._id,
      type: 'deposit',
      status: 'pending',
      amount: Number(amount),
      method,
      direction: 'credit',
      details: details || '',
      purpose: selectedPlan ? 'investment-plan' : 'general',
      planId: selectedPlan?.id || '',
      planName: selectedPlan?.name || '',
      reference: createReference('DEP'),
    });

    let investment = null;

    if (selectedPlan) {
      investment = await Investment.create({
        user: req.authUser._id,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: Number(amount),
        minAmount: selectedPlan.minInvestment,
        maxAmount: selectedPlan.maxInvestment,
        returnRateLabel: selectedPlan.returnRateLabel,
        fundingMethod: method,
        fundingReference: transaction.reference,
        projectedDailyReturn: Number(
          (Number(amount) * (parseFloat(selectedPlan.returnRateLabel) / 100)).toFixed(2),
        ),
        durationDays: selectedPlan.durationDays,
        status: 'pending',
      });

      await User.findByIdAndUpdate(req.authUser._id, {
        $inc: { totalInvest: Number(amount) },
      });
    }

    res.status(201).json({
      message: selectedPlan
        ? `Deposit request created for ${selectedPlan.name}`
        : 'Deposit request created successfully',
      transaction: serializeTransaction(transaction),
      investment: investment ? serializeInvestment(investment) : null,
    });
  } catch (error) {
    console.error('Create deposit error:', error);
    res.status(500).json({ message: 'Server error while creating deposit request' });
  }
});

app.get('/api/withdrawals', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      user: req.authUser._id,
      type: 'withdrawal',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      withdrawals: withdrawals.map(serializeTransaction),
    });
  } catch (error) {
    console.error('List withdrawals error:', error);
    res.status(500).json({ message: 'Server error while loading withdrawals' });
  }
});

app.post('/api/withdrawals', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const { amount, method, details } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ message: 'Amount and method are required' });
    }

    const transaction = await Transaction.create({
      user: req.authUser._id,
      type: 'withdrawal',
      status: 'pending',
      amount: Number(amount),
      method,
      direction: 'debit',
      details: details || '',
      reference: createReference('WDL'),
    });

    res.status(201).json({
      message: 'Withdrawal request created successfully',
      transaction: serializeTransaction(transaction),
    });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({ message: 'Server error while creating withdrawal request' });
  }
});

app.get('/api/support-tickets', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.authUser._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      tickets: tickets.map(serializeTicket),
    });
  } catch (error) {
    console.error('List support tickets error:', error);
    res.status(500).json({ message: 'Server error while loading support tickets' });
  }
});

app.post('/api/support-tickets', ensureDatabaseConnection, requireAuth, async (req, res) => {
  try {
    const { department, subject, priority, message } = req.body;

    if (!department || !subject || !message) {
      return res.status(400).json({ message: 'Department, subject, and message are required' });
    }

    const ticket = await SupportTicket.create({
      user: req.authUser._id,
      department,
      subject,
      priority: priority || 'Normal',
      message,
      reference: createReference('TKT'),
    });

    await User.findByIdAndUpdate(req.authUser._id, {
      $inc: { totalTicket: 1 },
    });

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: serializeTicket(ticket),
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ message: 'Server error while creating support ticket' });
  }
});

app.get('/api/admin/users', ensureDatabaseConnection, requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.status(200).json({ users: users.map(serializeUser) });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ message: 'Server error while loading users' });
  }
});

app.patch('/api/admin/users/:id', ensureDatabaseConnection, requireAuth, requireAdmin, async (req, res) => {
  try {
    const updates = {};

    editableUserFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
    }

    [
      'mainBalance',
      'interestBalance',
      'totalDeposit',
      'totalEarn',
      'totalInvest',
      'totalPayout',
      'totalTicket',
      'totalReferralBonus',
      'lastReferralBonus',
    ].forEach((field) => {
      if (updates[field] !== undefined) {
        updates[field] = Number(updates[field]) || 0;
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User account updated successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

app.delete('/api/admin/users/:id', ensureDatabaseConnection, requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');

  app.use(express.static(frontendDistPath));

  app.get('/{*path}', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }

    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
