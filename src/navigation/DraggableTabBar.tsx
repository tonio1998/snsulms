// components/DraggableTabBar.tsx
import React, { useRef } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Animated,
	PanResponder,
	StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function DraggableTabBar({ state, descriptors, navigation }) {
	const position = useRef(new Animated.ValueXY({ x: 10, y: 200 })).current;

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderMove: Animated.event(
				[null, { dx: position.x, dy: position.y }],
				{ useNativeDriver: false }
			),
			onPanResponderRelease: () => {},
		})
	).current;

	return (
		<Animated.View style={[styles.container, position.getLayout()]} {...panResponder.panHandlers}>
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
							? options.title
							: route.name;

				const isFocused = state.index === index;

				const iconName = {
					Home: 'home-outline',
					Jobs: 'briefcase-outline',
					Chat: 'chatbubble-outline',
					Application: 'document-outline',
					Profile: 'person-outline',
				}[route.name] || 'ellipse-outline';

				return (
					<TouchableOpacity
						key={route.key}
						accessibilityRole="button"
						onPress={() => navigation.navigate(route.name)}
						style={styles.tabButton}
					>
						<Icon
							name={isFocused ? iconName.replace('-outline', '') : iconName}
							size={22}
							color={isFocused ? '#004D1A' : '#888'}
						/>
						<Text style={[styles.label, isFocused && { color: '#004D1A' }]}>
							{label}
						</Text>
					</TouchableOpacity>
				);
			})}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 5,
		elevation: 10,
		zIndex: 99,
	},
	tabButton: {
		alignItems: 'center',
		marginVertical: 12,
	},
	label: {
		fontSize: 12,
		color: '#888',
		marginTop: 4,
		textAlign: 'center',
	},
});
