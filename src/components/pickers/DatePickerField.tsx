import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';

interface DatePickerFieldProps {
	initialDate?: Date;
	onDateChange: (date: Date) => void;
	placeholder?: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
	                                                         initialDate,
	                                                         onDateChange,
	                                                         placeholder,
                                                         }) => {
	const [open, setOpen] = useState(false);
	
	const handleConfirm = (selectedDate: Date) => {
		setOpen(false);
		onDateChange(selectedDate);
	};
	
	return (
		<View style={styles.pickerWrapper}>
			<TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
				<Icon name="calendar-outline" size={20} color="#555" style={styles.icon} />
				<Text style={styles.buttonText}>
					{initialDate ? initialDate.toDateString() : placeholder}
				</Text>
			</TouchableOpacity>
			
			<DatePicker
				mode="date"
				modal
				open={open}
				date={initialDate || new Date()}
				onConfirm={handleConfirm}
				onCancel={() => setOpen(false)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	pickerWrapper: {
		marginVertical: 10,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		borderColor: '#ccc',
		borderWidth: 1,
		padding: 12,
		borderRadius: 8,
		backgroundColor: '#f9f9f9',
	},
	icon: {
		marginRight: 10,
	},
	buttonText: {
		fontSize: 16,
		color: '#333',
	},
});

export default DatePickerField;
