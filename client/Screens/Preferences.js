import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, Switch, TouchableOpacity } from 'react-native';
import { P_SPECIAL, P_FAST, P_EASY, P_MED, P_HARD } from '../PrefTypes'; // Import the pref constants
import { useNavigation } from '@react-navigation/native';

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
      props.logout();
    };

    const handleRefreshMeals = () => {
      props.refreshMeals();
      navigation.navigate('Discover')
    };

    const handleClearHistory = () => {
      props.clearHistory()
        .then((res) => {
          alert("Success!");
        })
        .catch((e) => {
          alert("There was an error");
        });
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
                height: 190,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'gray',
                padding: 10,
                margin: 5,
              }}
              multiline={true}
              numberOfLines={10}
              value={specialReqs}
              onChangeText={handleTextChange}
            />

            <View style={styles.switch}>
              <Text style={{ fontSize: 16 }}>Fast Mode</Text>
              <Switch
                value={fastMode}
                onValueChange={() => {
                  setFastMode(!fastMode);
                  setPref(P_FAST, !fastMode);
                }}
              />
            </View>

            <Text style={styles.title}>Permitted Complexities</Text>
            <View>
              <View style={styles.switch}>
                <Text style={{ fontSize: 16 }}>Simple</Text>
                <Switch
                  value={simpleMeal}
                  onValueChange={() => {
                    setSimpleMeal(!simpleMeal);
                    setPref(P_EASY, !simpleMeal);
                  }}
                />
              </View>
              <View style={styles.switch}>
                <Text style={{ fontSize: 16 }}>Average</Text>
                <Switch
                  value={averageMeal}
                  onValueChange={() => {
                    setAverageMeal(!averageMeal);
                    setPref(P_MED, !averageMeal);
                  }}
                />
              </View>
              <View style={styles.switch}>
                <Text style={{ fontSize: 16 }}>Complex</Text>
                <Switch
                  value={complexMeal}
                  onValueChange={() => {
                    setComplexMeal(!complexMeal);
                    setPref(P_HARD, !complexMeal);
                  }}
                />
              </View>
            </View>
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
    fontSize: 16,
  },
  title: {
    fontSize: 15,
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
  },
});

export default Preferences;
