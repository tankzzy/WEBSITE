const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planId: {
    type: String,
    required: true,
    trim: true,
  },
  planName: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  minAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  maxAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  returnRateLabel: {
    type: String,
    trim: true,
    default: '',
  },
  fundingMethod: {
    type: String,
    trim: true,
    default: '',
  },
  fundingReference: {
    type: String,
    trim: true,
    default: '',
  },
  projectedDailyReturn: {
    type: Number,
    default: 0,
  },
  durationDays: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Investment', investmentSchema);
