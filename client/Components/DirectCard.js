import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import RNFetchBlob from 'rn-fetch-blob';

const DirectCard = ({ meal, onPress, onLongPress, cache }) => {
  const [failedToLoad, setFailedToLoad] = useState(false); // Allow fallback image if the image cannot load
  const image = `${RNFetchBlob.fs.dirs.DocumentDir}/saved/${meal.meal}/${meal.date}.jpg`;

  const [validImage, setValidImage] = useState(true);
  useEffect(() => {
    RNFetchBlob.fs.exists(image)
      .then((res) => {
        setValidImage(res);
      });
  }, [meal]);

  return (
    <TouchableOpacity
      onPress={() => onPress(meal)}
      onLongPress={(event) => onLongPress(event, meal)}
      style={styles.card}
    >
      

      <View style={styles.container}>
        <Text style={styles.title}>{meal.title} ({meal.meal})</Text>
        {/* Conditionally render the image in the top right corner */}
      {meal.cart && (
          <Image
            source={ require('../assets/cart.png')}
            style={styles.cartImage}
          />
        )}
      </View>
      <View style={styles.horizontalLine} />
      <View style={styles.container}>
        <Image
          source={image ? (!failedToLoad ? (meal?.image ? { uri: cache ? (validImage ? image : meal.image) : meal.image } : require('../assets/notfound.jpg')) : (meal?.image ? { uri: meal.image } : require('../assets/notfound.jpg'))) : require('../assets/load.gif')}
          style={styles.image}
          onError={() => { setFailedToLoad(true); }}
        />
        <Text style={styles.description}>{meal.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 15,
    elevation: 2,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginBottom: 10,
    marginTop: 10
  },
  cartImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
  },
  description: {
    flex: 1,
    fontSize: 16,
    marginTop: 8,
  },
});

export default DirectCard;
