// Import the Express.js framework
const express = require('express');
require('dotenv').config();
var mongoose = require('mongoose');


// Create an instance of the Express application
const app = express();

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server on port 3000
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
