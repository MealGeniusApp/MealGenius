// Navigation.js
import React from 'react';
import {Text, TouchableOpacity, Platform, View, Image} from 'react-native';
import { NavigationContainer} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Cart from './Cart.js'
import Icon from 'react-native-vector-icons/Ionicons';
import List from './List.js'
import Discover from './Discover.js'
import Direct from './Direct.js';
import Preferences from './Preferences.js'
import CartSwitch from '../Components/CartSwitch.js';

const Tab = createBottomTabNavigator();



const Navigation = (props) => {
  // Search query
  

  // Custom header for meals: meal swap handled here
  const CustomHeader = ({type}) => {

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  
    const handleTitlePress = () => {
      props.changeMeal(props.mealTitle === 'breakfast'? 'lunch': props.mealTitle === 'lunch'? 'dinner': 'breakfast')
    };


    if (type == "Preferences")
    return (
      <View style={{top: "3%", width: '100%', flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>


        <View>
          <TouchableOpacity>
            <Text style={{ fontWeight: 'bold', fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 17 }}>{`Preferences`}</Text>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity onPress={() => {props.help()}}>
            <Text style={{fontWeight: 'bold', fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 17 }}>Help</Text>
          </TouchableOpacity>
        </View>
      </View>


  )

  if (type =="Discover")
  
    return (
      <View style={{top: "3%",width: '100%', flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity onPress={handleTitlePress}>
          <Text style = {{fontWeight: 'bold', fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 17}}>{ `${type} ${capitalizeFirstLetter(props.mealTitle)}`}</Text>
        </TouchableOpacity>
      </View>
      
    );

    if (type =="Saved")
    return (
      <View style={{top: "3%",width: '100%', flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity onPress={handleTitlePress}>
          <Text style = {{fontWeight: 'bold', fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 17}}>{ `${type} ${capitalizeFirstLetter(props.mealTitle)}`}</Text>
        </TouchableOpacity>
        <View style = {{display: 'flex', flexDirection: 'row'}}>
          <View style = {{paddingRight: 15, top: -5}}> 
            <CartSwitch
              value = {props.cart} 
              onValueChange={props.setCart} 
              imageSource={require('../assets/cart.png')}/>
            </View>
          <TouchableOpacity onPress={() => props.toggleSearch()}>
            <View> 
              <Image
                style={{
                  width: Platform.OS === 'ios' && Platform.isPad ? 32 : 22,
                  height: Platform.OS === 'ios' && Platform.isPad ? 32 : 22
                }}
                source={require('../assets/search.png')}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    
  );
  };


  
  return (
    <NavigationContainer>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
    
          // if (route.name === 'Cart') {
          //   iconName = focused ? 'cart' : 'cart-outline';
          // } 
          if (route.name === 'Saved') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'pizza' : 'pizza-outline';
          } else if (route.name === 'Preferences') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Direct Meals') {
            iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
          }
    
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
      >
        <Tab.Screen name="Discover" options={{
          headerTitle: () => <CustomHeader type = "Discover" />,
        }} children={()=><Discover cache = {props.cache} requests={props.requests} swipe={props.swipe} nextMeal = {props.nextMeal} loading = {props.loading} loadProgress = {props.loadProgress} tokens = {props.tokens}/>}/>
       
       <Tab.Screen name="Direct Meals" 
          children={()=><Direct tokens = {props.tokens} saveMeal = {props.saveMeal} generate = {props.directMeal} updateUsePrefs = {props.updateUsePrefs} usePrefs = {props.usePrefs} cache = {props.cache} cartMeal={props.cartMeal}/>} />
    
        <Tab.Screen name="Saved" options={{
          headerTitle: () => <CustomHeader type= "Saved"/>,
        }}

        children={()=><List cart = {props.cart} warndels = {props.warndels} cache = {props.cache} toggleSearch = {props.toggleSearch} showSearch = {props.showSearch} search = {props.search} updateSearch = {props.updateSearch} forgetMeal={props.forgetMeal} cartMeal={props.cartMeal} meals = {props.meals} meal = {props.nextMeal? props.nextMeal.meal: 'breakfast'}/>} />
    
        {/* <Tab.Screen name="Cart" options={{
          headerTitle: () => <CustomHeader type = "Shopping"/>,
        }}

        children={()=><Cart warndels = {props.warndels} cache = {props.cache} showSearch = {props.showSearch} search = {props.search} updateSearch = {props.updateSearch} forgetMeal={props.forgetMeal} cartMeal={props.cartMeal} meals = {props.meals} meal = {props.nextMeal? props.nextMeal.meal: 'breakfast'}/>} />
     */}
        <Tab.Screen name="Preferences" options={{
          headerTitle: () => <CustomHeader type = "Preferences"/>,
        }}

        children={()=><Preferences updateWarndels = {props.updateWarndels} warndels = {props.warndels} updateCacheOption = {props.updateCacheOption} cache = {props.cache} requests = {props.requests} updateRequests= {props.updateRequests} meal = {props.mealTitle.toUpperCase()} subscribed = {props.subscribed} purchase = {props.purchase} tokens = {props.tokens} managementURL = {props.managementURL} refreshMeals = {props.refreshMeals} prefs = {props.prefs} setFastMode = {props.setFastMode} savePreferences = {props.savePreferences} clearHistory = {props.clearHistory} logout={props.logout} deleteAccount= {props.deleteAccount}/>} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
