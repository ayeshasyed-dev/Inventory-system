const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories with product count
// @route   GET /api/categories
// @access  Private / Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Count products per category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id });
        return {
          ...cat.toObject(),
          productCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCounts.length,
      data: categoriesWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const products = await Product.find({ category: category._id });

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      color: color || '#3b82f6',
      icon: icon || 'tag',
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name && name.trim() !== category.name) {
      const duplicate = await Category.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Category name already in use' });
      }
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if products are linked
    const linkedProducts = await Product.countDocuments({ category: req.params.id });
    if (linkedProducts > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. There are ${linkedProducts} product(s) linked to this category. Please reassign or delete them first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
