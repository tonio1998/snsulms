import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dimensions, StatusBar, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import StudentScreen from '../screens/Students/StudentScreen.tsx';
import { theme } from '../theme';
import { globalStyles } from '../theme/styles.ts';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext.tsx';
import { useAccess } from '../hooks/useAccess.ts';
import { CText } from '../components/CText.tsx';
import UsersScreen from '../screens/user/UsersScreen.tsx';
import ClassesScreen from '../screens/Classes/ClassesScreen.tsx';

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

export default function ClassBottomNav() {
	const isLandscape = useOrientation();
	const { hasRole, can } = useAccess();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color, size, focused }) => {
					let iconName = 'ellipse-outline';
					switch (route.name) {
						case 'Home':
							iconName = focused ? 'home' : 'home-outline';
							break;
						case 'Activities':
							iconName = focused ? 'school' : 'school-outline';
							break;
						case 'Classes':
							iconName = focused ? 'people' : 'people-outline';
							break;
						case 'Settings':
							iconName = focused ? 'settings' : 'settings-outline';
							break;
						default:
							break;
					}
					return <Icon name={iconName} size={20} color={color} />;
				},
				tabBarLabel: ({ color, focused }) => (
					<View style={{ maxWidth: 80, alignItems: 'center' }}>
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
					</View>
				),
				tabBarLabelPosition: isLandscape ? 'beside-icon' : 'below-icon',
				tabBarActiveTintColor: currentColors.primary,
				tabBarInactiveTintColor: currentColors.primary,
				headerShown: false,
				tabBarStyle: {
					backgroundColor: currentColors.card,
					height: isLandscape ? 55 : 65,
					paddingTop: 4,
					paddingBottom: isLandscape ? 4 : 10,
					// margin: 20,
					// borderRadius: 20,
					// position: 'absolute',
					// elevation: 10,
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
		</Tab.Navigator>
	);
}

function ClassesStackScreen() {
	return (
		<>
			<StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
			<ClassesStack.Navigator screenOptions={{ headerShown: false }}>
				<ClassesStack.Screen name="Classes" component={ClassesScreen} />
			</ClassesStack.Navigator>
		</>
	);
}