import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLocationToDB } from '../api/modules/location.ts';

export const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );

            if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;

            if (Platform.Version >= 29) {
                const backgroundGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
                );
                return backgroundGranted === PermissionsAndroid.RESULTS.GRANTED;
            }

            return true;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    return true;
};


export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                // console.error('Error getting location:', error.message);
                resolve(null);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    });
};


export const captureAndSaveLocation = async (userId: string) => {
    const permissionGranted = await requestLocationPermission();
    if (!permissionGranted) return;
    
    const location = await getCurrentLocation();
    if (location) {
        try {
            await AsyncStorage.setItem('location', JSON.stringify(location));
            await saveLocationToDB({
                user_id: userId,
                latitude: location.latitude,
                longitude: location.longitude,
            });
            // console.log('Location saved to DB:', location);
        } catch (err) {
            // console.error('Error saving location to DB:', err);
        }
    } else {
        // console.warn('Location not available');
    }
};