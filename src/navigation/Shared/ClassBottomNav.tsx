import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAccess } from "../../hooks/useAccess.ts";
import { theme } from "../../theme";
import { CText } from '../../components/common/CText.tsx';
import WallScreen from "../../Shared/Wall/WallScreen.tsx";
import ActivityScreen from "../../screens/Student/Classes/ActivityScreen.tsx";
import MaterialScreen from "../../screens/Student/Classes/MaterialScreen.tsx";
import ActivityScreenFac from "../../screens/Faculty/Classes/ClassDetails/ActivityScreen.tsx";
import PeopleScreenFac from "../../screens/Faculty/Classes/ClassDetails/PeopleScreen.tsx";
import MaterialScreenFac from "../../screens/Faculty/Classes/ClassDetails/MaterialScreen.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import ClassSettingsScreen from "../../screens/Faculty/Classes/ClassDetails/ClassSettingsScreen.tsx";
import { ClassProvider, useClass } from "../../context/SharedClassContext.tsx";
import PeopleScreen from "../../screens/Faculty/Classes/ClassDetails/PeopleScreen.tsx";
import ScanScreen from "../../Shared/Scanner/ScanScreen.tsx";

const Tab = createMaterialTopTabNavigator();
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

export default function ClassBottomNav({ route }) {
	const ClassID = route.params.ClassID;
	const isLandscape = useOrientation();
	const { hasRole } = useAccess();

	return (
		<ClassProvider ClassID={ClassID}>
			<InnerTabs ClassID={ClassID} isLandscape={isLandscape} hasRole={hasRole} />
		</ClassProvider>
	);
}

function InnerTabs({ ClassID, isLandscape, hasRole }) {
	const { classes } = useClass();

	return (
		<Tab.Navigator
			tabBarPosition="bottom"
			swipeEnabled={true}
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color }) => {
					let iconName = 'ellipse-outline';
					switch (route.name) {
						case 'Wall':
							iconName = focused ? 'home' : 'home-outline';
							break;
						case 'Activities':
							iconName = focused ? 'reader' : 'reader-outline';
							break;
						case 'Materials':
							iconName = focused ? 'book' : 'book-outline';
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
						case 'Settings':
							iconName = focused ? 'settings' : 'settings-outline';
							break;
						case 'Scan':
							iconName = focused ? 'scan' : 'scan-outline';
							break;
						default:
							iconName = 'ellipse';
					}
					return <Icon name={iconName} size={20} color={color} />;
				},
				tabBarLabel: ({ focused, color }) => (
					<CText
						numberOfLines={1}
						style={{
							color: focused ? color : '#9F9F9F',
							fontWeight: focused ? 'bold' : 'normal',
							fontSize: 12,
							textAlign: 'center',
						}}
					>
						{route.name}
					</CText>
				),
				tabBarLabelPosition: isLandscape ? 'beside-icon' : 'below-icon',
				tabBarActiveTintColor: theme.colors.light.primary,
				tabBarInactiveTintColor: '#9F9F9F',
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
				tabBarIndicatorStyle: {
					backgroundColor: theme.colors.light.primary,
				},
				headerShown: false,
			})}
		>
			<Tab.Screen
				name="Wall"
				component={WallStackScreen}
				initialParams={{ ClassID }}
			/>

			{hasRole('STUD') && (
				<>
					<Tab.Screen name="Activities" component={ActivityScreen} initialParams={{ ClassID }} />
					<Tab.Screen name="Materials" component={MaterialScreen} initialParams={{ ClassID }} />
				</>
			)}

			{hasRole('ACAD') && (
				<>
					<Tab.Screen name="Activities" component={ActivityScreenFac} initialParams={{ ClassID }} />
					{classes?.Attendance === 'Y' && (
						<Tab.Screen name="Scan" component={ScanScreen} initialParams={{ ClassID }} />
					)}
				</>
			)}

			<Tab.Screen name="People" component={PeopleScreen} initialParams={{ ClassID }} />

			{hasRole('ACAD') && (
				<Tab.Screen name="Settings" component={ClassSettingsScreen} initialParams={{ ClassID }} />
			)}
		</Tab.Navigator>
	);
}

function WallStackScreen({ route }) {
	const { ClassID } = route.params;

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
