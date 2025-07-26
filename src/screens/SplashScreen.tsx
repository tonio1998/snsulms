import React from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar, Text, Image } from 'react-native';
import { theme } from '../theme';
import { CText } from '../components/CText.tsx';
import { globalStyles } from '../theme/styles.ts';
import { APP_NAME, TAGLINE } from '../api/api_configuration.ts';

export default function SplashScreen() {
	return (
		<>
			<StatusBar
				backgroundColor={theme.colors.light.primary_soft}
				barStyle="light-content"
			/>
			<View style={styles.container}>
				<View style={globalStyles.bgTopCircle} />
				<Image
					source={require('../../assets/img/ic_launcher.png')}
					style={{ width: 120, height: 120 }}
				/>
				<CText fontSize={40} fontStyle={'B'} style={[globalStyles.shadowText,{ color: '#fff', marginBottom: 10 }]}>{APP_NAME}</CText>
				<CText style={{ color: '#fff', marginBottom: 10 }}>{TAGLINE}</CText>
				<Text>{'\n'}</Text>
				<ActivityIndicator size="large" color={theme.colors.light.card} />
				<View style={globalStyles.bgBottomCircle} />
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.light.primary_soft,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
