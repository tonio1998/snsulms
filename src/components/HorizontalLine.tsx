import React from 'react';
import { View, StyleSheet } from 'react-native';

const HorizontalLine = () => {
	return <View style={styles.line} />;
};

const styles = StyleSheet.create({
	line: {
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
		marginVertical: 10,
	},
});

export default HorizontalLine;
