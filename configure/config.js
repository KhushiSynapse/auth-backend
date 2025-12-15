// config.js
require('dotenv').config(); // Load .env variables

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  
};
