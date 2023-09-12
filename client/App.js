
import {AppState } from 'react-native';
import Navigation from './Screens/Navigation';
import Login from './Components/Login';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react'
import {BASE_URL} from "@env"
// TODO
// add table for all devices for keeping track of trials? Or query all users?
// Move pin to new screen with back button
// remember me?
//enforce valid email
// if email is not confirmed in 5 mins, and account is new (devices length is 0) delete the account
let breakfastQueue = []
let lunchQueue = []
let dinnerQueue = []
let history = {
  breakfast: [],
  lunch: [],
  dinner: [],
}

let breakfastToGenerate = 0
let lunchToGenerate = 0
let dinnerToGenerate = 0

// The size of the queue when printing will not exceed 10. What happens, is extra food is generated, because some generations over dominate the update of the queue for others. So a food generation will sometimes fail to update the state, causing an extra generation
export default function App() {

  const [authenticated, setAuthenticated] = useState(false)
  
  // Don't wait for history to be updated between swipes. Faster, less varied
  const FAST_MODE = false

  // Stateful progress monitors stateless queues and sends data to loading screen for real-time analytics.
  const [progress, setProgress] = useState(0)
  const [breakfastLoaded, setBreakfastLoaded] = useState(false)
  const [lunchLoaded, setLunchLoaded] = useState(false)
  const [dinnerLoaded, setDinnerLoaded] = useState(false)

  const [nextMeal, setNextMeal] = useState('')

  
  const MAX_HISTORY_LENGTH = 150

  

  const [breakfastList, setBreakfastList] = useState([])
  const [lunchList, setLunchList] = useState([])
  const [dinnerList, setDinnerList] = useState([])
  const DEFAULT_MEAL = 'breakfast'
  const [activeMeal, setActiveMeal] = useState(DEFAULT_MEAL)
  const [preferences, setPreferences] = useState({})

  const [init, setInit] = useState(false)
  // Automatically check to see if we are logged in
  const [preInit, setPreInit] = useState(true)
  const [loading, setLoading] = useState(true)
  const MIN_QUEUE_SIZE = 20

  // When we authenticate, initialize.
  useEffect(() =>
  {
    if (authenticated)
    {
      setInit(true)
    }
  }, [authenticated])


  useEffect(() =>
  {
    AsyncStorage.getItem('token').then(value => {
      // If we are logged in, set auth to true to show the app and init
      if (value)
      {
        setAuthenticated(true)
      }
      setPreInit(false)
    })

  }, [preInit])

  useEffect(() => {
    // If all meals are loaded, set loaded to true because everything has loaded
    if (breakfastLoaded && lunchLoaded && dinnerLoaded)
    {
      if (loading)
      {
        setLoading(false)
        
      }
    }

  }, [breakfastLoaded, lunchLoaded, dinnerLoaded])

  // When setting new meal type, show the meal on the UI
  useEffect(() =>
  {
    if (!loading)
    {
      // Trying to fix bug where queue is not up to date yet and shows repeat meal by comparing meal names
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
  },[activeMeal])


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


  const handleAppStateChange = newState => {
    if (newState === 'inactive') {

      AsyncStorage.setItem('breakfast_list', JSON.stringify(breakfastList))
      AsyncStorage.setItem('lunch_list', JSON.stringify(lunchList))
      AsyncStorage.setItem('dinner_list', JSON.stringify(dinnerList))
      AsyncStorage.setItem('history', JSON.stringify(history))
      

      AsyncStorage.setItem('preferences', JSON.stringify(preferences))

    }

  };



  useEffect(() => {
    // Subscribe to AppState changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up subscription when component unmounts
    return () => {
      appStateSubscription.remove();
    };
  }, []);


  // Log out through preference page
  function logOut()
  {
    AsyncStorage.removeItem('token')
    setAuthenticated(false)
  }

  // Clear history
  function clearHistory()
  {
    AsyncStorage.removeItem('history')
    history = {
      breakfast: [],
      lunch: [],
      dinner: [],
    }
  }

  // Meal queues
  function scheduleMeal(meal, count)
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
    if ( ((meal === 'breakfast'? breakfastToGenerate : meal === 'lunch'? lunchToGenerate : dinnerToGenerate) === count) || FAST_MODE)
    {
      // Queue was empty so must start the recursive calls
      generateMeal(meal)
    }
  }

  // On first load, get values from storage and restore state
  if (init)
  {
    // AsyncStorage.removeItem('breakfast_queue')
    // AsyncStorage.removeItem('lunch_queue')
    // AsyncStorage.removeItem('dinner_queue')
    setInit(false)

    console.log('initializing')

    // Load history from storage
    AsyncStorage.getItem('history').then(value => {
      if (value)
      {
        history = (JSON.parse(value))
      }
        
        
      // History is loaded, so load the meals now

      // Initialize food items - make sure we have a stocked selection!

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
          breakfastQueue = q
        scheduleMeal('breakfast', (MIN_QUEUE_SIZE - (q? q.length: 0)))
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
        scheduleMeal('lunch', (MIN_QUEUE_SIZE - (q? q.length: 0)))
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
        scheduleMeal('dinner', (MIN_QUEUE_SIZE - (q? q.length: 0)))
      }

      // Update load progress
      setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
        
    });
    })


    // Initialize preferences
    AsyncStorage.getItem('preferences').then(value => {
      if(value)
        setPreferences(JSON.parse(value))
    })


    // Load cookbook items
    AsyncStorage.getItem('breakfast_list').then(value => {
      if(value)
        setBreakfastList(JSON.parse(value))
    })
    AsyncStorage.getItem('lunch_list').then(value => {
      if(value)
        setLunchList(JSON.parse(value))
    })
    AsyncStorage.getItem('dinner_list').then(value => {
      if(value)
        setDinnerList(JSON.parse(value))
    })


    


  }

