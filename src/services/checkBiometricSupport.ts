import * as Keychain from 'react-native-keychain';
const checkBiometricSupport = async (): Promise<{
	supported: boolean;
	biometryType: Keychain.BIOMETRY_TYPE | null;
}> => {
	try {
		const biometryType = await Keychain.getSupportedBiometryType();

		return {
			supported: !!biometryType,
			biometryType: biometryType ?? null,
		};
	} catch (error) {
		console.error('Error checking biometric support:', error);
		return {
			supported: false,
			biometryType: null,
		};
	}
};

export default checkBiometricSupport;
