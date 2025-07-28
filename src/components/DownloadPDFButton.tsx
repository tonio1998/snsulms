import React, { useState } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { downloadAndOpenPDF } from '../utils/fileDownloader';
import { API_BASE } from '../../env.ts';
import { theme } from '../theme';
import Icon from 'react-native-vector-icons/Ionicons';

interface DownloadPDFButtonProps {
	quizId: number;
	title?: string;
	baseUrl?: string;
	style?: StyleProp<ViewStyle>;
}

const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({
	                                                             quizId,
	                                                             title = 'Download Answer Sheet',
	                                                             baseUrl = `${API_BASE}`,
	                                                             style,
                                                             }) => {
	const [loading, setLoading] = useState(false);

	const handleDownload = async () => {
		try {
			setLoading(true);
			const url = `${baseUrl}download/quiz/${quizId}/answersheet`;
			const fileName = `answersheet-quiz${quizId}.pdf`;
			await downloadAndOpenPDF(url, fileName);
		} catch (error) {
			console.error('Error downloading PDF:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<TouchableOpacity
			style={[styles.button, loading && styles.disabled, style]}
			onPress={handleDownload}
			disabled={loading}
			activeOpacity={0.8}
		>
			{loading ? (
				<View style={styles.row}>
					<ActivityIndicator size="small" color="#fff" />
				</View>
			) : (
				<Icon name="print-outline" size={24} color="#fff" />
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: theme.colors.light.primary,
		padding: 5,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	disabled: {
		opacity: 0.7,
	},
	text: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
});
export default DownloadPDFButton;
