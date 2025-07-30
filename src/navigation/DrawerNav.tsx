// src/navigation/DrawerNav.tsx

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNav from './BottomTabNav.tsx';
import ProfileScreen from '../Shared/User/ProfileScreen.tsx';
import AcademicYearScreen from '../Shared/AcademicYearScreen.tsx';

const Drawer = createDrawerNavigator();
const HiddenStack = createNativeStackNavigator();

function HiddenStackScreen() {
    return (
        <HiddenStack.Navigator screenOptions={{ headerShown: false }}>
            {/* Main Tabbed App */}
            <HiddenStack.Screen name="Tabs" component={BottomTabNav} />

            {/* Drawer Screens that should not hide the bottom tabs */}
            <HiddenStack.Screen name="Profile" component={ProfileScreen} />
            <HiddenStack.Screen name="AcademicYear" component={AcademicYearScreen} />
            <HiddenStack.Screen name="AddActivity" component={AcademicYearScreen} />
            {/* Add more here if needed */}
        </HiddenStack.Navigator>
    );
}

export default function DrawerNav() {
    return (
        <Drawer.Navigator
            initialRouteName="Main"
            screenOptions={{ headerShown: false }}
        >
            <Drawer.Screen name="Main" component={HiddenStackScreen} />
        </Drawer.Navigator>
    );
}
