import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginWithBiometric = async () => {
  const rnBiometrics = new ReactNativeBiometrics();
  const email = await AsyncStorage.getItem('biometricUserEmail');
  console.log("email:", email)

  if (!email) throw new Error('No biometric user found.');

  const { success } = await rnBiometrics.simplePrompt({
    promptMessage: 'Login using Biometrics',
  });

  if (!success) return null;

  const credentials = await Keychain.getGenericPassword({
    service: `tnhs-biometric-${email}`,
    authenticationPrompt: {
      title: 'Biometric Login',
    },
  });

  if (!credentials) throw new Error('No saved session found.');

  const session = JSON.parse(credentials.username);
  return session;
};
