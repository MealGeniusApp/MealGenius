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
} from 'react-native';
import ListCard from '../Components/ListCard';

// Render a list of all meals saved in the database
const List = ({ meals, meal, forgetMeal, cartMeal }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [activeTab, setActiveTab] = useState('Ingredients');

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
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMeal(null)
  };

  const handleLongPress = (event, meal) => {
    // Vibrate the phone briefly
    Vibration.vibrate(50);

    // Determine if the long press is on the left or right half of the screen
    const { locationX } = event.nativeEvent;
    const isOnLeftHalf = locationX < 100

    // Use isOnLeftHalf as needed
    if (isOnLeftHalf)
    {
      // Delete the item
      forgetMeal(meal)

    }
    else
    {
      // Add to shopping cart
      cartMeal(meal)
    }
  };

  

  return (
    <ScrollView>
      <View>
        {meals[meal].map((mealItem, index) => (
          <TouchableWithoutFeedback key={index}>
          <View>
            <ListCard meal={mealItem} onLongPress={handleLongPress} onPress={() => onPress(mealItem)} />
          </View>
        </TouchableWithoutFeedback>
        ))}
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
            <Image source={{ uri: selectedMeal?.image }} style={styles.image} />

            {/* Tab Buttons */}
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
              </View>

            {/* Content based on active tab */}
            <ScrollView>
              {selectedMeal &&
                (activeTab === 'Ingredients' ? (
                  selectedMeal.instructions.trim() === '' ? (
                    <View style={styles.tokenContainer}>
                      <Text style={styles.loadtext}>Generating awesomeness, hang tight</Text>
                      <Image source={{ uri: 'https://i.gifer.com/4V0b.gif' }} style={styles.loadimage} />
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
                      <Image source={{ uri: 'https://i.gifer.com/4V0b.gif' }} style={styles.loadimage} />
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
                ) : null)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    fontSize: 18,
    textAlign: 'center',
  },
  image: {
    height: 150,
    width: 150,
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
  },
  contentText: {
    fontSize: 17
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
    fontSize: 17,
  },
  loadtext: {
    fontSize: 17,
    textAlign: 'center'
  },
  loadimage: {
    width:100,
    height:100,
    alignSelf: 'center'
  },
});

export default List;
