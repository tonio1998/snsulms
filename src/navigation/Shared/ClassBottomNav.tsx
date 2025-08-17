import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
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
import OutlineListScreen from "../../screens/Faculty/Classes/Outline/OutlineListScreen.tsx";
import { Platform, StatusBar, View } from "react-native";
import StudentMaterialScreen from "../../screens/Student/Classes/MaterialScreen.tsx";

const BottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const TopTab = createMaterialTopTabNavigator();

export default function ClassBottomNav({ route }) {
	const ClassID = route.params.ClassID;
	return (
		<ClassProvider ClassID={ClassID}>
			<InnerTabs ClassID={ClassID} />
		</ClassProvider>
	);
}

function ClassTopTabs({ route }) {
	const { ClassID } = route.params;
	const { hasRole } = useAccess();
	const { classes } = useClass();

	return (
		<>
			{/*<StatusBar*/}
			{/*	barStyle="light-content"*/}
			{/*	translucent={true}*/}
			{/*/>*/}
			<View style={{ flex: 1 }}>
				<View
					style={{
						paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 44,
						paddingBottom: 12,
						backgroundColor: theme.colors.light.primary,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<CText style={{ fontSize: 16, fontWeight: "bold", color: "#fff", width: "80%", textAlign: 'center' }} numberOfLines={1}>
						{classes?.CourseCode || "Class"} - {classes?.CourseName || "Class"}
					</CText>
				</View>
				<TopTab.Navigator
					screenOptions={({ route }) => ({
						tabBarLabel: ({ focused, color }) => (
							<CText
								numberOfLines={1}
								style={{
									color: focused ? color : '#9F9F9F',
									fontWeight: focused ? 'bold' : 'normal',
									fontSize: 10,
									textAlign: 'center',
								}}
							>
								{route.name}
							</CText>
						),
						tabBarIndicatorStyle: {
							backgroundColor: theme.colors.light.primary,
							height: 4,
							borderRadius: 3,
							marginBottom: Platform.OS === 'android' ? -3 : 0
						},
						tabBarActiveTintColor: theme.colors.light.primary,
						tabBarInactiveTintColor: '#9F9F9F',
						tabBarStyle: {
							backgroundColor: theme.colors.light.card,
							elevation: 0,
							shadowOffset: { width: 0, height: -2 },
							borderBottomWidth: 1,
							borderBottomColor: '#ccc',
							// height:55,
							// padding: 0
							// padding: 1
						},
						tabBarIcon: ({ focused, color }) => {
							let iconName = "ellipse-outline";
							switch (route.name) {
								case "Activities": iconName = focused ? "reader" : "reader-outline"; break;
								case "Materials": iconName = focused ? "book" : "book-outline"; break;
								case "Schedule": iconName = focused ? "calendar" : "calendar-outline"; break;
								case "Scan": iconName = focused ? "scan" : "scan-outline"; break;
								case "Outline": iconName = focused ? "list" : "list-outline"; break;
								case "Settings": iconName = focused ? "settings" : "settings-outline"; break;
								default: iconName = "ellipse-outline";
							}
							return <Icon name={iconName} size={18} color={color} />;
						},
					})}
				>
					<TopTab.Screen
						name="Activities"
						component={hasRole("STUD") ? ActivityScreen : ActivityScreenFac}
						initialParams={{ ClassID }}
					/>
					{hasRole("STUD") && (
						<TopTab.Screen
							name="Materials"
							component={StudentMaterialScreen}
							initialParams={{ ClassID }}
						/>
					)}
					{hasRole("ACAD") && (
						<TopTab.Screen
							name="Materials"
							component={MaterialScreenFac}
							initialParams={{ ClassID }}
						/>
					)}
					{hasRole("ACAD") && (
						<>
							{classes?.Attendance === "Y" && (
								<TopTab.Screen
									name="Scan"
									component={ScanScreen}
									initialParams={{ ClassID }}
								/>
							)}
							<TopTab.Screen
								name="Outline"
								component={OutlineListScreen}
								initialParams={{ ClassID }}
							/>
							<TopTab.Screen
								name="Settings"
								component={ClassSettingsScreen}
								initialParams={{ ClassID }}
							/>
						</>
					)}
					<TopTab.Screen
						name="Schedule"
						component={ClassScheduleScreen}
						initialParams={{ ClassID }}
					/>
				</TopTab.Navigator>
			</View>
		</>
	);
}

function WallStackScreen({ route }) {
	const { ClassID } = route.params;
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="Wall"
				component={WallScreen}
				initialParams={{ ClassID }}
			/>
		</Stack.Navigator>
	);
}

function InnerTabs({ ClassID }) {
	return (
		<BottomTab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color }) => {
					let iconName = 'ellipse-outline';
					switch (route.name) {
						case 'Wall': iconName = focused ? 'notifications' : 'notifications-outline'; break;
						case 'Class': iconName = focused ? 'reader' : 'reader-outline'; break;
						case 'People': iconName = focused ? 'people' : 'people-outline'; break;
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
			<BottomTab.Screen name="Wall" component={WallStackScreen} initialParams={{ ClassID }} />
			<BottomTab.Screen name="Class" component={ClassTopTabs} initialParams={{ ClassID }} />
			<BottomTab.Screen name="People" component={PeopleScreen} initialParams={{ ClassID }} />
		</BottomTab.Navigator>
	);
}
