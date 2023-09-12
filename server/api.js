var express = require('express');
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
var router = express.Router();
require('dotenv').config();
var axios = require('axios')
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');

// DB connection
dbConnect()

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  });


// Endpoints
const GPT_KEY = process.env.GPT_API_KEY

router.get('/', (req,res) => {
    res.send('Meal Genius')
})

// Function to send a verification code
// New device is recognized during login. User account exists.
// Must take user id and email, and device_id
// store device_id in pending_device in user db
// generate and store a device_code in user db
// send email with the code and message
async function sendCode(user, device) {

  return new Promise((resolve, reject) => {
    // Generate code
    const randomDecimal = Math.random();
    const code = Math.floor(randomDecimal * 90000) + 10000;

    const updateOperation = {
        $set: {
          code: code,
          pending_device: device,
        },
      };
      
      // Use findOneAndUpdate to update the user's properties
      User.findOneAndUpdate(
        { _id: user._id }, // Find the user by object ID
        updateOperation, // Apply the update operation
        { new: true }).then(() => {

          const mailOptions = {
            from: process.env.MAILER_USER,
            to: user.email,
            subject: `${code} is your MealGenius confirmaition code`,
            text: `Your MealGenius account was accessed from a new location. If this was you, enter code ${code} in the app. If not, you can change your password in the app.`,
          };
        
          // Send the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log('Error sending email:', error);
              reject('Could not send mail!')
            } else {
              console.log('successfully sent code')
              resolve('Sent code!')
              
            }
          });
        }) 
      
  }) // Promise end
  }

// Check the code the user provided
router.post("/confirmDevice", async (req, response) => {
    // fetch the pending code and device id 
    let user = await User.findById(req.body.user_id)

    //let user = null
        if (user) {
          console.log(user.code, req.body.code)
            // Check if the codes match, if so add the device
            if (user.code == req.body.code)
            {
                // Add the device
                User.findByIdAndUpdate(
                    req.body.user_id,
                    { $push: { devices: user.pending_device } },
                    { new: true }).then((updatedUser) => {

                      if (updatedUser) {

                        response.status(200).send({
                          message: "Success!",
                        });


                      } else {
                        response.status(404).send({
                            message: "Could not locate user",
                        });
                      }

                    })
                  
 
            }
            else{
              response.status(400).send({
                message: "Wrong code!",
                });
            }
    
        //console.log('Code:', user.code);
        //console.log('Pending Device:', user.pending_device);
        } else {
            response.status(404).send({
                message: "Could not find user",
              });
        }
})

// register endpoint
router.post("/register", (request, response) => {
    // hash the password
    bcrypt
      .hash(request.body.password, 5)
      .then((hashedPassword) => {
        // create a new user instance and collect the data
        const user = new User({
          email: request.body.email,
          password: hashedPassword,
        });
  
        // save the new user
        user.save()
          // return success if the new user is added to the database successfully
          .then((result) => {
            response.status(201).send({
              message: "User Created Successfully",
              result,
            });
          })
          // catch error if the new user wasn't added successfully to the database
          .catch((errorResponse) => {
            let errorMessage = null;

            for (const key in errorResponse['errors']) {
              if (errorResponse['errors'][key].properties && errorResponse['errors'][key].properties.message) {
                errorMessage = errorResponse['errors'][key].properties.message;
                break; // Stop iterating once found
              }
            }

            if (errorMessage)
            {
              console.log(errorMessage)
              response.status(403).send({
                message: errorMessage,
                errorResponse,
              });
            }
            else{
              response.status(500).send({
                message: "User already exists!",
                errorResponse,
              });
            }
            
            
          });
      })
      // catch error if the password hash isn't successful
      .catch((e) => {
        response.status(500).send({
          message: "Password was not hashed successfully",
          e,
        });
      });
  });
  

// login endpoint
router.post("/login", (request, response) => {
    // check if email exists
    
    User.findOne({ email: request.body.email })
    
      // if email exists
      .then((user) => {
        
        
        // compare the password entered and the hashed password found
        bcrypt
          .compare(request.body.password, user.password)

          // if the passwords match
          .then(async (passwordCheck) => {
  
            // check if password matches
            if(!passwordCheck) {
                return response.status(400).send({
                message: "Passwords does not match",
              });
            }

            console.log('Logging in..')

            // Now check if device is permitted
            if (user.devices.includes(request.body.device))
            {
                response.status(200).send({
                    message: "Login Successful",
                    token: user._id,
                });
            }
            else 
            {
                console.log('not recognized')
                // Device not recognized. Send email code to recognize device!
                // When code is entered, allow the login and add the device to DB.
                sendCode(user, request.body.device).then((res) =>
                {
                  console.log("code sent!")
                    // Code was sent successfully 
                    response.status(422).send({
                        message: res,
                        token: user._id
                    });

                })
                .catch((error) => {
                  console.log(error)
                  response.status(500).send({
                    message: error,
                });
                })
                
            }

            
  
            
          })
          // catch error if password does not match
          .catch((error) => {
            console.log(error)
            response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          });
      })
      // catch error if email does not exist
      .catch((e) => {
        
        response.status(404).send({
          message: "Email not found",
          e,
        });
      });
  });
  

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
    axios.get(`https://www.google.com/search?q=${encodeURI(title)}&tbm=isch&tbs=il:cl`)
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
        res.json({
        title: title,
        description: description,
        image: image,
        })
    })


  })
  .catch(error => {
    // gpt error: server issue, not client issue
    console.log('FATAL GPT ERROR: ', error)
    res.status(500);
    res.json({error: error})
  })

  
})

module.exports = router;