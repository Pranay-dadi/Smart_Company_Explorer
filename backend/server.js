const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const companyRoutes = require('./routes/companyRoutes');
require('dotenv').config();

// Import Company model at the top
const Company = require('./models/Company');

const app = express();

console.log('Setting up middleware and routes...');
app.use(cors());
app.use(express.json());

console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI.substring(0, 20) + '...');
mongoose.connect(process.env.MONGODB_URI, { dbName: 'company_db' }).then(() => {
  console.log('Connected to MongoDB with database:', mongoose.connection.db.databaseName);
  (async () => {
    try {
      const companies = await Company.find().lean();
      console.log('Startup check - Companies in DB:', companies);
    } catch (err) {
      console.error('Startup check error:', err);
    }
  })();
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.use('/api/', companyRoutes);

app.use((err, req, res, next) => {
  console.error('Error handler triggered:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
console.log('Starting server on port:', PORT);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});