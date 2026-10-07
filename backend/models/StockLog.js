const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    operation: {
      type: String,
      enum: ['add', 'subtract', 'set', 'initial', 'deleted'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StockLog', stockLogSchema);
