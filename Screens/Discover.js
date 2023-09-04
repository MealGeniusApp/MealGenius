import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DiscoverCard from '../Components/DiscoverCard';
import LoadingCard from '../Components/LoadingCard';

const Discover = (props) => {
    if (!props.loading)
    {
        return (
            <View>
            <View style={styles.container}>
                <DiscoverCard nextMeal = {props.nextMeal} swipe = {props.swipe}/>
            </View>
            </View>
        
      );
    }
        // Return loading screen
    return (
        <View>
        <View style={styles.container}>
            <LoadingCard progress = {props.loadProgress}/>
        </View>
        </View>
    
  );
    
    

};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
  });

export default Discover;
