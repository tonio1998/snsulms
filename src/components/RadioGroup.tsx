import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface RadioGroupProps {
    options: string[];
    selected?: string;
    initialValue?: string; // optional prop
    onChange: (value: string) => void;
    columns?: number;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
                                                   options,
                                                   selected,
                                                   initialValue,
                                                   onChange,
                                                   columns = 1,
                                               }) => {
    const [value, setValue] = React.useState(initialValue || selected || '');

    React.useEffect(() => {
        if (selected !== undefined) setValue(selected);
    }, [selected]);

    const handlePress = (option: string) => {
        setValue(option);
        onChange(option);
    };
    
    const buttonWidth = `${100 / columns}%`;
    
    return (
        <View style={styles.container}>
            {options.map(option => (
                <TouchableOpacity
                    key={option}
                    style={[styles.radioButton, { width: buttonWidth }]} // ⬅️ Apply width
                    onPress={() => handlePress(option)}
                >
                    <View style={[styles.outerCircle, value === option && styles.selectedOuter]}>
                        {value === option && <View style={styles.innerCircle} />}
                    </View>
                    <Text style={styles.label}>{option}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default RadioGroup;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap', // ➕ Allow multiple rows
        marginVertical: 16,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    outerCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#777',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    selectedOuter: {
        borderColor: theme.colors.light.primary,
    },
    innerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.light.primary,
    },
    label: {
        fontSize: 16,
    },
});
