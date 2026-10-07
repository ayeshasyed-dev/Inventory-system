const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const Category = require('../models/Category');

// @desc    Get all products with filtering, search, and pagination
// @route   GET /api/products
// @access  Private / Public
const getProducts = async (req, res, next) => {
  try {
    const { search, category, status, sortBy, order, page = 1, limit = 50 } = req.query;

    const query = {};

    // Search by product name or SKU
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { sku: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status (in_stock, low_stock, out_of_stock)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy) {
      const sortOrder = order === 'asc' ? 1 : -1;
      sortOptions = { [sortBy]: sortOrder };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Retrieve recent stock history for this product
    const stockHistory = await StockLog.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        stockHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      price,
      costPrice,
      stock,
      lowStockThreshold,
      description,
      imageUrl,
    } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, price, and stock quantity',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Selected category does not exist' });
    }

    // Handle image from file upload (multer) or imageUrl field
    let imagePath = imageUrl || '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const initialStock = Number(stock) || 0;
    const initialThreshold = lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5;

    const product = new Product({
      name: name.trim(),
      sku: sku && sku.trim() ? sku.trim() : `SKU-${Date.now().toString().slice(-6)}`,
      category,
      price: Number(price),
      costPrice: costPrice ? Number(costPrice) : 0,
      stock: initialStock,
      lowStockThreshold: initialThreshold,
      description: description ? description.trim() : '',
      image: imagePath,
      createdBy: req.user ? req.user._id : null,
    });

    await product.save();

    // Create initial stock audit log
    await StockLog.create({
      product: product._id,
      productName: product.name,
      operation: 'initial',
      quantity: initialStock,
      previousStock: 0,
      newStock: initialStock,
      notes: 'Initial stock setup on product creation',
      performedBy: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System Admin',
    });

    const populatedProduct = await Product.findById(product._id).populate(
      'category',
      'name color icon'
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      price,
      costPrice,
      stock,
      lowStockThreshold,
      description,
      imageUrl,
    } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (category) {
      const cat = await Category.findById(category);
      if (!cat) {
        return res.status(400).json({ success: false, message: 'Selected category does not exist' });
      }
      product.category = category;
    }

    if (name) product.name = name.trim();
    if (sku) product.sku = sku.trim();
    if (price !== undefined) product.price = Number(price);
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (description !== undefined) product.description = description.trim();

    // If stock changed directly via edit form, record audit log
    if (stock !== undefined && Number(stock) !== product.stock) {
      const oldStock = product.stock;
      const newStockVal = Number(stock);
      product.stock = newStockVal;

      await StockLog.create({
        product: product._id,
        productName: product.name,
        operation: 'set',
        quantity: Math.abs(newStockVal - oldStock),
        previousStock: oldStock,
        newStock: newStockVal,
        notes: `Stock edited in product details (${oldStock} -> ${newStockVal})`,
        performedBy: req.user ? req.user._id : null,
        userName: req.user ? req.user.name : 'Admin',
      });
    }

    // Handle new uploaded image
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
      product.image = imageUrl;
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate(
      'category',
      'name color icon'
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product stock (add, subtract, set)
// @route   PATCH /api/products/:id/stock
// @access  Private (Admin/Manager)
const updateStock = async (req, res, next) => {
  try {
    const { quantity, operation, notes } = req.body;

    if (quantity === undefined || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quantity and operation (add, subtract, set)',
      });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || (qty < 0 && operation !== 'set')) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.stock;
    let newStock = previousStock;

    if (operation === 'add') {
      newStock = previousStock + qty;
    } else if (operation === 'subtract') {
      if (previousStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Cannot subtract ${qty}. Current stock is only ${previousStock}`,
        });
      }
      newStock = previousStock - qty;
    } else if (operation === 'set') {
      if (qty < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock level cannot be negative',
        });
      }
      newStock = qty;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Use add, subtract, or set',
      });
    }

    product.stock = newStock;
    await product.save();

    // Log transaction
    const log = await StockLog.create({
      product: product._id,
      productName: product.name,
      operation,
      quantity: qty,
      previousStock,
      newStock,
      notes: notes || `Stock updated via quick inventory operation (${operation})`,
      performedBy: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Admin',
    });

    const updatedProduct = await Product.findById(product._id).populate(
      'category',
      'name color icon'
    );

    res.status(200).json({
      success: true,
      message: `Stock successfully updated to ${newStock}`,
      data: updatedProduct,
      log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await StockLog.create({
      product: product._id,
      productName: product.name,
      operation: 'deleted',
      quantity: product.stock,
      previousStock: product.stock,
      newStock: 0,
      notes: 'Product deleted from inventory',
      performedBy: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Admin',
    });

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
};
