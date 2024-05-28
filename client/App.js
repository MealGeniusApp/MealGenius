
import {AppState, Platform, Modal, View, StyleSheet, Text, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard, Linking, Image} from 'react-native';
import Navigation from './Screens/Navigation';
import Login from './Components/Login';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react'
import RNFetchBlob from 'rn-fetch-blob';


import { P_SPECIAL, P_FAST, P_EASY, P_MED, P_HARD } from './PrefTypes'; // Import the pref constants

import Purchases from 'react-native-purchases';


// Meal Genius server url
//const BASE_URL = "http://172.20.10.10:3001"
const BASE_URL = "https://mealgenius-bes7.onrender.com"

// Demo video url
const DEMO_URL = "https://youtu.be/udKK51jYs7M"

// RevCat API
const APPL_API = "appl_iymEcrjJXGyUyYLMNqGXZYiaKvP"
const GOOG_API = "goog_NxhhAZhHJkJSHDfsFAPtYIyEClP"

let breakfastQueue = []
let lunchQueue = []
let dinnerQueue = []

let breakfastToGenerate = 0
let lunchToGenerate = 0
let dinnerToGenerate = 0

// Local file system paths (caching images)
const breakfastPath = `${RNFetchBlob.fs.dirs.DocumentDir}/breakfast`
const lunchPath = `${RNFetchBlob.fs.dirs.DocumentDir}/lunch`
const dinnerPath = `${RNFetchBlob.fs.dirs.DocumentDir}/dinner`
const savedPath = `${RNFetchBlob.fs.dirs.DocumentDir}/saved`
const savedBreakfastPath = savedPath + '/breakfast';
const savedLunchPath = savedPath + '/lunch';
const savedDinnerPath = savedPath + '/dinner'

const MAX_SAVED_IMGS = 50 // Maximum number of downloaded image for each meal.

