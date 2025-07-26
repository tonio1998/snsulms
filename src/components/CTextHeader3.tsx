import React from 'react';
import { Text, TextProps, View } from 'react-native';

export const CTextHeader3 = (props: TextProps) => {
    return <Text {...props} style={[{ fontFamily: 'Dongle-Bold', fontSize: 38 }, props.style]} />;
};
