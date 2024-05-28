import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated, Platform } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import RNFetchBlob from 'rn-fetch-blob';

const SwipeableCard = ({ nextMeal, swipe, cache }) => {
  const [translateX] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(1));
  const [validImage, setValidImage] = useState(true);
  const [failedToLoad, setFailedToLoad] = useState(false);
  const image = nextMeal ? `${RNFetchBlob.fs.dirs.DocumentDir}/${nextMeal.meal}/${nextMeal.date}.jpg` : '';
  const SWIPE_THRESH = 25;

  useEffect(() => {
    RNFetchBlob.fs.exists(image).then((res) => {
      setValidImage(res);
    });
  }, [nextMeal]);

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
    if (translateX._value <= SWIPE_THRESH && translateX._value >= -SWIPE_THRESH) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    } else if (translateX._value > 0) {
      Animated.timing(translateX, {
        toValue: 500,
        duration: 300,
        useNativeDriver: false,
      }).start(() => replaceCard(true));
    } else if (translateX._value < 0) {
      Animated.timing(translateX, {
        toValue: -500,
        duration: 300,
        useNativeDriver: false,
      }).start(() => replaceCard(false));
    }
  };

  const replaceCard = (right) => {
    swipe(right);
    opacity._value = 0;

    const resetTranslateAnimation = Animated.timing(translateX, {
      toValue: 0,
      duration: 0,
      useNativeDriver: false,
    });

    const fadeInAnimation = Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    });

    Animated.sequence([resetTranslateAnimation, fadeInAnimation]).start();
  };

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
            transform: [{ translateX: translateX }, { rotate: rotateCard }],
          },
        ]}
      >
        <Text style={styles.title}>{nextMeal?.title}</Text>
        <View style={styles.imagecontainer}>
          <Image
            source={
              nextMeal?.image
                ? { uri: cache ? (validImage ? image : nextMeal.image) : nextMeal.image }
                : require('../assets/notfound.jpg')
            }
            style={styles.image}
            onError={() => setFailedToLoad(true)}
          />
        </View>
        <Text style={styles.description}>{nextMeal?.description}</Text>
        <View style={styles.bottomRightContainer}>
          <Image source={require('../assets/icon.png')} style={styles.bottomRightImage} />
          <Text style={styles.bottomRightText}>Meal Genius</Text>
        </View>
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
    height: Platform.OS === 'ios' && Platform.isPad ? 1150 : 620,
    position: 'relative',
  },
  title: {
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 40 : 18,
    fontWeight: 'bold',
    paddingBottom: 16,
  },
  description: {
    marginTop: 8,
    fontSize: Platform.OS === 'ios' && Platform.isPad ? 30 : 15,
    padding: Platform.OS === 'ios' && Platform.isPad ? 40 : 15,
  },
  imagecontainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  image: {
    width: Platform.OS === 'ios' && Platform.isPad ? 300 : 200,
    height: Platform.OS === 'ios' && Platform.isPad ? 300 : 200,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    resizeMode: 'cover',
  },
  bottomRightContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    alignItems: 'center',
  },
  bottomRightImage: {
    width: 40,
    height: 40,
  },
  bottomRightText: {
    marginTop: 4,
    fontSize: 10,
  },
});

export default SwipeableCard;
