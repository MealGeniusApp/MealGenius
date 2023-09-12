// Meal card to display on list page

// Just a rectangular card - list item

// New mealview component will have title at top, back arrow, and two tabs at top for ingredients and instructions
// Button to add to cart?
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ListCard = ({ title, description }) => {
  return (
    <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    color: 'black',
    margin: 8,
    elevation: 2, // Android shadow
    shadowColor: 'black', // iOS shadow
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    height: 100
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 8,
  },
});

export default ListCard;
