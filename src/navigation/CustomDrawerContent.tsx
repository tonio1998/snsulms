import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text } from 'react-native';

export default function CustomDrawerContent(props) {
  return (
      <DrawerContentScrollView {...props}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Hello, User 👋</Text>
        </View>
        <DrawerItem
            label="Home"
            onPress={() => props.navigation.navigate('Home')}
        />
        <DrawerItem
            label="Settings"
            onPress={() => props.navigation.navigate('Settings')}
        />
      </DrawerContentScrollView>
  );
}
