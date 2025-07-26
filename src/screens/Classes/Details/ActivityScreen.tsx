import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView, Image, ScrollView, StyleSheet
} from 'react-native';
import {getActivities} from "../../../api/modules/activitiesApi.ts";
import {getOfflineStudents, saveStudentsOffline} from "../../../utils/sqlite/students";
import {handleApiError} from "../../../utils/errorHandler.ts";
import {useFocusEffect} from "@react-navigation/native";
import CustomHeader from "../../../components/CustomHeader.tsx";
import BackgroundWrapper from "../../../utils/BackgroundWrapper";
import {globalStyles} from "../../../theme/styles.ts";
import {CText} from "../../../components/CText.tsx";
import {theme} from "../../../theme";
import {NetworkContext} from "../../../context/NetworkContext.tsx";

const ActivityScreen = ({ navigation }) => {
	const network = useContext(NetworkContext);

	return (
		<>
			<SafeAreaView style={[globalStyles.safeArea]}>
				<Text>Wall</Text>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	floatBtn: {
		position: 'absolute',
		right: 20,
		bottom: 20,
	},
	fab: {
		backgroundColor: theme.colors.light.primary,
		width: 60,
		height: 60,
		borderRadius: 30,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	}
});

export default ActivityScreen;
