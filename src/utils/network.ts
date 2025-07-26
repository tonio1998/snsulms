import NetInfo from '@react-native-community/netinfo';

export const isNetworkAvailable = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
};
