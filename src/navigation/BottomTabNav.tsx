import React from 'react';
import { Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme';

import HomeScreen from '../Shared/HomeScreen.tsx';
import ClassesScreen from '../screens/Student/Classes/ClassesScreen.tsx';
import ActivitiesScreen from '../screens/Student/Classes/ActivitiesScreen.tsx';
import QRCodeScreen from '../Shared/User/QRCodeScreen.tsx';
import ClassesListScreen from '../screens/Faculty/Classes/ClassesListScreen.tsx';

import { useAccess } from '../hooks/useAccess.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { CText } from '../components/common/CText.tsx';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestBuilderScreen from "../Shared/Survey/TestBuilderScreen.tsx";
import CalendarScreen from "../Shared/CalendarScreen.tsx";
import SchedulesScreen from "../Shared/Schedule/SchedulesScreen.tsx";

const ClassesStack = createNativeStackNavigator();
const FacClassesStack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const currentColors = theme.colors.light;

export default function BottomTabs() {
	const { hasRole } = useAccess();
	const { user } = useAuth();

	return (
		<Tab.Navigator
			initialRouteName="Home"
			screenOptions={({ route }) => ({
				headerShown: false,
				swipeEnabled: true,
				tabBarShowIcon: true,
				tabBarActiveTintColor: currentColors.primary,
				tabBarInactiveTintColor: '#9F9F9F',
				tabBarStyle: {
					backgroundColor: currentColors.card,
					height: 65,
					paddingBottom: 10,
					paddingTop: 4,
					borderTopColor: '#ccc',
					borderTopWidth: 1,
					elevation: 4,
					shadowColor: '#000',
					shadowOpacity: 0.1,
					shadowRadius: 10,
					shadowOffset: { width: 0, height: -2 },
				},
				tabBarIcon: ({ focused, color, size }) => {
					let iconName = 'ellipse-outline';
					switch (route.name) {
						case 'Home':
							iconName = focused ? 'home' : 'home-outline';
							break;
						case 'Activities':
							iconName = focused ? 'reader' : 'reader-outline';
							break;
						case 'Classes':
							iconName = focused ? 'library' : 'library-outline';
							break;
						case 'myQR':
							iconName = 'qr-code';
							break;
						case 'Grades':
							iconName = focused ? 'bar-chart' : 'bar-chart-outline';
							break;
						case 'Test Builder':
							iconName = focused ? 'book' : 'book-outline';
							break;
						case 'Calendar':
							iconName = focused ? 'calendar' : 'calendar-outline';
							break;
						case 'Schedule':
							iconName = focused ? 'time' : 'time-outline';
							break;
						default:
							break;
					}
					return <Icon name={iconName} size={22} color={color} />;
				},
				tabBarLabel: ({ focused, color }) => (
					<CText
						numberOfLines={1}
						style={{
							color,
							fontWeight: focused ? 'bold' : 'normal',
							fontSize: 12,
							textAlign: 'center',
						}}
					>
						{route.name}
					</CText>
				),
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Schedule" component={SchedulesScreen} />

			{hasRole('STUD') && (
				<>
					<Tab.Screen name="Classes" component={ClassesStackScreen} />
					<Tab.Screen name="myQR" component={QRCodeScreen} />
					<Tab.Screen name="Activities" component={ActivitiesScreen} />
				</>
			)}
			{hasRole('ACAD') && (
				<>
					<Tab.Screen name="Classes" component={FacClassesStackScreen} />
					<Tab.Screen name="Test Builder" component={TestBuilderScreen} />
				</>
			)}

			<Tab.Screen name="Calendar" component={CalendarScreen} />
		</Tab.Navigator>
	);
}

function ClassesStackScreen() {
	return (
		<ClassesStack.Navigator screenOptions={{ headerShown: false }}>
			<ClassesStack.Screen name="Classes" component={ClassesScreen} />
		</ClassesStack.Navigator>
	);
}

function FacClassesStackScreen() {
	return (
		<FacClassesStack.Navigator screenOptions={{ headerShown: false }}>
			<FacClassesStack.Screen name="Classes" component={ClassesListScreen} />
		</FacClassesStack.Navigator>
	);
}
