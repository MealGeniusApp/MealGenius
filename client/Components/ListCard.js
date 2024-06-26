import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import RNFetchBlob from 'rn-fetch-blob';

const ListCard = ({ meal, onPress, onLongPress, cache }) => {
  const [failedToLoad, setFailedToLoad] = useState(false) // allow fallback image if the image cannot load
  const image = `${RNFetchBlob.fs.dirs.DocumentDir}/saved/${meal.meal}/${meal.date}.jpg`

  const [validImage, setValidImage] = useState(true)
  useEffect(() => {
    RNFetchBlob.fs.exists(image)
    .then((res) => {
      setValidImage(res)
    })
    
    
  }, [meal])


  return (
    <TouchableOpacity
      onPress={() => onPress(meal)}
      onLongPress={(event) => onLongPress(event, meal)}
      style={styles.card}
    >
      {/* Add image on the left */}
      <Image 
        source={image? (!failedToLoad? (meal?.image? {uri: cache? (validImage? image: meal.image): meal.image} : require('../assets/notfound.jpg')): (meal?.image? {uri: meal.image }: require('../assets/notfound.jpg'))): require('../assets/load.gif')}
        style={styles.image}
        onError={() => {setFailedToLoad(true)}} 
        />

      {/* Text content on the right */}
      <View style={styles.textContainer}>
        {/* Conditionally render the image in the top right corner */}
        {meal.cart && (
          <Image
            source={ require('../assets/cart.png')}
            style={styles.cartImage}
          />
        )}

        <Text style={styles.title}>{meal.title.length > 29? meal.title.substring(0, 28) + '..': meal.title}</Text>
        <Text style={styles.description}>{meal.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    padding: 16,
    color: 'black',
    margin: 8,
    elevation: 2,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    height: Platform.OS === 'ios' && Platform.isPad ? 200 : 120,
  },
  image: {
    width: Platform.OS === 'ios' && Platform.isPad ? 120 : 70,
    height: Platform.OS === 'ios' && Platform.isPad ? 120 : 70,
    marginRight: 16,
    borderRadius: 15,
  },
  textContainer: {
    flex: 1,
    position: 'relative', // Add position relative to the container
  },
  cartImage: {
    position: 'absolute',
    top: Platform.OS === 'ios' && Platform.isPad ? -15 : 0,
    right: 0,
    width: Platform.OS === 'ios' && Platform.isPad ? 60 : 30,
    height: Platform.OS === 'ios' && Platform.isPad ? 60 : 30,
    borderRadius: 15,
  },
  title: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 30 : 15,
    fontWeight: 'bold',
  },
  description: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 23 : 14,
    marginTop: 8,
  },
});

export default ListCard;
