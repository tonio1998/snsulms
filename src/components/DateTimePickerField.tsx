import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';

interface DateTimePickerFieldProps {
	initialDate?: Date;
	selectedDate?: Date | null;
	onChange?: (date: Date) => void;
	buttonTitle?: string;
	placeholder?: string;
	labelKey?: string; // Not used but included for extensibility
	valueKey?: string; // Not used but included for extensibility
}

const DateTimePickerField: React.FC<DateTimePickerFieldProps> = ({
																																	 initialDate,
																																	 selectedDate,
																																	 onChange,
																																	 buttonTitle = 'Pick a Date',
																																	 placeholder = 'Select date & time',
																																 }) => {
	const [open, setOpen] = useState(false);
	const [dateTime, setDateTime] = useState<Date>(selectedDate || initialDate || new Date());

	useEffect(() => {
		if (selectedDate) {
			setDateTime(selectedDate);
		}
	}, [selectedDate]);

	const handleConfirm = (selected: Date) => {
		setOpen(false);
		setDateTime(selected);
		onChange && onChange(selected);
	};

	return (
		<View style={styles.pickerWrapper}>
			<TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
				<Icon name="calendar" size={20} color="#555" style={styles.icon} />
				<Text style={styles.buttonText}>
					{dateTime ? dateTime.toLocaleString() : placeholder}
				</Text>
			</TouchableOpacity>

			<DatePicker
				mode="datetime"
				modal
				open={open}
				date={dateTime}
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

export default DateTimePickerField;
