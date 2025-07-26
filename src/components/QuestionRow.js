import React, {
	forwardRef,
	useImperativeHandle,
	useState,
	memo,
} from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

const QuestionRow = forwardRef(({ id, question_no, initialKey, initialPoint }, ref) => {
	const [selected, setSelected] = useState(initialKey);
	const [point, setPoint] = useState(initialPoint);

	useImperativeHandle(ref, () => ({
		id,
		question_no,
		selected,
		point,
	}));

	return (
		<View style={styles.questionRow}>
			<Text style={styles.questionText}>{question_no}</Text>

			<View style={styles.choicesRow}>
				{['A', 'B', 'C', 'D'].map((choice) => (
					<TouchableOpacity
						key={choice}
						style={[
							styles.choiceBubble,
							selected === choice && styles.selectedBubble,
						]}
						onPress={() => setSelected(choice)}
					>
						<Text
							style={[
								styles.choiceText,
								selected === choice && styles.selectedText,
							]}
						>
							{choice}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<View style={styles.stepperContainer}>
				<TouchableOpacity
					style={styles.stepperButton}
					onPress={() => setPoint((prev) => Math.max(prev - 1, 1))}
				>
					<Text style={styles.stepperText}>-</Text>
				</TouchableOpacity>

				<Text style={styles.pointText}>{point}</Text>

				<TouchableOpacity
					style={styles.stepperButton}
					onPress={() => setPoint((prev) => prev + 1)}
				>
					<Text style={styles.stepperText}>+</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
});

export default memo(QuestionRow);

const styles = StyleSheet.create({
	questionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	questionText: {
		fontSize: 20,
		marginRight: 10,
		color: '#333',
		width: 30,
		textAlign: 'center',
	},
	choicesRow: {
		flexDirection: 'row',
		gap: 4,
	},
	choiceBubble: {
		width: 35,
		height: 35,
		borderRadius: 24,
		borderWidth: 2,
		borderColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
	},
	selectedBubble: {
		backgroundColor: theme.colors.light.primary,
		borderColor: theme.colors.light.primary,
	},
	choiceText: {
		fontSize: 16,
		color: '#555',
		fontWeight: '600',
	},
	selectedText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	stepperContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 12,
	},
	stepperButton: {
		width: 30,
		height: 30,
		borderRadius: 5,
		backgroundColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
		marginHorizontal: 4,
	},
	stepperText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	pointText: {
		fontSize: 16,
		width: 20,
		textAlign: 'center',
	},
});
