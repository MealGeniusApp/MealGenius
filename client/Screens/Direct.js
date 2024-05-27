import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Modal,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Vibration,
  Platform,
  TextInput,
  Keyboard,
  Alert,
  Switch
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import DirectCard from '../Components/DirectCard';
import NoTokens from '../Components/NoTokens';

// Render a list of all meals saved in the database
const Direct = ({saveMeal, generate, cache, cartMeal, updateUsePrefs, usePrefs, tokens }) => {
  if (tokens <= 0)
  {
    return (
      <View>
      <View style={styles.container}>
          <NoTokens/>
      </View>
      </View>
  
  );
  }
  const [isModalVisible, setModalVisible] = useState(false);
  const [meal, setMeal] = useState(null);
  const [activeTab, setActiveTab] = useState('Ingredients');
  const [validImage, setValidImage] = useState(true)

  const [directions, setDirections] = useState("");
  const [hist, setHist] = useState([])
    // To ignore the change if they didnt change any details.
  const [prevReqs, setPrevReqs] = useState("");
  const [loading, setLoading] = useState(false);

  const [mealSaved, setMealSaved] = useState(false)


  // Cached image state
  const [image, setImage] = useState('')
  const [failedToLoad, setFailedToLoad] = useState(false) // allow fallback image if the image cannot load


  const handleLongPress = () => {
    // TO FIX
    
    // Vibrate the phone briefly
    // Vibration.vibrate(50);

    //   // Add to shopping cart
    //   cartMeal(meal)
    //   meal.cart = !meal.cart
  };

  const handleTextChange = (newText) => {
    if (newText.length <= 300) {
      // Set requests locally
      setDirections(newText);
      
    }
  };
  
  // To open the modal
  const onPress = (meal) => {
    setActiveTab('Ingredients')
    setFailedToLoad(false)
    
    setImage(`${RNFetchBlob.fs.dirs.DocumentDir}/saved/${meal.meal}/${meal.date}.jpg`)
    RNFetchBlob.fs.exists(`${RNFetchBlob.fs.dirs.DocumentDir}/saved/${meal.meal}/${meal.date}.jpg`)
    .then((res) => {
      setValidImage(res)
    })
    

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };


  // Save the meal to DB
  function handleSaveMeal()
  {
    setMealSaved(true)
    saveMeal(meal)
    .catch(() => {
      alert("Error saving meal")
      setMealSaved(false)
    })
  }

  async function handleGenerateMeal()
  {
    // Prepare the history string
    setMealSaved(false)
    setLoading(true)
    let res = await generate(directions)

    setMeal(res) // finally, show this meal on the UI. We can click on it to get instructions.
    setLoading(false)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    customButton: {
      backgroundColor: 'white',
      borderRadius: 8,
      paddingVertical: 16,
      marginTop: 10,
      elevation: 2,
      shadowColor: 'black',
      shadowOpacity: 0.2,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 2 },
    },
    buttonText: {
      textAlign: 'center',
      color: mealSaved ? 'green' : 'black'
    },
    switch: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin:3,
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
    image: {
      height: Platform.OS === 'ios' && Platform.isPad ? 240 : 150,
      width: Platform.OS === 'ios' && Platform.isPad ? 240 : 150,
      borderRadius: 8,
      margin: 20,
      alignSelf: 'center'
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    tabButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    activeTab: {
      borderBottomColor: 'lightblue',
      borderBottomWidth: 2
    },
    tabText: {
      fontWeight: 'bold',
      fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 14,
    },
    contentText: {
      fontSize: Platform.OS === 'ios' && Platform.isPad ? 17 : 17,
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
    tokenContainer: {
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      marginBottom: 8, // Add space between tokens
      padding: 8,
    },
    tokenText: {
      fontSize: Platform.OS === 'ios' && Platform.isPad ? 30 : 17,
    },
    loadtext: {
      fontSize: Platform.OS === 'ios' && Platform.isPad ? 30 : 17,
      textAlign: 'center'
    },
    loadimage: {
      width: Platform.OS === 'ios' && Platform.isPad ? 100 : 120,
      height: Platform.OS === 'ios' && Platform.isPad ? 100 : 120,
      alignSelf: 'center'
    },
  });

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style = {{margin: 10}}>

      <View>
        <Text>
          What would you like to make?
        </Text>

        <TextInput
          placeholder="Enter a meal and press go..."
          returnKeyType="go"
          onSubmitEditing={() => {
            handleGenerateMeal();
            Keyboard.dismiss();
          }}
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'gray',
            padding: 10,
            margin: 5,
            fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 14
          }}
          value={directions}
          onChangeText={handleTextChange}
          onFocus={() => setPrevReqs(directions)}
        />

        {/* Option for using preferences requests */}
        <View style={styles.switch}>
          <Text style={{ fontSize: Platform.OS === 'ios' && Platform.isPad ? 26 : 16  }}>Use preferences</Text>
          <Switch
            value={usePrefs}
            onValueChange={() => {
              updateUsePrefs(!usePrefs)
            }}
          />
        </View>
        
        
        {
          meal && !loading && 
          ( 
            <View>

              <DirectCard meal={meal} onLongPress={handleLongPress} onPress={() => onPress(meal)} cache = {cache} /> 
              <TouchableOpacity
              style={[styles.customButton]}
              onPress={handleSaveMeal}
              disabled={mealSaved}
            >
              <Text style={styles.buttonText}>{mealSaved ? "Meal Saved!" : "Click to Save"}</Text>
            </TouchableOpacity>
            </View>
        
          )
        }

        {
          loading &&
          (
            <Image source={require('../assets/load.gif')} style={styles.loadimage} />
          )
        }
        
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Title and Close Button */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{meal?.title}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>x</Text>
              </TouchableOpacity>
            </View>

            {/* Image */}
            <Image 
              source={image? (!failedToLoad? (meal?.image? {uri: cache? (validImage? image: meal.image): meal.image} : require('../assets/notfound.jpg')): (meal?.image? {uri: meal.image }: require('../assets/notfound.jpg'))): require('../assets/load.gif')}
              style={styles.image}
              onError={() => {setFailedToLoad(true)}} />

            {/* Tab Buttons */}
            {meal?.instructions.trim() !== '' && (
              <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'Ingredients' && styles.activeTab]}
                onPress={() => setActiveTab('Ingredients')}
              >
                <Text style={styles.tabText}>Ingredients</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'Instructions' && styles.activeTab]}
                onPress={() => setActiveTab('Instructions')}
              >
                <Text style={styles.tabText}>Instructions</Text>
              </TouchableOpacity>

            {meal?.nutrition && (
              <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Nutrition' && styles.activeTab]}
              onPress={() => setActiveTab('Nutrition')}
            >
              <Text style={styles.tabText}>Nutrition</Text>
            </TouchableOpacity>
            )}
              
            </View>
            )}
            

            {/* Content based on active tab */}
            <ScrollView>
              {meal &&
                (activeTab === 'Ingredients' ? (
                  meal.instructions.trim() === '' ? (
                    <View style={styles.tokenContainer}>
                      <Text style={styles.loadtext}>Generating awesomeness, hang tight</Text>
                      <Image source={require('../assets/load.gif')} style={styles.loadimage} />
                    </View>
                  ) :
                  meal.ingredients.split('\n').map((ingredient, index) => (
                    ingredient.length > 2 && (
                      <View key={index} style={styles.tokenContainer}>
                        <Text style={styles.tokenText}>{ingredient}</Text>
                      </View>
                    )
                  ))
                ) : activeTab === 'Instructions' ? (
                  meal.instructions.trim() === '' ? (
                    <View style={styles.tokenContainer}>
                      <Text style={styles.loadtext}>Generating awesomeness, hang tight</Text>
                      <Image source={require('../assets/load.gif')} style={styles.loadimage} />
                    </View>
                  ) : (
                    meal.instructions.split('\n').map((instruction, index) => (
                      instruction.length > 2 && (
                        <View key={index} style={styles.tokenContainer}>
                          <Text style={styles.tokenText}>{instruction}</Text>
                        </View>
                      )
                    ))
                  )
                ) : activeTab === 'Nutrition' ? (
                  meal.instructions.trim() === '' ? (
                    <View style={styles.tokenContainer}>
                      <Text style={styles.loadtext}>Generating awesomeness, hang tight</Text>
                      <Image source={require('../assets/load.gif')} style={styles.loadimage} />
                    </View>
                  ) : (
                    meal.nutrition.split('\n').map((fact, index) => (
                      fact.length > 2 && (
                        <View key={index} style={styles.tokenContainer}>
                          <Text style={styles.tokenText}>{fact.match(/[a-zA-Z].*/)}</Text>
                        </View>
                      )
                    ))
                  )
                ) : null)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
    </TouchableWithoutFeedback>
  );


  
};



export default Direct;
