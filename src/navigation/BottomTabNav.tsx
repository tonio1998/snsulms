import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import ClassesScreen from '../screens/Classes/ClassesScreen.tsx';

import { theme } from '../theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAccess } from '../hooks/useAccess.ts';
import { CText } from '../components/CText.tsx';
import GradesScreen from "./Grades/GradesScreen.tsx";
import ActivitiesScreen from "../screens/Activities/ActivitiesScreen.tsx";

const Tab = createBottomTabNavigator();
const ClassesStack = createNativeStackNavigator();
const currentColors = theme.colors.light;

function useOrientation() {
	const [isLandscape, setIsLandscape] = useState(
		Dimensions.get('window').width > Dimensions.get('window').height
	);

	useEffect(() => {
		const subscription = Dimensions.addEventListener('change', ({ window }) => {
			setIsLandscape(window.width > window.height);
		});
		return () => subscription?.remove?.();
	}, []);

	return isLandscape;
}

export default function BottomTabNav() {
	const isLandscape = useOrientation();
	const { hasRole } = useAccess();

	return (
		<>
			<Tab.Navigator
				screenOptions={({ route }) => ({
					tabBarIcon: ({ color, size, focused }) => {
						let iconName = 'ellipse-outline';
						switch (route.name) {
							case 'Home':
								iconName = focused ? 'home' : 'home-outline';
								break;
							case 'Activities':
								iconName = focused ? 'reader' : 'reader-outline';
								break;
							case 'Classes':
								iconName = focused ? 'people' : 'people-outline';
								break;
							case 'Grades':
								iconName = focused ? 'bar-chart' : 'bar-chart-outline';
								break;
							default:
								break;
						}
						return <Icon name={iconName} size={20} color={focused ? currentColors.primary : '#9F9F9F'} />;
					},
					tabBarLabel: ({ color, focused }) => (
						<CText
							numberOfLines={1}
							style={{
								color: focused ? currentColors.primary : '#9F9F9F',
								fontWeight: focused ? 'bold' : 'normal',
								fontSize: 12,
								textAlign: 'center',
							}}
						>
							{route.name}
						</CText>
					),
					tabBarLabelPosition: isLandscape ? 'beside-icon' : 'below-icon',
					tabBarActiveTintColor: currentColors.primary,
					tabBarInactiveTintColor: '#9F9F9F',
					headerShown: false,
					tabBarStyle: {
						backgroundColor: currentColors.card,
						height: isLandscape ? 55 : 65,
						paddingTop: 4,
						paddingBottom: isLandscape ? 4 : 10,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: -2 },
						shadowOpacity: 0.1,
						shadowRadius: 10,
						borderColor: '#ccc',
						flexDirection: isLandscape ? 'row' : 'column',
					},
				})}
			>
				<Tab.Screen name="Home" component={HomeScreen} />
				<Tab.Screen name="Classes" component={ClassesStackScreen} />
				<Tab.Screen name="Activities" component={ActivitiesScreen} />
				{/*<Tab.Screen name="Grades" component={GradesScreen} />*/}
			</Tab.Navigator>
		</>
	);
}

function ClassesStackScreen() {
	return (
		<>
			<ClassesStack.Navigator screenOptions={{ headerShown: false }}>
				<ClassesStack.Screen name="Classes" component={ClassesScreen} />
			</ClassesStack.Navigator>
		</>
	);
}
