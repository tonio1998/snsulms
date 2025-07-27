import React, { createContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextProps {
	isOnline: boolean;
}

export const NetworkContext = createContext<NetworkContextProps | undefined>(undefined);

const NetworkProvider: React.FC = ({ children }) => {
	const [isOnline, setIsOnline] = useState<boolean>(true);
	
	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			setIsOnline(state.isConnected ?? state.isInternetReachable ?? true);
			// setIsOnline(false);
		});

		return () => unsubscribe();
	}, []);

	// useEffect(() => {
	// 	setIsOnline(false);
	//
	// 	return () => unsubscribe();
	// }, []);

	return (
		<NetworkContext.Provider value={{ isOnline }}>
			{children}
		</NetworkContext.Provider>
	);
};

export default NetworkProvider;
