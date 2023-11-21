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
import CartCard from '../Components/CartCard';

// Render a list of all meals saved in the database
const Cart = ({ meals, meal, forgetMeal, cartMeal }) => {



  const onPress = (meal) => {
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
        {meals[meal].filter(mealItem => mealItem.cart).map((mealItem, index) => (
          <TouchableWithoutFeedback key={index}>
            <View>
              <CartCard meal={mealItem} onLongPress={handleLongPress} onPress={() => onPress(mealItem)} />
            </View>
          </TouchableWithoutFeedback>
        ))}
      </View>
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

export default Cart;
