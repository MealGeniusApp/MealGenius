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

export default Cart;
