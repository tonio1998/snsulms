import React from 'react';
import {View, ActivityIndicator, StyleSheet, StatusBar, Text, Image, SafeAreaView} from 'react-native';
import { theme } from '../theme';
import { CText } from '../components/CText.tsx';
import { globalStyles } from '../theme/styles.ts';
import { APP_NAME, TAGLINE } from '../api/api_configuration.ts';
import BackgroundWrapper from "../utils/BackgroundWrapper";
import SmartSelectPicker from "../components/SmartSelectPicker.tsx";

export default function AcademicYearScreen() {
	return (
		<>
			<BackgroundWrapper>
				<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 100}]}>
					<View style={styles.container}>
						<CText fontSize={20} fontStyle={'B'} style={[{ marginBottom: 10 }]}>Academic Year</CText>
						<CText fontSize={16} fontStyle={'SB'} style={{ color: '#fff', marginBottom: 10 }}>Set Academic Year</CText>
						<View>
						</View>
					</View>
				</SafeAreaView>
			</BackgroundWrapper>
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
