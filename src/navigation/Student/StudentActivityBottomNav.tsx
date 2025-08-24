import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dimensions, StatusBar, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useAccess} from "../../hooks/useAccess.ts";
import {theme} from "../../theme";
import { CText } from '../../components/common/CText.tsx';
import WallScreen from "../../Shared/Wall/WallScreen.tsx";
import ActivityScreen from "../../screens/Student/Classes/ActivityScreen.tsx";
import PostWallScreen from "../../Shared/Wall/PostWallScreen.tsx";
import WallCommentsScreen from "../../Shared/Wall/WallCommentScreen.tsx";
import PeopleScreen from "../../screens/Student/Classes/PeopleScreen.tsx";
import InstructionScreen from "../../screens/Student/Activities/Instruction/InstructionScreen.tsx";
import SubmissionScreen from "../../screens/Student/Activities/Submission/SubmissionScreen.tsx";
import {ActivityProvider} from "../../context/SharedActivityContext.tsx";
import ClassesScreen from "../../screens/Student/Classes/ClassesScreen.tsx";
import {useSafeAreaInsets} from "react-native-safe-area-context";
const Tab = createBottomTabNavigator();
const ClassesDetailsStack = createNativeStackNavigator();
const SubmissionStack = createNativeStackNavigator();
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

export default function StudentActivityBottomNav({route, navigation}) {
	const StudentActivityID = route.params.StudentActivityID;
	// console.log("route", route.params);
	const ClassID = route.params.ClassID;
	const ActivityID = route.params.ActivityID;
	const Type = route.params.ActivityTypeID;
	const isLandscape = useOrientation();
	const { hasRole, can } = useAccess();
	const insets = useSafeAreaInsets();

	return (
		<>
			<ActivityProvider StudentActivityID={StudentActivityID} ActivityID={ActivityID}>
				<Tab.Navigator
					screenOptions={({ route }) => ({
						tabBarIcon: ({ color, size, focused }) => {
							let iconName = 'ellipse-outline';
							switch (route.name) {
								case 'Instruction':
									iconName = focused ? 'reader' : 'reader-outline';
									break;
								case 'Submission':
									iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
									break;
								case 'Submissions':
									iconName = focused ? 'reader' : 'reader-outline';
									break;
								case 'Comments':
									iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
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
							paddingBottom: insets.bottom, // Adds padding for devices with 3-button nav
							height: 60 + insets.bottom,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: -2 },
							shadowOpacity: 0.1,
							shadowRadius: 10,
							borderColor: '#ccc',
							flexDirection: isLandscape ? 'row' : 'column',
						},
					})}
				>
					<Tab.Screen name="Instruction" component={InstructionScreen}/>
					<Tab.Screen name="Submission" component={SubmissionScreen}/>
				</Tab.Navigator>
			</ActivityProvider>
		</>
	);
}