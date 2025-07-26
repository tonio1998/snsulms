import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

interface CTextProps extends TextProps {
    fontSize?: number;
}

export const CTextBold = ({ fontSize = 30, style, ...props }: CTextProps) => {
    return <Text {...props} style={[{ fontFamily: 'Dongle-Bold', fontSize }, style]} />;
};