// Login from login screen
function loggedIn(token)
{
  AsyncStorage.setItem('token', token)
  setAuthenticated(true)
  
}

// Client changes meal from header touch
function changeMeal(newMeal)
{
  setActiveMeal(newMeal)
  //Triggers useEffect which will set the meal card
}



// Swiped on a meal
function swiped(right)
{
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
  scheduleMeal(activeMeal, 1)

  // We know the meal , we need to learn it
  if (right)
    learnMeal(meal)

  
}

// Learn a meal - when swiped right, gather instructions and ingredients, and when done, add to cookbook
function learnMeal(meal)
{

}

async function generateMeal(meal)
{
  // Gather preferences from state
  let blacklist = []
  let blacklist_str = ''
  let history_str = ''
  let complexity_easy = 1
  let complexity_hard = 1
  let complexity_medium = 1

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
      complexity += (complexity)? ' or hard': 'hard'
    }
    
  }

  if (blacklist.length)
  {
    

    if (blacklist.length === 1)
    {
      // If only one, no structuring or commas
      blacklist_str = blacklist[0]
    }

    else //format the string nicely
    {
      for (let i = 0; i < blacklist.length; i++) {

        // last item
        if (i === blacklist.length - 1 && i > 0)
        {
          blacklist_str += `or ${blacklist[i]}`
        }
  
        // Non last item
        else
        {
          blacklist_str += `${blacklist[i]}, `
        }
      }
    }

    
  }
  if (history[activeMeal].length)
  {

    if (history[activeMeal].length === 1)
    {
      // If only one, no structuring or commas
      history_str = history[activeMeal][0]
    }

    else //format the string nicely
    {
      for (let i = 0; i < history[activeMeal].length; i++) {

        // last item
        if (i === history[activeMeal].length - 1 && i > 0)
        {
          history_str += `or ${history[activeMeal][i]}. `
        }
  
        // Non last item
        else
        {
          history_str += `${history[activeMeal][i]}, `
        }
      }
    }
  } // end history section

  // Execute endpoint from server
  axios.post(`${BASE_URL}/generateMeal`, {meal: meal, complexity: complexity, blacklist: blacklist_str, history: history_str})
  .then(response => {
    let description = response.data.description
    let title = response.data.title
    let image = response.data.image

    //add this title to history
    const activeMealHistory = [...history[activeMeal]];
    activeMealHistory.push(title);

    // Check to see if the length is too long now
    if (activeMealHistory.length > MAX_HISTORY_LENGTH)
    {
      activeMealHistory.shift()
    }

    // Finalize and update the new history state
    history[activeMeal] = activeMealHistory;

    // Add the meal

    newMeal = {title: title, description: description, meal: meal, image: image, ingredients: '', instructions: ''}
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
              generateMeal('breakfast')
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
              generateMeal('lunch')
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
              generateMeal('dinner')
            }

            // If dinner just has not yet loaded, check if it is now loaded
            else
            {
              // Will check if all food types are loaded and if so sets loading to false through useEffect
              setDinnerLoaded(true)
            }
          }
        
          // Update loading progress
          setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
      

  })
  .catch(error => {
    console.log(`Error in MealGenius api @ generateMeal: `, error)
  })

}
  if (authenticated)
  {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigation clearHistory = {clearHistory} logout = {logOut} loadProgress = {progress} changeMeal = {changeMeal} mealTitle = {activeMeal} swipe = {swiped} nextMeal = {nextMeal} loading = {loading}></Navigation>
    </GestureHandlerRootView>
    );
  }
  return(
    <Login login = {loggedIn}></Login>
  )

  
}
