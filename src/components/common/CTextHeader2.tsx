import React from 'react';
import { Text, TextProps, View } from 'react-native';

export const CTextHeader2 = (props: TextProps) => {
    return <Text {...props} style={[{ fontFamily: 'Poppins-Bold', fontWeight: 'semibold', fontSize: 24 }, props.style]} />;
};
