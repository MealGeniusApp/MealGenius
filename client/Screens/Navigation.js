// Navigation.js
import React from 'react';
import { useState } from 'react';
import {Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Cart from './Cart.js'
import Icon from 'react-native-vector-icons/Ionicons';
import List from './List.js'
import Discover from './Discover.js'
import Preferences from './Preferences.js'

const Tab = createBottomTabNavigator();



const Navigation = (props) => {

  // Custom header for meals: meal swap handled here
  const CustomHeader = () => {

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  
    const handleTitlePress = () => {
      props.changeMeal(props.mealTitle === 'breakfast'? 'lunch': props.mealTitle === 'lunch'? 'dinner': 'breakfast')
    };
  
    return (
      <TouchableOpacity onPress={handleTitlePress}>
        <Text style = {{fontWeight: 'bold', fontSize: 17}}>{`Discover ${capitalizeFirstLetter(props.mealTitle)}`}</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <NavigationContainer>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
    
          if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'List') {
            iconName = focused ? 'ios-list' : 'ios-list-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'pizza' : 'pizza-outline';
          } else if (route.name === 'Preferences') {
            iconName = focused ? 'ios-settings' : 'ios-settings-outline';
          }
    
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
      >
        <Tab.Screen name="Discover" options={{
          headerTitle: () => <CustomHeader />,
        }} children={()=><Discover swipe={props.swipe} nextMeal = {props.nextMeal} loading = {props.loading} loadProgress = {props.loadProgress}/>}/>
        <Tab.Screen name="List" component={List} />
        <Tab.Screen name="Cart" component={Cart} />
        <Tab.Screen name="Preferences"
        children={()=><Preferences clearHistory = {props.clearHistory} logout={props.logout}/>} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
