
import React from 'react';
import CodeInput from 'react-native-confirmation-code-input';

const CodeEntry = ({ visible, fulfilled }) => {
  if (visible)
  {
    return (
      <CodeInput
        //ref="codeInputRef2"
        secureTextEntry
        //compareWithCode='12345'
        activeColor='rgba(49, 180, 4, 1)'
        inactiveColor='rgba(49, 180, 4, 1.3)'
        autoFocus={true}
        ignoreCase={true}
        inputPosition='center'
        size={50}
        onFulfill={fulfilled}
        //containerStyle={{ marginTop: 30 }}
        codeInputStyle={{ borderWidth: 1.5 }}
      />
    );
  }
  
};


export default CodeEntry;
