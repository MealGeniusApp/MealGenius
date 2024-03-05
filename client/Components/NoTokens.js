
import React from 'react';
import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';
import Subscribe from '../Components/Subscribe';

const NoTokens = (props) => {
  return (
    <View style={styles.card}>
      

      <View style={styles.imagecontainer}>
          <Image
            source={require('../assets/notokens.png')}
            style={styles.image}
          />
      </View>
        
      <Text style={styles.title}>Swipe limit reached!</Text>
      <Text style={styles.description}>Please subscribe to continue. </Text>
      <Subscribe simple = {true}></Subscribe>

    

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    elevation: 2, // Android shadow
    shadowColor: 'black', // iOS shadow
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    height: Platform.OS === 'ios' && Platform.isPad ? 1150 : 620,
  },
  title: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 40 : 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 28 : 16,
    marginTop: 30,
    marginBottom: 20,
    
  },
  imagecontainer: {
    alignItems: 'center'
  },
  image: {
    width: Platform.OS === 'ios' && Platform.isPad ? 350 : 200,
    height: Platform.OS === 'ios' && Platform.isPad ? 350 : 200,
    resizeMode: 'cover', 
  },
  
});

export default NoTokens;
