import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export default function useNetworkStatus() {
	const [netInfo, setNetInfo] = useState<NetInfoState | null>(null);
	
	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			setNetInfo(state);
		});
		
		// Initial fetch
		NetInfo.fetch().then(setNetInfo);
		
		return () => unsubscribe();
	}, []);
	
	return netInfo;
}
