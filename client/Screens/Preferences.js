import React, { useState, useEffect } from 'react';
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

    // Keybaord open, then hide stuff to fix android bug    
    const [isKeyboardOpen, setKeyboardOpen] = useState(false);

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setKeyboardOpen(true);
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardOpen(false);
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);

    const navigation = useNavigation();

    let defaultReqs = getDefaultSpecialRequests()
    const [specialReqs, setSpecialReqs] = useState(defaultReqs);
    // To ignore the change if they didnt change any details.
    const [prevReqs, setPrevReqs] = useState(defaultReqs);
    const [cache, setCache] = useState(props.cache)
    const [warndels, setWarndels] = useState(props.warndels)

    // const [fastMode, setFastMode] = useState(getPref(P_FAST, false));

    // For deletion:
    const [password, setPassword] = useState('');
    const [delAccount, setDelAccount] = useState(false);

    // const [simpleMeal, setSimpleMeal] = useState(getPref(P_EASY, true));
    // const [averageMeal, setAverageMeal] = useState(getPref(P_MED, true));
    // const [complexMeal, setComplexMeal] = useState(getPref(P_HARD, true));

    function getDefaultSpecialRequests()
    {
      // Set the value of special requests.
      // Handle migration from Async to Mongo:
      // If async has data and mongo is empty, use async and set mongo, without reloading, then set async to empty
      
      if (getPref(P_SPECIAL, '') && !props.requests)
      {
        let pref = getPref(P_SPECIAL, '')
        props.updateRequests(pref, false)
        setPref(P_SPECIAL, '')

        return pref

      }
      // Otherwise use mongo data
      else
      {
        return props.requests
      }
    }

    const handleUpdateReqs = () => {
      // Done updating preferences. Send the value

      // save in DB and refresh meals (true)
      // iff there was a change.
      if (specialReqs != prevReqs)
        props.updateRequests(specialReqs, true);

      // Old method used async storage
      // setSpecialReqs(newText);
      // setPref(P_SPECIAL, newText);
    }

    const handleTextChange = (newText) => {
      if (newText.length <= 300) {
        // Set requests locally
        setSpecialReqs(newText);
        
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

    const handleDeletion = () => {
      // Show confirmation dialog before logging out
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => props.deleteAccount(password) },
        ],
        { cancelable: false }
      );
    };

    
  
    // If bringing this button back, besure to also change refreshMeals in App.js to remove paramater req_in.
    // State issue must be genuinely solved in this case.
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

    // Show delete page if deleting
    if (delAccount)
    {
      return (
        <View style={styles.container}>
          <View style={styles.loginFormView}>
            <Text style={styles.logoText}>Delete Your Account</Text>
            <TextInput
              placeholder="Please confirm your password"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              autoCapitalize="none"
              secureTextEntry={true}
              autoCorrect= {false}
              onChangeText={(text) => {setPassword(text)}}
            />
            

          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.buttonWithBorder, styles.customButton]}
              onPress={() => {handleDeletion()}}
            >
              <Text style={styles.buttonText}>Confirm Deletion</Text>
            </TouchableOpacity>

         

            <TouchableOpacity
              style={[styles.buttonWithBorder, styles.customButton]}
              onPress={()=> {setDelAccount(false)}}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

      )
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.preferencesContainer}>
            <Text style={styles.title}>Special Requests</Text>
            <TextInput
              style={{
                height: Platform.OS === 'ios' && Platform.isPad ? 200 : 100,
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
              onEndEditing={handleUpdateReqs}
              onFocus={() => setPrevReqs(specialReqs)}
            />

            <Text style = {{marginBottom: "5%", textAlign: 'center',fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 11}}>Your meals with refresh automatically when changing.</Text>
          {!isKeyboardOpen && 
          ( <View>
            {/* Option for caching images */}
            <View style={styles.switch}>
                <Text style={{ fontSize: Platform.OS === 'ios' && Platform.isPad ? 26 : 16  }}>Faster Images</Text>
                <Switch
                  value={cache}
                  onValueChange={() => {
                    props.updateCacheOption(!cache)
                    setCache(!cache);
                  }}
                />
              </View>

              <View style={styles.switch}>
                <Text style={{ fontSize: Platform.OS === 'ios' && Platform.isPad ? 26 : 16  }}>Warn Deletions</Text>
                <Switch
                  value={warndels}
                  onValueChange={() => {
                    props.updateWarndels(!warndels)
                    setWarndels(!warndels);
                  }}
                />
              </View>

            {/* <Text style={styles.title}>Permitted Complexities</Text>
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
            </View> */}
            
            
            </View>)}
          </View>
          {!isKeyboardOpen && (
          <View>
            <View>
              <Text style = {{marginTop: 'auto', textAlign: 'center', fontWeight: 'bold', fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 14}}>Tips</Text>
              <Text style = {{textAlign: 'center',fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 11}}>Swipe left to discard, swipe right to save</Text>
              <Text style = {{textAlign: 'center',fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 11}}>{`Tap "${props.meal}" at the top of the screen to view other meals.`}</Text>
              <Text style = {{textAlign: 'center',fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 11}}>In the Saved tab, long press the left side of an item to delete it.</Text>
              <Text style = {{marginBottom: Platform.OS === 'ios' && Platform.isPad ? 45 : 9 ,textAlign: 'center',fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 11}}>Long press the right side to toggle the item in or out of the cart.</Text>

              <Subscribe purchase = {props.purchase} subscribed= {props.subscribed} simple = {false}></Subscribe>
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
              onPress={() => {setDelAccount(true)}}
            >
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>


            {/* <TouchableOpacity
              style={[styles.buttonWithBorder, styles.customButton]}
              onPress={handleRefreshMeals}
            >
              <Text style={styles.buttonText}>Refresh Meals</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={[styles.buttonWithBorder, styles.customButton]}
              onPress={handleClearHistory}
            >
              <Text style={styles.buttonText}>Clear History</Text>
            </TouchableOpacity>
          </View>
          </View>)}
          
        
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
  logoText: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 60 : 40,
    fontWeight: "100",
    marginTop: Platform.OS === 'ios' && Platform.isPad ? 250 : 150 ,
    marginBottom: 30,
    textAlign: "center",
  },
  errorText: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 24 : 18 ,
    fontWeight: "200",
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 40,
    textAlign: "center",
  },
  loginFormTextInput: {
    height: 43,
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 23 : 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#fafafa",
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
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
