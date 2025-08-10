import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const PING_URL = 'https://www.google.com/';

const StatusIndicator = () => {
	const [isOnline, setIsOnline] = useState(true);
	const [isSlow, setIsSlow] = useState(false);
	const intervalRef = useRef(null);

	const testLatency = async () => {
		const start = Date.now();
		try {
			await fetch(PING_URL, { method: 'HEAD' });
			const latency = Date.now() - start;
			return latency;
		} catch {
			return Infinity;
		}
	};

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state) => {
			setIsOnline(state.isConnected);
			if (!state.isConnected) {
				setIsSlow(false); // no internet = no slow warning
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			} else {
				if (!intervalRef.current) {
					// start latency check loop
					intervalRef.current = setInterval(async () => {
						const latency = await testLatency();
						setIsSlow(latency > 1000); // flag slow if ping > 1000 ms
					}, 10000); // every 10 seconds
				}
			}
		});

		return () => {
			unsubscribe();
			clearInterval(intervalRef.current);
		};
	}, []);

	if (!isOnline) {
		return (
			<View style={styles.statusContainer}>
				<Text style={[styles.statusText, styles.offlineText]}>
					No Internet connection...
				</Text>
			</View>
		);
	}

	if (isSlow) {
		return (
			<View style={styles.statusContainer}>
				<Text style={[styles.statusText, styles.slowText]}>
					Internet is too slow... reconnecting
				</Text>
			</View>
		);
	}

	return null;
};

const styles = StyleSheet.create({
	statusContainer: {
		position: 'absolute',
		top: '5%',
		left: 0,
		right: 0,
		padding: 3,
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
	slowText: {
		color: 'orange',
	},
});

export default StatusIndicator;
