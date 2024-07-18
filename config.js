// Description: This file contains the configuration for the application.
require('dotenv').config();

const config = {
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET
};

module.exports = config;