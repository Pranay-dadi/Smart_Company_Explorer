const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const mongoose = require('mongoose');

router.get('/companies', async (req, res) => {
  try {
    const { query } = req.query;
    let filter = {};
    if (query) {
      // Case-insensitive partial match on company name
      filter.name = { $regex: query, $options: 'i' };
    }
    console.log('Fetching companies with filter:', filter);
    const companies = await Company.find(filter).lean();
    if (!companies || companies.length === 0) {
      return res.status(200).json([]);
    }
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