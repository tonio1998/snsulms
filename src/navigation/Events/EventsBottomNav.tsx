import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from "../../theme";
import { CText } from '../../components/common/CText.tsx';
import { ClassProvider } from "../../context/SharedClassContext.tsx";
import { useAccess } from "../../hooks/useAccess.ts";
import { useClass } from "../../context/SharedClassContext.tsx";
import WallScreen from "../../Shared/Wall/WallScreen.tsx";
import ScanScreen from "../../Shared/Scanner/ScanScreen.tsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AttendanceDetails from "../../Shared/Attendance/AttendanceDetails.tsx";

const BottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function EventsBottomNav({ route }) {
	const AttendanceID = route.params.AttendanceID;
	return (
		<ClassProvider AttendanceID={AttendanceID}>
			<InnerTabs AttendanceID={AttendanceID} />
		</ClassProvider>
	);
}

function InformationStack({ route }) {
	const { AttendanceID } = route.params;
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="InformationHome"
				component={AttendanceDetails}
				initialParams={{ AttendanceID }}
			/>
		</Stack.Navigator>
	);
}

function InnerTabs({ AttendanceID }) {
	const insets = useSafeAreaInsets();
	const { hasRole } = useAccess();

	return (
		<BottomTab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color }) => {
					let iconName = 'ellipse-outline';
					switch (route.name) {
						case 'Information': iconName = focused ? 'information-circle' : 'information-circle-outline'; break;
						case 'Activities': iconName = focused ? 'reader' : 'reader-outline'; break;
						case 'Materials': iconName = focused ? 'book' : 'book-outline'; break;
						default: iconName = 'ellipse'; break;
					}
					return <Icon name={iconName} size={22} color={color} />;
				},
				tabBarLabel: ({ focused, color }) => (
					<CText
						numberOfLines={1}
						style={{
							color: focused ? color : '#9F9F9F',
							fontWeight: focused ? 'bold' : 'normal',
							fontSize: 11,
							textAlign: 'center',
							marginTop: 3,
						}}
					>
						{route.name}
					</CText>
				),
				tabBarActiveTintColor: theme.colors.light.primary,
				tabBarInactiveTintColor: '#9F9F9F',
				tabBarStyle: {
					backgroundColor: theme.colors.light.card,
					paddingBottom: insets.bottom,
					height: 60 + insets.bottom,
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
			<BottomTab.Screen
				name="Information"
				component={InformationStack}
				initialParams={{ AttendanceID }}
			/>
			<BottomTab.Screen
				name="Scanner"
				component={ScanScreen}
				initialParams={{ AttendanceID }}
			/>
		</BottomTab.Navigator>
	);
}
