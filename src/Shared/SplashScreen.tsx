import React from 'react';
import {
	View,
	ActivityIndicator,
	StyleSheet,
	StatusBar,
	Image,
	ImageBackground,
	SafeAreaView,
} from 'react-native';
import { FontFamily, theme } from '../theme';
import { CText } from '../components/common/CText.tsx';
import { globalStyles } from '../theme/styles.ts';
import { APP_NAME, TAGLINE } from '../../env.ts';

export default function SplashScreen() {
	return (
		<SafeAreaView style={styles.safeArea}>
			<ImageBackground
				source={require('../../assets/img/bg2.png')}
				style={styles.bg}
				resizeMode="cover"
				imageStyle={styles.bgImage}
			>
				<View style={styles.overlay}>
					<View style={globalStyles.bgTopCircle} />

					<Image
						source={require('../../assets/img/ic_launcher.png')}
						style={styles.logo}
					/>

					<CText fontSize={40} fontStyle="SB" style={styles.title}>
						{APP_NAME}
					</CText>
					<CText fontStyle="B" fontSize={12} style={styles.tagline}>
						{TAGLINE}
					</CText>

					<ActivityIndicator size="large" color={theme.colors.light.card} style={styles.loader} />

					<View style={globalStyles.bgBottomCircle} />
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: theme.colors.light.primary,
	},
	bg: {
		flex: 1,
	},
	bgImage: {
		alignSelf: 'flex-start',
	},
	overlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	logo: {
		width: 120,
		height: 120,
		marginBottom: 20,
	},
	title: {
		color: '#fff',
		marginBottom: 8,
		...globalStyles.shadowText,
	},
	tagline: {
		color: '#fff',
		marginBottom: 20,
		...globalStyles.shadowText,
	},
	loader: {
		marginTop: 20,
	},
});
