import React, { useState, useEffect, useRef, forwardRef } from 'react';
import {
    View,
    Text,
    TextInput,
    Switch,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import IconMaterial from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import DateTimePicker from '@react-native-community/datetimepicker';
import gstyle from '../../theme/styles2.ts';
import { CText } from './CText.tsx';
import { theme } from '../../theme';

const isTablet = Dimensions.get('window').width >= 768;

const CInput = forwardRef(({
                               label,
                               type,
                               value,
                               icon,
                               labelColor,
                               numColumns,
                               iconsize,
                               iconcolor,
                               placeholder,
                               placeholderTextColor,
                               onChange,
                               onBlur,
                               haserror,
                               error,
                               options = [],
                               width = isTablet ? 98 : 96.2,
                           }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(options);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showDate2Picker, setShowDate2Picker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDate2, setSelectedDate2] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const handleDateChange = (_, date) => {
        if (date) {
            setSelectedDate(date);
            setShowDatePicker(false);
            setShowTimePicker(true);
        }
    };

    const handleDate2Change = (_, date) => {
        if (date) {
            setSelectedDate2(date);
            setShowDate2Picker(false);
        }
    };

    const handleTimeChange = (_, time) => {
        if (time && selectedDate) {
            const combinedDateTime = new Date(selectedDate);
            combinedDateTime.setHours(time.getHours());
            combinedDateTime.setMinutes(time.getMinutes());
            onChange(dayjs(combinedDateTime).format('YYYY-MM-DD HH:mm:ss'));
        }
        setShowTimePicker(false);
    };

    useEffect(() => {
        Animated.timing(animatedLabel, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    return (
        <View style={styles.inputContainer}>
            {(type === 'text' || type === 'number') && (
                <View>
                    <View style={gstyle.row_between}>
                        <CText style={[styles.label, { color: labelColor }]} fontSize={16}>{label}</CText>
                        {error && <CText style={gstyle.textdanger}>{error}</CText>}
                    </View>
                    <View style={styles.inputWrapper}>
                        {icon && (
                            <IconMaterial
                                name={icon}
                                size={iconsize}
                                color={iconcolor}
                                style={styles.icon}
                            />
                        )}
                        <TextInput
                            ref={ref}
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            keyboardType={type === 'number' ? 'numeric' : 'default'}
                            onFocus={() => setIsFocused(true)}
                            onBlur={(e) => {
                                setIsFocused(false);
                                if (onBlur) onBlur(e);
                            }}
                            placeholder={placeholder}
                            placeholderTextColor={placeholderTextColor}
                        />
                    </View>
                </View>
            )}

            {type === 'checkbox' && (
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => onChange(!value)}
                >
                    <View style={[styles.checkbox, value && styles.checkboxChecked]} />
                    <CText style={styles.checkboxLabel}>{label}</CText>
                </TouchableOpacity>
            )}

            {type === 'radio' && (
                <View>
                    <View style={gstyle.row_between}>
                        <CText style={[styles.label, { color: labelColor }]} fontSize={16}>{label}</CText>
                        {error && <CText style={gstyle.textdanger}>{error}</CText>}
                    </View>
                    <View style={styles.radioContainer}>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.radioItem,
                                    value === option.value && styles.radioSelected,
                                    { width: `${(width || 100) / (numColumns || 1)}%` }
                                ]}
                                onPress={() => onChange(option.value)}
                            >
                                <View
                                    style={[
                                        styles.radio,
                                        value === option.value && styles.radioActive
                                    ]}
                                />
                                <CText numberOfLines={1}>{option.label}</CText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {type === 'dropdown' && (
                <View>
                    <CText style={[styles.label, { color: labelColor }]}>{label}</CText>
                    <DropDownPicker
                        open={open}
                        setOpen={setOpen}
                        items={items}
                        setItems={setItems}
                        value={value}
                        listMode="SCROLLVIEW"
                        onChangeValue={onChange}
                        placeholder="Select an option"
                        setValue={(callback) => {
                            const selectedValue = callback(value);
                            onChange(selectedValue);
                        }}
                        containerStyle={{ height: 50 }}
                        style={styles.dropdown}
                        dropDownStyle={{ backgroundColor: '#fafafa' }}
                    />
                </View>
            )}

            {type === 'switch' && (
                <View style={styles.switchContainer}>
                    <CText style={[styles.label, { color: labelColor }]}>{label}</CText>
                    <Switch value={value} onValueChange={onChange} />
                    {error && <Text style={gstyle.textdanger}>* {error}</Text>}
                </View>
            )}

        </View>
    );
});

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 20,
    },
    datetimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
        marginTop: 5,
    },
    label: {
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    input: {
        flex: 1,
        fontSize: 16,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    icon: {
        marginRight: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: 'gray',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: 'blue',
    },
    checkboxLabel: {
        fontSize: 15,
    },
    radioContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
        margin: 3,
        borderWidth: 1,
        borderColor: 'lightgray',
    },
    radioSelected: {
        borderColor: theme.colors.light.primary,
    },
    radio: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 10,
        marginRight: 10,
    },
    radioActive: {
        backgroundColor: theme.colors.light.primary,
        borderColor: theme.colors.light.primary,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        backgroundColor: 'white',
    },
});

export default CInput;
