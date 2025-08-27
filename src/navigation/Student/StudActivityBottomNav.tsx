import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../theme';
import { CText } from '../../components/common/CText.tsx';

import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StudActivityProvider} from "../../context/StudSharedActivityContext.tsx";
import InstructionScreen from "../../screens/Student/Activities/Instruction/InstructionScreen.tsx";
import SubmissionScreen from "../../screens/Student/Activities/Submission/SubmissionScreen.tsx";

const Tab = createMaterialTopTabNavigator();

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

export default function StudActivityBottomNav({ route }) {
	const ActivityID = route.params.ActivityID;
	const isLandscape = useOrientation();
	const insets = useSafeAreaInsets();

	return (
		<StudActivityProvider ActivityID={ActivityID}>
			<Tab.Navigator
				tabBarPosition="bottom"
				swipeEnabled={true}
				screenOptions={({ route }) => ({
					tabBarIcon: ({ focused, color }) => {
						let iconName = 'ellipse-outline';
						switch (route.name) {
							case 'Instruction':
								iconName = focused ? 'reader' : 'reader-outline';
								break;
							case 'Submissions':
								iconName = focused ? 'reader' : 'reader-outline';
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
					tabBarActiveTintColor: theme.colors.light.primary,
					tabBarInactiveTintColor: '#9F9F9F',
					tabBarIndicatorStyle: {
						backgroundColor: theme.colors.light.primary,
						top: -2,
						padding: 1,
						borderRadius: 10,
						// height: 2
					},
					tabBarStyle: {
						backgroundColor: theme.colors.light.card,
						paddingTop: 4,
						paddingBottom: insets.bottom,
						height: 60 + insets.bottom,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: -2 },
						shadowOpacity: 0.1,
						shadowRadius: 10,
						borderColor: '#ccc',
						flexDirection: isLandscape ? 'row' : 'column',
					},
					tabBarLabelPosition: isLandscape ? 'beside-icon' : 'below-icon',
					headerShown: false,
				})}
			>
				<Tab.Screen name="Instruction" component={InstructionScreen} />
				<Tab.Screen name="Submissions" component={SubmissionScreen} />
			</Tab.Navigator>
		</StudActivityProvider>
	);
}
