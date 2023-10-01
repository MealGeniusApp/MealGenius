
import React from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet, Button} from 'react-native';
import CodeInput from 'react-native-confirmation-code-input';

const CodeEntry = ({ fulfilled, status }) => {
  function handlePress()
  {
    // back button
    alert('button working')
    console.log('back button working')
  }

    return (

      <View style={styles.containerView} behavior="padding">
       
        
        <View style={styles.loginScreenContainer}>

            <View style={styles.container}>
              <TouchableOpacity style={{position:'absolute', flex: 1}} onPress={handlePress}>
              <Text style={styles.button} onPress={handlePress} >{'<'}</Text>
              </TouchableOpacity>
                
            </View>


            
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
  });


export default CodeEntry;
