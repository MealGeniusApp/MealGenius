// Card.js
import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import * as Progress from 'react-native-progress'

const LoadingCard = (props) => {
  return (
    <View style={styles.card}>
      

      <View style={styles.imagecontainer}>
          <Image
            source={require('../assets/load.gif')}
            style={styles.image}
          />
      </View>
        
      <Text style={styles.description}>{props.requests? 'Generating meals based on:': 'Generating meals...'}</Text>
      {(props.requests && (<Text style={styles.description}>{props.requests}</Text>))}

      <Progress.Bar progress={props.progress} width={Platform.OS === 'ios' && Platform.isPad ? 400 : 200} />

      <View style = {styles.bottomTextContainer}>
        <Text style={styles.bottomText}>This should only take a minute.</Text>
      </View>

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
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 25 : 16,
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
  bottomTextContainer: {
    flex: 1, 
    justifyContent: 'flex-end',
    alignItems: 'center', 
    marginBottom: 50
  },
  bottomText: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 26 : 16,
  },
});

export default LoadingCard;
