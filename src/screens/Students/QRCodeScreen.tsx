import React, { useRef } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	TouchableOpacity,
	Text,
	PermissionsAndroid,
	Platform, ToastAndroid, Image, Alert
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import QRGenerator from '../../components/QRGenerator.tsx';
import { globalStyles } from '../../theme/styles.ts';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext.tsx';
import { CText } from '../../components/CText.tsx';
import { APP_NAME } from '../../api/api_configuration.ts';
import BackgroundWrapper from '../../utils/BackgroundWrapper';
import { handleApiError } from '../../utils/errorHandler.ts';
import { useLoading } from '../../context/LoadingContext.tsx';
import { useAlert } from '../../components/CAlert.tsx';
import { useAccess } from '../../hooks/useAccess.ts';

const QRCodeScreen = () => {
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const { hasRole, can } = useAccess();
	const { showAlert } = useAlert();
	const qrRef = useRef(null);

	const qr_code = user?.qr_code ?? '';
	const name = user?.name ?? '';
	const data = (qr_code && name) ? `${qr_code}@${name}` : 'NO-DATA';


	const requestStoragePermission = async () => {
		try {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
				{
					title: 'Storage Permission',
					message: 'App needs storage permission to save QR code.',
					buttonNeutral: 'Ask Me Later',
					buttonNegative: 'Cancel',
					buttonPositive: 'OK',
				}
			);

			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				return true;
			} else {
				return false;
			}
		} catch (err) {
			console.error("Permission error:", err);
			return false;
		}
	};

	const handleShare = async () => {
		try {
			const uri = await qrRef.current.capture();
			await Share.open({ url: uri });
		} catch (error) {
			// console.error('Share failed:', error);
		}
	};

	const handleDownload = async () => {
		const hasPermission = await requestStoragePermission();
		console.log("hasPermission: ", hasPermission)
		if (!hasPermission) {
			showAlert('error', 'Error', 'Cannot save QR code without permission.')
			return;
		}
		try {
			const uri = await qrRef.current.capture();
			const fileName = `qr_${Date.now()}.png`;
			const destPath = `${RNFS.PicturesDirectoryPath}/${fileName}`;

			if (Platform.OS === 'android') {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
				);
				if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
					return;
				}
			}

			await RNFS.copyFile(uri, destPath);
			showAlert('success', 'QR Saved', 'QR Code saved to gallery!')
		} catch (error) {
			handleApiError(error, "df")
			console.error('Download failed:', error);
		}
	};

	return (
		<>
		<BackgroundWrapper>
			<SafeAreaView style={[globalStyles.flex1, styles.container]}>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					<ViewShot ref={qrRef} options={{ format: 'jpg', quality: 1.0, backgroundColor: '#fff' }}>
						<View style={styles.qrContainer}>
							<View style={[globalStyles.mb_10, globalStyles.cardRow]}>
								<Image source={
									require('../../../assets/img/ic_launcher.png')
								}
									   style={{width: 50, height: 50, marginRight: 10}}
									   resizeMode={'contain'}
								/>
								<CText fontSize={35} fontStyle={'SB'} style={{ color: theme.colors.light.primary}}>{APP_NAME}</CText>
							</View>
							<View style={[globalStyles.mb_10]}>
								<CText style={{ textAlign: 'center'}} fontSize={20} fontStyle={'SB'}>{name}</CText>
								<CText style={{ width: 250, textAlign: 'center'}} fontSize={16} fontStyle={'SB'} numberOfLines={1} ellipsizeMode={'middle'}>{qr_code}</CText>
							</View>
							<QRGenerator value={data} size={250} />
						</View>
					</ViewShot>

					<View style={styles.buttonRow}>
						<TouchableOpacity style={styles.button} onPress={handleShare}>
							<Text style={styles.buttonText}>Share</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.button} onPress={handleDownload}>
							<Text style={styles.buttonText}>Download</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</SafeAreaView>
		</BackgroundWrapper>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	qrContainer: {
		alignItems: 'center',
		marginVertical: 20,
		backgroundColor: '#fff',
		padding: 40,
		borderRadius: 10
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 20,
		marginTop: 5,
	},
	button: {
		backgroundColor: theme.colors.light.primary,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
	},
});

export default QRCodeScreen;
