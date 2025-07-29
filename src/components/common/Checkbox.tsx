// components/Checkbox.tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
export default function Checkbox({ label, checked, onChange }) {
  return (
    <Pressable
      onPress={onChange}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      }}
    >
      <Icon
        name={checked ? 'checkbox-outline' : 'square-outline'}
        size={24}
        color={checked ? '#007BFF' : '#999'}
      />
      <Text style={{ marginLeft: 10 }}>{label}</Text>
    </Pressable>
  );
}
