const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String, 
    required: true,
  },
  passwordResetTokenHash: {
    type: String,
    default: '',
  },
  passwordResetExpiresAt: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["active", "pending", "suspended"],
    default: "active",
  },
  mainBalance: {
    type: Number,
    default: 5,
  },
  interestBalance: {
    type: Number,
    default: 0,
  },
  totalDeposit: {
    type: Number,
    default: 0,
  },
  totalEarn: {
    type: Number,
    default: 0,
  },
  totalInvest: {
    type: Number,
    default: 0,
  },
  totalPayout: {
    type: Number,
    default: 0,
  },
  totalTicket: {
    type: Number,
    default: 0,
  },
  totalReferralBonus: {
    type: Number,
    default: 0,
  },
  lastReferralBonus: {
    type: Number,
    default: 0,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  referralCount: {
    type: Number,
    default: 0,
  },
  linkedWallets: {
    type: [
      {
        provider: {
          type: String,
          trim: true,
        },
        walletLabel: {
          type: String,
          trim: true,
        },
        walletAddress: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          enum: ["connected", "pending"],
          default: "connected",
        },
        connectedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
