const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'payout'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'rejected'],
    default: 'pending',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  method: {
    type: String,
    trim: true,
    default: '',
  },
  direction: {
    type: String,
    enum: ['credit', 'debit', 'internal'],
    default: 'credit',
  },
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  details: {
    type: String,
    trim: true,
    default: '',
  },
  purpose: {
    type: String,
    enum: ['general', 'investment-plan'],
    default: 'general',
  },
  planId: {
    type: String,
    trim: true,
    default: '',
  },
  planName: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
