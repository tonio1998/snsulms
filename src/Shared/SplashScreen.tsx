import React from 'react';
import {View, ActivityIndicator, StyleSheet, StatusBar, Text, Image, ImageBackground, SafeAreaView} from 'react-native';
import {FontFamily, theme} from '../theme';
import { CText } from '../components/common/CText.tsx';
import { globalStyles } from '../theme/styles.ts';
import { APP_NAME, TAGLINE } from '../../env.ts';

export default function SplashScreen() {
	return (
		<>
			<SafeAreaView style={[{ flex: 1, backgroundColor: theme.colors.light.primary }]}>
				<ImageBackground
					source={require('../../assets/img/bg2.png')}
					style={[styles.container]}
					resizeMode="cover"
					imageStyle={{ alignSelf: 'flex-start' }}
				>
					<View style={styles.container}>
						<View style={globalStyles.bgTopCircle} />
						<Image
							source={require('../../assets/img/ic_launcher.png')}
							style={{ width: 120, height: 120 }}
						/>
						<CText fontSize={40} fontStyle={'B'} style={[globalStyles.shadowText,{ color: '#fff', marginBottom: 10 }]}>{APP_NAME}</CText>
						<CText fontStyle={'SB'} fontSize={13} style={[globalStyles.shadowText, { color: '#fff', marginBottom: 10 }]}>{TAGLINE}</CText>
						<Text>{'\n'}</Text>
						<ActivityIndicator size="large" color={theme.colors.light.card} />
						<View style={globalStyles.bgBottomCircle} />
					</View>
				</ImageBackground>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
