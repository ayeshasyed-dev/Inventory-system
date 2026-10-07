const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please assign a category'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative'],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'Cost price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Threshold cannot be negative'],
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update status based on stock and lowStockThreshold before save
productSchema.pre('save', function (next) {
  if (this.stock <= 0) {
    this.status = 'out_of_stock';
  } else if (this.stock <= this.lowStockThreshold) {
    this.status = 'low_stock';
  } else {
    this.status = 'in_stock';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
