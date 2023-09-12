import React, {useState, useEffect } from "react";
import {BASE_URL} from "@env"
import axios from "axios";
import CodeEntry from "./CodeEntry";


import styles from "./login_style";
import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button} from "react-native-elements";

let Constants;
let deviceInfoModule;

if (__DEV__) {
  // Check if running in Expo
  try {
    Constants = require('expo-constants');
    deviceInfoModule = Constants;
  } catch (error) {
    // If not in Expo, require react-native-device-info
    deviceInfoModule = require('react-native-device-info');
  }
} else {
  // In production, use Expo's Constants if available
  if (typeof Constants !== 'undefined') {
    deviceInfoModule = Constants;
  } else {
    // Otherwise, require react-native-device-info
    deviceInfoModule = require('react-native-device-info');
  }
}

export default function LoginScreen(props) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showCode, setShowCode] = useState(false)

  const [status, setStatus] = useState('')
 
  
  const [deviceId, setDeviceId] = useState('');
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const getDeviceId = async () => {
      let id;

      if (deviceInfoModule) {
        if (deviceInfoModule === Constants) {
          // Running in Expo
          
          id = deviceInfoModule["default"]["manifest2"]["id"];
        } else {
          // Not running in Expo
          id = await deviceInfoModule.getUniqueId();
        }
      } else {
        id = 'Device ID not available';
      }

      setDeviceId(id);
    };

    getDeviceId();
  }, []);


  

  const onLoginPress = () => {
    //setStatus('Logging in...')
    axios.post(`${BASE_URL}/login`, {email: email, password: password, device: deviceId})
    .then((res) =>
    {
      // Credentials valid. And device is permitted
      setStatus('success')
      props.login(res.data.token)
    })
    .catch((e) => {
      console.log(e)
      if (e.response.status === 400)
      {
        // Incorrect password
        setStatus('Incorrect password!')
      }
      else if (e.response.status === 422)
      {
        // New device, code sent
        setStatus('Email sent!')
        setUserId(e.response.data.token)

        // Load UI for code entry
        setShowCode(true)

      }
      else if (e.response.status === 404)
      {
        setStatus('User not found!')
      }
      else 
      {
        setStatus('Error, please try again')
      }
    })

  };

  // Register user
  const onRegisterPress = () => {
    axios.post(`${BASE_URL}/register`, {email: email, password: password})
    .then((res) =>
    {
      //then, log in
      setStatus('Success!')
      onLoginPress()
    })
    .catch((e) => {
      console.log(e.response.data.errorResponse)
      setStatus(e.response.data.message)
      
    })

  };

  // User inputted verification code
  const onFulfill = (code) => {
    // check with server
    axios.post(`${BASE_URL}/confirmDevice`, {user_id: userId, code: code})
    .then((res) =>
    {
      setShowCode(false)
      setStatus('Success!')
    })
    .catch((e) => {
      setStatus('Incorrect code!')
    })
  };

  return (
    <KeyboardAvoidingView style={styles.containerView} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.loginScreenContainer}>
          <View style={styles.loginFormView}>
            <Text style={styles.logoText}>Meal Genius</Text>
            <TextInput
              placeholder="email"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              onChangeText={(text) => {setEmail(text); setStatus('')}}
            />
            <TextInput
              placeholder="Password"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              secureTextEntry={true}
              onChangeText={(text) => {setPassword(text); setStatus('')}}
            />
            <Button
              buttonStyle={styles.loginButton}
              onPress={() => onLoginPress()}
              title="Login"
              disabled={email === '' || password === ''}
            />

            <Button
              buttonStyle={styles.loginButton}
              onPress={() => onRegisterPress()}
              title="Register"
              disabled={email === '' || password === ''}
            />

            <Text style={styles.errorText}>{status}</Text>

            <CodeEntry visible = {showCode} fulfilled = {onFulfill} ></CodeEntry>

          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
