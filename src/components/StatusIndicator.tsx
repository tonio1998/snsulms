import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const StatusIndicator = () => {
	const [isOnline, setIsOnline] = useState(true);
	const [isSlow, setIsSlow] = useState(false);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state) => {
			setIsOnline(state.isConnected);
			let slow = false;
			if (!state.isConnected) {
				slow = false;
			} else if (state.type === 'wifi') {
				const downlink = state.details?.downlink;
				if (typeof downlink === 'number' && downlink > 0) {
					slow = downlink < 0.3;
				} else {
					slow = false; // Treat unknown downlink as not slow
				}
			} else if (state.type === 'cellular') {
				const gen = state.details?.cellularGeneration;
				slow = gen === '2g' || gen === '3g';
			}

			setIsSlow(slow);
		});

		return () => unsubscribe();
	}, []);

	return (
		<>
			{!isOnline && (
				<View style={styles.statusContainer}>
					<Text style={[styles.statusText, styles.offlineText]}>
						No Internet connection...
					</Text>
				</View>
			)}
			{isOnline && isSlow && (
				<View style={styles.statusContainer}>
					<Text style={[styles.statusText, styles.offlineText]}>
						Internet is too slow... reconnecting
					</Text>
				</View>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	statusContainer: {
		position: 'absolute',
		top: '0%',
		left: 0,
		right: 0,
		padding: 13,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		zIndex: 999,
	},
	statusText: {
		fontSize: 11,
		textAlign: 'center',
		fontWeight: 'bold',
	},
	offlineText: {
		color: 'red',
	},
});

export default StatusIndicator;
