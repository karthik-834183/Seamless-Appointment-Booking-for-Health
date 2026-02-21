const mongoose = require('mongoose');

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB (docspot)');
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = connectToDB;
