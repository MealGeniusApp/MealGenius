var express = require('express');

var router = express.Router();
require('dotenv').config();
const mongoose = require('./server'); // Import the Mongoose connection from server.js
var axios = require('axios')

// Endpoints
const GPT_KEY = process.env.GPT_API_KEY

router.post('/generateMeal', (req,res) => {
    let meal = req.body.meal
    let complexity = req.body.complexity
    let blacklist = req.body.blacklist
    let history = req.body.history

    let query = `give me a random ${complexity} ${meal} meal and a 20 word description. Do not include anything that contains or is related to ${blacklist}! Do not use any of the following: ${history} Your response must be in the form of FOOD: {meal} DESC: {description}`

    // Result
    let title = ''
    let description = ''
    let image = ''


    const endpoint = 'https://api.openai.com/v1/chat/completions';

  const messages = [
    { role: 'user', content: query },
  ];
  
  axios.post(
    endpoint,
    {
      model: 'gpt-3.5-turbo',
      messages: messages,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GPT_KEY}`,
      },
    }
  )
  .then(response => {

    result = response.data.choices[0].message.content

    title = result.substring(result.toUpperCase().indexOf('FOOD:')+6,  result.toUpperCase().indexOf('DESC') - 1).replace(new RegExp('"', 'g'), '').replace(new RegExp(':', 'g'), '')
    description = result.substring(result.toUpperCase().indexOf('DESC: ') + 6, result.length)

    // Get the image for this meal
    axios.get(`https://www.google.com/search?q=${encodeURI(title)}+free&tbm=isch`)
    .then(response => {
      
      const htmlContent = response.data;
      const start = htmlContent.indexOf('src="https')
      const end = htmlContent.substring(start + 5, htmlContent.length).indexOf('"')

      image = htmlContent.substring(start + 5, start + end + 5)
      
      // const start = htmlContent.indexOf('href="/url?q=')
      // const end = htmlContent.substring(start + 12, htmlContent.length).indexOf('"')

      // image = htmlContent.substring(start + 12, start + end + 12)
      // console.log(htmlContent)
      // console.log(image)

      // SUCCESS! Return details
        res.json({
        title: title,
        description: description,
        image: image,
  })
        
    })
    .catch(error => {
        // Image error, return anyway
    })


  })
  .catch(error => {
    // gpt error: server issue, not client issue
  })

  
})

module.exports = router;