import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import {StatusBar, Vibration, LogBox, AppState} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

import { theme } from './src/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext.tsx';
import { LoadingProvider } from './src/context/LoadingContext.tsx';
import { CAlert } from './src/components/CAlert.tsx';
import { AccessProvider } from './src/context/AccessContext.tsx';
import NetworkProvider from './src/context/NetworkContext.tsx';
import StatusIndicator from './src/components/StatusIndicator.tsx';

import LoginOptionsScreen from './src/Shared/Auth/LoginOptionsScreen.tsx';
import SigninForm from './src/Shared/Auth/SigninForm.tsx';
import SignupForm from './src/Shared/Auth/SignupForm.tsx';
import SplashScreen from './src/Shared/SplashScreen.tsx';

import BottomTabNav from './src/navigation/BottomTabNav.tsx';
import ClassBottomNav from './src/navigation/Shared/ClassBottomNav.tsx';
import StudentActivityBottomNav from './src/navigation/Student/StudentActivityBottomNav.tsx';
import FacultyActivityBottomNav from './src/navigation/Faculty/FacultyActivityBottomNav.tsx';

import JoinClassScreen from './src/screens/Student/Classes/JoinClassScreen.tsx';
import AddClassScreen from './src/screens/Faculty/Classes/AddClassScreen.tsx';
import SubmissionDetailsScreen from './src/screens/Faculty/Activities/Submission/SubmissionDetailScreen.tsx';
import WallCommentsScreen from './src/Shared/Wall/WallCommentScreen.tsx';
import PostWallScreen from './src/Shared/Wall/PostWallScreen.tsx';
import ProfileScreen from './src/Shared/User/ProfileScreen.tsx';
import AcademicYearScreen from './src/Shared/AcademicYearScreen.tsx';

import messaging, {
    getInitialNotification,
    getMessaging,
    onMessage,
    onNotificationOpenedApp,
} from '@react-native-firebase/messaging';

import { navigationRef } from './src/utils/navigation.ts';
import { tryFlushPendingNavigation } from './src/hooks/RootNavigation.ts';
import { triggerAllSyncs } from './src/utils/sqlite/syncManager';
import notificationEmitter from './src/utils/notificationEmitter.ts';
import { handleNotificationNavigation } from './src/utils/handleNotificationNavigation.ts';
import AddActivityScreen from "./src/screens/Faculty/Activities/AddActivityScreen.tsx";
import {syncAllTables} from "./src/services/syncService";
import {tableConfigs} from "./src/config/syncTables";
import CreateMeetingScreen from "./src/Shared/GMeet/CreateMeetingScreen.tsx";
import {Loading2Provider} from "./src/context/Loading2Context.tsx";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import SurveyBottomTabNav from "./src/navigation/Survey/SurveyBottomTabNav.tsx";
import AddQuestionScreen from "./src/Shared/Survey/AddQuestionScreen.tsx";
import QuizScreen from "./src/Shared/Survey/QuizScreen.tsx";
import QuizStartScreen from "./src/Shared/Survey/QuizStartScreen.tsx";
import ResponsePreviewScreen from "./src/Shared/Survey/ResponsePreviewScreen.tsx";
import QuizBuilderScreen from "./src/Shared/Survey/QuizBuilderScreen.tsx";

const Stack = createNativeStackNavigator();
LogBox.ignoreLogs(['Text strings must be rendered within a <Text> component']);

const UnauthenticatedStack = () => (
    <>
        <StatusBar backgroundColor="translucent" barStyle="dark-content" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LoginOptions" component={LoginOptionsScreen} />
            <Stack.Screen name="Login" component={SigninForm} />
            <Stack.Screen name="Register" component={SignupForm} />
        </Stack.Navigator>
    </>
);

