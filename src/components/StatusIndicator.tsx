import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const StatusIndicator = () => {
	const [isOnline, setIsOnline] = useState(true);
	const [connectionType, setConnectionType] = useState(null);
	const [isInternetReachable, setIsInternetReachable] = useState(true);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			setIsOnline(state.isConnected);
			setConnectionType(state.type);
			setIsInternetReachable(state.isInternetReachable ?? true);
		});

		return () => unsubscribe();
	}, []);

	if (!isOnline || !isInternetReachable) {
		return (
			<View style={styles.statusContainer}>
				<Text style={[styles.statusText, styles.offlineText]}>
					No Internet connection...
				</Text>
			</View>
		);
	}

	if (connectionType === 'cellular') {
		// You can optionally warn if cellular, maybe consider this as "slow"
		return (
			<View style={styles.statusContainer}>
				<Text style={[styles.statusText, styles.slowText]}>
					Cellular connection detected, speed may vary...
				</Text>
			</View>
		);
	}

	return null; // no warning when online and on wifi
};

const styles = StyleSheet.create({
	statusContainer: {
		position: 'absolute',
		top: '5%',
		left: 0,
		right: 0,
		padding: 5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		zIndex: 999,
	},
	statusText: {
		fontSize: 12,
		textAlign: 'center',
		fontWeight: 'bold',
	},
	offlineText: {
		color: 'red',
	},
	slowText: {
		color: 'orange',
	},
});

export default StatusIndicator;
