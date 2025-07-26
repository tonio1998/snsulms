import React from 'react';
import { Text, TextProps, View } from 'react-native';

export const CTextHeader1 = (props: TextProps) => {
    return <Text {...props} style={[{ fontFamily: 'Poppins-Bold', fontWeight: 'bold', fontSize: 32 }, props.style]} />;
};
