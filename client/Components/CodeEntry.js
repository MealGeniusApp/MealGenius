
import React from 'react';
import { View, Text, Platform } from 'react-native';
import CodeInput from 'react-native-confirmation-code-input';
import styles from "./login_style";

const CodeEntry = ({ fulfilled, status }) => {
    return (

      <View style={styles.containerView} behavior="padding">
        <View style={styles.loginScreenContainer}>
          <View style={styles.loginFormView}>
            <Text style={styles.logoText}>Meal Genius</Text>
            <Text style={styles.errorText}>{status}</Text>  

            <CodeInput
              secureTextEntry = {false}
              activeColor='rgba(67, 121, 209, 1)'
              inactiveColor='rgba(67, 121, 209, 1.3)'
              autoFocus={true}
              ignoreCase={true}
              keyboardType= {Platform.OS === 'ios' ? 'numeric' : 'number-pad'}
              inputPosition='center'
              size={50}
              onFulfill={fulfilled}
              //containerStyle={{ marginTop: 30 }}
              codeInputStyle={{ borderWidth: 1.5 }}
            />  
          


          </View>
        </View>
    </View>

      
    );
  }


export default CodeEntry;
