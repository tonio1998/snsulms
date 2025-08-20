import React, { useRef } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	TouchableOpacity,
	Text,
	Platform,
	Image,
	StatusBar,
	ToastAndroid
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
import BackHeader from "../../components/layout/BackHeader.tsx";

const QRCodeScreen = () => {
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const { showAlert } = useAlert();
	const qrRef = useRef(null);

	const qr_code = user?.conn_id ?? '';
	const name = user?.name ?? '';
	const data = (qr_code && name) ? `${qr_code}@${name}` : 'NO-DATA';

	const handleShare = async () => {
		try {
			const uri = await qrRef.current.capture();
			await Share.open({ url: uri });
		} catch (error) {
		}
	};

	const handleDownload = async () => {
		try {
			const uri = await qrRef.current.capture();
			const fileName = `qr_${Date.now()}.png`;
			const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

			await RNFS.copyFile(uri, destPath);
			ToastAndroid.show('QR Code saved to Downloads folder!', ToastAndroid.SHORT);
			await FileViewer.open(destPath, {
				showOpenWithDialog: false,
			});
		} catch (error) {
			handleApiError(error, 'Download Failed');
		}
	};

	return (
		<SafeAreaView style={[globalStyles.flex1, { backgroundColor: theme.colors.light.background }]}>
			<BackHeader title="My QR Code" />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/*<View style={styles.header}>*/}
				{/*	<View style={styles.logoContainer}>*/}
				{/*		<Image*/}
				{/*			source={require('../../../assets/img/qr_logo.png')}*/}
				{/*			style={styles.logo}*/}
				{/*			resizeMode='contain'*/}
				{/*		/>*/}
				{/*	</View>*/}
				{/*	<CText fontSize={28} fontStyle='B' style={styles.title}>*/}
				{/*		{APP_NAME}*/}
				{/*	</CText>*/}
				{/*</View>*/}

				<ViewShot ref={qrRef} options={{ format: 'jpg', quality: 1.0, backgroundColor: '#fff' }}>
					<View style={styles.qrCard}>
						<View style={styles.logoContainer}>
							<Image
								source={require('../../../assets/img/qr_logo.png')}
								style={styles.logo}
								resizeMode='contain'
							/>
						</View>
						<View style={styles.qrWrapper}>
							<QRGenerator value={data} size={250} />
						</View>
						<CText fontSize={22} style={styles.userName}>{name}</CText>
						<CText fontSize={14} style={styles.userCode} numberOfLines={1}>
							{user?.email}
						</CText>
					</View>
				</ViewShot>

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
	);
};

const styles = StyleSheet.create({
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	header: {
		alignItems: 'center',
		marginBottom: 30,
	},
	logoContainer: {
		// padding: 12,
		// borderRadius: 50,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		// elevation: 4,
	},
	logo: {
		width: 220,
		height: 80,
	},
	title: {
		color: theme.colors.light.primary,
	},
	qrCard: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 24,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		// elevation: 5,
		width: 300,
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
		bottom: 20
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
