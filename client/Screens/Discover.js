import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DiscoverCard from '../Components/DiscoverCard';
import LoadingCard from '../Components/LoadingCard';
import NoTokens from '../Components/NoTokens';

const Discover = (props) => {
    // Only show meals if we have tokens
    if (props.tokens > 0)
    {
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
    }
    else{
      return (
        <View>
        <View style={styles.container}>
            <NoTokens/>
        </View>
        </View>
    
    );


    }
    
    
    

};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
  });

export default Discover;
