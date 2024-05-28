
import { Platform, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect} from 'react';
import RNFetchBlob from 'rn-fetch-blob';

const CartCard = ({ meal, onLongPress, cache }) => {
  // For image display, new cached version
  const [failedToLoad, setFailedToLoad] = useState(false) // allow fallback image if the image cannot load
  const image = `${RNFetchBlob.fs.dirs.DocumentDir}/saved/${meal.meal}/${meal.date}.jpg`

  const [selected, setSelected] = useState(false)
  const [finished, setFinished] = useState([])
const [validImage, setValidImage] = useState(true)
useEffect(() => {
  RNFetchBlob.fs.exists(image)
  .then((res) => {
    setValidImage(res)
  })
  
  
}, [meal])

  // Select this ingredient
  function complete(ingredient)
  {
    if (finished.includes(ingredient))
    {
      // Remove it
      setFinished((prevFinished) =>
        prevFinished.filter((item) => item !== ingredient)
     );
    }
    else
    {
      // add it
      setFinished((prevFinished) => [...prevFinished, ingredient]);
    }
  }



  return (
    <TouchableOpacity
      onPress={() => {setSelected(!selected)}}
      onLongPress={(event) => onLongPress(event, meal)}
      style={{ ...styles.card, height: selected? 'auto': Platform.OS === 'ios' && Platform.isPad ? 200 : 120 }}
    >
      {/* Add image on the left */}
      {!selected && (
      <Image 
          source={image? (!failedToLoad? (meal?.image? {uri: cache? (validImage? image: meal.image): meal.image} : require('../assets/notfound.jpg')): (meal?.image? {uri: meal.image }: require('../assets/notfound.jpg'))): require('../assets/load.gif')}
          style={styles.image}
          onError={() => {setFailedToLoad(true)}} 
        />)}



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
         {

            !selected? (
            <View>
              <Text style = {{fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 14,}}>Touch to view ingredients</Text>
            </View>)
            :

            

            meal.instructions.trim() === '' ? (
              <View style={styles.tokenContainer}>
                <Text style={styles.loadtext}>Generating awesomeness, hang tight</Text>
                <Image source={require('../assets/load.gif')} style={styles.loadimage} />
              </View>
            ) :
            meal.ingredients.split('\n').map((ingredient, index) => (
              ingredient.length > 2 && (
                
                <View key={index} style={{...styles.tokenContainer, backgroundColor: !finished.includes(index)? '#d6eefb': '#f0f0f0'}}>
                  <Text onPress={()=> {complete(index)}} style={styles.tokenText}>{ingredient}</Text>
                </View>
              )
            ))
          }
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
  tokenContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 3, // Add space between tokens
    padding: 8,
  },
  tokenText: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 30 : 17,
  },
  loadtext: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 30 : 17,
    textAlign: 'center'
  },
  loadimage: {
    width: Platform.OS === 'ios' && Platform.isPad ? 150 : 100,
    height: Platform.OS === 'ios' && Platform.isPad ? 150 : 100,
    alignSelf: 'center'
  },
});

export default CartCard;
