var express = require('express');
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const Trial = require("./db/trialModel");
const cron = require('node-cron');
var router = express.Router();
require('dotenv').config();
var axios = require('axios')
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const MAX_HISTORY_LENGTH = process.env.MAX_HISTORY_LENGTH


// DB connection
dbConnect()

// Maitenance
const job = cron.schedule('0 0 * * *', maintainUsers);
job.start()

// Change password button on login page, send code, when verified, choose new password

// Mailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});


// Daily Maitenance
// * Send warning emails
// * Delete inactive accounts (if they arent subscribed!)
async function maintainUsers()
{
  const currentDate = new Date();

  // Calculate the date 10 days from now
  const futureDate = new Date(currentDate);
  futureDate.setDate(currentDate.getDate() + 10);

  // Format the date as "Month Day, Year"
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = futureDate.toLocaleDateString('en-US', options);

  // For each user, check if they have an active subscription.
  // Active if subscription field is not '', AND passes API verification.
  // Otherwise, not active.

  // const subscribers = await User.find({ receipt: { $ne: '' } });

  //   // Process each user in the result
  //   subscribers.forEach((user) => {
      
  //     console.log(`Processing user ${user._id}, subscription: ${user.receipt}`);
      
  //     // If receipt is invalid, set tokens to 0. If it is valid, AND today is the date of subscription, reset.

  //     const requestData = {
  //       'receipt-data': user.receipt,
  //       'password': process.env.APPLE_SECRET
  //     };

  //     axios.post('https://sandbox.itunes.apple.com/verifyReceipt', requestData)
  //     .then(response => {
  //       const latestReceiptInfo = response.data.latest_receipt_info[0];

  //       if (latestReceiptInfo) {
  //           const expirationDate = new Date(item.expires_date_ms);
  //           const isSubscriptionActive = item.is_in_intro_offer_period === 'false';

  //           if (isSubscriptionActive) {
  //             console.log(`Subscription for product ${productId} is active until ${expirationDate}`);
  //           } else {
  //             console.log(`Subscription for product ${productId} has expired`);
  //           }
            
  //       } else {
  //         // Not a valid subscription, set tokens to 0
  //         console.log('No latest receipt info found');
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error validating old receipt:', error);
  //     });

  //   });


  try {
    // Increment 'dormant' field by 1 for all users
    await User.updateMany({}, { $inc: { dormant: 1 } });

    // Find and remove users with 'marked_for_deletion' and 'email_confirmed' both set to false
    await User.deleteMany({ marked_for_deletion: true });

    // Email a warning to all inactive users
    const dormantUsers = await User.find({
      $and: [
        { dormant: { $gte: 180 } },
        { subscribed: false }
      ]
    });

    // Send each email
    dormantUsers.forEach((user) => {
      
      const mailOptions = {
        from: process.env.MAILER_USER,
        to: user.email,
        subject: `MealGenius account scheduled for deletion`,
        text: `Your MealGenius account hasn't been accessed in ${user.dormant} days, 
        and data is scheduled to be purged from our system in 10 days on ${formattedDate}. 
        To keep your data, simply log in to your account. We hope to see you soon!`,
      };
    
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending warning email:', error);
        } else {
        }
      });

    });


    // MARK UNCONFIRMED USERS FOR DELETION
    try {
      // Find users where 'email_confirmed' is false
      const unconfirmedUsers = await User.find({ email_confirmed: false });
  
      // For all unconfirmed users prepare to mark for deletion
      const updatePromises = unconfirmedUsers.map((user) => {
        user.marked_for_deletion = true;
        return user.save();
      });
  
      // Execute all the update operations
      await Promise.all(updatePromises);
  
    } catch (error) {
      console.error('Error marking users for deletion:', error);
    }


  } catch (error) {
    console.error('Error updating users:', error);
  }
}





// Endpoints
const GPT_KEY = process.env.GPT_API_KEY

router.get('/', (req,res) => {
    res.send('Meal Genius')
})


// Clear history
router.post('/clearHistory', async(req, res) => {
  try {
    const doc = await User.findOneAndUpdate(
      {_id: req.body.user_id}, 
      { 'history': [] },
      { new: true } 
    );

    if (!doc) {
      return res.status(404).send("User not found.");
    }

    res.json(doc);
  } catch (err) {
    res.status(500).send(err);
  }
})

// Load the user when they log in
// Must mark them as active, load token count, load meals etc
router.post('/user', (req, response) => {
  // Get the user
  User.findByIdAndUpdate(
    req.body.user_id,
    {
      $set: { dormant: 0 } // Set dormant days to 0
    }, {new: true}).then((user) => {

      if (user)
      {
        response.status(200).send({
          message: "Success!",
          meals: user.meals,
          tokens: user.tokens
        });
      }
      else
      {
        response.status(404).send({
          message: "User not found!",
        });
      }
    })
    .catch((e) => {
      response.status(500).send({
        message: "Error finding user",
      });
    })
    
    
})

