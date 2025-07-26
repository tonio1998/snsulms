import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';

export default function FastSpinner({ size = 40, color = '#007AFF', speed = 500 }) {
	const spinValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.timing(spinValue, {
				toValue: 1,
				duration: speed,
				easing: Easing.linear,
				useNativeDriver: true,
			})
		).start();
	}, [spinValue, speed]);

	const spin = spinValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg'],
	});

	const circleSize = size / 2;
	const borderWidth = size / 10;

	return (
		<Animated.View style={[{ width: size, height: size, transform: [{ rotate: spin }], justifyContent: 'center', alignItems: 'center' }]}>
			<View
				style={{
					width: circleSize,
					height: circleSize,
					borderWidth,
					borderColor: color,
					borderTopColor: 'transparent',
					borderRadius: circleSize / 2,
				}}
			/>
		</Animated.View>
	);
}
