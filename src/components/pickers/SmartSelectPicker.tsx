import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import api from '../../api/api.ts';
import { theme } from '../../theme';

function getNestedValue(obj, keyPath) {
	return keyPath.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}

export default function SmartSelectPicker({
											  value,
											  onValueChange,
											  apiUrl,
											  items = [],
											  labelKey = 'label',
											  valueKey = 'value',
											  placeholder = 'Select one',
											  onLoad,
										  }) {
	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [tempOptions, setTempOptions] = useState([]);

	useEffect(() => {
		const debounce = setTimeout(() => {
			if (apiUrl && searchText.length >= 2) {
				api.get(`${apiUrl}?search=${encodeURIComponent(searchText)}`).then((res) => {
					const formatted = res.data.map((item) => ({
						label: getNestedValue(item, labelKey) || 'Unnamed',
						value: String(getNestedValue(item, valueKey)),
					}));
					setTempOptions(formatted);
				});
			}
		}, 500);

		return () => clearTimeout(debounce);
	}, [searchText]);

	useEffect(() => {
		if (open && searchText.length >= 2) {
			setOptions(tempOptions);
		}
	}, [tempOptions, open]);

	useEffect(() => {
		if (apiUrl) {
			api.get(apiUrl).then((res) => {
				const formatted = res.data.map((item) => ({
					label: getNestedValue(item, labelKey) || 'Unnamed',
					value: String(getNestedValue(item, valueKey)),
				}));
				setOptions(formatted);
				if (typeof onLoad === 'function') {
					onLoad(res.data);
				}
			});
		} else {
			const formatted = items.map((item) => ({
				label: getNestedValue(item, labelKey) || 'Unnamed',
				value: String(getNestedValue(item, valueKey)),
			}));
			setOptions(formatted);
			if (typeof onLoad === 'function') {
				onLoad(items);
			}
		}
	}, [apiUrl]);

	return (
		<View style={styles.container}>
			<DropDownPicker
				open={open}
				setOpen={setOpen}
				value={value}
				setValue={(callback) => {
					const result = typeof callback === 'function' ? callback(value) : callback;
					onValueChange?.(result);
				}}
				items={options}
				setItems={setOptions}
				searchable
				searchTextInputProps={{
					value: searchText,
					onChangeText: setSearchText,
					placeholder: 'Search...',
					placeholderTextColor: '#999',
				}}
				searchTextInputStyle={{
					paddingVertical: 12,
					paddingHorizontal: 16,
					borderRadius: 12,
					borderColor: '#e0e0e0',
					borderWidth: 1,
					backgroundColor: '#fff',
					fontSize: 16,
					color: '#333',
				}}
				placeholder={placeholder}
				listMode="MODAL"
				modalProps={{ animationType: 'slide', transparent: true }}
				modalContentContainerStyle={{
					backgroundColor: '#fff',
					margin: 10,
					padding: 10,
					borderRadius: 16,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.1,
					shadowRadius: 10,
					elevation: 5,
				}}
				listItemContainerStyle={{
					paddingHorizontal: 16,
					backgroundColor: '#fff',
				}}
				listItemLabelStyle={{
					fontSize: 16,
					color: '#333',
					paddingVertical: 14,
					height: 50
				}}
				selectedItemLabelStyle={{
					fontWeight: 'bold',
					color: theme.colors.light.primary,
					paddingVertical: 14,
				}}
				selectedItemContainerStyle={{
					backgroundColor: theme.colors.light.primary + '11',
					borderRadius: 8,
				}}
				style={styles.pickerSelectStyles}
				dropDownContainerStyle={{
					maxHeight: 150,
					borderColor: 'lightgray',
					zIndex: 10000,
					elevation: 10,
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		zIndex: 1000,
		position: 'relative',
	},
	pickerSelectStyles: {
		borderColor: '#ccc',
		borderRadius: 8,
		minHeight: 47,
	},
});
