import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CText } from '../../components/common/CText.tsx';
import HomeScreen from "../../Shared/HomeScreen.tsx";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../../theme";
import { useAuth } from "../../context/AuthContext.tsx";
import { useAccess } from "../../hooks/useAccess.ts";
import InfoScreen from "../../Shared/Survey/SurveyDetails/InfoScreen.tsx";
import QuestionsScreen from "../../Shared/Survey/SurveyDetails/QuestionsScreen.tsx";

const Tab = createBottomTabNavigator();

const currentColors = theme.colors.light;

export default function SurveyBottomTabNav({ route }) {
	const { hasRole } = useAccess();
	const { user } = useAuth();
	const SurveyID = route.params.id;

	return (
		<Tab.Navigator
			initialRouteName="Info"
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarShowLabel: true,
				tabBarActiveTintColor: currentColors.primary,
				tabBarInactiveTintColor: '#9F9F9F',
				tabBarStyle: {
					backgroundColor: currentColors.card,
					height: 65,
					paddingBottom: 6,
					paddingTop: 6,
					elevation: 4,
					shadowColor: '#000',
					shadowOpacity: 0.1,
					shadowRadius: 10,
					shadowOffset: { width: 0, height: -2 },
					borderTopColor: '#ccc',
				},
				tabBarIcon: ({ focused, color, size }) => {
					let iconName = 'ellipse-outline';
					switch (route.name) {
						case 'Info':
							iconName = focused ? 'information-circle' : 'information-circle-outline';
							break;
						case 'Questions':
							iconName = focused ? 'add-circle' : 'add-circle-outline';
							break;
						case 'Responses':
							iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
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
			<Tab.Screen name="Info" component={InfoScreen} initialParams={{ SurveyID: SurveyID }} />
			<Tab.Screen name="Questions" component={QuestionsScreen} initialParams={{ SurveyID: SurveyID }} />
			<Tab.Screen name="Responses" component={HomeScreen} initialParams={{ SurveyID: SurveyID }} />
		</Tab.Navigator>
	);
}
