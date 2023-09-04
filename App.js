
import {AppState } from 'react-native';
import Navigation from './Screens/Navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react'
// Note for production
// Move asyncstorage.setitem for food queues to when the app closes. Dont need to do it after every meal generation!

// Note for queue size errors
// The size of the queue when printing will not exceed 10. What happens, is extra food is generated, because some generations over dominate the update of the queue for others. So a food generation will sometimes fail to update the state, causing an extra generation
export default function App() {
  
  const [breakfastLoaded, setBreakfastLoaded] = useState(false)
  const [lunchLoaded, setLunchLoaded] = useState(false)
  const [dinnerLoaded, setDinnerLoaded] = useState(false)

  const [nextMeal, setNextMeal] = useState('')
  const [stateDummy, setStateDummy] = useState(0)

  const [breakfastQueue, setBreakfastQueue] = useState([])
  const [lunchQueue, setLunchQueue] = useState([])
  const [dinnerQueue, setDinnerQueue] = useState([])
  const [history, setHistory] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const MAX_HISTORY_LENGTH = 50

  const [breakfastToGenerate, setBreakfastToGenerate] = useState(0)
  const [lunchToGenerate, setLunchToGenerate] = useState(0)
  const [dinnerToGenerate, setDinnerToGenerate] = useState(0)

  const [breakfastList, setBreakfastList] = useState([])
  const [lunchList, setLunchList] = useState([])
  const [dinnerList, setDinnerList] = useState([])
  const DEFAULT_MEAL = 'breakfast'
  const [activeMeal, setActiveMeal] = useState(DEFAULT_MEAL)
  const [preferences, setPreferences] = useState({})

  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(true)
  const MIN_QUEUE_SIZE = 10
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
          // let temp = breakfastQueue[0]
          // if (temp.title === nextMeal.title)
          // {
          //   temp = breakfastQueue[1]
          // }
          // setNextMeal(temp)

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
      console.log(' Done loading!')
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
    if (breakfastToGenerate > 0)
    {
      generateMeal('breakfast')
    }

  }, [breakfastToGenerate])

  useEffect(() => {
    
    if (lunchToGenerate > 0)
    {
      generateMeal('lunch')
    }

  }, [lunchToGenerate])

  useEffect(() => {
    
    if (dinnerToGenerate > 0)
    {
      generateMeal('dinner')
    }

  }, [dinnerToGenerate])



  useEffect(() => {
    // Subscribe to AppState changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up subscription when component unmounts
    return () => {
      appStateSubscription.remove();
    };
  }, []);

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
        console.log(JSON.parse(value))
        setHistory(JSON.parse(value))
      }
        
        
      // History is loaded, so load the meals now

      // Initialize food items - make sure we have a stocked selection!

    AsyncStorage.getItem('breakfast_queue').then(value => {
      let q = JSON.parse(value)
      console.log('breakfast queue: ', q.length)
      if (q?.length >= MIN_QUEUE_SIZE - 1)
      {
        // We have saved data, load it!
        setBreakfastQueue(q)
        setBreakfastLoaded(true)
        
      }

      // No saved data present - must generate new!
      else
      {
        if (q)
          setBreakfastQueue(q)
        // Clear old state
        console.log('generating new breakfast queue...')
        setBreakfastToGenerate(MIN_QUEUE_SIZE - (q? q.length: 0))
      }
      

        
    });

    AsyncStorage.getItem('lunch_queue').then(value => {
      let q = JSON.parse(value)
      console.log('lunch queue: ', q.length)
      if (q?.length >= MIN_QUEUE_SIZE - 1)
        // We have saved data, load it!
        {
          setLunchQueue(q)
          setLunchLoaded(true)
        }
        
    

      // No saved data present - must generate new!
      else
      {
        if (q)
          setLunchQueue(q)
        console.log('generating new lunch queue...')
        setLunchToGenerate(MIN_QUEUE_SIZE - (q? q.length: 0))
      }
        

        
    });

    AsyncStorage.getItem('dinner_queue').then(value => {
      let q = JSON.parse(value)

      if (q?.length >= MIN_QUEUE_SIZE - 1)
        // We have saved data, load it!
        {
          setDinnerQueue(q)
          setDinnerLoaded(true)
        }
        


      // No saved data present - must generate new!
      else
      {
        if (q)
          setDinnerQueue(q)
        console.log('generating new dinner queue...')
        setDinnerToGenerate(MIN_QUEUE_SIZE- (q? q.length: 0))
      }
        
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
  //test(breakfastQueue)
  setStateDummy(stateDummy + 1)
  // Remove and store the first item from the array
  let meal = ''
  switch (activeMeal)
  {
    case 'breakfast':
      {
        
        meal = breakfastQueue.shift()
        //setBreakfastQueue(breakfastQueue)
        setNextMeal(breakfastQueue[0])
        if (breakfastQueue.length < MIN_QUEUE_SIZE)
          //setBreakfastToGenerate(MIN_QUEUE_SIZE - (breakfastQueue.length + breakfastToGenerate)) // Attempt: Desired queue size - sum of current queue and pending queue items
          setBreakfastToGenerate(breakfastToGenerate + 1)
        break
      }
    case 'lunch':
      {
        meal = lunchQueue.shift()
        setNextMeal(lunchQueue[0])
        if (lunchQueue.length < MIN_QUEUE_SIZE)
          setLunchToGenerate(lunchToGenerate + 1)
        break
      }
    case 'dinner':
      {
        meal = dinnerQueue.shift()
        setNextMeal(dinnerQueue[0])
        if (dinnerQueue.length < MIN_QUEUE_SIZE)
          setDinnerToGenerate(dinnerToGenerate + 1)
        break
      }

    default:
      {
        meal = null
        break
      }
  }

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
  
  setStateDummy(stateDummy + 1)
  // Check if we already have enough and should halt
  switch (meal)
  {
    
    case 'breakfast':
    {
      if (breakfastQueue.length >= MIN_QUEUE_SIZE)
        return
      else
        break
    }
    case 'lunch':
    {
      if (lunchQueue.length >= MIN_QUEUE_SIZE)
        return
      else
        break
    }
    case 'dinner':
      {
        if (dinnerQueue.length >= MIN_QUEUE_SIZE)
          return
        else
          break
      }
  }
  
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
      setStateDummy(stateDummy + 1)

      result = response.data.choices[0].message.content
      //console.log(result)
      
      
      let image = ''
      let title = result.substring(result.toUpperCase().indexOf('FOOD:')+6,  result.toUpperCase().indexOf('DESC') - 1).replace(new RegExp('"', 'g'), '').replace(new RegExp(':', 'g'), '')
      let description = result.substring(result.toUpperCase().indexOf('DESC: ') + 6, result.length)

      //add this title to history
      const historyCopy = { ...history };
      const activeMealHistory = [...historyCopy[activeMeal]];
      activeMealHistory.push(title);

      // Check to see if the length is too long now
      if (activeMealHistory.length >= MAX_HISTORY_LENGTH)
      {
        activeMealHistory.shift()
      }

      // Finalize and update the new history state
      historyCopy[activeMeal] = activeMealHistory;
      setHistory(historyCopy);


      
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
            let newQueue = breakfastQueue.concat(newMeal)
            setBreakfastQueue(newQueue)
            setBreakfastToGenerate(breakfastToGenerate - 1)
            AsyncStorage.setItem('breakfast_queue', JSON.stringify(newQueue))

            // If breakfast just has not yet loaded, check if it is now loaded
            if (!breakfastLoaded && (newQueue?.length >= MIN_QUEUE_SIZE))
            {
              // Will check if all food types are loaded and if so sets loading to false through useEffect
              setBreakfastLoaded(true)
            }
          }

          else if (meal === 'lunch')
          {
            let newQueue = lunchQueue.concat(newMeal)
            setLunchQueue(newQueue)
            setLunchToGenerate(lunchToGenerate - 1)
            AsyncStorage.setItem('lunch_queue', JSON.stringify(newQueue))

             // If lunch just has not yet loaded, check if it is now loaded
             if (!lunchLoaded && (newQueue?.length >= MIN_QUEUE_SIZE))
             {
               // Will check if all food types are loaded and if so sets loading to false through useEffect
               setLunchLoaded(true)
             }
          }
          else if (meal === 'dinner')
          {

            newQueue = dinnerQueue.concat(newMeal)
            setDinnerQueue(newQueue)
            setDinnerToGenerate(dinnerToGenerate - 1)
            AsyncStorage.setItem('dinner_queue', JSON.stringify(newQueue))

             // If dinner just has not yet loaded, check if it is now loaded
             if (!dinnerLoaded && (newQueue?.length >= MIN_QUEUE_SIZE))
             {
               // Will check if all food types are loaded and if so sets loading to false through useEffect
               setDinnerLoaded(true)
             }
          }
        
      }

      
    })
    .catch(error => {
      console.log(error.message)
      //setTimeout(() => {generateMeal(meal)}, 1000)
    });


}


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigation loadProgress = {(breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE)} changeMeal = {changeMeal} mealTitle = {activeMeal} swipe = {swiped} nextMeal = {nextMeal} loading = {loading}></Navigation>
  </GestureHandlerRootView>
  );
}
