import React from 'react';
import { StatusBar, Platform } from 'react-native';

const DynamicStatusBar = ({ isDark = true, backgroundColor = '#ffffff', translucent = false }) => {
  return (
    <StatusBar
      barStyle={isDark ? 'dark-content' : 'light-content'}
      backgroundColor={Platform.OS === 'android' ? backgroundColor : undefined}
      translucent={translucent}
    />
  );
};

export default DynamicStatusBar;
