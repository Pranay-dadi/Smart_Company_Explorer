const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const mongoose = require('mongoose');

router.get('/companies', async (req, res) => {
  try {
    console.log('Fetching all companies...');
    const companies = await Company.find().lean();
    console.log('Raw Mongoose query result:', companies);
    const rawData = await mongoose.connection.db.collection('companies').find().toArray();
    console.log('Raw MongoDB data:', rawData);
    if (!companies || companies.length === 0) {
      console.log('No companies found in database or query failed');
      return res.status(200).json([]);
    }
    console.log('Sending response:', companies);
    res.json(companies);
  } catch (err) {
    console.error('Error fetching companies:', err.stack);
    res.status(500).json({ error: 'Server error while fetching companies' });
  }
});

router.get('/company/:companyName', async (req, res) => {
  try {
    console.log('Fetching company:', req.params.companyName);
    const company = await Company.findOne({ name: req.params.companyName }).lean();
    console.log('Found company data:', company);
    if (!company) {
      console.log('Company not found:', req.params.companyName);
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (err) {
    console.error('Error fetching company:', err.stack);
    res.status(500).json({ error: 'Server error while fetching company' });
  }
});

console.log('Company routes initialized');
module.exports = router;