// Change the password
router.post('/setNewPassword', async(req,res) => {
  let code = req.body.resetCode
  let pass = req.body.pass
  let email = req.body.email

  // Find the user 
  let user = await User.findOne({email: email})


      // Validate request
      if (user && user.code == code) {
        // user is authorized to change the password
        // hash the password
        bcrypt
        .hash(pass, 5)
        .then((hashedPassword) => {
          // create a new user instance and collect the data
          user.password = hashedPassword

          // save the user
          user.save()
            // return success if the new user is added to the database successfully
            .then((updatedUser) => {
              res.status(200).send({
                message: "Password changed successfully",
                token: user._id,
              });
            })
            // catch error if the new user wasn't added successfully to the database
            .catch((errorResponse) => {

                res.status(500).send({
                  message: "Error changing password!",
                  errorResponse,
                });
              
            });
        })
        // catch error if the password hash isn't successful
        .catch((e) => {
          res.status(500).send({
            message: "Password was not hashed successfully",
            e,
          });
        });

      }

      else{
        //unauthorized request
        res.status(401)
        res.json('Unauthorized')
      }


  
})

// Send reset code to email
router.post('/resetPassword', (req, res) => {
  const randomDecimal = Math.random();
    const code = Math.floor(randomDecimal * 90000) + 10000;

    const updateOperation = {
        $set: {
          code: code
        },
      };
      
      // Use findOneAndUpdate to update the user's properties
      User.findOneAndUpdate(
        { email: req.body.email }, // Find the user by email
        updateOperation).then(() => {

          const mailOptions = {
            from: process.env.MAILER_USER,
            to: req.body.email,
            subject: `${code} is your MealGenius confirmaition code`,
            text: `A new password was requested for your account. If this was you, enter code ${code} in the app. If not, somebody tried to log in using your email.`,
          };
        
          // Send the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log('Error sending email:', error);
              res.status(500)
              res.json({error: "error sending email"})
            } else {
              console.log('successfully sent code')
              res.status(200)
              res.json('successfully sent password reset email')
              
            }
          });
        }) 

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
    let user = await User.findOne({email: req.body.email})

    //let user = null
        if (user) {
            // Check if the codes match, if so add the device
            if (user.code == req.body.code)
            {
              // Before adding this device, check if we can activate trial tokens
              Trial.findOne({}).then((trial_doc) => {

                const emailExists = trial_doc.emails.includes(user.email);
                const deviceExists = trial_doc.devices.includes(user.pending_device);
                let grant_trial = true

                if (emailExists)
                {
                  grant_trial = false
                }
                else
                {
                  trial_doc.emails.push(user.email)
                }

                if (deviceExists)
                {
                  grant_trial = false
                }
                else
                {
                  trial_doc.devices.push(user.pending_device)
                }

                

                trial_doc.save()


                // Confirm email / grant trial if applicable
                User.findByIdAndUpdate(
                  user._id,
                  {
                    // Grant trial if applicable
                    $inc: { tokens: grant_trial? process.env.TRIAL_SWIPES: 0 },
                    $set: { email_confirmed: true }, // Confirmed the email
                    $push: { devices: user.pending_device}
                  },
                  { new: true }).then((updatedUser) => {

                    if (updatedUser) {
                      response.status(200).send({
                        message: "Success!",
                        trial: grant_trial
                      });


                    } else {
                      response.status(404).send({
                          message: "Could not locate user",
                      });
                    }

                  })
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

            //Now check if device is permitted
            if (user.devices.includes(request.body.device))
            {
                response.status(200).send({
                    message: "Login Successful",
                    token: user._id,
                });
            }
            else 
            {
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
  

router.post('/generateMeal', async(req,res) => {
    let meal = req.body.meal
    let complexity = req.body.complexity
    let blacklist = req.body.blacklist

    // Load user object to get history and tokens
    let user = await User.findById(req.body.user_id)
    if (!user)
    {
        res.status(500);
        res.json({error: "Could not load user from DB"})
        return
      
    }
    let tokens = user.tokens
    let history = user.history
    if (tokens == 0)
    {
      res.status(422);
      res.json({error: "Insufficient tokens"})
    }

    let history_str = ""
    if (history[meal].length)
  {

    if (history[meal].length === 1)
    {
      // If only one, no structuring or commas
      history_str = history[meal][0]
    }

    else //format the string nicely
    {
      for (let i = 0; i < history[meal].length; i++) {

        // last item
        if (i === history[meal].length - 1 && i > 0)
        {
          history_str += `or ${history[meal][i]}. `
        }
  
        // Non last item
        else
        {
          history_str += `${history[meal][i]}, `
        }
      }
    }
  } // end history section

    let query = `give me a random ${complexity} ${meal} meal and a 20 word description. Do not include anything that contains or is related to ${blacklist}! Do not use any of the following: ${history_str} Your response must be in the form of FOOD: {meal} DESC: {description}`

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
    .then(async response => {
      
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
      
      // History is at its max length. Remove oldest item
      if (user.history[meal].length > MAX_HISTORY_LENGTH)
      {
        user.history[meal].shift()
      }

      user.history[meal].push(title);

      // Decrease the tokens field by 1
      user.tokens--;
      
      // Save the updated user with less tokens
      try {
        await user.save();
        // Successful return 
        res.json({
          title: title,
          description: description,
          image: image,
          tokens: user.tokens, // return true token count for server side validation
         })

      } catch (err) {
        console.error('Error updating user after meal generation', err);
        res.status(500);
        res.json({error: "Error updating user tokens and history"})
      }
      
     
        
    })
    .catch(error => {
        // Image error, return anyway
        res.json({
        title: title,
        description: description,
        image: image,
        tokens: user.tokenes,
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