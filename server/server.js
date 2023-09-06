// Import the Express.js framework
const express = require('express');
require('dotenv').config();
var cors = require('cors');
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI //atlas

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


// Create an instance of the Express application
const app = express();
app.use(cors());

var api = require('./api');
app.use('/', api);

// Start the server on port 3000
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`MealGenius Server is running on port ${PORT}`);
});

// Export mongoose connection for api to use
module.exports = mongoose;