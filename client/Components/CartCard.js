import React, {useEffect, useState} from 'react';
import { Platform, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const CartCard = ({ meal, onPress, onLongPress }) => {

  const [selected, setSelected] = useState(false)
  const [finished, setFinished] = useState([])

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
      onPress={() => {onPress(meal); setSelected(!selected)}}
      onLongPress={(event) => onLongPress(event, meal)}
      style={{ ...styles.card, height: selected? 'auto': Platform.OS === 'ios' && Platform.isPad ? 200 : 120 }}
    >
      {/* Add image on the left */}
      {!selected && (<Image source={{ uri: meal.image }} style={styles.image} />)}



      {/* Text content on the right */}
      <View style={styles.textContainer}>
        {/* Conditionally render the image in the top right corner */}
        {meal.cart && (
          <Image
            source={{ uri: 'https://cdn1.iconfinder.com/data/icons/leto-ecommerce-shopping-1/64/checkout_cart_shopping_shop-1024.png' }}
            style={styles.cartImage}
          />
        )}

        <Text style={styles.title}>{meal.title}</Text>
         {

            !selected? (
            <View>
              <Text style = {{fontSize: Platform.OS === 'ios' && Platform.isPad ? 20 : 14,}}>Touch to view ingredients</Text>
            </View>)
            :

            

            meal.instructions.trim() === '' ? (
              <View style={styles.tokenContainer}>
                <Text style={styles.loadtext}>Generating awesomeness, hang tight</Text>
                <Image source={{ uri: 'https://i.gifer.com/4V0b.gif' }} style={styles.loadimage} />
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
