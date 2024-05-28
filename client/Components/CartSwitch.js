import React, { useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Image } from 'react-native';

const CartSwitch = ({ value, onValueChange, imageSource }) => {
  const [animationValue] = useState(new Animated.Value(value ? 18 : -5));

  const backgroundColor = animationValue.interpolate({
    inputRange: [-5, 18],
    outputRange: ['#ccc', '#00c04b'],
  });

  const toggleSwitch = () => {
    Animated.timing(animationValue, {
      toValue: value ? -5 : 18,
      duration: 200,
      useNativeDriver: false, // useNativeDriver cannot animate background color, hence false
    }).start(() => {
      onValueChange(!value);
    });
  };

  return (
    <TouchableOpacity onPress={toggleSwitch}>
      <Animated.View style={[styles.switchContainer, { backgroundColor }]}>
        <Animated.View style={[styles.switchCircle, { transform: [{ translateX: animationValue }] }]}>
          <Image source={imageSource} style={styles.image} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 5,
  },
  switchCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 20,
    height: 20,
  },
});

export default CartSwitch;
