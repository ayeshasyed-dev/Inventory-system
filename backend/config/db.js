const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers to resolve MongoDB Atlas SRV records smoothly on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // fallback if environment restricts setting dns servers
}

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory_system';

  try {
    // Attempt standard MongoDB connection (Atlas or Local)
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500, // Fail fast if local mongo service isn't running
    });
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ [MongoDB Local Connect Failed]: ${error.message}`);
    console.log(`🔄 Launching In-Memory MongoDB engine for seamless development...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(memUri);
      console.log(`🚀 [In-Memory MongoDB Connected]: ${memUri}`);
      console.log(`ℹ️ [Tip]: To use MongoDB Atlas, add your connection string to backend/.env: MONGODB_URI=mongodb+srv://...`);
      return conn;
    } catch (memError) {
      console.error(`❌ [Failed to initialize In-Memory MongoDB]:`, memError.message);
      console.error(`Please install/start MongoDB or provide a valid MONGODB_URI in backend/.env`);
    }
  }
};

module.exports = connectDB;
