import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert, Linking, LogBox, StatusBar, Text, TouchableOpacity, Vibration } from 'react-native';

import { theme } from './src/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext.tsx';
import { LoadingProvider } from './src/context/LoadingContext.tsx';
import { CAlert } from './src/components/CAlert.tsx';
import LoginOptionsScreen from "./src/screens/Auth/LoginOptionsScreen.tsx";
import { firebase } from '@react-native-firebase/auth';
import messaging, {
    getInitialNotification,
    getMessaging, onMessage,
    onNotificationOpenedApp
} from '@react-native-firebase/messaging';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetworkProvider from './src/context/NetworkContext.tsx';
import StatusIndicator from './src/components/StatusIndicator.tsx';
import BottomTabNav from './src/navigation/BottomTabNav.tsx';
import notificationEmitter from './src/utils/notificationEmitter.ts';
import { handleNotificationNavigation } from './src/utils/handleNotificationNavigation.ts';
import Toast from 'react-native-toast-message';
import { navigationRef } from './src/utils/navigation.ts';
import { tryFlushPendingNavigation } from './src/hooks/RootNavigation.ts';
import { getApp } from '@react-native-firebase/app';
import { AccessProvider } from './src/context/AccessContext.tsx';
import NFCRegisterVerification from './src/screens/Students/NFCRegisterVerification.tsx';
import { CText } from './src/components/CText.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import ProfileScreen from './src/screens/user/ProfileScreen.tsx';
import Sidebar from './src/components/Sidebar.tsx';
import SigninForm from './src/screens/Auth/SigninForm.tsx';
import SignupForm from './src/screens/Auth/SignupForm.tsx';
import SplashScreen from './src/screens/SplashScreen.tsx';
import NetInfo from '@react-native-community/netinfo';
import { triggerAllSyncs } from './src/utils/sqlite/syncManager';
import AcademicYearScreen from "./src/screens/AcademicYearScreen.tsx";
import ClassBottomNav from "./src/navigation/class/ClassBottomNav.tsx";
import WallCommentsScreen from "./src/screens/Classes/Details/WallCommentScreen.tsx";
const Stack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
LogBox.ignoreLogs([
    'Text strings must be rendered within a <Text> component',
]);

function UnauthenticatedStack() {
    return (
        <>
            <StatusBar
                backgroundColor="translucent"
                barStyle="dark-content"/>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="LoginOptions" component={LoginOptionsScreen}/>
                <Stack.Screen name="Login" component={SigninForm}/>
                <Stack.Screen name="Register" component={SignupForm}/>
            </Stack.Navigator></>
    );
}

enableScreens();

function AppNavigator() {
    const { user, loginAuth } = useAuth();
    const [splashScreen, setSplashScreen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState('MainTabs');

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                triggerAllSyncs();
            }
        });

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        const app = getApp();
        const messaging = getMessaging(app);

        const unsubscribe = onMessage(messaging, async remoteMessage => {
            Toast.show({
                type: 'success',
                text1: remoteMessage.notification?.title || 'New Message',
                text2: remoteMessage.notification?.body || '',
                position: 'top',
                autoHide: true,
                visibilityTime: 4000,
                topOffset: 50,
            });
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const app = getApp();
        const messaging = getMessaging(app);
        let appOpened = false;

        const unsubscribeNotificationOpened = onNotificationOpenedApp(messaging, remoteMessage => {
            if (remoteMessage?.data) {
                console.log('[Notification Opened from unsubscribeNotificationOpened]', remoteMessage.data);
                Vibration.vibrate([500, 1000, 500, 1000]);
                notificationEmitter.emit('newMessage', remoteMessage.data);
                handleNotificationNavigation(remoteMessage.data);
            }
        });

        getInitialNotification(messaging).then(remoteMessage => {
            if (remoteMessage?.data && !appOpened) {
                console.log('[Notification Opened from getInitialNotification]', remoteMessage.data);
                const interval = setInterval(() => {
                    if (navigationRef.isReady()) {
                        notificationEmitter.emit('newMessage', remoteMessage.data);
                        handleNotificationNavigation(remoteMessage.data);
                        appOpened = true;
                        clearInterval(interval);
                    }
                }, 200);
            }
        });

        const unsubscribeForeground = onMessage(messaging, async remoteMessage => {
            if (remoteMessage?.data) {
                console.log('[Notification Opened from unsubscribeForeground]', remoteMessage.data);

                notificationEmitter.emit('newMessage', remoteMessage.data);
            }
        });

        return () => {
            unsubscribeNotificationOpened();
            unsubscribeForeground();
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSplashScreen(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (splashScreen) {
        return <SplashScreen />;
    }


    if(!user){
        return (
            <NavigationContainer>
                <UnauthenticatedStack />
            </NavigationContainer>
        )
    }else{
        return (
            <>
                <SafeAreaProvider>
                    <StatusBar backgroundColor={theme.colors.light.primary} barStyle="light-content" />
                    <AccessProvider>
                        <NavigationContainer
                            ref={navigationRef}
                            onReady={() => {
                                tryFlushPendingNavigation();
                            }}
                        >
                                <Stack.Navigator screenOptions={{ headerShown: false }}>
                                    <Stack.Screen name="MainTabs" component={BottomTabNav} />
                                    <Stack.Screen name="ClassDetails" component={ClassBottomNav} options={{
                                        headerShown: true,
                                        headerStyle:{
                                            backgroundColor: theme.colors.light.primary,
                                        },
                                        headerTitleStyle:{
                                            color: '#fff'
                                        },
                                        headerTintColor: '#fff',
                                        title: 's',
                                    }} />
                                    <Stack.Screen
                                        name="WallComments"
                                        component={WallCommentsScreen}
                                        options={{
                                            headerShown: true,
                                            headerStyle:{
                                                backgroundColor: theme.colors.light.primary,
                                            },
                                            headerTitleStyle:{
                                                color: '#fff'
                                            },
                                            headerTintColor: '#fff',
                                            title: 's',
                                        }}
                                    />
                                    <Stack.Screen name="Profile" component={ProfileScreen} />
                                    <Stack.Screen name="AcademicYear" component={AcademicYearScreen} />
                                </Stack.Navigator>
                        </NavigationContainer>
                    </AccessProvider>
                </SafeAreaProvider>
            </>
        );
    }
}

function App(): React.JSX.Element {
    return (
        <LoadingProvider>
            <CAlert>
                <LoadingProvider>
                    <NetworkProvider>
                        <AuthProvider>
                            <AppNavigator />
                        </AuthProvider>
                        <StatusIndicator />
                    </NetworkProvider>
                </LoadingProvider>
            </CAlert>
        </LoadingProvider>
    );
}

export default App;