// The size of the queue when printing will not exceed 10. What happens, is extra food is generated, because some generations over dominate the update of the queue for others. So a food generation will sometimes fail to update the state, causing an extra generation
export default function App() {

  const [authenticated, setAuthenticated] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  // State value of 'booting' - true while we wait to reach the server, false when we have connected (show splash screen while true)
  const [showSplash, setShowSplash] = useState(true)
  

  // Stateful progress monitors stateless queues and sends data to loading screen for real-time analytics.
  const [progress, setProgress] = useState(0)
  const [breakfastLoaded, setBreakfastLoaded] = useState(false)
  const [lunchLoaded, setLunchLoaded] = useState(false)
  const [dinnerLoaded, setDinnerLoaded] = useState(false)

  const [tokens, setTokens] = useState(0)
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState()
  const [meals, setMeals] = useState()
  const [requests, setRequests] = useState('')
  const [cache, setCache] = useState(true)
  const [warndels, setWarndels] = useState(true)
  const [usePrefs, setUsePrefs] = useState(true)

  const [nextMeal, setNextMeal] = useState('')
  const [search, setSearch] = useState('') // For list and cart tab
  const [showSearch, setShowSearch] = useState(false)

  const DEFAULT_MEAL = 'breakfast'
  const [activeMeal, setActiveMeal] = useState(DEFAULT_MEAL)
  const [preferences, setPreferences] = useState({})
  const [managementURL, setManagementURL] = useState('')

  const [init, setInit] = useState(false)
  // Automatically check to see if we are logged in
  const [preInit, setPreInit] = useState(true)
  const [loading, setLoading] = useState(true)

  const [isModalVisible, setModalVisible] = useState(false)

  const [cart, setCart] = useState(false);
  const MIN_QUEUE_SIZE = 5

  useEffect(() => {
    // Entry point of the app. Make folders here
    async function setupFiles() {
      await checkAndCreateFolder(breakfastPath)
      await checkAndCreateFolder(lunchPath)
      await checkAndCreateFolder(dinnerPath)

      // Make files for saved images
      await checkAndCreateFolder(savedPath)

      await checkAndCreateFolder(savedBreakfastPath)
      await checkAndCreateFolder(savedLunchPath)
      await checkAndCreateFolder(savedDinnerPath)
    }

    setupFiles() // create
    
  }, [])

  // Setup meal folder
  const checkAndCreateFolder = async (folderPath) => {
    try {
      const folderExists = await RNFetchBlob.fs.isDir(folderPath);
      if (!folderExists) {
        await RNFetchBlob.fs.mkdir(folderPath);
        console.log('Folder created successfully!');
      }
    } catch (error) {
      console.error('Error checking or creating folder:', error);
    }
  };


  // SEARCHING: Toggle the search bar
  function toggleSearch()
  {
    setShowSearch(!showSearch)
  }

  // SEARCHING: Update the search criteria
  function updateSearch(query)
  {
    setSearch(query)
  }

  // Help modal text
  const [textInputValue, setTextInputValue] = useState('');

  // Help modal
  const handleChangeText = (text) => {
    setTextInputValue(text);
  };

  // Submit help message
  const handleSubmit = () => {
    // Close modal
    closeModal();

    // Send the message
    axios.post(`${BASE_URL}/contact`, {msg: textInputValue, uid: userId, email: email})
    .then(() => {
      alert("Your message was recieved!")
    })
    .catch(() => {
      alert("We're sorry, there was an error.\nPlease email MealGeniusApp@gmail.com")
    })
    setTextInputValue('');
  };

  // When we authenticate, initialize.
  useEffect(() =>
  {
    if (authenticated)
    {
      setInit(true)
    }
  }, [authenticated])

  

  useEffect( () =>
  {
    AsyncStorage.getItem('token').then(value => {
      // If we are logged in, set auth to true to show the app and init
      
      if (value)
      {
        logIn(value)
        // Hides the splash screen after attempting to log in.
      }
      else
      {
        // We are not log in, hide the splash screen (to present the login page)
        setShowSplash(false)
      }

      setPreInit(false)
    })

  }, [preInit])

  useEffect(() => {
    // If all meals are loaded, set loaded to false because everything has loaded
    if (breakfastLoaded && lunchLoaded && dinnerLoaded)
    {
      if (loading)
      {
        // ALL meals have just finished loading!
        setLoading(false)
        
      }
    }

  }, [breakfastLoaded, lunchLoaded, dinnerLoaded])

  // When setting new meal type, or when done loading, show the meal on the UI
  useEffect(() =>
  {
    if (!loading)
    {
      switch (activeMeal)
      {
        case 'breakfast':
        {

          setNextMeal(breakfastQueue[0])
          break
        }
        case 'lunch':
        {
          setNextMeal(lunchQueue[0])
          break
        }
        case 'dinner':
        {
          setNextMeal(dinnerQueue[0])
          break
        }
      }
    }
  },[activeMeal, loading])


  // Loading has started or finished. If it finished, we can set next meal
  useEffect(() =>
  {
    if (loading)
    {
      // loading...
    
    }
    else{
      // Done loading.. trigger meal update
      console.log('Done loading!')
      //setActiveMeal(DEFAULT_MEAL)
      if (!nextMeal)
      {
        switch (activeMeal)
        {
          case 'breakfast':
          {
            setNextMeal(breakfastQueue[0])
            break
          }
          case 'lunch':
          {
            setNextMeal(lunchQueue[0])
            break
          }
          case 'dinner':
          {
            setNextMeal(dinnerQueue[0])
            break
          }
        }
      }
      
    }
  }, [loading])

  useEffect(() =>
  {
    
    // Makes sure we re-render to show the first meal: Experimental
  }, [nextMeal])


  const handleAppStateChange = newState => {
    if (newState === 'active') {
      // App opened. User is not dormat.
      if (userId)
        axios.post(`${BASE_URL}/appOpened`, {user_id: userId})
    }
    

  };



  useEffect(() => {
    // Subscribe to AppState changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    //console.log("Opened")

    // Clean up subscription when component unmounts
    return () => {
      appStateSubscription.remove();
    };
  }, []);

  // Force regeneration of all meals
  function refreshMeals(req_in)
  {
    setLoading(true)
    AsyncStorage.removeItem('breakfast_queue')
    breakfastQueue = []
    setBreakfastLoaded(false)
    scheduleMeal('breakfast', (MIN_QUEUE_SIZE ), req_in)

    AsyncStorage.removeItem('lunch_queue')
    lunchQueue = []
    setLunchLoaded(false)
    scheduleMeal('lunch', (MIN_QUEUE_SIZE ), req_in)

    AsyncStorage.removeItem('dinner_queue')
    dinnerQueue = []
    setDinnerLoaded(false)
    scheduleMeal('dinner', (MIN_QUEUE_SIZE ), req_in)

  }


  // user logged in, load queues
  useEffect(() => {

    if (authenticated)
    {

      // Load queues up given history.
    AsyncStorage.getItem('breakfast_queue').then(value => {
      let q = JSON.parse(value)
      if (q?.length >= MIN_QUEUE_SIZE - 1)
      {
        
        // We have saved data, load it!
        breakfastQueue = q
        
        setBreakfastLoaded(true)
        
      }

      // No saved data present - must generate new!
      else
      {
        if (q)
          breakfastQueue = q // Load up values if any are present
        scheduleMeal('breakfast', (MIN_QUEUE_SIZE - (q? q.length: 0)), requests) // generate the remaining
      }
      
      setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
        
      
      
    });

    AsyncStorage.getItem('lunch_queue').then(value => {
      let q = JSON.parse(value)

        if (q?.length >= MIN_QUEUE_SIZE - 1)
        // We have saved data, load it!
        {
          lunchQueue = q
          setLunchLoaded(true)
        }
        
    

      // No saved data present - must generate new!
      else
      {
        if (q)
          lunchQueue = q
        scheduleMeal('lunch', (MIN_QUEUE_SIZE - (q? q.length: 0)), requests)
      }
        
      setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
        

      
    });

    

    AsyncStorage.getItem('dinner_queue').then(value => {
      let q = JSON.parse(value)
 
        if (q?.length >= MIN_QUEUE_SIZE - 1)
        // We have saved data, load it!
        {
          dinnerQueue = q
          setDinnerLoaded(true)
        }
        


      // No saved data present - must generate new!
      else
      {
        if (q)
          dinnerQueue = q
        scheduleMeal('dinner', (MIN_QUEUE_SIZE - (q? q.length: 0)), requests)
      }

      // Update load progress
      setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
        
     
      
    });
    }
    
  

  }, [authenticated])

  /**
   * Download the image for faster loading
   * @param {String} uri 
   * @param {String} path
   */
  const downloadImage =  async (uri, path) => {
    try {
      await RNFetchBlob.config({
        path: path,
      }).fetch('GET', uri);
      //console.log('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
    }
    
  };
  
  // Function to maintain the image storage
  
  
  const downloadAndMaintainImages = async (item, saved) => {
    // Download image for the item `${RNFetchBlob.fs.dirs.DocumentDir}/images`
    const path = `${RNFetchBlob.fs.dirs.DocumentDir}/${saved? 'saved/': ''}${item.meal}`
    const imagePath = `${path}/${item.date}.jpg`; 

    downloadImage(item.image, imagePath);

    try {
      // Read directory contents
      const paths = await RNFetchBlob.fs.lstat(path);
  
      // Check if we exceed the maximum allowed images
      const numberOfItems = paths.length;
      const maxItems = saved ? MAX_SAVED_IMGS : MIN_QUEUE_SIZE;
  
      if (numberOfItems > maxItems) {
        // Find the oldest image file
        let oldestItem = null;
        let oldestItemTime = Number.MAX_SAFE_INTEGER;
  
        for (const item of paths) {
          if (item.lastModified < oldestItemTime) {
            oldestItem = item.path;
            oldestItemTime = item.lastModified ;
          }
        }
  
        // Delete the oldest image file
        await RNFetchBlob.fs.unlink(oldestItem);
        //console.log('Deleted oldest image:', oldestItem);
      }
    } catch (error) {
      console.error('Error checking and deleting oldest image:', error);
    }
  };

  // Hide / show the help modal
  const showHelpModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Update value of cache from prefs page
  function updateCacheOption(should)
  {
    setCache(should)
    // store locally so we remember when we re initialize the app
    AsyncStorage.setItem('cache', should+'')
  }

  // Update value of use prefs for direct meal gen
  function updateUsePrefs(should)
  {
    setUsePrefs(should)
    // store locally so we remember when we re initialize the app
    AsyncStorage.setItem('useprefs', should+'')
  }

  // Update value of warn deletions from prefs page
  function updateWarndels(should)
  {
    setWarndels(should)
    // store locally so we remember when we re initialize the app
    AsyncStorage.setItem('warndels', should+'')
  }

  // Update special requests through preferences page
  function updateRequests(req_in, refresh)
  {
    
    setRequests(req_in)
    axios.post(`${BASE_URL}/updateRequests`, {user_id: userId, requests: req_in})
    .then((res)=> {
      // Refresh the meals
      if (refresh)
      {
        
        clearHistory()
        refreshMeals(req_in)
      }
      
    })
    .catch((e) => {
      alert(`Error: ${e}`)
    })
    // Can return this and do a .then .catch in pref page.
  }

  // Log out through preference page
  function logOut()
  {
    AsyncStorage.removeItem('token')
    setAuthenticated(false)
  }

   // Delete account through preference page
   function deleteAccount(password)
   {
    AsyncStorage.getItem('token')
    .then((id) => {

      axios.post(`${BASE_URL}/deleteAccount`, {id: id, password: password})
      .then((res) => {
        // Deleted account successfully, logout now
        AsyncStorage.removeItem('token')
        setAuthenticated(false)

      })
      .catch((e) => {
        // could not delete, display error
        if (e.response.status == 400)
        {
          alert("Failed to delete your account. Your password was incorrect.")

        }
        else if (e.response.status == 404)
        {
          alert("Failed to delete your account: User not found")

        }
        else{
          alert("Failed to delete your account. Please try again later")

        }
        
        console.log("Error deleting account:", e.response.status)
      })
     

    })
    
   }

  // Clear history
  function clearHistory()
  {
    // Call api to set history
    return axios.post(`${BASE_URL}/clearHistory`, {user_id: userId})
  }

  // Meal queues
  function scheduleMeal(meal, count, req_in)
  {
    // Increase the number of meals to generate
    switch(meal)
    {
      case 'breakfast':
      {
        breakfastToGenerate += count
        break
      }
      case 'lunch':
      {
        lunchToGenerate += count
        break
      }
      case 'dinner':
      {
        dinnerToGenerate += count
        break
      }
    }

    // Start the cycle if it was not running
    if ( ((meal === 'breakfast'? breakfastToGenerate : meal === 'lunch'? lunchToGenerate : dinnerToGenerate) === count) || getPref(P_FAST, false))
    {
      // Queue was empty so must start the recursive calls
      generateMeal(meal, req_in)
    }
  }

  // Get the preference or return default
  function getPref(pref, fallback)
  {
    let res = preferences[pref]
    if (typeof res === 'undefined')
      return fallback
    return res
  }

  // On first load, get values from storage and restore state
  if (init)
  {
    setInit(false)

    console.log('initializing')

    AsyncStorage.getItem('cache').then(value => {
      if (value)
      {
        setCache(value === "true")
      }
      // Default to true
      else{
        setCache(true)
        AsyncStorage.setItem('cache', "true")
      }
    })

    AsyncStorage.getItem('warndels').then(value => {
      if (value)
      {
        setWarndels(value === "true")
      }
      // Default to true
      else{
        setWarndels(true)
        AsyncStorage.setItem('warndels', "true")
      }
    })

    AsyncStorage.getItem('useprefs').then(value => {
      if (value)
      {
        setUsePrefs(value === "true")
      }
      // Default to true
      else{
        setUsePrefs(true)
        AsyncStorage.setItem('useprefs', "true")
      }
    })
    

    // Load user data from DB
    AsyncStorage.getItem('token').then(value => {
      if (value)
      {
        logIn(value)
      }
    })
    

    // Initialize preferences
    // Prefs are to be saved after modifying one: set state variable and store
    AsyncStorage.getItem('preferences').then(value => {
      if(value)
        setPreferences(JSON.parse(value))
    })


  }

// Saves the new preferences dictionary
function savePreferences(prefs)
{
  setPreferences(prefs)
  AsyncStorage.setItem('preferences', JSON.stringify(prefs))
}

// middleware Login from login screen: Must set token because it definitely is not set
function loggedIn(token)
{
  AsyncStorage.setItem('token', token)
  logIn(token)
}

// Log in: load user data and authenticate
function logIn(token)
{
  
  
  axios.post(`${BASE_URL}/user`, {user_id: token})
  .then(async (res) => {
    setTokens(res.data.tokens)
    setMeals(res.data.meals)
    setRequests(res.data.requests)
    setEmail(res.data.email)
    setUserId(token)
    setSubscribed(res.data.subscribed)

    // Allow purchasing subscriptions
    try {
      if (Platform.OS === 'ios')
      {
        await Purchases.configure({apiKey: APPL_API, appUserID: token})
      }
      else
      {
        await Purchases.configure({apiKey: GOOG_API, appUserID: token})
      }
    }
    catch {
      console.log("RevenueCat failed to initialize")
    }
    
    setShowSplash(false) // we finished our attempt to login, so we can hide the splash screen
    setAuthenticated(true)
    
  })
  .catch((e) => {
    console.log('Error in logIn app.js: ', e)
    //alert("Failed to connect to the server.")
  })
}

// Purchase subscription
const purchase = async () => {
  try {
      // Try to make the purchase
      //Purchases.getOfferings()
      products = await Purchases.getProducts(['cards']);
      product = products[0]
      //console.log(product)
      try {
        const {customerInfo, productIdentifier} = await Purchases.purchaseStoreProduct(product);
        if (typeof customerInfo.entitlements.active['pro'] !== "undefined") {
          // Successfull purchase, grant tokens
          axios.post(`${BASE_URL}/newSubscriber`, {user_id: userId})
          .then((response) => {
            // Update tokens locally
            setTokens(response.data.tokens)
            setSubscribed(true)
            console.log("Subscribed!")

            // UI feedback here for subscription

          })
          .catch((e) => {
            // User was charged, but my server made an error
            // issue refund / log the error
            console.log(e)
          })
        }
        else
        {
          //console.log("LOCKED")
        }
      } catch (e) {
        if (!e.userCancelled) {
          console.log(e)
        }
      }

      
      
  }
  catch(e)
  { // User canceled, no wifi etc
      alert('Error Purchasing. You were not charged.')
  }
}

// Client changes meal from header touch
function changeMeal(newMeal)
{
  setActiveMeal(newMeal)
  //Triggers useEffect which will set the meal card
}



// Swiped on a meal
  async function swiped(right)
{
  // Locally decrease tokens. This is cosmetic, only.
  setTokens(tokens - 1)

  // If we ran out of meals (swiping too fast! ) Show the load screen while they regenerate
  if (((activeMeal == 'breakfast')? breakfastQueue.length : (activeMeal == 'lunch')? lunchQueue.length : dinnerQueue.length) == 1)
  {
    setLoading(true)
  }
  // Remove and store the first item from the array
  let meal = ''
  switch (activeMeal)
  {
    case 'breakfast':
      {
        // Queue is no longer fully loaded
        setBreakfastLoaded(false)
        meal = breakfastQueue.shift()
        setNextMeal(breakfastQueue[0])
        break
      }
    case 'lunch':
      {
        // Queue is no longer fully loaded
        setLunchLoaded(false)
        meal = lunchQueue.shift()
        setNextMeal(lunchQueue[0])
        break
      }
    case 'dinner':
      {
        // Queue is no longer fully loaded
        setDinnerLoaded(false)
        meal = dinnerQueue.shift()
        setNextMeal(dinnerQueue[0])
        break
      }

    default:
      {
        meal = null
        break
      }
  }

  // Schedule the new meal to be generated: Starts meal gen or increases count
  scheduleMeal(activeMeal, 1, requests)

  // We know the meal , we need to learn it
  if (right)
  {
    // Add the meal immediately while it loads for UI purposes
    let uid = meal.date
    setMeals((prevMeals) => ({
      ...prevMeals,
      [meal.meal]: [...prevMeals[meal.meal], meal],
    }));

    // Download the image
    downloadAndMaintainImages(meal, true) // store it for longer with true param, because we saved it.
    

    // Now get the ingredients and instructions
    let response = await learnMeal(meal)
    
    let new_meal = response.data.meal

    // When we recieve the ingredients and instructions store them locally
    // by replacing the item we added previously
    setMeals((prevMeals) => ({
      ...prevMeals,
      [meal.meal]: prevMeals[meal.meal].map((old_meal) => ((uid == old_meal.date) ? new_meal : old_meal)),
    }));
  }

  
}

// Learn a meal - when swiped right, gather instructions and ingredients, and when done, add to cookbook
async function learnMeal(meal, req_in) {
  return new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/learnMeal`, { meal: meal, uid: userId, reqs: req_in ? req_in : requests, save: !req_in })
      .then(response => {
        resolve(response); // Resolve with the response data
      })
      .catch(error => {
        alert("Sorry, there was an error learning the meal");
        reject(error); // Reject with the error object
      });
  });
}


// Unlearn a meal: Deletes from our meal array.
  async function forgetMeal(meal)
{
  axios.post(`${BASE_URL}/forgetMeal`, { meal: meal, uid: userId });

  // Remove locally
  setMeals(prevMeals => ({
    ...prevMeals,
    [meal.meal]: prevMeals[meal.meal].filter(item => item !== meal),
  }));

  // Delete image from cache
  let path = `${RNFetchBlob.fs.dirs.DocumentDir}/saved/${meal.meal}/${meal.date}.jpg`
  if (await RNFetchBlob.fs.exists(path))
    RNFetchBlob.fs.unlink(path)
}

// Add the meal to the shopping cart
function cartMeal(meal)
{
  // Locally change the property
  setMeals((prevMeals) => {
    return {
      ...prevMeals,
      [meal.meal]: prevMeals[meal.meal].map((item) => {
        if (item === meal) {
          return {
            ...item,
            cart: !(meal.cart),
          };
        }
        return item;
      }),
    };
  });
  
  axios.post(`${BASE_URL}/cartMeal`, { meal: meal, uid: userId })
  .catch(() => {
    // set it back, alert error
    setMeals((prevMeals) => {
      return {
        ...prevMeals,
        [meal.meal]: prevMeals[meal.meal].map((item) => {
          if (item === meal) {
            return {
              ...item,
              cart: !meal.cart,
            };
          }
          return item;
        }),
      };
    });

    alert('Error carting meal')
  })



}

// User wants a meal from their direct instructions
// User provides details on what type of meal they want, ingredients they have etc
async function directMeal(details, hist)
{

  let reqs = !usePrefs? details : (details + (!requests? "" : " You must also adhere to these instructions: " + requests))
  console.log(details)
  let meal = await generateMeal("", reqs , hist)
  if (!meal)
  {
    // No tokens, or some other error
    alert("Sorry, there was an issue.")
    return
  }
  // Now get the ingredients and instructions
  let response = await learnMeal(meal, reqs)
    
  return response.data.meal // it has the instructions / ingredients injected.

}

// Save a meal (if we learned it with direct meal page and now want to store it)
function saveMeal(meal)
{
  // Add to UI locally
  setMeals((prevMeals) => ({
    ...prevMeals,
    [meal.meal]: [...prevMeals[meal.meal], meal],
  }));

  return axios.post(`${BASE_URL}/saveMeal`, {
    meal: meal,
    uid: userId,
  })
}

async function generateMeal(meal, req_in, hist_in) {
  return new Promise((resolve, reject) => {
    console.log('Generating a meal...');

    // Gather preferences from state
    let req = req_in ? req_in : requests;
    let complexity_easy = getPref(P_EASY, true) ? 1 : 0;
    let complexity_hard = getPref(P_MED, true) ? 1 : 0;
    let complexity_medium = getPref(P_HARD, true) ? 1 : 0;

    let complexity = '';

    if (complexity_easy + complexity_medium + complexity_hard === 2 || complexity_easy + complexity_medium + complexity_hard === 1) {
      if (complexity_easy) {
        complexity += 'easy';
      }
      if (complexity_medium) {
        complexity += complexity ? ' or medium' : 'medium';
      }
      if (complexity_hard) {
        complexity += complexity ? ' or complex' : 'complex';
      }
    }

    axios.post(`${BASE_URL}/generateMeal`, {
        meal: meal,
        complexity: complexity,
        requests: req,
        user_id: userId,
        history: hist_in
      })
      .then(response => {
        let description = response.data.description;
        let title = response.data.title;
        let image = response.data.image;

        const currentDate = new Date();
        const uniqueString = currentDate.toISOString().replace(/[-T:.Z]/g, '');

        const newMeal = {
          title: title,
          description: description,
          meal: meal? meal : response.data.meal,
          image: image,
          ingredients: '',
          instructions: '',
          nutrition: '',
          cart: false,
          date: uniqueString
        };

        // Save the image locally to load it quicker
        // param 'saved' is false because it's only necessary for the queue
        downloadAndMaintainImages(newMeal, false);

        console.log(title);

        if (meal === 'breakfast') {
          breakfastQueue.push(newMeal);
          breakfastToGenerate--;
          AsyncStorage.setItem('breakfast_queue', JSON.stringify(breakfastQueue))
            .then(() => {
              if (breakfastToGenerate > 0) {
                generateMeal('breakfast', req).then(resolve).catch(reject);
              } else {
                setBreakfastLoaded(true);
              }
            })
            .catch(reject);
        } else if (meal === 'lunch') {
          lunchQueue.push(newMeal);
          lunchToGenerate--;
          AsyncStorage.setItem('lunch_queue', JSON.stringify(lunchQueue))
            .then(() => {
              if (lunchToGenerate > 0) {
                generateMeal('lunch', req).then(resolve).catch(reject);
              } else {
                setLunchLoaded(true);
              }
            })
            .catch(reject);
        } else if (meal === 'dinner') {
          dinnerQueue.push(newMeal);
          dinnerToGenerate--;
          AsyncStorage.setItem('dinner_queue', JSON.stringify(dinnerQueue))
            .then(() => {
              if (dinnerToGenerate > 0) {
                generateMeal('dinner', req).then(resolve).catch(reject);
              } else {
                setDinnerLoaded(true);
                
              }
            })
            .catch(reject);
        }

        if (breakfastToGenerate + lunchToGenerate + dinnerToGenerate === 0 && loading) {
          setLoading(false);
        }

        // Update loading progress
        setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE));
        resolve(newMeal);

      })
      .catch(error => {
        console.log(`Error in MealGeniuds api @ generateMeal: `, error);
        reject(error);
      });
  });
}

  if (showSplash)
  {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require('./assets/splash.png')}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      </View>
    )
  }
  if (authenticated)
  {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Navigation cart = {cart} setCart = {setCart} saveMeal = {saveMeal} directMeal = {directMeal} usePrefs = {usePrefs} updateUsePrefs = {updateUsePrefs} updateWarndels = {updateWarndels} warndels = {warndels} updateCacheOption = {updateCacheOption} cache = {cache} showSearch = {showSearch} updateSearch = {updateSearch} toggleSearch = {toggleSearch} search = {search} help = {showHelpModal} requests = {requests} updateRequests= {updateRequests} deleteAccount = {deleteAccount} subscribed = {subscribed} purchase = {purchase} managementURL= {managementURL} cartMeal={cartMeal} forgetMeal={forgetMeal} meals={meals} refreshMeals = {refreshMeals} prefs = {preferences} savePreferences = {savePreferences} clearHistory = {clearHistory} logout = {logOut} loadProgress = {progress} changeMeal = {changeMeal} mealTitle = {activeMeal} swipe = {swiped} nextMeal = {nextMeal} loading = {loading} tokens = {tokens}></Navigation>
          
          {/* Help Modal */}
          
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.modalContent}>
                {/* Title and Close Button */}
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Help</Text>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>x</Text>
                  </TouchableOpacity>
                </View>

{/* Main Content view (Top / button) */}
              <View style = {{flex:1, justifyContent: 'space-between'}}>
{/* Message Content */}
              <View style ={{marginTop: '5%'}}>
              <Text style={styles.text}>Have a comment / concern?</Text>
                <TextInput
                  style={{
                    height: Platform.OS === 'ios' && Platform.isPad ? 300 : 190,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'gray',
                    padding: 10,
                    margin: 5,
                    fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 14
                  }}
                  multiline={true}
                  numberOfLines={10}
                  value={textInputValue}
                  onChangeText={handleChangeText}
                />
                {(textInputValue && 
                <TouchableOpacity onPress={() => handleSubmit()} style={styles.demoButton}>
                  <Text style={styles.buttonText}>Send Message</Text>
                </TouchableOpacity>
                )}
              </View>

                    {/* Tutorial appears on the button  */}
              <View>
                <Text style={styles.text}>Or, watch a video app walkthrough</Text>

                <TouchableOpacity onPress={() => {Linking.openURL(DEMO_URL)
      .catch((err) => console.error('An error occurred', err))}} style={styles.demoButton}>
                  <Text style={styles.buttonText}>Watch Tutorial</Text>
                </TouchableOpacity>
              </View>

              </View>
              {/* Above ends the main content view (top and bottom) */}
                
              </View>
              </TouchableWithoutFeedback>
            </View>
          </Modal>
        </GestureHandlerRootView>
    );
  }
  return(
    <Login login = {loggedIn} api = {BASE_URL}></Login>
  )

  
}

const styles = StyleSheet.create({
  buttonText: {
    color: '#fff', // White color for text on the button
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: '#2196F3', // Blue color for Subscribe button
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    marginHorizontal: 8
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 40 : 18,
    textAlign: 'center',
  },
  text: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 18,
    textAlign: 'center',
  },
  
  closeButton: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'lightgray',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
});
