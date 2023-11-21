// Card.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as Progress from 'react-native-progress'

const LoadingCard = (props) => {
  return (
    <View style={styles.card}>
      

      <View style={styles.imagecontainer}>
          <Image
            source={{ uri: 'https://i.gifer.com/4V0b.gif' }}
            style={styles.image}
          />
      </View>
        
      <Text style={styles.description}>Generating meals...</Text>

      <Progress.Bar progress={props.progress} width={200} />

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
    height: 620
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginTop: 30,
    marginBottom: 20,
    
  },
  imagecontainer: {
    alignItems: 'center'
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'cover', 
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

export default LoadingCard;
