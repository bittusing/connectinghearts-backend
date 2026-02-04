// Smart logger that disables console.log in production
// But keeps it enabled in development

const isProduction = process.env.IS_PROD === "TRUE";

// Save original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

// Create smart logger
const logger = {
  log: (...args) => {
    if (!isProduction) {
      originalConsole.log(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, even in production (but minimal)
    originalConsole.error(...args);
  },
  
  warn: (...args) => {
    if (!isProduction) {
      originalConsole.warn(...args);
    }
  },
  
  info: (...args) => {
    if (!isProduction) {
      originalConsole.info(...args);
    }
  },
  
  debug: (...args) => {
    if (!isProduction) {
      originalConsole.debug(...args);
    }
  }
};

// Override global console in production
if (isProduction) {
  console.log = () => {}; // Disable completely
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
  // Keep console.error for critical issues only
}

module.exports = logger;
