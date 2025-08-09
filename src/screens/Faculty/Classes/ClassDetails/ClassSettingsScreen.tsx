import React, { useContext, useEffect, useState } from 'react';
import {
	View,
	SafeAreaView,
	ScrollView,
	Switch,
	StyleSheet, ActivityIndicator,
} from 'react-native';
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import { useLoading } from '../../../../context/LoadingContext.tsx';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import BackHeader from '../../../../components/layout/BackHeader.tsx';
import { CText } from '../../../../components/common/CText.tsx';
import { NetworkContext } from '../../../../context/NetworkContext.tsx';
import { getClassInfo, updateClassSetting } from '../../../../api/modules/classesApi.ts';
import {useLoading2} from "../../../../context/Loading2Context.tsx";
import {useClass} from "../../../../context/SharedClassContext.tsx";

const ClassSettingsScreen = ({ route }) => {
	const { classes } = useClass();
	const ClassID = classes?.ClassID;
	const { showLoading2, hideLoading2 } = useLoading2();
	const network = useContext(NetworkContext);

	const [settings, setSettings] = useState({
		MeetOK: false,
		Attendance: false,
	});

	useEffect(() => {
		if (classes) {
			setSettings({
				MeetOK: classes.MeetOK === 'Y',
				Attendance: classes.Attendance === 'Y',
			});
		}
	}, [classes]);


	useEffect(() => {
		fetchClassSettings();
	}, []);

	const fetchClassSettings = async () => {
		try {
			setSettings({
				MeetOK: classes?.MeetOK === 'Y',
				Attendance: classes?.Attendance === 'Y',
			});
		} catch (err) {
			handleApiError(err, 'Unable to load class settings');
		} finally {
			hideLoading2();
		}
	};

	const toggleSetting = async (key) => {
		try {
			const newValue = !settings[key];
			setSettings((prev) => ({ ...prev, [key]: newValue }));

			const valueToSave = newValue ? 'Y' : 'N';
			const res = await updateClassSetting(ClassID, key, valueToSave);
		} catch (err) {
			handleApiError(err, `Failed to toggle ${key}`);
		}
	};

	const settingCards = [
		{
			label: 'Allow Students to Generate Meeting',
			key: 'MeetOK',
			description: 'Let students create their own meeting links for this class.',
		},
		{
			label: 'Enable Class Attendance',
			key: 'Attendance',
			description: 'Turn this on to allow students to mark their attendance.',
		},
	];

	return (
		<>
			<BackHeader title="Class Settings" />
			<SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
				<ScrollView contentContainerStyle={styles.container}>
					{settingCards.map(({ label, key, description }) => (
						<View key={key} style={styles.card}>
							<View style={styles.cardContent}>
								<View style={{ flex: 1 }}>
									<CText fontSize={16} fontStyle="SB">{label}</CText>
									<CText fontSize={13} style={styles.descText}>{description}</CText>
								</View>
								<Switch
									value={settings[key]}
									onValueChange={() => toggleSetting(key)}
									trackColor={{ false: '#ccc', true: theme.colors.light.primary }}
									thumbColor={'#fff'}
								/>
							</View>
						</View>
					))}
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingBottom: 100,
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 5,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#ddd',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	cardContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	descText: {
		marginTop: 4,
		color: '#777',
	},
});

export default ClassSettingsScreen;
