import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

export default function CheckBoxGroup({ options = [], selectedIds = [], onChange }) {
	const safeSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];
	
	const toggleSelection = (itemId) => {
		const isChecked = safeSelectedIds.includes(itemId);
		const selectedOption = options.find((opt) => opt.id === itemId);
		const isNone = selectedOption?.value === 'None';
		
		if (isNone) {
			onChange?.(isChecked ? [] : [itemId]);
		} else {
			let updated = isChecked
				? safeSelectedIds.filter((id) => id !== itemId)
				: [...safeSelectedIds, itemId];
			
			const noneOption = options.find((opt) => opt.value === 'None');
			if (noneOption && updated.includes(noneOption.id)) {
				updated = updated.filter((id) => id !== noneOption.id);
			}
			
			onChange?.(updated);
		}
	};
	
	
	return (
		<View>
			{options.map((item) => {
				const isChecked = safeSelectedIds.includes(item.id);
				
				return (
					<Pressable
						key={item.id}
						onPress={() => toggleSelection(item.id)}
						style={({ pressed }) => ({
							flexDirection: 'row',
							alignItems: 'center',
							marginBottom: 10,
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Icon
							name={isChecked ? 'checkbox' : 'square-outline'}
							size={24}
							color={isChecked ? theme.colors.light.primary : '#999'}
						/>
						<Text style={{ marginLeft: 10 }}>{item.value}</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

CheckBoxGroup.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			value: PropTypes.string.isRequired,
		})
	).isRequired,
	selectedIds: PropTypes.array,
	onChange: PropTypes.func.isRequired,
};

CheckBoxGroup.defaultProps = {
	selectedIds: [],
};
