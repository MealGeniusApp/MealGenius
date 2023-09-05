import React, { useState} from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

const SwipeableCard = ({ nextMeal, swipe}) => {
  const [translateX] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(1));
  const SWIPE_THRESH = 25
  

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const rotateCard = translateX.interpolate({
    inputRange: [-500, 0, 500],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp',
  });

  

  const onGestureEnd = () => {
    // Done swiping
    // Aborted Swipe
    if (translateX._value  <= SWIPE_THRESH && translateX._value >= -SWIPE_THRESH) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }

    // Swiped Right
    else if (translateX._value > 0)
    {
      

      Animated.timing(translateX, {
        toValue: 500, // Target value
        duration: 300, // Animation duration
        useNativeDriver: false,
      }).start(() => replaceCard(true));

    }

    // Swiped left
    else if (translateX._value < 0)
    {

      Animated.timing(translateX, {
        toValue: -500, // Target value
        duration: 300, // Animation duration
        useNativeDriver: false,
      }).start(() => replaceCard(false));
      
    }
    
  };


  // Load the next card onto the screen and into reference
  const replaceCard = (right) => {
    // Call swipe event to load the next meal to the UI
    swipe(right)
    
    opacity._value = 0

    // Put the card back in the center
    const resetTranslateAnimation = Animated.timing(translateX, {
      toValue: 0,
      duration: 0,
      useNativeDriver: false,
    });

    // Fade in the card
    const fadeInAnimation = Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    });

    //resetTranslateAnimation.start()
    Animated.sequence([resetTranslateAnimation, fadeInAnimation]).start()
  }


  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={(event) => {
        onGestureEnd();

      }}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: opacity,
            transform: [
              { translateX: translateX },
              { rotate: rotateCard },
            ],
          },
        ]}
      >
        <Text style={styles.title}>{nextMeal?.title}</Text>
        <View style={styles.imagecontainer}>
          <Image
            source={{ uri: nextMeal?.image? nextMeal.image: 'https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg' }}
            style={styles.image}
          />
        </View>
        
        <Text style={styles.description}>{nextMeal?.description}</Text>
      </Animated.View>
    </PanGestureHandler>
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
    elevation: 2,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    height: 620
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 16
  },
  description: {
    marginTop: 8,
  },
  imagecontainer: {
    alignItems: 'center',
    paddingBottom: 16
  },
  image: {
    width: 200,
    height: 200,
    borderWidth: 1,     
    borderColor: 'gray', 
    borderRadius: 5,      
    resizeMode: 'cover', // You can choose other resizeMode values
  },
});

export default SwipeableCard;
