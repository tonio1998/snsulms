import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dimensions, StatusBar, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useAccess} from "../../hooks/useAccess.ts";
import {theme} from "../../theme";
import { CText } from '../../components/CText.tsx';
import WallScreen from "../../screens/Classes/Details/WallScreen.tsx";
import ActivityScreen from "../../screens/Classes/Details/ActivityScreen.tsx";
import PostWallScreen from "../../screens/Classes/Details/PostWallScreen.tsx";
import WallCommentsScreen from "../../screens/Classes/Details/WallCommentScreen.tsx";
import PeopleScreen from "../../screens/Classes/Details/PeopleScreen.tsx";
const Tab = createBottomTabNavigator();
const ClassesDetailsStack = createNativeStackNavigator();

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

export default function ClassBottomNav({route, navigation}) {
	const ClassID = route.params.ClassID;

	navigation.setOptions({
		headerTitle: route.params.Title,
		headerTitleStyle: {
			fontSize: 16,
			color: '#fff',
			fontWeight: 'bold',
		},
	});

	const isLandscape = useOrientation();
	const { hasRole, can } = useAccess();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color, size, focused }) => {
					let iconName = 'ellipse-outline';
					switch (route.name) {
						case 'Wall':
							iconName = focused ? 'home' : 'home-outline';
							break;
						case 'Activities':
							iconName = focused ? 'list' : 'list-outline';
							break;
						case 'People':
							iconName = focused ? 'people' : 'people-outline';
							break;
						case 'Progress':
							iconName = focused ? 'bar-chart' : 'bar-chart-outline';
							break;
						case 'Calendar':
							iconName = focused ? 'calendar' : 'calendar-outline';
							break;
						default:
							iconName = 'ellipse';
					}
					return <Icon name={iconName} size={20} color={focused ? theme.colors.light.primary : '#9F9F9F'} />;
				},
				tabBarLabel: ({ color, focused }) => (
					focused ? <CText
						numberOfLines={1}
						style={{
							color,
							fontWeight: 'bold',
							fontSize: 12,
							textAlign: 'center',
						}}
					>
						{route.name}
					</CText> : <CText
						numberOfLines={1}
						style={{
							color: '#9F9F9F',
							fontWeight: 'normal',
							fontSize: 12,
							textAlign: 'center',
						}}
					>
						{route.name}
					</CText>
				),
				tabBarLabelPosition: isLandscape ? 'beside-icon' : 'below-icon',
				tabBarActiveTintColor: theme.colors.light.primary,
				tabBarInactiveTintColor: theme.colors.light.primary,
				headerShown: false,
				tabBarStyle: {
					backgroundColor: theme.colors.light.card,
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
			<Tab.Screen name="Wall" component={WallStackScreen} initialParams={{ ClassID }}/>
			<Tab.Screen name="Activities" component={ActivityScreen} initialParams={{ ClassID }}/>
			<Tab.Screen name="People" component={PeopleScreen} initialParams={{ ClassID }}/>
			<Tab.Screen name="Progress" component={WallScreen} initialParams={{ ClassID }}/>
			<Tab.Screen name="Calendar" component={WallScreen} initialParams={{ ClassID }}/>
		</Tab.Navigator>
	);
}

function WallStackScreen({ route }) {
	const { ClassID } = route.params;
	console.log("ClassID", ClassID)

	return (
		<ClassesDetailsStack.Navigator screenOptions={{ headerShown: false }}>
			<ClassesDetailsStack.Screen
				name="Wall"
				component={WallScreen}
				initialParams={{ ClassID }}
			/>
		</ClassesDetailsStack.Navigator>
	);
}
