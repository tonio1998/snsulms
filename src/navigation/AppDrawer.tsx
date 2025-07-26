import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StackWithHeader from './StackWithHeader';
import CustomDrawerContent from './CustomDrawerContent';
import {theme} from "../theme";
import {StatusBar} from "react-native";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
      <><StatusBar
          backgroundColor="#1e90ff"
          barStyle="light-content"
      /><Drawer.Navigator
          initialRouteName="Dashboard"
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.light.primary,
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
      >
        <Drawer.Screen name="Dashboard" component={StackWithHeader}/>
      </Drawer.Navigator></>
  );
}
