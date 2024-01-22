import React, { useState } from 'react';
import { Platform, View, Text, Button, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, Switch, TouchableOpacity, Alert } from 'react-native';
import { P_SPECIAL, P_FAST, P_EASY, P_MED, P_HARD } from '../PrefTypes'; // Import the pref constants
import { useNavigation } from '@react-navigation/native';
import Subscribe from '../Components/Subscribe';

const Preferences = (props) => {
  if (props.prefs) {
    // Helper to get a preference or return the provided default if it was not initialized
    function getPref(pref, fallback) {
      let res = props.prefs[pref];
      if (typeof res === 'undefined') return fallback;
      return res;
    }

    const navigation = useNavigation();


    const [specialReqs, setSpecialReqs] = useState(getPref(P_SPECIAL, ''));
    const [fastMode, setFastMode] = useState(getPref(P_FAST, false));

    const [simpleMeal, setSimpleMeal] = useState(getPref(P_EASY, true));
    const [averageMeal, setAverageMeal] = useState(getPref(P_MED, true));
    const [complexMeal, setComplexMeal] = useState(getPref(P_HARD, true));

    const handleTextChange = (newText) => {
      if (newText.length <= 300) {
        setSpecialReqs(newText);
        setPref(P_SPECIAL, newText);
      }
    };

    const handleLogout = () => {
      // Show confirmation dialog before logging out
      Alert.alert(
        'Logout',
        'Are you sure you want to log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => props.logout() },
        ],
        { cancelable: false }
      );
    };
  
    const handleRefreshMeals = () => {
      // Show confirmation dialog before refreshing meals
      Alert.alert(
        'Refresh Meals',
        'Are you sure you want to refresh meals?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: () => {
              props.refreshMeals();
              navigation.navigate('Discover');
            },
          },
        ],
        { cancelable: false }
      );
    };
  
    const handleClearHistory = () => {
      // Show confirmation dialog before clearing history
      Alert.alert(
        'Clear History',
        'Are you sure you want to clear history?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: () => {
              props.clearHistory()
                .then((res) => {
                  alert('Success!');
                })
                .catch((e) => {
                  alert('There was an error');
                });
            },
          },
        ],
        { cancelable: false }
      );
    };

    // Call to update the preference and save it to async storage.
    function setPref(pref, value) {
      props.prefs[pref] = value;
      props.savePreferences(props.prefs);
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.preferencesContainer}>
            <Text style={styles.title}>Special Requests</Text>
            <TextInput
              style={{
                height: Platform.OS === 'ios' && Platform.isPad ? 300 : 190,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'gray',
                padding: 10,
                margin: 5,
                fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 14
              }}
              multiline={true}
              numberOfLines={10}
              value={specialReqs}
              onChangeText={handleTextChange}
            />

            {/* <View style={styles.switch}>
              <Text style={{ fontSize: 16 }}>Fast Mode</Text>
              <Switch
                value={fastMode}
                onValueChange={() => {
                  setFastMode(!fastMode);
                  setPref(P_FAST, !fastMode);
                }}
              />
            </View> */}

            <Text style={styles.title}>Permitted Complexities</Text>
            <View>
              <View style={styles.switch}>
                <Text style={{ fontSize: Platform.OS === 'ios' && Platform.isPad ? 26 : 16  }}>Simple</Text>
                <Switch
                  value={simpleMeal}
                  onValueChange={() => {
                    setSimpleMeal(!simpleMeal);
                    setPref(P_EASY, !simpleMeal);
                  }}
                />
              </View>
              <View style={styles.switch}>
                <Text style={{ fontSize: Platform.OS === 'ios' && Platform.isPad ? 26 : 16  }}>Average</Text>
                <Switch
                  value={averageMeal}
                  onValueChange={() => {
                    setAverageMeal(!averageMeal);
                    setPref(P_MED, !averageMeal);
                  }}
                />
              </View>
              <View style={styles.switch}>
                <Text style={{ fontSize: Platform.OS === 'ios' && Platform.isPad ? 26 : 16 }}>Complex</Text>
                <Switch
                  value={complexMeal}
                  onValueChange={() => {
                    setComplexMeal(!complexMeal);
                    setPref(P_HARD, !complexMeal);
                  }}
                />
              </View>
            </View>
            <Text style = {{marginTop: 'auto', textAlign: 'center', fontWeight: 'bold', fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 14}}>Tips</Text>
            <Text style = {{textAlign: 'center',fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 11}}>In the List & Cart tabs, long press the left side of an item to delete it.</Text>
            <Text style = {{marginBottom: Platform.OS === 'ios' && Platform.isPad ? 45 : 9 ,textAlign: 'center',fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 11}}>Long press the right side to toggle the item in or out of the cart.</Text>

            {/* <Subscribe purchase = {props.purchase} subscribed={props.subscribed}></Subscribe> */}

          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.buttonWithBorder, styles.customButton]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonWithBorder, styles.customButton]}
              onPress={handleRefreshMeals}
            >
              <Text style={styles.buttonText}>Refresh Meals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonWithBorder, styles.customButton]}
              onPress={handleClearHistory}
            >
              <Text style={styles.buttonText}>Clear History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between', // Pushes content and buttons to the top and bottom, respectively
  },
  buttonWithBorder: {
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 5,
  },
  customButton: {
    padding: 10,
  },
  buttonText: {
    color: 'red',
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 30 : 16,
  },
  title: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 22 : 15,
    alignSelf: 'center',
    fontWeight: 'bold',
    margin: 5,
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin:3,
  },
  preferencesContainer: {
    flex: 1, // Takes up available space in the container
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' && Platform.isPad ? 30 : 10
  },
});

export default Preferences;
