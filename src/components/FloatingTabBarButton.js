// components/FloatingTabBarButton.js
import React from 'react';
import { TouchableOpacity, View, Platform } from 'react-native';
import { theme } from '../theme';

const currentColors = theme.colors.light;

const FloatingTabBarButton = ({ children, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        top: -30,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 65,
          height: 65,
          borderRadius: 32.5,
          backgroundColor: currentColors.primary,
          ...Platform.select({
            ios: {
              shadowColor: currentColors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            },
            android: {
              elevation: 8,
            },
          }),
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default FloatingTabBarButton;
