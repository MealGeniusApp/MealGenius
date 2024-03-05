import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Vibration,
  TextInput,
  Keyboard
} from 'react-native';
import CartCard from '../Components/CartCard';

// Render a list of all meals saved in the database
const Cart = ({showSearch, search, updateSearch, meals, meal, forgetMeal, cartMeal }) => {



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
      <TouchableWithoutFeedback onPress = {() => Keyboard.dismiss()}>
      <View>
          {/* Render only meals containing the search text */}
          {showSearch ? (
              <View key={meal}>
                {meals[meal].filter(mealItem => mealItem.cart && mealItem.title.toLowerCase().includes(search.toLowerCase()))
.map((mealItem, index) => (
                  <TouchableWithoutFeedback key={index}>
                    <View>
                      <CartCard meal={mealItem} onLongPress={handleLongPress} onPress={() => onPress(mealItem)} />
                    </View>
                  </TouchableWithoutFeedback>
                ))}
              </View>
            
          ) : (
            // Render all meals if showSearch is false
              <View key={meal}>
                {meals[meal].filter(mealItem => mealItem.cart).map((mealItem, index) => (
                  <TouchableWithoutFeedback key={index}>
                    <View>
                      <CartCard meal={mealItem} onLongPress={handleLongPress} onPress={() => onPress(mealItem)} />
                    </View>
                  </TouchableWithoutFeedback>
                ))}
              </View>
          )}
        </View>
        </TouchableWithoutFeedback>
    </ScrollView>
    </View>
  );
};

export default Cart;
