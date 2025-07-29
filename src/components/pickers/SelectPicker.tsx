import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/Ionicons';

interface SelectOption {
	label: string;
	value: any;
}

interface SelectPickerProps {
	items: SelectOption[];
	onValueChange: (value: any) => void;
	placeholder?: string;
	value?: any;
	label?: string;
}

const SelectPicker: React.FC<SelectPickerProps> = ({
	                                                   items,
	                                                   onValueChange,
	                                                   placeholder = 'Select an option',
	                                                   value,
	                                                   label,
                                                   }) => {
	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}
			<RNPickerSelect
				onValueChange={onValueChange}
				items={items}
				value={value}
				placeholder={{
					label: placeholder,
					value: null,
					color: '#9EA0A4',
				}}
				style={pickerSelectStyles}
				Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 10,
	},
	label: {
		fontSize: 14,
		marginBottom: 4,
		color: '#444',
	},
});

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		color: '#333',
		paddingRight: 30, // to make room for the icon
		backgroundColor: '#f9f9f9',
	},
	inputAndroid: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		color: '#333',
		paddingRight: 30,
		backgroundColor: '#f9f9f9',
	},
	iconContainer: {
		top: 15,
		right: 10,
	},
});

export default SelectPicker;
