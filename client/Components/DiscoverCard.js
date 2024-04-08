import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated, Platform } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import RNFetchBlob from 'rn-fetch-blob';

const SwipeableCard = ({ nextMeal, swipe, cache}) => {
  const [translateX] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(1));
  const [validImage, setValidImage] = useState(true)

  const [failedToLoad, setFailedToLoad] = useState(false) // allow fallback image if the image cannot load
  const image = nextMeal? `${RNFetchBlob.fs.dirs.DocumentDir}/${nextMeal.meal}/${nextMeal.date}.jpg`: ''
  const SWIPE_THRESH = 25

  useEffect(() => {
    RNFetchBlob.fs.exists(image)
    .then((res) => {
      setValidImage(res)
    })
    
    
  }, [nextMeal])


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
            source={(nextMeal?.image? {uri: cache? (validImage? image: nextMeal.image): nextMeal.image} : require('../assets/notfound.jpg'))}
            style={styles.image}
            onError={() => setFailedToLoad(true)} // for some reason, failed to load was true and source was not using the image although it was present.
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
    height: Platform.OS === 'ios' && Platform.isPad ? 1150 : 620
  },
  title: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 40 : 18,
    fontWeight: 'bold',
    paddingBottom: 16
  },
  description: {
    marginTop: 8,
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 30 : 15,
    padding: Platform.OS === 'ios' && Platform.isPad ? 40 : 15,
  },
  imagecontainer: {
    alignItems: 'center',
    paddingBottom: 16
  },
  image: {
    width: Platform.OS === 'ios' && Platform.isPad ? 300 : 200,
    height: Platform.OS === 'ios' && Platform.isPad ? 300 : 200,
    borderWidth: 1,     
    borderColor: 'gray', 
    borderRadius: 5,      
    resizeMode: 'cover', // You can choose other resizeMode values
  },
});

export default SwipeableCard;
