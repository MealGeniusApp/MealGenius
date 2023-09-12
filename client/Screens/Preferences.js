import React from 'react';
import { View, Text, Button } from 'react-native';

const Preferences = (props) => {
  return (
    <View>
      <Button
        onPress={() => props.logout()}
        title="Logout"
      />
    </View>
  );
};

export default Preferences;
