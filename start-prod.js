#!/usr/bin/env node

// Cross-platform production starter
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load production environment variables
const envProdPath = path.join(__dirname, '.env.prod');
if (fs.existsSync(envProdPath)) {
  require('dotenv').config({ path: envProdPath });
}

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

console.log('Starting Connecting Hearts Backend in Production Mode...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Environment file:', envProdPath);

// Start the main application
require('./app.js');
