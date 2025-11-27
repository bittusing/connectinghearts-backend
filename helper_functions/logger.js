const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs', 'app.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const logger = (message) => {
  const logEntry = `${new Date().toISOString()} - ${JSON.stringify(message)}\n`;
  logStream.write(logEntry);
  process.stdout.write(logEntry); // Optionally write to the console as well
};

module.exports = logger;