const AppNavigator = () => {
    const { user } = useAuth();
    const [splashVisible, setSplashVisible] = useState(true);

    useEffect(() => {
        let syncInterval;
        const startSync = () => {
            syncAllTables(tableConfigs);
            syncInterval = setInterval(() => {
                syncAllTables(tableConfigs);
                // console.log('AppNavigatorssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss');
            }, 5 * 5 * 1000);
        };

        const stopSync = () => clearInterval(syncInterval);

        const handleAppStateChange = (nextState) => {
            if (nextState === 'active') startSync();
            else stopSync();
        };

        startSync();

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            stopSync();
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                triggerAllSyncs();
            }
        });

        const setupFCM = async () => {
            const app = getMessaging();

            onMessage(app, async remoteMessage => {
                console.log('Foreground notification:', remoteMessage);
                Vibration.vibrate([200]);

                Toast.show({
                    type: 'success',
                    text1: remoteMessage.notification?.title || 'New Message',
                    text2: remoteMessage.notification?.body || '',
                    position: 'top',
                    autoHide: true,
                    visibilityTime: 4000,
                    topOffset: 50,
                });

                if (remoteMessage?.data) {
                    notificationEmitter.emit('newMessage', remoteMessage.data);
                    handleNotificationNavigation(remoteMessage.data);
                }
            });

            onNotificationOpenedApp(app, remoteMessage => {
                if (remoteMessage?.data) {
                    console.log('onNotificationOpenedApp:', remoteMessage.data);
                    Vibration.vibrate([500, 1000, 500]);
                    notificationEmitter.emit('newMessage', remoteMessage.data);
                    handleNotificationNavigation(remoteMessage.data);
                }
            });

            const initialMessage = await getInitialNotification(app);
            if (initialMessage?.data) {
                const interval = setInterval(() => {
                    if (navigationRef.isReady()) {
                        console.log('Initial notification:', initialMessage.data);
                        notificationEmitter.emit('newMessage', initialMessage.data);
                        handleNotificationNavigation(initialMessage.data);
                        clearInterval(interval);
                    }
                }, 200);
            }
        };

        setupFCM();

        // Cleanup
        return () => {
            unsubscribeNetInfo();
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setSplashVisible(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (splashVisible) return <SplashScreen />;

    if (!user) {
        return (
            <NavigationContainer>
                <UnauthenticatedStack />
            </NavigationContainer>
        );
    }

    return (
        <>
            <StatusBar backgroundColor={theme.colors.light.primary} barStyle="dark-content" />
            <SafeAreaProvider>
                <AccessProvider>
                    <NavigationContainer ref={navigationRef} onReady={tryFlushPendingNavigation}>
                        <Stack.Navigator screenOptions={{
                            headerShown: false,
                        }}>
                            <Stack.Screen name="MainTabs" component={BottomTabNav} />
                            <Stack.Screen name="SurveyTest" component={SurveyBottomTabNav} />
                            <Stack.Screen name="AddQuestionScreen" component={AddQuestionScreen} />
                            <Stack.Screen name="QuizStartScreen" component={QuizStartScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ResponsePreview" component={ResponsePreviewScreen} />
                            <Stack.Screen name="QuizBuilder" component={QuizBuilderScreen} />
                            <Stack.Screen name="QuizScreen" component={QuizScreen} />
                            <Stack.Screen name="JoinClass" component={JoinClassScreen} />
                            <Stack.Screen name="AddClass" component={AddClassScreen} />
                            <Stack.Screen name="AddActivity" component={AddActivityScreen} />
                            <Stack.Screen name="SubmissionDetails" component={SubmissionDetailsScreen} />
                            <Stack.Screen name="ClassDetails" component={ClassBottomNav} />
                            <Stack.Screen name="ClassMeeting" component={CreateMeetingScreen} />
                            <Stack.Screen name="ActivityDetails" component={StudentActivityBottomNav} />
                            <Stack.Screen name="FacActivityDetails" component={FacultyActivityBottomNav} />
                            <Stack.Screen
                                name="WallComments"
                                component={WallCommentsScreen}
                                options={{
                                    headerShown: true,
                                    title: 'Comments',
                                    headerStyle: { backgroundColor: theme.colors.light.primary },
                                    headerTitleStyle: { color: '#fff' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen name="PostWall" component={PostWallScreen} />
                            <Stack.Screen name="Profile" component={ProfileScreen} />
                            <Stack.Screen name="AcademicYear" component={AcademicYearScreen} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </AccessProvider>
            </SafeAreaProvider>
        </>
    );
};

export default function App(): React.JSX.Element {
    return (
        <LoadingProvider>
            <Loading2Provider>
                <CAlert>
                    <NetworkProvider>
                        <AuthProvider>
                            <GestureHandlerRootView style={{ flex: 1 }}>
                                <AppNavigator />
                            </GestureHandlerRootView>
                        </AuthProvider>
                        <StatusIndicator />
                    </NetworkProvider>
                </CAlert>
            </Loading2Provider>
        </LoadingProvider>
    );
}
