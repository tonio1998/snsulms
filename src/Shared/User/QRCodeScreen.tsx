import React, { useEffect, useRef, useState } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	TouchableOpacity,
	Text,
	Image,
	ToastAndroid, StatusBar,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import QRGenerator from '../../components/special/QRGenerator.tsx';
import { globalStyles } from '../../theme/styles.ts';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext.tsx';
import { CText } from '../../components/common/CText.tsx';
import { handleApiError } from '../../utils/errorHandler.ts';
import { useLoading } from '../../context/LoadingContext.tsx';
import { useAlert } from '../../components/CAlert.tsx';
import { APP_NAME } from '../../../env.ts';
import FileViewer from 'react-native-file-viewer';
import Icon from 'react-native-vector-icons/Ionicons';
import BackHeader from '../../components/layout/BackHeader.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QRCodeScreen = () => {
	const { user } = useAuth();
	const { showAlert } = useAlert();
	const qrRef = useRef<ViewShot>(null);
	const [userID, setUserID] = useState<string>('');
	const { showLoading, hideLoading } = useLoading();

	useEffect(() => {
		const loadUserID = async () => {
			showLoading('Generating QR Code...')
			try {
				if (user?.id) {
					const storedID = await AsyncStorage.getItem('EncryptedUserID');
					if (storedID) {
						setUserID(storedID);
					}
				}
			} catch (error) {
				handleApiError(error, 'Failed to load user ID');
			} finally {
				hideLoading();
			}
		};

		loadUserID();
	}, [user?.id]);

	const qr_code = userID ?? '';
	const name = user?.name ?? '';
	const data = qr_code && name ? `${qr_code}@${name}` : 'NO-DATA';

	const handleShare = async () => {
		try {
			if (qrRef.current) {
				const uri = await qrRef.current.capture();
				await Share.open({ url: uri });
			}
		} catch (error) {
			// ignore cancel errors
		}
	};

	const handleDownload = async () => {
		try {
			if (qrRef.current) {
				const uri = await qrRef.current.capture();
				const fileName = `qr_${Date.now()}.png`;
				const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

				await RNFS.copyFile(uri, destPath);
				ToastAndroid.show('QR Code saved to Downloads folder!', ToastAndroid.SHORT);

				await FileViewer.open(destPath, {
					showOpenWithDialog: false,
				});
			}
		} catch (error) {
			handleApiError(error, 'Download Failed');
		}
	};

	return (
		<>
			<BackHeader title={"My QR Code"} style={{ color: "#fff"}}/>
			<SafeAreaView style={[globalStyles.safeArea2]}>
				<BackHeader title="My QR Code" style={{ color: '#fff' }} />
				<View style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					height: 300,
					backgroundColor: theme.colors.light.primary,
				}}></View>
				<StatusBar
					barStyle="light-content"
				/>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					<ViewShot ref={qrRef} options={{ format: 'jpg', quality: 1.0, backgroundColor: '#fff' }}>
						<View style={styles.qrCard}>
							<View style={styles.logoContainer}>
								<Image
									source={require('../../../assets/img/qr_logo.png')}
									style={styles.logo}
									resizeMode="contain"
								/>
							</View>
							<View style={styles.qrWrapper}>
								<QRGenerator value={data} size={270} />
							</View>
							<CText fontStyle={'SB'} fontSize={18} style={styles.userName}>
								{name}
							</CText>
							<CText fontSize={14} style={styles.userCode} numberOfLines={1}>
								{user?.email}
							</CText>
						</View>
					</ViewShot>
					<View style={{ marginHorizontal: 16, marginTop: 16}}>
						<CText
							style={{
								padding: 0,
								borderRadius: 12,
							}}
						>
							Show this QR code to your teacher during class for attendance scanning.
						</CText>
					</View>


					<View style={styles.actions}>
						<TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
							<Icon name="share-social-outline" size={20} color="#fff" />
							<Text style={styles.actionText}>Share</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
							<Icon name="download-outline" size={20} color="#fff" />
							<Text style={styles.actionText}>Download</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 10,
	},
	logoContainer: {
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	logo: {
		width: 220,
		height: 80,
	},
	qrCard: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 10,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		// width: 350,
	},
	userName: {
		marginBottom: 4,
		color: '#333',
	},
	userCode: {
		color: '#666',
		marginBottom: 12,
	},
	qrWrapper: {
		padding: 12,
		backgroundColor: '#f9f9f9',
		borderRadius: 12,
	},
	actions: {
		flexDirection: 'row',
		gap: 16,
		marginTop: 32,
		position: 'absolute',
		bottom: 20,
	},
	actionBtn: {
		backgroundColor: theme.colors.light.primary,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		elevation: 3,
		shadowColor: theme.colors.light.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
	},
	actionText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
});

export default QRCodeScreen;
