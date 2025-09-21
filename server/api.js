  var express = require('express');
  const dbConnect = require("./db/dbConnect");
  const User = require("./db/userModel");
  const Trial = require("./db/trialModel");
  const Options = require("./db/optionsModel");
  const cron = require('node-cron');
  var router = express.Router();
  require('dotenv').config();
  var axios = require('axios')
  const bcrypt = require("bcrypt");
const { default: mongoose } = require('mongoose');
  const MAX_HISTORY_LENGTH = process.env.MAX_HISTORY_LENGTH

  const GPT_KEY = process.env.GPT_API_KEY
  const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY

  // DB connection
  dbConnect()




  


  // Daily Maitenance
  // * Send warning emails
  // * Delete inactive accounts (if they arent subscribed!)

  // Maitenance
  const job = cron.schedule('0 0 * * *', maintainUsers);
  //const job = cron.schedule('*/30 * * * * *', maintainUsers);
  job.start()
  
let latest;
  
const urlToPing = process.env.PING_URL;
 
const pingUrl = () => {
  axios.get(urlToPing)
    .then((res) => {
      latest = res.data
      console.log(latest)
      
    })
    .catch((error) => {
      setTimeout(pingUrl, 2000); // Retry after 2 seconds
    });
};

cron.schedule('*/4 * * * *', pingUrl);
pingUrl();

  async function maintainUsers()
  {
    const currentDate = new Date();

    

    // Calculate the date 10 days from now
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 10);

    // Format the date as "Month Day, Year"
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = futureDate.toLocaleDateString('en-US', options);


    try {
      // Grant tokens if its renewal day

      // Find all users that renew today and check/update entitlements
      let users = await User.find({renewal_date: currentDate.getDate()})
        
      // Iterate through each user and update tokens if they have an active entitlement
      for (const user of users) {
        let subscribed = await isSubscribed(user._id)
        if (subscribed)
        {
          await User.updateOne({ _id: user._id }, { $set: { tokens: process.env.TOKEN_COUNT } });
        }
        else
        {
          // It looks like they expired today. Remove tokens.
          // Update: They did pay for month long access.. so dont remove the tokens. 
          await User.updateOne({ _id: user._id }, { $set: { renewal_date: 0 } });
          // Be sure to stop renewing them.
        }
        
      }

    
      // Increment 'dormant' field by 1 for all users
      await User.updateMany({}, { $inc: { dormant: 1 } });

      // Find and remove users with 'marked_for_deletion' and 'email_confirmed' both set to false
      await User.deleteMany({ marked_for_deletion: true });

      // // Email a warning to all inactive users
      // const dormantUsers = await User.find({
      //   $and: [
      //     { dormant: { $gte: 365 } }
      //   ]
      // });

      // // Send each email to dormant users who are not subscribed
      // dormantUsers.forEach((user) => {
        
      //   if (!isSubscribed(user._id))
      //   {
      //     const mailOptions = {
      //       from: process.env.MAILER_USER,
      //       to: user.email,
      //       subject: `MealEstate account scheduled for deletion`,
      //       text: `Your MealEstate account hasn't been accessed in ${user.dormant} days, 
      //       and data is scheduled to be purged from our system on ${formattedDate}. 
      //       To keep your data, simply log in to your account. We hope to see you soon!`,
      //     };
        
      //     // Send the email
      //     transporter.sendMail(mailOptions, (error, info) => {
      //       if (error) {
      //         console.log('Error sending warning email:', error);
      //       } else {
      //       }
      //     });
  

      //   }
        
      // });


      // MARK UNCONFIRMED USERS FOR DELETION
      try {
        // Find users where 'email_confirmed' is false
        const unconfirmedUsers = await User.find({ email_confirmed: false });
    
        // For all unconfirmed users prepare to mark for deletion
        // If they are not subscribed
        const updatePromises = unconfirmedUsers
        .filter(user => !isSubscribed(user._id))
        .map((user) => {
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


  router.get('/', (req,res) => {
      res.send('Meal Estate')
  })

  async function isSubscribed(user_id) {
    const maxRetries = 3; // Maximum number of retry attempts
    let retries = 0;
  
    while (retries < maxRetries) {
      try {
        const options = {
          method: 'GET',
          url: `https://api.revenuecat.com/v1/subscribers/${user_id}`,
          headers: { accept: 'application/json', Authorization: `Bearer ${REVENUECAT_API_KEY}` },
        };
  
        const response = await axios.request(options);
  
        // The user
        const subscriber = response.data.subscriber;
        const entitlements = subscriber.entitlements;
  
        // Look at the user's entitlements to check for cards
        for (const value of Object.values(entitlements)) {
          if (value['product_identifier'] === 'cards') {
            // Check if it is active
            const expirationTime = new Date(value.expires_date);
            const currentTime = new Date();
            return expirationTime > currentTime;
          }
        }
  
        // If no relevant entitlement was found, assume not subscribed
        return false;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          const retryAfterHeader = error.response.headers['Retry-After'];
          if (retryAfterHeader) {
            const retryAfterMs = parseInt(retryAfterHeader)
            console.log(`Too Many Requests. Retrying after ${retryAfterMs} milliseconds...`);
            await wait(retryAfterMs);
          } else {
            console.log('Too Many Requests. No Retry-After header found.');
          }
          retries++;
        } else {
          // Handle other types of errors or non-retryable errors
          console.error('Error fetching isSubscribed: ', error.response.status);
          return false;
        }
      }
    }
  
    throw new Error(`Request to get isSubscribed failed after ${maxRetries} retries`);
  }
  
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function sendMail(from, to, subject, text)
  {
    axios.post('https://server.153home.online/sendMail', {
      from: from,
      to: to,
      bcc: process.env.ADMIN_EMAIL,
      subject: subject,
      text: text,
      password: process.env.MAILER_PASS
    })
  }

  // Ensure alive
  router.get('/ping', async(req, res) => {
    res.json(Date.now())
  })

  // A user just subscribed
  // Verify their reciept => grant tokens
  router.post('/newSubscriber', async(req, res) => {
    let user_id = req.body.user_id
    // Anyone can call this endpoint
    // Implement security by checking subscription status
    const subscribed = await isSubscribed(user_id);

    if (subscribed)
    {
      let currentDate = new Date();
      let dayofmonth = currentDate.getDate()
      // User is verified! Grant the tokens
      User.findByIdAndUpdate(
        req.body.user_id,
        {
          // Sets the tokens to TOKEN_COUNT and stores the date on which to renew.
          $set: { tokens: process.env.TOKEN_COUNT, renewal_date: dayofmonth} // Set tokens
        }, {new: true}).then((user) => {
    
          if (user)
          {
            // Send me a notice email
            const mailOptions = {
              from: process.env.MAILER_USER,
              to: process.env.ADMIN_EMAIL,
              subject: `🎉 MealEstate NEW SUBSCRIBER! `,
              text: `Woohoo! 🥳 ${user.email} just subscribed!`,
            };

            sendMail(mailOptions.from, mailOptions.to, mailOptions.subject, mailOptions.text)
          
           

            res.status(200).send({
              message: "Success!",
              tokens: user.tokens
            });
          }
          else
          {
            res.status(404).send({
              message: "User not found!",
            });
          }
        })
        .catch((e) => {
          res.status(500).send({
            message: e,
          });
        })


    }
    else
    {
      // User is not subscribed return 401 unauthorized.
      res.status(401).send({status: "Unauthorized"})
    }

  })



  // Clear history
  router.post('/clearHistory', async(req, res) => {
    try {
      const doc = await User.findOneAndUpdate(
        {_id: req.body.user_id}, 
        { 'history': {"breakfast": [], "lunch": [], "dinner": []} },
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
  
  // Mark user as active when app is opened
  router.post('/appOpened', (req, res) => {
    User.findByIdAndUpdate(
      
      req.body.user_id,
      {
        $set: { dormant: 0 }
      }, {new: true}).then((user) => {
        console.log(user.email, "opened the app")
      })
  })
  
  // Update special requests
  router.post('/updateRequests', (req,res) => {
    User.findByIdAndUpdate(
      
      req.body.user_id,
      {
        $set: { requests: req.body.requests }
      }, {new: true}).then((user) => {
        console.log(user.email, "updated preferences")
        res.send('Success')
      })
      .catch((e) => {
        console.log(e)
        res.status(500).send(e)
      })
    
  })
  // Load the user when they log in
  // Must mark them as active, load token count, load meals etc
  router.post('/user', (req, response) => {
    // Get the user
    User.findByIdAndUpdate(
      req.body.user_id,
      {
        $set: { dormant: 0 } // Set dormant days to 0: Handled now by /appOpened endpoint
      }, {new: true}).then(async (user) => {
        

        if (user)
        {
          response.status(200).send({
            message: "Success!",
            meals: user.meals,
            requests: user.requests,
            tokens: user.tokens,
            email: user.email,
            subscribed: await isSubscribed(req.body.user_id)
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
              subject: `${code} is your MealEstate confirmaition code`,
              text: `A new password was requested for your account. If this was you, enter code ${code} in the app. If not, somebody tried to log in using your email.`,
            };
            sendMail(mailOptions.from, mailOptions.to, mailOptions.subject, mailOptions.text)

          
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
            code_attempts: 0, // Reset failure count
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
              subject: `${code} is your MealEstate confirmaition code`,
              text: `Your MealEstate account was accessed from a new location. If this was you, enter code ${code} in the app. If not, you can change your password in the app. Feel free to reply to this email for any assistance!`,
            };
          
            sendMail(mailOptions.from, mailOptions.to, mailOptions.subject, mailOptions.text)

            
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

                // If this is their third failed code
                if (user.code_attempts >= 2)
                {
                  // Return exhausted status
                  response.status(429).send({
                    message: "Too many requests!",
                    });

                  return
                }

                // First or second failure: Increase count and send wrong code 401
                User.findByIdAndUpdate( user._id, { $inc: { code_attempts: 1 } },
                  { new: true }).then((updatedUser) => {

                    if (updatedUser) {
                      


                    } else {
                      console.log('Failed updating user document api/confirmDevice')
                      response.status(404).send({
                          message: "Could not locate user",
          
                      });
                    }

                  })

                  // Moved to here instead of if statement so the UI response does not wait on a DB operation
                  response.status(401).send({
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

  // Send help email
  router.post("/contact", (request, response) => {
    const mailOptions = {
      from: process.env.MAILER_USER,
      to: process.env.MAILER_USER,
      bcc: process.env.ADMIN_EMAIL,
      subject: `MealEstate Support`,
      text: `${request.body.msg}\n\nfrom ${request.body.email} (${request.body.uid})`,
    };
  
    sendMail(mailOptions.from, mailOptions.to, mailOptions.subject, mailOptions.text)

   
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
              // Email me of the new user, if option is enabled
              Options.findOne({}).then((option_doc) => {
                if (option_doc.registerAlerts)
                {
                  // Send the email
                  const mailOptions = {
                    from: process.env.MAILER_USER,
                    to: process.env.ADMIN_EMAIL,
                    subject: `MealEstate new user! 😁`,
                    text: `${request.body.email} has signed up!`,
                  };

                  sendMail(mailOptions.from, mailOptions.to, mailOptions.subject, mailOptions.text)

                
                 
                  
                }

              })

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

              console.log('Logging in: ', user.email)

              //Now check if device is permitted
              if (user.devices.includes(request.body.device) || user.email == "demo@demo.demo")
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

  // Retrieve a list of all saved meals
  router.post('/getMeals', async(req,res) => {
    let cart = req.body.cart // Only want to get shopping cart meals
    let uid = req.body.uid // The user whose meals to get

    // Load user object to read meals array
    let user = await User.findById(uid)
    if (!user)
    {
        res.status(500);
        res.json({error: "Could not load user from DB"})
        return
      
    }

    // If we only want to get items in the cart
    if (cart)
    {
      const filteredMeals = user.meals
        .flatMap(category => category.items)
        .flatMap(item => item.subitems)
        .filter(subitem => subitem.cart === false);

      res.json({ meals: filteredMeals });
    }

    res.json({meals: user.meals})

  })

  // Delete meal from DB
  router.post('/forgetMeal', async (req, res) => {
    try {
      const meal = req.body.meal;
      const uid = req.body.uid;

      // Load user object to update meals array
      const user = await User.findById(uid);
      
      if (!user) {
        res.status(500);
        res.json({ error: "Could not load user from DB" });
        return;
      }

      // Remove the meal
      const updatedMeals = user.meals[meal.meal].filter(userMeal => userMeal.date !== meal.date);
      user.meals[meal.meal] = updatedMeals;

      // Save the updated user document
      await user.save();

      res.status(200).json({ message: "Meal removed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Cart the meal
  router.post('/cartMeal', async (req, res) => {
    try {
      const meal = req.body.meal;
      const uid = req.body.uid;

      // Load user object to update meals array
      const user = await User.findById(uid);
      
      if (!user) {
        res.status(500);
        res.json({ error: "Could not load user from DB" });
        return;
      }

      let meals = user.meals[meal.meal]

      let newMeals = meals.map(item => {
        if (item.date === meal.date) {
          return { ...item, cart: !(meal.cart) };
          
        }
        return item;
      });

      user.meals[meal.meal] = newMeals


      // Save the updated user document
      await user.save();

      res.status(200).json({ message: "Meal carted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Delete account
  router.post('/deleteAccount', async(req, response) => {
    let pwd = req.body.password
    let id = req.body.id

    User.findById({_id: id })
      
        // if email exists
        .then((user) => {
          
          
          // compare the password entered and the hashed password found
          bcrypt
            .compare(pwd, user.password)

            // if the passwords match
            .then(async (passwordCheck) => {
    
              // check if password matches
              if(!passwordCheck) {
                  return response.status(400).send({
                  message: "Passwords does not match",
                });
              }

              User.findByIdAndDelete(id)
              .then((res)=> {
                response.status(200).send({
                  message: "Delete Successful"
              });

              })
              .catch((e) => {
                response.status(500).send({
                  message: e
              });

              })

                  
              
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
            message: "User not found",
            e,
          });
        });
  })



  // Save a meal. This is used if we learned a meal in Direct Meal page, and now want to save it to the DB.
  router.post('/saveMeal', async(req,res) => {
    let uid = req.body.uid
    let meal = req.body.meal

    let user = await User.findById(uid)
    if (!user)
    {
        res.status(500);
        res.json({error: "Could not load user from DB to save the meal"})
        
    }

    user.meals[meal.meal].push(meal);
    user.save()
    
  })


  // Learn the meal
  router.post('/learnMeal', async(req,res) => {
    let meal = req.body.meal
    let uid = req.body.uid
    let reqs = req.body.reqs
    let save = req.body.save // we should not save the meal of req_in was passed in App.js because this means it was from the Direct Meal tab.

    // Add the meal immediately to the DB, without instructions
    let user = await User.findById(uid)
    if (!user)
    {
        res.status(500);
        res.json({error: "Could not load user from DB to save the meal"})
        return
      
    }

    if (save)
    {
      user.meals[meal.meal].push(meal);
      user.save()
    }
    
    
    

    // Form a message to ask chatGPT
    let query = `Give me a list of instructions, ingredients and nutrition for ${meal.title}: ${meal.description}. ${reqs? "You must follow these requests: " + reqs : ""} Your response must be structured in this way: INGREDIENTS: {numbered list of ingredients} INSTRUCTIONS: {numbered list of instructions} NUTRITION: {list of nutrition facts}. Do not exceed 250 words in your combined response. Do not deviate from this format.`

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
  .then(async response => {
    // Get the meal from the DB incase they updated the cart value while loading

    result = response.data.choices[0].message.content

    // Get latest user to fix overwriting data
    // let user2 = await User.findById(uid)

    // Get and update the learned meal again (incase its cart value has been updating while learning)
    let latestMeal = save ? user.meals[meal.meal].find(item => item.date === meal.date) : meal

    latestMeal.ingredients = result.substring(result.toUpperCase().indexOf('IGREDIENTS:')+ 14,  result.toUpperCase().indexOf('INSTRUCTIONS') - 1)
    latestMeal.instructions = result.substring(result.toUpperCase().indexOf('INSTRUCTIONS:') + 14, result.toUpperCase().indexOf('NUTRITION') - 1)
    latestMeal.nutrition = result.substring(result.toUpperCase().indexOf('NUTRITION') + 11, result.length)

    // If we aren't saving, quit now
    if (!save)
      res.json({
        meal: latestMeal
      })


    // Prepare the update query
    const updateValues = {
      $set: {
        ['meals.' + meal.meal + '.$[element].ingredients']: latestMeal.ingredients,
        ['meals.' + meal.meal + '.$[element].instructions']: latestMeal.instructions,
        ['meals.' + meal.meal + '.$[element].nutrition']: latestMeal.nutrition,
      }
    };
    
    const options = {
      arrayFilters: [{ 'element.date': meal.date }],
      new: true, // Return the modified document
    };

    // Update the values for this user
    User.findByIdAndUpdate(uid, updateValues, options)
    .then((doc) => {
      // To set the details on the UI
      res.json({
        meal: latestMeal
      })
    })
    .catch((e) => {
      console.log("Learn meal fail:", e)
    })
          
  })
  .catch(error => {
    // gpt error: server issue, not client issue
    console.log('FATAL GPT ERROR ')
    res.status(500);
    res.json({error: error})
    return
  })
    

  })// endpoint end learnMeal
    

  router.post('/generateMeal', async(req,res) => {

      let meal = req.body.meal
      let complexity = req.body.complexity
      let requests = req.body.requests
      let directHistory = req.body.history // override history from DB, useful for direct meal feature

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
      if (tokens <= 0)
      {
        res.status(422).json({error: "Insufficient tokens"})
        return
      }

      let history_str = ""
      // history override
      if (directHistory)
      {
        history_str = directHistory
      }
      else if (history[meal])
      {

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

      }

      

      let query = `give me a random ${complexity} ${meal} meal and a 20 word description. ${history_str ? "Do not use any of the following:" + history_str: ""} ${requests ? "You must follow these additional requests:" + requests: ""} Your response must be in the form of FOOD: {meal} DESC: {description}${!meal? " TYPE: {meal type, which is either 'breakfast', 'lunch', or 'dinner'}" : ""}`
      //console.log(query)
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
    .then(async response => {

      result = response.data.choices[0].message.content

      title = result.substring(result.toUpperCase().indexOf('FOOD:')+6,  result.toUpperCase().indexOf('DESC') - 1).replace(new RegExp('"', 'g'), '').replace(new RegExp(':', 'g'), '')

      let endIndex = !meal ? result.toUpperCase().indexOf('TYPE:') : result.length
      description = result.substring(result.toUpperCase().indexOf('DESC: ') + 6, endIndex)

      // If we didn't provide a meal type, let AI predict it and categorize based on it's thoughts.
      if (!meal)
        meal = result.substring(result.toUpperCase().indexOf('TYPE: ') + 6, result.length).toLowerCase()

      // CSE Grab
      const apiKey = process.env.CSE_API;
      const cx = process.env.CSE_ID;

      axios.get(`https://www.googleapis.com/customsearch/v1?q=${title}&cx=${cx}&key=${apiKey}&searchType=image`)
      .then((response) => {
        const image = response.data.items[0].link;
        confirmMeal(user, meal, res,  title, description, image)

      })
      .catch(() => {
        // No more requests: Grab google

        // Google grab
      axios.get(`https://www.google.com/search?q=${encodeURI(title)}&tbm=isch&tbs=il:cl`)
      .then(async response => {
        
        const haystack = response.data;
        const start = haystack.indexOf('src="https')
        const end = haystack.substring(start + 5, haystack.length).indexOf('"')

        image = haystack.substring(start + 5, start + end + 5)
        confirmMeal(user, meal, res, title, description, image)
      
      })

        
      .catch(error => {
        console.log("Error grabbing image: ", error)
          // Image error, return anyway
          confirmMeal(user, meal, res,  title, description, image)
          
      })


      })

    })
    .catch(error => {
      // gpt error: server issue, not client issue
      console.log('FATAL GPT ERROR: ', error)
      res.status(500);
      res.json({error: error})
      return
    })

    
  })

  async function confirmMeal(user, meal, res, title, description, image)
  {
    if (user.history[meal])
    {
      if (user.history[meal].length > MAX_HISTORY_LENGTH)
      {
        user.history[meal].shift()
      }

      user.history[meal].push(title);
    }
    // History is at its max length. Remove oldest item
    

    // Decrease the tokens field by 1
    user.tokens--;
    
    // Save the updated user with less tokens
    
    // THIS IS THE RETURN FOR GENERATE MEAL!
    try {
      await user.save();
      // Successful return 
      res.json({
        title: title,
        description: description,
        meal: meal,
        image: image,
        tokens: user.tokens, // return true token count for server side validation
      })

    } catch (err) {
      console.error('Error updating user after meal generation', err);
      res.status(500);
      res.json({error: "Error updating user tokens and history"})
    }
  }

  module.exports = router;