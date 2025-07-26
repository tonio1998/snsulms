import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { View, StyleSheet } from 'react-native';

interface SearchableServerSelectProps {
	apiUrl: string;
	onValueChange: (value: any) => void;
	placeholder?: string;
	label?: string;
}

const SearchableServerSelect: React.FC<SearchableServerSelectProps> = ({
	                                                                       apiUrl,
	                                                                       onValueChange,
	                                                                       placeholder = 'Select an option',
                                                                       }) => {
	const [open, setOpen] = useState(false);
	const [items, setItems] = useState<any[]>([]);
	const [value, setValue] = useState(null);

	useEffect(() => {
		axios.get(apiUrl)
			.then((res) => {
				setItems(res.data);
			})
			.catch((err) => {
				console.error('Dropdown fetch failed:', err);
			});
	}, [apiUrl]);

	return (
		<View style={styles.container}>
			<DropDownPicker
				open={open}
				value={value}
				items={items}
				setOpen={setOpen}
				setValue={setValue}
				setItems={setItems}
				placeholder={placeholder}
				searchable={true}
				onChangeValue={onValueChange}
				style={styles.dropdownpicker}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 10,
		zIndex: 1000,
	},
	dropdownpicker: {
		borderColor: 'lightgray',
	},
});

export default SearchableServerSelect;
