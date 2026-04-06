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
];

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
    createdAt: user.createdAt,
  };
}

function createReference(prefix) {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${timestamp}-${random}`;
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
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: 'Account created successfully',
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

    res.status(200).json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
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
    const { amount, method, details } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ message: 'Amount and method are required' });
    }

    const transaction = await Transaction.create({
      user: req.authUser._id,
      type: 'deposit',
      status: 'pending',
      amount: Number(amount),
      method,
      direction: 'credit',
      details: details || '',
      reference: createReference('DEP'),
    });

    res.status(201).json({
      message: 'Deposit request created successfully',
      transaction: serializeTransaction(transaction),
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
  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('/*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }

    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
