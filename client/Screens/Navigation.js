// Navigation.js
import React from 'react';
import {Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Cart from './Cart.js'
import Icon from 'react-native-vector-icons/Ionicons';
import List from './List.js'
import Discover from './Discover.js'
import Preferences from './Preferences.js'

const Tab = createBottomTabNavigator();



const Navigation = (props) => {

  // Custom header for meals: meal swap handled here
  const CustomHeader = ({type}) => {

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  
    const handleTitlePress = () => {
      props.changeMeal(props.mealTitle === 'breakfast'? 'lunch': props.mealTitle === 'lunch'? 'dinner': 'breakfast')
    };
  
    return (
      <TouchableOpacity onPress={handleTitlePress}>
        <Text style = {{fontWeight: 'bold', fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 17}}>{ `${type} ${capitalizeFirstLetter(props.mealTitle)}`}</Text>
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
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'pizza' : 'pizza-outline';
          } else if (route.name === 'Preferences') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
    
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
      >
        <Tab.Screen name="Discover" options={{
          headerTitle: () => <CustomHeader type = "Discover" />,
        }} children={()=><Discover requests={props.requests} swipe={props.swipe} nextMeal = {props.nextMeal} loading = {props.loading} loadProgress = {props.loadProgress} tokens = {props.tokens}/>}/>
        <Tab.Screen name="List" options={{
          headerTitle: () => <CustomHeader type= "Saved"/>,
        }}

        children={()=><List forgetMeal={props.forgetMeal} cartMeal={props.cartMeal} meals = {props.meals} meal = {props.nextMeal? props.nextMeal.meal: 'breakfast'}/>} />
    
      <Tab.Screen name="Cart" options={{
          headerTitle: () => <CustomHeader type = "Shopping"/>,
        }}

        children={()=><Cart forgetMeal={props.forgetMeal} cartMeal={props.cartMeal} meals = {props.meals} meal = {props.nextMeal? props.nextMeal.meal: 'breakfast'}/>} />
    
        <Tab.Screen name="Preferences"
        children={()=><Preferences requests = {props.requests} updateRequests= {props.updateRequests} meal = {props.mealTitle.toUpperCase()} subscribed = {props.subscribed} purchase = {props.purchase} tokens = {props.tokens} managementURL = {props.managementURL} refreshMeals = {props.refreshMeals} prefs = {props.prefs} setFastMode = {props.setFastMode} savePreferences = {props.savePreferences} clearHistory = {props.clearHistory} logout={props.logout} deleteAccount= {props.deleteAccount}/>} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
