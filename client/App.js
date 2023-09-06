
import {AppState } from 'react-native';
import Navigation from './Screens/Navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react'
// Note for production
// Move asyncstorage.setitem for food queues to when the app closes. Dont need to do it after every meal generation!

// Note for queue size errors
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
  
  // Don't wait for history to be updated between swipes. Faster, less varied
  const FAST_MODE = false

  // Stateful progress monitors stateless queues and sends data to loading screen for real-time analytics.
  const [progress, setProgress] = useState(0)
  const [breakfastLoaded, setBreakfastLoaded] = useState(false)
  const [lunchLoaded, setLunchLoaded] = useState(false)
  const [dinnerLoaded, setDinnerLoaded] = useState(false)

  const [nextMeal, setNextMeal] = useState('')

  
  const MAX_HISTORY_LENGTH = 50

  

  const [breakfastList, setBreakfastList] = useState([])
  const [lunchList, setLunchList] = useState([])
  const [dinnerList, setDinnerList] = useState([])
  const DEFAULT_MEAL = 'breakfast'
  const [activeMeal, setActiveMeal] = useState(DEFAULT_MEAL)
  const [preferences, setPreferences] = useState({})

  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(true)
  const MIN_QUEUE_SIZE = 20
  // For billing charge per api call.
  // Limit each api call tokens through max special request length??
  // Charge for at least max possible usage

  // useEffect(() => {
  //   console.log('New history:', history)
  // }, [history])


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
  

  let query = `give me a random ${complexity} ${meal? meal: 'breakfast'} meal and a 20 word description.`
  

  if (blacklist.length)
  {
    let blacklist_str = ''

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

    // Append blacklist
    query += `Do not include anything that contains or is related to ${blacklist_str}!` 
  }
    if (history[activeMeal].length)
  {
    let history_str = ''

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

    //APpend history
    query+= `Do not use any of the following: ${history_str}`
  }
    
    

  

  // Final instruction
  //query += ' Your response should strictly be the meal title, then a description of the meal, then a list of igredients, and finally a list of detailed instructions.'
  query+= 'Your response must be in the form of FOOD: {meal} DESC: {description}'

  
  const apiKey = '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';
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const messages = [
    { role: 'user', content: query },
  ];
  
  //console.log(query)
  axios.post(
    endpoint,
    {
      model: 'gpt-3.5-turbo',
      messages: messages,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )
    .then(response => {

      result = response.data.choices[0].message.content
      
      
      let image = ''
      let title = result.substring(result.toUpperCase().indexOf('FOOD:')+6,  result.toUpperCase().indexOf('DESC') - 1).replace(new RegExp('"', 'g'), '').replace(new RegExp(':', 'g'), '')
      let description = result.substring(result.toUpperCase().indexOf('DESC: ') + 6, result.length)

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

        addMeal()
          
      })
      .catch(error => {
        // Image quota reached?
        //console.log(error)
        addMeal()
      });

      // Add the new Meal 
      function addMeal()
      {
        

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
      }

      
    })
    .catch(error => {
      console.log(error.message)
      //setTimeout(() => {generateMeal(meal)}, 1000)
    });


}


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigation loadProgress = {progress} changeMeal = {changeMeal} mealTitle = {activeMeal} swipe = {swiped} nextMeal = {nextMeal} loading = {loading}></Navigation>
  </GestureHandlerRootView>
  );
}
