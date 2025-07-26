// src/navigation/StackWithHeader.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNav from './BottomTabNav';

const Stack = createNativeStackNavigator();

export default function StackWithHeader() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={BottomTabNav}
        options={{ title: '📱 SnapCheck', headerShown: false }}
      />
    </Stack.Navigator>
  );
}
