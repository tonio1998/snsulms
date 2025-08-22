import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import DatePickerModal from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { theme } from '../../theme';
import { CText } from '../common/CText.tsx';

interface CustomDatePickerProps {
	value: Date;
	onChange: (date: Date) => void;
	label?: string;
	placeholder?: string;
	mode?: 'date' | 'time' | 'datetime';
	minimumDate?: Date;
	maximumDate?: Date;
}

const CustomDatePicker = ({
	                          value,
	                          onChange,
	                          label = 'Date',
	                          placeholder = 'Select date',
	                          mode = 'date',
	                          minimumDate,
	                          maximumDate,
                          }: CustomDatePickerProps) => {
	const [open, setOpen] = useState(false);
	
	const handleConfirm = (selectedDate: Date) => {
		setOpen(false);
		onChange(selectedDate);
	};
	
	return (
		<View>
			{label && <CText style={styles.label}>{label}</CText>}
			
			<TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
				<Icon name="calendar-outline" size={20} color={theme.colors.text.default} style={styles.icon} />
				<Text style={[styles.buttonText]}>
					{mode === 'date' ? dayjs(value).format('MMM D, YYYY') : dayjs(value).format('MMM D, YYYY h:mm A')}
				</Text>
			</TouchableOpacity>
			
			<DatePickerModal
				modal
				mode={mode}
				open={open}
				date={value}
				onConfirm={handleConfirm}
				onCancel={() => setOpen(false)}
				minimumDate={minimumDate}
				maximumDate={maximumDate}
			/>
		</View>
	);
};

export default CustomDatePicker;

const styles = StyleSheet.create({
	label: {
		marginBottom: 8,
		fontSize: 16,
		// fontWeight: 'bold',
		color: '#222',
	},
	button: {
		backgroundColor: theme.colors.light.card,
		borderWidth: 1,
		borderColor: '#ccc',
		paddingVertical: 14,
		borderRadius: theme.radius.sm,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 5,
		paddingLeft: 10,
		marginBottom: 20,
		width: '100%',
	},
	buttonText: {
		color: theme.colors.text.default,
		fontSize: 16,
		// fontWeight: 'bold',
	},
	icon: {
		marginRight: 6,
	},
});
