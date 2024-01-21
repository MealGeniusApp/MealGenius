import React, {useState, useEffect } from "react";
import {BASE_URL} from "@env"
import axios from "axios";
import CodeEntry from "./CodeEntry";

import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
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

  const isEmail = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showCode, setShowCode] = useState(false)

  const [forgotPassword, setForgotPassword] = useState(false)
  const [canResetPass, setCanResetPass] = useState(false)
  const [resetCode, setResetCode] = useState()
  const [emailv1, setEmailv1] = useState('');
  const [emailv2, setEmailv2] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');

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

  // Handle forgot password button press to render new state
  const toggleForgotPassword = () => {
    setForgotPassword(!forgotPassword)
    if (forgotPassword)
    {
      setEmailv1(email)
    }
  }

  const onLoginPress = () => {
    setStatus('Attempting login...')

    axios.post(`${BASE_URL}/login`, {email: email, password: password, device: deviceId})
    .then((res) =>
    {
      // Credentials valid. And device is permitted
      // This section runs iff they do not need to confirm their device when logging in. Right now, this is NEVER!
      // Instead the below code in the onFulfill function will run when confirming code.
      setStatus('Logging in...')
      props.login(res.data.token)
    })
    .catch((e) => {
      setStatus('Error, please try again')
      if (e.response.status === 400)
      {
        // Incorrect password
        setStatus('Incorrect password!')
      }
      else if (e.response.status === 422)
      {
        // New device, code sent
        setStatus('Please enter the code sent to your email.')
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
    axios.post(`${BASE_URL}/confirmDevice`, {email: email, code: code})
    .then((res) =>
    {
      // Code correct for forgot password
      if (forgotPassword)
      {
        // Logic here for setting new password: new return block: SECURITY! must pass code with change request, verify again
        setStatus('')

        // locally store the code that the user entered to send for more validation
        setResetCode(code)
        
        setCanResetPass(true) // Show UI for setting password
        setShowCode(false)
        setForgotPassword(false) // hide UI for forgot password
      }
      else 
      {
        // Login confirmation successful
        setStatus('Logging in...')
        props.login(userId)
        if (res.data.trial)
        {
          alert("Welcome! You have been granted 30 free swipes!")
        }
      }
      
    })
    .catch((e) => {
      if (e.response.status === 401)
      {
        setStatus('Incorrect code, please try again.')
      }
      else 
      {
        if (e.response.status === 429)
        {
          setStatus('Too many failures. Please login again.')
        }
        else{
          setStatus('Error, please try again later')
        }

        // Code was not wrong, but there was an error. Return to login
        setShowCode(false)
        setForgotPassword(false)
        

      }
      
      

      // If code is exhasuted, return to login
    })
  };
  
  // Reset password
  const resetPassword = () => {
    // send code and new password as data
    axios.post(`${BASE_URL}/setNewPassword`, {resetCode: resetCode, pass: pass1, email: email})
    .then((res) => {
      // force login with new password
      props.login(res.data.token)

    })
    .catch((e) => {
      console.log(e)
      setStatus('Error updating password')
    })
  }


  //send user code for a pass reset
  const sendResetPassCode = () => {
    // Send code to reset password
    setEmail(emailv1)
    axios.post(`${BASE_URL}/resetPassword`, {email: emailv1})
    .then((res) =>
    {
      setStatus('Please enter the code sent to your email.')

    // Load UI for code entry
    setShowCode(true)

    })
    .catch((e) => {
      
      setStatus('Could not find user')
    })
    

  }

  if (showCode)
  {
    return(
      <CodeEntry fulfilled = {onFulfill} status = {status} ></CodeEntry>
    )
  }

  if (canResetPass)
  {
    return (
      <KeyboardAvoidingView style={styles.containerView} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.loginScreenContainer}>
            <View style={styles.loginFormView}>
              <Text style={styles.logoText}>Reset Password</Text>
              <TextInput
                placeholder="Enter new password"
                placeholderColor="#c4c3cb"
                secureTextEntry={true}
                style={styles.loginFormTextInput}
                onChangeText={(text) => {setPass1(text); setStatus((text === pass2)? '': 'Passwords must match')}}
              />
              <TextInput
                placeholder="Confirm new password"
                placeholderColor="#c4c3cb"
                secureTextEntry={true}
                style={styles.loginFormTextInput}
                onChangeText={(text) => {setPass2(text); setStatus((pass1 === text)? '': 'Passwords must match')}}
              />
              <Button
                buttonStyle={styles.loginButton}
                onPress={() => resetPassword()}
                title="Change Password"
                disabled={!((pass1 === pass2))}
              />
  
  
  
  
              <Text style={styles.errorText}>{status}</Text>
  
  
              <View style = {styles.bottomTextContainer}>
                <Text onPress = {() => setCanResetPass(false)}style={styles.bottomText}>Back to Login</Text>
              </View>
  
              
  
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    )
  }

  else if (forgotPassword)
  {
    return (
      <KeyboardAvoidingView style={styles.containerView} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.loginScreenContainer}>
            <View style={styles.loginFormView}>
              <Text style={styles.logoText}>Reset Password</Text>
              <TextInput
                placeholder="Email"
                placeholderColor="#c4c3cb"
                style={styles.loginFormTextInput}
                onChangeText={(text) => {setEmailv1(text); setStatus((text === emailv2)? '': 'Please type the same email twice')}}
              />
              <TextInput
                placeholder="Confirm Email"
                placeholderColor="#c4c3cb"
                style={styles.loginFormTextInput}
                onChangeText={(text) => {setEmailv2(text); setStatus((emailv1 === text)? '': 'Please type the same email twice')}}
              />
              <Button
                buttonStyle={styles.loginButton}
                onPress={() => sendResetPassCode()}
                title="Send Reset Link"
                disabled={!(isEmail.test(emailv1) && isEmail.test(emailv2) && (emailv1 === emailv2))}
              />
  
  
  
  
              <Text style={styles.errorText}>{status}</Text>
  
  
              <View style = {styles.bottomTextContainer}>
                <Text onPress = {() => toggleForgotPassword()}style={styles.bottomText}>{(!forgotPassword? 'Forgot password': 'Login')}</Text>
              </View>
  
              
  
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.containerView} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.loginScreenContainer}>
          <View style={styles.loginFormView}>
            <Text style={styles.logoText}>Meal Genius</Text>
            <TextInput
              placeholder="Email"
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
              disabled={!(isEmail.test(email) && password)}
            />

            <Button
              buttonStyle={styles.loginButton}
              onPress={() => onRegisterPress()}
              title="Register"
              disabled={!(isEmail.test(email) && password)}
            />



            <Text style={styles.errorText}>{status}</Text>


            <View style = {styles.bottomTextContainer}>
              <Text onPress = {() => toggleForgotPassword()}style={styles.bottomText}>{(!forgotPassword? 'Forgot password': 'Login')}</Text>
            </View>

            

          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    alignItems: "center"
  },
  loginScreenContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "100",
    marginTop: 150,
    marginBottom: 30,
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "200",
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 40,
    textAlign: "center",
  },
  loginFormView: {
    flex: 1,
  },
  loginFormTextInput: {
    height: 43,
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#fafafa",
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  loginButton: {
    backgroundColor: "#3897f1",
    borderRadius: 5,
    height: 45,
    marginTop: 10,
    width: 350,
    alignItems: "center"
  },
  container: {
    marginTop: 50,
    marginBottom:-50,
  },
  button: {
    fontSize: 24,
  },
  bottomTextContainer: {
    flex: 1, 
    justifyContent: 'flex-end',
    alignItems: 'center', 
    marginBottom: 50
  },
  bottomText: {
    fontSize: 16,
  },
});
