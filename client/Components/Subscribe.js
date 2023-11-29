import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

const Subscribe = ({ subscribed, purchase }) => {
  return (
    <View style={[styles.container, subscribed ? styles.activeContainer : null]}>
      {subscribed ? (
        <>
          <Text style={styles.activeText}>Subscription Active</Text>
          <Image source='https://image.similarpng.com/very-thumbnail/2021/05/Blue-check-mark-icon-design-on-transparent-background-PNG.png' style={styles.checkmarkImage} />
        </>
      ) : (
        <>
          <Text style={styles.inactiveText}>Subscribe Now!</Text>
          <TouchableOpacity onPress={() => purchase()} style={styles.subscribeButton}>
            <Text style={styles.buttonText}>Subscribe</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    alignItems: 'center',
  },
  activeContainer: {
    backgroundColor: '#8BC34A', // Green color for active subscription
  },
  activeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // White color for text in active subscription
  },
  checkmarkImage: {
    width: 20,
    height: 20,
    marginVertical: 8,
  },
  inactiveText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscribeButton: {
    backgroundColor: '#2196F3', // Blue color for Subscribe button
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff', // White color for text on the button
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Subscribe;
