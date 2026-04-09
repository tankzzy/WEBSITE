const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  asset: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  leverage: {
    type: String,
    trim: true,
    default: '',
  },
  expiration: {
    type: String,
    trim: true,
    default: '',
  },
  side: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'closed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Trade', tradeSchema);
