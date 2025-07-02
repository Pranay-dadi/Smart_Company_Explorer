const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  logo: { type: String },
  website: { type: String },
  domain: { type: String },
  employees: { type: String },
  revenue: { type: String },
  industries: { type: String },
  tech_stack: { type: [String], default: [] },
  wiki_title: { type: String },
  scraped_at: { type: Date },
  source: { type: [String], default: [] },
}, { 
  timestamps: true,
  strict: false // Allow extra fields from the scraper
});

console.log('Initializing Company model with schema:', companySchema);
module.exports = mongoose.model('Company', companySchema, 'companies');