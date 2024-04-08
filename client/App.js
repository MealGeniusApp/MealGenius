
import {AppState, Platform, Modal, View, StyleSheet, Text, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard, Linking} from 'react-native';
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
//const BASE_URL = "http://54.204.246.135:3001"
const BASE_URL = "https://mealgenius-bes7.onrender.com"
// Demo video url
const DEMO_URL = "https://youtu.be/udKK51jYs7M"
const APPL_API = "appl_iymEcrjJXGyUyYLMNqGXZYiaKvP"
const GOOG_API = "goog_NxhhAZhHJkJSHDfsFAPtYIyEClP"

//let defaultBreakfast = [{"title":"French Toast\n","description":"Thick slices of bread soaked in a sweet eggy mixture, lightly fried until golden brown, and served with maple syrup.","meal":"breakfast","image":"https://sugarspunrun.com/wp-content/uploads/2023/08/French-Toast-recipe-1-of-1.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121001954477"},{"title":"Blueberry Yogurt Parfait ","description":"Layers of creamy yogurt, crunchy granola, and sweet blueberries create a delightful morning treat bursting with flavor and texture.","meal":"breakfast","image":"https://beamingbaker.com/wp-content/uploads/2022/07/IGT-blueberry-yogurt-parfait-blueberry-parfait-5.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121002003429"},{"title":"Bacon and Egg Burrito ","description":"A tantalizing combination of crispy bacon, scrambled eggs, and melted cheese, all wrapped in a warm tortilla. A breakfast favorite.","meal":"breakfast","image":"https://peasandcrayons.com/wp-content/uploads/2020/03/bacon-breakfast-burrito-recipe-.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121002010072"},{"title":"Breakfast Burrito ","description":"A hearty and flavorful Mexican-inspired breakfast filled with scrambled eggs, cheese, black beans, and salsa wrapped in a warm tortilla.","meal":"breakfast","image":"https://hips.hearstapps.com/hmg-prod/images/delish-breakfast-burrito-horizontaljpg-1541624805.jpg?crop=0.8889743589743591xw:1xh;center,top&resize=1200:*","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121002016212"},{"title":"Breakfast Sandwich ","description":"A hearty combination of fluffy scrambled eggs, crispy bacon, melted cheese, and tangy tomato sauce sandwiched between buttery toasted bread.","meal":"breakfast","image":"https://www.twopeasandtheirpod.com/wp-content/uploads/2023/06/Breakfast-Sandwich-0015.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121002023972"},{"title":"Bacon and Cheese Frittata ","description":"A delightful combination of fluffy eggs, crispy bacon, and melty cheese, baked to perfection for a satisfying breakfast.","meal":"breakfast","image":"https://www.allrecipes.com/thmb/suo78_q5T1jGL0ZGXtWd8EeykvA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/222584-bacon-cheese-frittata-4x3-0775-577af3bbcf8047b193c5ee69d366c3ce.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121002029584"},{"title":"Cinnamon Roll","description":"Soft and fluffy cinnamon roll drizzled with a sweet glaze, perfect for a cozy and indulgent breakfast treat.","meal":"breakfast","image":"https://www.allrecipes.com/thmb/SXBA_9EaVs0Q5anMwXtGIJ4g6kQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/cinnamon_rolls_editedcinnmon_roll_TT_421-9a9e8182d542469e84d6aa0e75cf9fd3.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121002034761"},{"title":"Lox Bagel","description":"A toasty bagel topped with smoked salmon, cream cheese, red onion, capers, and fresh dill for a savory breakfast delight.","meal":"breakfast","image":"https://tastesbetterfromscratch.com/wp-content/uploads/2022/07/Lox-Bagel-1.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121004149882"}]
//let defaultLunch = [{"title":"Salmon Teriyaki","description":"Succulent salmon fillet glazed with a tangy teriyaki sauce, perfectly grilled to achieve a delightful caramelized texture. Served with steamed jasmine rice and fresh stir-fried vegetables.","meal":"lunch","image":"https://natashaskitchen.com/wp-content/uploads/2016/01/Teriyaki-Salmon-Recipe-4.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121001948760"},{"title":"Chicken Shawarma","description":"Succulent marinated chicken grilled to perfection, served with warm pita bread, tangy garlic sauce, and refreshing crisp vegetables.","meal":"lunch","image":"https://feelgoodfoodie.net/wp-content/uploads/2023/09/Chicken-Shawarma-TIMG.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121001954538"},{"title":"Margherita Pizza ","description":"A classic Italian thin-crust pizza topped with tangy tomato sauce, fresh mozzarella cheese, and fragrant basil leaves.","meal":"lunch","image":"https://images.prismic.io/eataly-us/ed3fcec7-7994-426d-a5e4-a24be5a95afd_pizza-recipe-main.jpg?auto=compress,format","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003339290"},{"title":"Beef Stir-Fry","description":"Tender strips of beef tossed with colorful vegetables in a savory soy sauce, served over a bed of fluffy white rice.","meal":"lunch","image":"https://www.wellplated.com/wp-content/uploads/2020/05/Beef-Stir-Fry.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003344817"},{"title":"Turkey Club Sandwich ","description":"A classic combination of sliced turkey, crispy bacon, lettuce, tomato, and mayo on toasted bread for a satisfying lunch.","meal":"lunch","image":"https://dinnersdishesanddesserts.com/wp-content/uploads/2022/03/Turkey-Club-Sandwich-square-scaled-735x735.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003350976"},{"title":"Vegetable Pad Thai ","description":"A tantalizing blend of rice noodles, colorful veggies, and a tangy peanut sauce, topped with crushed peanuts for added crunch.","meal":"lunch","image":"https://pinchofyum.com/wp-content/uploads/Vegetarian-Pad-Thai-Recipe.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003402018"},{"title":"BBQ Pulled Pork Sandwich ","description":"Tender pulled pork smothered in tangy barbecue sauce, served on a toasted brioche bun with a side of crispy coleslaw.","meal":"lunch","image":"https://www.melskitchencafe.com/wp-content/uploads/2010/08/bbq-pork-sandwich4-600x900.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003408445"},{"title":"Spicy Tofu Tacos ","description":"Crispy corn tortillas filled with flavorful tofu, topped with tangy slaw, avocado, and drizzled with spicy chipotle sauce.","meal":"lunch","image":"https://thetoastedpinenut.com/wp-content/uploads/2019/06/Spicy-Vegetarian-Tofu-Tacos-6.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003416667"}]
//let defaultDinner = [{"title":"Spicy Beef Stir-Fry","description":"Tender slices of beef sautéed with vibrant vegetables in a fiery sauce, served over fragrant steamed jasmine rice.","meal":"dinner","image":"https://omnivorescookbook.com/wp-content/uploads/2015/03/1502_Spicy-Beef-Stir-Fry-with-Pepper_005.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121002213415"},{"title":"Mushroom and Goat Cheese Risotto","description":"Creamy risotto cooked with flavorful mushrooms and tangy goat cheese, topped with a sprinkle of fresh herbs.","meal":"dinner","image":"https://realfood.tesco.com/media/images/RFO-LargeHero-1400x919-MushroomRisotto-1f42b142-3efb-4b64-85e7-984aa6f7b156-0-1400x919.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003342366"},{"title":"Cajun Shrimp Pasta","description":"A spicy and flavorful dish featuring succulent shrimp smothered in a creamy Cajun sauce, served over al dente pasta.","meal":"dinner","image":"https://sugarspunrun.com/wp-content/uploads/2023/02/Cajun-Shrimp-Pasta-Recipe-1-of-1.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003348464"},{"title":"Beef and Broccoli Stir-Fry ","description":"Tender slices of beef sautéed with crisp broccoli florets in a savory ginger-soy sauce. Served over steamed white rice.","meal":"dinner","image":"https://www.dinneratthezoo.com/wp-content/uploads/2017/10/beef-and-broccoli-stir-fry-14.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003354953"},{"title":"Shrimp Scampi","description":"Succulent shrimp tossed in garlic butter and white wine sauce, served over a bed of linguine pasta.","meal":"dinner","image":"https://www.themediterraneandish.com/wp-content/uploads/2021/08/shrimp-scampi-recipe-5.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003400037"},{"title":"Spaghetti Bolognese","description":"Classic Italian dish with hearty tomato sauce, ground beef, and aromatic herbs served over al dente spaghetti.","meal":"dinner","image":"https://www.recipetineats.com/wp-content/uploads/2018/07/Spaghetti-Bolognese.jpg?w=500&h=500&crop=1","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003841015"},{"title":"Chicken Parmesan","description":"Crispy breaded chicken breasts topped with marinara sauce and melted mozzarella cheese, served over a bed of spaghetti.","meal":"dinner","image":"https://tastesbetterfromscratch.com/wp-content/uploads/2023/03/Chicken-Parmesan-1.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003846483"},{"title":"Pesto Pasta with Grilled Vegetables","description":"A comforting plate of al dente pasta coated in homemade basil pesto, topped with grilled seasonal vegetables for a burst of freshness.","meal":"dinner","image":"https://www.eatingwell.com/thmb/dGjxmiAtCVBhijKL1lgJpZGcY-w=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/8115128-34bc7be43d6746fcb0c05dbe9cbdbf95.jpg","ingredients":"","instructions":"","nutrition":"","cart":false,"date":"20231121003853857"}]
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
    
    
    setAuthenticated(true)
    
  })
  .catch((e) => {
    console.log('Error in logIn app.js: ', e)
    
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
async function learnMeal(meal) {
  try {
    return axios.post(`${BASE_URL}/learnMeal`, { meal: meal, uid: userId });

  } catch (error) {
    alert("Sorry, there was an error learning the meal");
    throw error; // Rethrow the error to propagate it up the call stack
  }
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

async function generateMeal(meal, req_in)
{
  console.log('Generating a meal...')
  // Gather preferences from state
  let req = req_in? req_in : requests
  let complexity_easy = getPref(P_EASY, true)? 1: 0
  let complexity_hard = getPref(P_MED, true)? 1: 0
  let complexity_medium = getPref(P_HARD, true)? 1: 0

  let complexity = ''

  if (complexity_easy + complexity_medium + complexity_hard === 2 || complexity_easy + complexity_medium + complexity_hard === 1)
  {

    if (complexity_easy)
    {
      complexity += 'easy'
    }

    if (complexity_medium)
    {
      complexity += (complexity)? ' or medium': 'medium'
    }

    if (complexity_hard)
    {
      complexity += (complexity)? ' or complex': 'complex'
    }
    
  }

  

  // Execute endpoint from server
  axios.post(`${BASE_URL}/generateMeal`, {meal: meal, complexity: complexity, requests: req, user_id: userId})
  .then(response => {
    let description = response.data.description
    let title = response.data.title
    let image = response.data.image
    console.log(breakfastToGenerate, lunchToGenerate, dinnerToGenerate)

    const currentDate = new Date();
    const uniqueString = currentDate.toISOString().replace(/[-T:.Z]/g, '');


    newMeal = {title: title, description: description, meal: meal, image: image, ingredients: '', instructions: '', nutrition: '', cart: false, date: uniqueString}
    // Save the image locally to load it quicker
    // param 'saved' is false because it's only necessary for the queue
    downloadAndMaintainImages(newMeal, false)
    // Debug print for the generated food title
    console.log(title)

    if (meal === 'breakfast')
    {
      breakfastQueue.push(newMeal)
      breakfastToGenerate--
      AsyncStorage.setItem('breakfast_queue', JSON.stringify(breakfastQueue))

      // Load next meal if queue is not empty
      if (breakfastToGenerate > 0)
      {
        generateMeal('breakfast', req)
      }
      else
      {
        setBreakfastLoaded(true)
      }
    }

    else if (meal === 'lunch')
    {
      lunchQueue.push(newMeal)
      lunchToGenerate--
      AsyncStorage.setItem('lunch_queue', JSON.stringify(lunchQueue))



      // Load next meal if queue is not empty
      if (lunchToGenerate > 0)
      {
        generateMeal('lunch', req)
      }
      // If lunch just has not yet loaded, it has been loaded now
      else
      {
        // Will check if all food types are loaded and if so sets loading to false through useEffect
        setLunchLoaded(true)
      }
    }
    else if (meal === 'dinner')
    {

      dinnerQueue.push(newMeal)
      dinnerToGenerate--
      AsyncStorage.setItem('dinner_queue', JSON.stringify(dinnerQueue))

      // Load next meal if queue is not empty
      if (dinnerToGenerate > 0)
      {
        generateMeal('dinner', req)
      }

      // If dinner just has not yet loaded, check if it is now loaded
      else
      {
        // Will check if all food types are loaded and if so sets loading to false through useEffect
        setDinnerLoaded(true)
      }
    }

    if (breakfastToGenerate + lunchToGenerate + dinnerToGenerate == 0 && loading)
    {
      setLoading(false)
    }
  
    // Update loading progress
    setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
  


  })
  .catch(error => {
    console.log(`Error in MealGeniuds api @ generateMeal: `, error)

    //generateMeal(meal)
  })

}
  if (authenticated)
  {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Navigation updateWarndels = {updateWarndels} warndels = {warndels} updateCacheOption = {updateCacheOption} cache = {cache} showSearch = {showSearch} updateSearch = {updateSearch} toggleSearch = {toggleSearch} search = {search} help = {showHelpModal} requests = {requests} updateRequests= {updateRequests} deleteAccount = {deleteAccount} subscribed = {subscribed} purchase = {purchase} managementURL= {managementURL} cartMeal={cartMeal} forgetMeal={forgetMeal} meals={meals} refreshMeals = {refreshMeals} prefs = {preferences} savePreferences = {savePreferences} clearHistory = {clearHistory} logout = {logOut} loadProgress = {progress} changeMeal = {changeMeal} mealTitle = {activeMeal} swipe = {swiped} nextMeal = {nextMeal} loading = {loading} tokens = {tokens}></Navigation>
          
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
    <Login login = {loggedIn}></Login>
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
