const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a category name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      default: '#3b82f6', // Hex color for category tagging
    },
    icon: {
      type: String,
      default: 'tag',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', categorySchema);
