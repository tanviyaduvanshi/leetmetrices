const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic
 */
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  // Check both MONGO_URI and MONGODB_URI (standard for many cloud providers)
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.includes('xxxxx')) {
    console.error('\n❌ CRITICAL: database URI is missing or contains a placeholder "xxxxx".');
    console.error('   Environment variables checked: MONGO_URI, MONGODB_URI');
    console.error('   Please update your Render Environment Variables with your actual MongoDB Atlas connection string.\n');
    
    // Give time for console.error to flush to Render logs
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(1);
  }

  while (retries < maxRetries) {
    try {
      // Robust connection options
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries} failed: ${err.message}`);
      
      if (err.message.includes('ENOTFOUND')) {
        console.error('💡 Troubleshooting Tip: This is a DNS error.');
        console.error('   1. Ensure you are not using a proxy/VPN that blocks SRV records.');
        console.error('   2. If on Render/Heroku, try the "Standard Connection String" (starts with mongodb:// instead of mongodb+srv://).');
        console.error('   3. Check if your MongoDB Atlas cluster is active.');
      }

      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.exit(1);
      }
      
      // Exponential backoff: 2s, 4s, 6s...
      const waitTime = 2000 * retries;
      console.log(`   Retrying in ${waitTime / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

module.exports = connectDB;
