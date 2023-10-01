
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const NoTokens = (props) => {
  return (
    <View style={styles.card}>
      

      <View style={styles.imagecontainer}>
          <Image
            source={{ uri: 'https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png' }}
            style={styles.image}
          />
      </View>
        
      <Text style={styles.title}>Swipe limit reached!</Text>
      <Text style={styles.description}>Please purchase more swipes to continue. </Text>

    

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
  
});

export default NoTokens;
