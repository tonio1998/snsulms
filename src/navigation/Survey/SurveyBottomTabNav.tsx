import React from 'react';
import { Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { CText } from '../../components/common/CText.tsx';
import HomeScreen from "../../Shared/HomeScreen.tsx";
import Icon from "react-native-vector-icons/Ionicons";
import {theme} from "../../theme";
import {useAuth} from "../../context/AuthContext.tsx";
import {useAccess} from "../../hooks/useAccess.ts";
import InfoScreen from "../../Shared/Survey/InfoScreen.tsx";
import QuestionsScreen from "../../Shared/Survey/QuestionsScreen.tsx";
const Tab = createMaterialTopTabNavigator();

const currentColors = theme.colors.light;

export default function SurveyBottomTabNav({ route }) {
	const { hasRole } = useAccess();
	const { user } = useAuth();
	const SurveyID = route.params.id;

	return (
		<Tab.Navigator
			initialRouteName="Info"
			tabBarPosition="bottom"
			screenOptions={({ route }) => ({
				swipeEnabled: false,
				tabBarShowIcon: true,
				tabBarPressColor: currentColors.primary,
				tabBarIndicatorStyle: {
					backgroundColor: theme.colors.light.primary,
				},
				tabBarIcon: ({ focused, color }) => {
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
						default:
							iconName = 'ellipse-outline'; // fallback
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

				tabBarActiveTintColor: currentColors.primary,
				tabBarInactiveTintColor: '#9F9F9F',

				tabBarStyle: {
					backgroundColor: currentColors.card,
					height: 65,
					paddingBottom: 10,
					paddingTop: 4,
					elevation: 4,
					shadowColor: '#000',
					shadowOpacity: 0.1,
					shadowRadius: 10,
					shadowOffset: { width: 0, height: -2 },
					borderTopColor: '#ccc',
				},
			})}
		>
			<Tab.Screen name="Info" component={InfoScreen} initialParams={{ SurveyID: SurveyID}}/>
			<Tab.Screen name="Questions" component={QuestionsScreen} initialParams={{ SurveyID: SurveyID}}/>
			<Tab.Screen name="Responses" component={HomeScreen} initialParams={{ SurveyID: SurveyID}}/>
		</Tab.Navigator>
	);
}