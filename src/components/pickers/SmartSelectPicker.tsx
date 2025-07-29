import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import api from '../../api/api.ts';

export default function SmartSelectPicker({
	                                          value,
	                                          onValueChange,
	                                          apiUrl,
	                                          items = [],
	                                          labelKey = 'label',
	                                          valueKey = 'value',
	                                          placeholder = 'Select one',
                                          }) {
	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState([]);

	useEffect(() => {
		if (apiUrl) {
			api.get(apiUrl).then((res) => {
				const formatted = res.data.map((item) => ({
					label: item[labelKey],
					value: String(item[valueKey]),
				}));
				setOptions(formatted);
			});
		} else {
			const formatted = items.map((item) => ({
				label: item[labelKey],
				value: String(item[valueKey]),
			}));
			setOptions(formatted);
		}
	}, [apiUrl, items, labelKey, valueKey]);

	return (
		<View style={styles.container}>
			<DropDownPicker
				open={open}
				setOpen={setOpen}
				value={String(value)}
				setValue={(callback) => {
					const result = typeof callback === 'function' ? callback(value) : callback;
					onValueChange?.(String(result));
				}}
				items={options}
				setItems={setOptions}
				placeholder={placeholder}
				searchable={true}
				style={styles.pickerSelectStyles}
				dropDownContainerStyle={{
					maxHeight: 150,
					borderColor: 'lightgray',
				}}
				zIndex={9999999}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		// marginBottom: 20,
	},
	pickerSelectStyles: {
		borderColor: '#ccc',
		borderRadius: 6,
		minHeight: 45,
	},
});
