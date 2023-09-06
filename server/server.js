// Import the Express.js framework
const express = require('express');
require('dotenv').config();
var cors = require('cors');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');


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
var api = require('./api');
var app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json());
app.use (express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/', api);



// Start the server on port 3000
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`MealGenius Server is running on port ${PORT}`);
});

// Export mongoose connection for api to use
module.exports = mongoose;