const Product = require('../models/Product');
const Category = require('../models/Category');
const StockLog = require('../models/StockLog');

// @desc    Get dashboard metrics & inventory summary
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Aggregate inventory quantity and total value
    const aggregateResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          totalCostValue: { $sum: { $multiply: ['$costPrice', '$stock'] } },
        },
      },
    ]);

    const totalStock = aggregateResult[0]?.totalStock || 0;
    const totalInventoryValue = aggregateResult[0]?.totalValue || 0;
    const totalCostValue = aggregateResult[0]?.totalCostValue || 0;

    // Counts for low stock and out of stock
    const outOfStockCount = await Product.countDocuments({ stock: { $lte: 0 } });
    
    // Low stock where stock > 0 and stock <= lowStockThreshold
    const lowStockProducts = await Product.find({
      $expr: {
        $and: [
          { $gt: ['$stock', 0] },
          { $lte: ['$stock', '$lowStockThreshold'] },
        ],
      },
    })
      .populate('category', 'name color')
      .limit(6);

    const lowStockCount = await Product.countDocuments({
      $expr: {
        $and: [
          { $gt: ['$stock', 0] },
          { $lte: ['$stock', '$lowStockThreshold'] },
        ],
      },
    });

    const outOfStockProducts = await Product.find({ stock: { $lte: 0 } })
      .populate('category', 'name color')
      .limit(6);

    // Recent Stock Transactions
    const recentActivity = await StockLog.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('product', 'name sku price image');

    // Category distribution for charts
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $unwind: '$categoryDetails',
      },
      {
        $project: {
          _id: 1,
          name: '$categoryDetails.name',
          color: '$categoryDetails.color',
          count: 1,
          totalStock: 1,
          totalValue: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalStock,
        totalInventoryValue,
        totalCostValue,
        lowStockCount,
        outOfStockCount,
        lowStockProducts,
        outOfStockProducts,
        recentActivity,
        categoryDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete stock audit logs
// @route   GET /api/dashboard/stock-logs
// @access  Private
const getStockLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, operation } = req.query;
    const query = {};

    if (operation && operation !== 'all') {
      query.operation = operation;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await StockLog.countDocuments(query);

    const logs = await StockLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('product', 'name sku price image');

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getStockLogs,
};
