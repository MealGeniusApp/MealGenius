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
  Alert
} from 'react-native';
import ListCard from '../Components/ListCard';
import RNFetchBlob from 'rn-fetch-blob';

// Render a list of all meals saved in the database
const List = ({warndels, showSearch, search, updateSearch, meals, meal, forgetMeal, cartMeal, cache }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [activeTab, setActiveTab] = useState('Ingredients');
  const [validImage, setValidImage] = useState(true)


  // Cached image state
  const [image, setImage] = useState('')
  const [failedToLoad, setFailedToLoad] = useState(false) // allow fallback image if the image cannot load
  

  // Executes when we get ingredient updates
  useEffect(() => {
    if (selectedMeal && meals && meal)
    {
      let date = selectedMeal.date

      // Reset the selected meal
      setSelectedMeal(null)
      setSelectedMeal(meals[meal].find(item => item.date == date))
    }
    
  }, [meals])


  const onPress = (meal) => {
    setActiveTab('Ingredients')
    setFailedToLoad(false)
    setSelectedMeal(meal);
    
    setImage(`${RNFetchBlob.fs.dirs.DocumentDir}/saved/${meal.meal}/${meal.date}.jpg`)
    RNFetchBlob.fs.exists(`${RNFetchBlob.fs.dirs.DocumentDir}/saved/${meal.meal}/${meal.date}.jpg`)
    .then((res) => {
      setValidImage(res)
    })
    

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMeal(null)
  };

  // Delete the item on long press
  const handleLongPress = (event, meal) => {
    // Vibrate the phone briefly
    Vibration.vibrate(50);

    // Determine if the long press is on the left or right half of the screen
    const { locationX } = event.nativeEvent;
    const isOnLeftHalf = locationX < 100

    // Use isOnLeftHalf as needed
    if (isOnLeftHalf)
    {
      if (warndels)
      {
        // Delete the item
      Alert.alert(
        'Delete Meal',
        'Are you sure?\nHolding down the left-side prompts a deletion.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => forgetMeal(meal) },
        ],
        { cancelable: true }
      );
      }
      else{
        forgetMeal(meal)
      }

    }
    else
    {
      // Add to shopping cart
      cartMeal(meal)
    }
  };


  

  return (
    
    <View>
      { showSearch && (
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            
            }}>

            <TextInput
              placeholder="Search here..."
              returnKeyType="done" // Set returnKeyType to 'done' to display 'Go' button on the keyboard
              onSubmitEditing={()=> {Keyboard.dismiss()}} // Handle submit action when 'Go' button is pressed
              value = {search}
              onChangeText={text => updateSearch(text)} // Update search query
              style={{
                width: '95%',
                height: 40,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                paddingHorizontal: 10,
                margin: 10,
              }}
            />
        </View>)}

    <ScrollView style = {{height: "100%"}}>
    <View>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* Render only meals containing the search text */}
          {showSearch ? (
            (
              <View key={meal}>
                {meals[meal].filter(mealItem => mealItem.title.toLowerCase().includes(search.toLowerCase())).map((mealItem, index) => (
                  <TouchableWithoutFeedback key={index}>
                    <View>
                      <ListCard meal={mealItem} onLongPress={handleLongPress} onPress={() => onPress(mealItem)} cache = {cache}/>
                    </View>
                  </TouchableWithoutFeedback>
                ))}
              </View>
            )
          ) : (
            // Render all meals if showSearch is false
            (
              <View key={meal}>
                {meals[meal].map((mealItem, index) => (
                  <TouchableWithoutFeedback key={index}>
                    <View>
                      <ListCard meal={mealItem} onLongPress={handleLongPress} onPress={() => onPress(mealItem)} cache = {cache}/>
                    </View>
                  </TouchableWithoutFeedback>
                ))}
              </View>
            )
          )}
          </TouchableWithoutFeedback>
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
              <Text style={styles.title}>{selectedMeal?.title}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>x</Text>
              </TouchableOpacity>
            </View>

            {/* Image */}
            <Image 
              source={image? (!failedToLoad? (selectedMeal?.image? {uri: cache? (validImage? image: selectedMeal.image): selectedMeal.image} : require('../assets/notfound.jpg')): (selectedMeal?.image? {uri: selectedMeal.image }: require('../assets/notfound.jpg'))): require('../assets/load.gif')}
              style={styles.image}
              onError={() => {setFailedToLoad(true)}} />

            {/* Tab Buttons */}
            {selectedMeal?.instructions.trim() !== '' && (
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

            {selectedMeal?.nutrition && (
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
              {selectedMeal &&
                (activeTab === 'Ingredients' ? (
                  selectedMeal.instructions.trim() === '' ? (
                    <View style={styles.tokenContainer}>
                      <Text style={styles.loadtext}>Generating awesomeness, hang tight</Text>
                      <Image source={require('../assets/load.gif')} style={styles.loadimage} />
                    </View>
                  ) :
                  selectedMeal.ingredients.split('\n').map((ingredient, index) => (
                    ingredient.length > 2 && (
                      <View key={index} style={styles.tokenContainer}>
                        <Text style={styles.tokenText}>{ingredient}</Text>
                      </View>
                    )
                  ))
                ) : activeTab === 'Instructions' ? (
                  selectedMeal.instructions.trim() === '' ? (
                    <View style={styles.tokenContainer}>
                      <Text style={styles.loadtext}>Generating awesomeness, hang tight</Text>
                      <Image source={require('../assets/load.gif')} style={styles.loadimage} />
                    </View>
                  ) : (
                    selectedMeal.instructions.split('\n').map((instruction, index) => (
                      instruction.length > 2 && (
                        <View key={index} style={styles.tokenContainer}>
                          <Text style={styles.tokenText}>{instruction}</Text>
                        </View>
                      )
                    ))
                  )
                ) : activeTab === 'Nutrition' ? (
                  selectedMeal.instructions.trim() === '' ? (
                    <View style={styles.tokenContainer}>
                      <Text style={styles.loadtext}>Generating awesomeness, hang tight</Text>
                      <Image source={require('../assets/load.gif')} style={styles.loadimage} />
                    </View>
                  ) : (
                    selectedMeal.nutrition.split('\n').map((fact, index) => (
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
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default List;
