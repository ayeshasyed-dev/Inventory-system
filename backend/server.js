const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    credentials: true,
  })
);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Root & Health check
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'Inventory Management System API is running smoothly',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      dashboard: '/api/dashboard',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed default data if database is initialized
const seedInitialData = async () => {
  try {
    const User = require('./models/User');
    const Category = require('./models/Category');
    const Product = require('./models/Product');

    const adminCount = await User.countDocuments();
    if (adminCount === 0) {
      const admin = await User.create({
        name: 'Syed Ayesha',
        email: 'syedayesha@gmail.com',
        password: 'ayesha@2005',
        role: 'admin',
      });
      console.log('✨ Seeded default Admin user: syedayesha@gmail.com / ayesha@2005');

      const categoriesCount = await Category.countDocuments();
      if (categoriesCount === 0) {
        const catElectronics = await Category.create({
          name: 'Electronics',
          description: 'Gadgets, appliances, and electronics',
          color: '#3b82f6',
          icon: 'laptop',
        });
        const catOffice = await Category.create({
          name: 'Office Supplies',
          description: 'Stationery, frames, and desk accessories',
          color: '#10b981',
          icon: 'briefcase',
        });
        const catHome = await Category.create({
          name: 'Home & Living',
          description: 'Home decor, furniture, and lighting',
          color: '#f59e0b',
          icon: 'home',
        });
        console.log('✨ Seeded sample categories');

        // Seed sample products
        await Product.create([
          {
            name: 'Premium Photo Frame',
            sku: 'SKU-PF101',
            category: catOffice._id,
            price: 499,
            costPrice: 280,
            stock: 25,
            lowStockThreshold: 5,
            description: 'Handcrafted wooden photo frame with anti-glare glass.',
            createdBy: admin._id,
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
          },
          {
            name: 'Ergonomic Desk Lamp',
            sku: 'SKU-ED204',
            category: catHome._id,
            price: 1299,
            costPrice: 750,
            stock: 4,
            lowStockThreshold: 5,
            description: 'Dimmable LED desk lamp with wireless fast charging pad.',
            createdBy: admin._id,
            image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=500&auto=format&fit=crop&q=80',
          },
          {
            name: 'Mechanical Wireless Keyboard',
            sku: 'SKU-KB808',
            category: catElectronics._id,
            price: 3499,
            costPrice: 2100,
            stock: 0,
            lowStockThreshold: 3,
            description: 'Compact 75% wireless mechanical keyboard with RGB backlighting.',
            createdBy: admin._id,
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
          },
          {
            name: 'Wireless Noise-Canceling Headphones',
            sku: 'SKU-HP550',
            category: catElectronics._id,
            price: 4999,
            costPrice: 3200,
            stock: 18,
            lowStockThreshold: 4,
            description: 'Over-ear Bluetooth headphones with active noise cancellation.',
            createdBy: admin._id,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
          },
        ]);
        console.log('✨ Seeded sample products');
      }
    }
  } catch (err) {
    // Non-critical seed fallback
    console.log('Notice: Seeding check completed.', err.message);
  }
};

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server after DB Connection
const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Inventory Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
