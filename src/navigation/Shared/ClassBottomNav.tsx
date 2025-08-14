import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { theme } from "../../theme";
import { CText } from '../../components/common/CText.tsx';
import { useAccess } from "../../hooks/useAccess.ts";
import { useClass, ClassProvider } from "../../context/SharedClassContext.tsx";

import WallScreen from "../../Shared/Wall/WallScreen.tsx";
import ActivityScreen from "../../screens/Student/Classes/ActivityScreen.tsx";
import MaterialScreen from "../../screens/Student/Classes/MaterialScreen.tsx";
import ActivityScreenFac from "../../screens/Faculty/Classes/ClassDetails/ActivityScreen.tsx";
import PeopleScreen from "../../screens/Faculty/Classes/ClassDetails/PeopleScreen.tsx";
import MaterialScreenFac from "../../screens/Faculty/Classes/ClassDetails/MaterialScreen.tsx";
import ClassSettingsScreen from "../../screens/Faculty/Classes/ClassDetails/ClassSettingsScreen.tsx";
import ScanScreen from "../../Shared/Scanner/ScanScreen.tsx";
import ClassScheduleScreen from "../../Shared/Schedule/ClassScheduleScreen.tsx";

const Tab = createBottomTabNavigator();
const ClassesDetailsStack = createNativeStackNavigator();

export default function ClassBottomNav({ route }) {
	const ClassID = route.params.ClassID;

	return (
		<ClassProvider ClassID={ClassID}>
			<InnerTabs ClassID={ClassID} />
		</ClassProvider>
	);
}

function InnerTabs({ ClassID }) {
	const { hasRole } = useAccess();
	const { classes } = useClass();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					let iconName = 'ellipse-outline';
					switch (route.name) {
						case 'Wall': iconName = focused ? 'home' : 'home-outline'; break;
						case 'Activities': iconName = focused ? 'reader' : 'reader-outline'; break;
						case 'Materials': iconName = focused ? 'book' : 'book-outline'; break;
						case 'People': iconName = focused ? 'people' : 'people-outline'; break;
						case 'Scan': iconName = focused ? 'scan' : 'scan-outline'; break;
						case 'Settings': iconName = focused ? 'settings' : 'settings-outline'; break;
						case 'Schedule': iconName = focused ? 'calendar' : 'calendar-outline'; break;
						default: iconName = 'ellipse'; break;
					}
					return (
						<Icon
							name={iconName}
							size={25}
							color={color}
							style={{ marginBottom: -3 }}
						/>
					);
				},
				tabBarLabel: ({ focused, color }) => (
					<CText
						numberOfLines={1}
						style={{
							color: focused ? color : '#9F9F9F',
							fontWeight: focused ? 'bold' : 'normal',
							fontSize: 10,
							textAlign: 'center',
							marginTop: 3,
						}}
					>
						{route.name}
					</CText>
				),
				// tabBarShowLabel: false,
				tabBarActiveTintColor: theme.colors.light.primary,
				tabBarInactiveTintColor: '#9F9F9F',
				tabBarStyle: {
					backgroundColor: theme.colors.light.card,
					height: 65,
					borderTopWidth: 1,
					borderTopColor: '#ccc',
					elevation: 4,
					shadowColor: '#000',
					shadowOpacity: 0.1,
					shadowRadius: 10,
					shadowOffset: { width: 0, height: -2 },
					paddingTop: 4,
				},
				headerShown: false,

			})}
		>
			<Tab.Screen name="Wall" component={WallStackScreen} initialParams={{ ClassID }} />
			<Tab.Screen name="Schedule" component={ClassScheduleScreen} initialParams={{ ClassID }} />

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
