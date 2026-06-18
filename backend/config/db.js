const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

// Persistent data directory — survives server restarts
const DATA_DIR = path.join(__dirname, '..', 'data', 'db');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Use memory server but with a PERSISTENT on-disk dbPath
    // so data survives restarts without needing a full MongoDB install
    if (!uri || uri === 'memory' || uri.includes('localhost')) {
      // Ensure the data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: DATA_DIR,
          storageEngine: 'wiredTiger', // persistent engine (vs. ephemeral)
          launchTimeout: 120000,
        },
      });

      uri = mongoServer.getUri();
      console.log(`✅ Persistent MongoDB started  →  data stored at: ${DATA_DIR}`);

      // Keep a reference so we can gracefully shut it down
      process.on('SIGINT', async () => {
        await mongoServer.stop();
        process.exit(0);
      });
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
