import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import DatePickerModal from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { theme } from '../../theme';

interface DatePickerProps {
	value: Date;
	onChange: (date: Date) => void;
	label?: string;
	placeholder?: string;
}

const DatePicker = ({ value, onChange, label = 'Date of Birth', placeholder = 'Select Date' }: DatePickerProps) => {
	const [open, setOpen] = useState(false);
	
	const handleConfirm = (selectedDate: Date) => {
		setOpen(false);
		onChange(selectedDate);
	};
	
	return (
		<View>
			{label && <Text style={styles.label}>{label}</Text>}
			
			<TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
				<Icon name="calendar-outline" size={20} color="#555" style={styles.icon} />
				<Text style={styles.buttonText}>
					{value ? dayjs(value).format('MMM D, YYYY') : placeholder}
				</Text>
			</TouchableOpacity>
			
			<DatePickerModal
				modal
				mode="date"
				open={open}
				date={value}
				onConfirm={handleConfirm}
				onCancel={() => setOpen(false)}
			/>
		</View>
	);
};

export default DatePicker;

const styles = StyleSheet.create({
	label: {
		marginBottom: 8,
		fontSize: 16,
		fontWeight: 'bold',
		color: '#222',
	},
	button: {
		backgroundColor: theme.colors.light.primary,
		paddingVertical: 14,
		borderRadius: theme.radius.xxxxl,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		marginBottom: 20,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	icon: {
		marginRight: 6,
	},
});
