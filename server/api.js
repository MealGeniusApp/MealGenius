var express = require('express');
var router = express.Router();
require('dotenv').config();
const mongoose = require('./server'); // Import the Mongoose connection from server.js

// Endpoints
const host = process.env.BASE_URL

router.get('/generateMeal/:meal', (req,res) => {
    let meal = req.params('meal')
})

module.exports = router;