import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import checkBiometricSupport from '../services/checkBiometricSupport';
import { authLogin, loginWithGoogle } from '../api/modules/auth';
import bcrypt from 'bcryptjs';
import { handleApiError } from './errorHandler';
import { loginWithBiometric } from '../hooks/useBiometrics';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const init = async () => {
    const email = await AsyncStorage.getItem('biometricUserEmail');
    const result = await checkBiometricSupport();
    const flagKey = `biometricEnabled:${email}`;
    const flag = await AsyncStorage.getItem(flagKey);
    const isSupported = result.supported;
    const isEnabled = flag === 'true';

    console.log("isSupportedss: ", isSupported)

    setIsBiometricEnabled(isSupported && isEnabled);
};


export const handleLogin = async () => {
    showLoading('Signing in...');
    setEmailError('');
    setPasswordError('');
    try {
        if (isOnline) {
            const response = await authLogin({ email, password });
            if (response.status === 200) {
                const sessionData = { ...response.data, password };

                await loginAuth(response.data);
                await AsyncStorage.setItem('isLoggedIn', 'true');
                await AsyncStorage.setItem('mobile', sessionData.token);
                await Keychain.setGenericPassword(JSON.stringify(sessionData), sessionData.token);
            }
        } else {
            const cachedSession = await Keychain.getGenericPassword();

            if (cachedSession) {
                const sessionData = JSON.parse(cachedSession.username);
                const isMatch = await bcrypt.compare(password, sessionData.password);

                if (sessionData.email === email && isMatch) {
                    const sessionDatasss = {
                        user: sessionData,
                        token: cachedSession.password,
                        roles: sessionData.roles,
                        permissions: sessionData.permissions
                    };
                    await loginAuth(sessionDatasss);
                    await AsyncStorage.setItem('isLoggedIn', 'true');
                    await AsyncStorage.setItem('mobile', cachedSession.password);
                } else {
                    setEmailError('Incorrect email.');
                    setPasswordError('Incorrect password.');
                }
            } else {
                setEmailError('No cached session available.');
            }
        }
    } catch (error) {
        console.error('Login Error:', error);
        setEmailError('Login failed. Please try again.');
        setPasswordError('');
        handleApiError(error, 'Login');
    } finally {
        hideLoading();
    }
};

export const handleBiometricLogin = async () => {
    try {
        const session = await loginWithBiometric();
        if(session){
            console.log(session)
            await loginAuth(session);
            await AsyncStorage.setItem('isLoggedIn', 'true');
            await AsyncStorage.setItem("mobile", session.token);
        }
    } catch (err) {
        handleApiError(err, 'BIo');
    }
};

export const handleGoogleLogin = async () => {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut();
    try {
        const userInfo = await GoogleSignin.signIn();
        showLoading('Logging in...');
        const user = userInfo?.data?.user;
        const idToken = userInfo?.data?.idToken;

        const response = await loginWithGoogle({
            token: idToken,
            name: user?.name,
            email: user?.email,
            photo: user?.photo,
        });
        await loginAuth(response.data);
    } catch (error) {
        console.error('Google login error:', error?.response?.data || error?.message);
        handleApiError(error, 'Login');
    } finally {
        hideLoading();
    }
};