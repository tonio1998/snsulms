import React from 'react';
import { Dimensions, Platform, StatusBar, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { useAccess } from '../hooks/useAccess.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { CText } from '../components/common/CText.tsx';

import HomeScreen from '../Shared/HomeScreen.tsx';
import CalendarScreen from "../Shared/CalendarScreen.tsx";
import SchedulesScreen from "../Shared/Schedule/SchedulesScreen.tsx";
import TestBuilderScreen from "../Shared/Survey/TestBuilderScreen.tsx";

import ClassesScreen from '../screens/Student/Classes/ClassesScreen.tsx';
import ActivitiesScreen from '../screens/Student/Classes/ActivitiesScreen.tsx';
import ClassesListScreen from '../screens/Faculty/Classes/ClassesListScreen.tsx';
import CustomHeader2 from "../components/layout/CustomHeader2.tsx";

const Tab = createBottomTabNavigator();
const ClassesStack = createNativeStackNavigator();
const FacClassesStack = createNativeStackNavigator();
const TopTab = createMaterialTopTabNavigator();

const colors = theme.colors.light;

export default function BottomTabs() {
	const { hasRole } = useAccess();
	const { user } = useAuth();
	const insets = useSafeAreaInsets();

	return (
		<Tab.Navigator
			initialRouteName="Home"
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarShowIcon: true,
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: '#9F9F9F',
				tabBarStyle: {
					backgroundColor: colors.card,
					paddingBottom: insets.bottom,
					height: 60 + insets.bottom,
					paddingTop: 4,
					// borderTopColor: '#ccc',
					// borderTopWidth: 1,
					// elevation: 4,
					// shadowColor: '#000',
					// shadowOpacity: 0.1,
					// shadowRadius: 10,
					// shadowOffset: { width: 0, height: -2 },
				},
				tabBarIcon: ({ focused, color }) => {
					let iconName = 'ellipse-outline';
					switch (route.name) {
						case 'Home':
							iconName = focused ? 'home' : 'home-outline';
							break;
						case 'Classes':
							iconName = focused ? 'library' : 'library-outline';
							break;
						case 'Calendar':
							iconName = focused ? 'calendar' : 'calendar-outline';
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

			{hasRole('STUD') && (
				<Tab.Screen name="Classes" component={StudentClassesStack} />
			)}

			{hasRole('ACAD') && (
				<Tab.Screen name="Classes" component={FacultyClassesStack} />
			)}

			<Tab.Screen name="Calendar" component={CalendarScreen} />
		</Tab.Navigator>
	);
}

// STUDENT Classes with Top Tabs
function StudentClassesStack() {
	return (
		<ClassesStack.Navigator screenOptions={{ headerShown: false }}>
			<ClassesStack.Screen name="StudentClassesTopTabs" component={StudentClassesTopTabs} />
		</ClassesStack.Navigator>
	);
}

function StudentClassesTopTabs() {
	return (
		<View style={{ flex: 1 }}>
			<View
				style={{
					paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 44,
					paddingBottom: 70,
					backgroundColor: colors.card,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<CustomHeader2/>
			</View>
			<TopTab.Navigator
				screenOptions={{
					tabBarScrollEnabled: true,
					tabBarItemStyle: { width: Dimensions.get('window').width / 3 },
					tabBarIndicatorStyle: {
						backgroundColor: colors.primary,
						height: 2,
						borderRadius: 3,
						marginBottom: Platform.OS === 'android' ? -1.5 : 0,
					},
					tabBarActiveTintColor: colors.primary,
					tabBarInactiveTintColor: '#9F9F9F',
					tabBarStyle: {
						backgroundColor: colors.card,
						elevation: 0,
						shadowOffset: { width: 0, height: -2 },
						borderBottomWidth: 1,
						borderBottomColor: '#ccc',
					},
					tabBarLabelStyle: { fontWeight: 'bold', color: colors.text },
				}}
			>
				<TopTab.Screen name="Classes" component={ClassesScreen} />
				<TopTab.Screen name="Activities" component={ActivitiesScreen} />
				<TopTab.Screen name="Schedule" component={SchedulesScreen} />
			</TopTab.Navigator>
		</View>
	);
}

// FACULTY Classes Top Tabs
function FacultyClassesStack() {
	return (
		<FacClassesStack.Navigator screenOptions={{ headerShown: false }}>
			<FacClassesStack.Screen name="FacultyClassesTopTabs" component={FacultyClassesTopTabs} />
		</FacClassesStack.Navigator>
	);
}

function FacultyClassesTopTabs() {
	return (
		<View style={{ flex: 1 }}>
			<View
				style={{
					paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 44,
					paddingBottom: 70,
					backgroundColor: colors.card,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<CustomHeader2/>
			</View>
			<TopTab.Navigator
				screenOptions={{
					tabBarScrollEnabled: true,
					tabBarItemStyle: { width: Dimensions.get('window').width / 2 },
					tabBarIndicatorStyle: {
						backgroundColor: colors.primary,
						height: 2,
						borderRadius: 3,
						marginBottom: Platform.OS === 'android' ? -1.5 : 0,
					},
					tabBarActiveTintColor: colors.primary,
					tabBarInactiveTintColor: '#9F9F9F',
					tabBarStyle: {
						backgroundColor: colors.card,
						elevation: 0,
						shadowOffset: { width: 0, height: -2 },
						borderBottomWidth: 1,
						borderBottomColor: '#ccc',
					},
					tabBarLabelStyle: { fontWeight: 'bold', color: colors.text },
				}}
			>
				<TopTab.Screen name="Classes" component={ClassesListScreen} />
				<TopTab.Screen name="Test Builder" component={TestBuilderScreen} />
			</TopTab.Navigator>
		</View>
	);
}
