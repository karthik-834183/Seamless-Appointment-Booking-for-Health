const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToDB = require("./config/connectToDB");

const app = express();

////// dotenv config ////////
dotenv.config();

////// Connect to MongoDB ////////
connectToDB();

const PORT = process.env.PORT || 5000;

////// Middleware ////////
app.use(express.json());
app.use(cors());

// Root route (Home)
app.get('/', (req, res) => {
  res.send('Welcome to the DocSpot API');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong", success: false });
});

////// API Routes ////////
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));

////// Start Server ////////
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
