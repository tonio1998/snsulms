import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { CText } from '../common/CText.tsx';

interface CustomDateTimePickerProps {
  label?: string;
  type?: 'date' | 'datetime';
  iconName?: string;
  iconColor?: string;
  initialDateTime?: Date;
  onDateTimeChange: (date: Date) => void;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
                                                                     type = 'date',
                                                                     label = 'Select Date & Time',
                                                                     iconName = 'calendar',
                                                                     iconColor = '#333',
                                                                     initialDateTime,
                                                                     onDateTimeChange,
                                                                   }) => {
  const [date, setDate] = useState(initialDateTime);
  const [open, setOpen] = useState(false);

  const handleConfirm = (selectedDate: Date) => {
    setOpen(false);
    if (selectedDate) {
      setDate(selectedDate);
      onDateTimeChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {label ? <CText style={styles.label} fontSize={16}>{label} {date ? dayjs(date).format('MMM D, YYYY') : ''}</CText> : null}

      <TouchableOpacity style={styles.inputWrapper} onPress={() => setOpen(true)}>
        <Icon name={iconName} size={20} color={iconColor} style={styles.icon} />
        <Text style={styles.text}>{type === 'date' ? dayjs(date).format('MMM D, YYYY') : dayjs(date).format('MMM D, YYYY h:mm A')}</Text>
      </TouchableOpacity>

      <DatePicker
        modal
        mode={type}
        open={open}
        display="default"
        date={date}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ccc',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default CustomDateTimePicker;
