import React from 'react';
import { Text, TextProps, View } from 'react-native';

export const CTextHeader4 = (props: TextProps) => {
    return <Text {...props} style={[{ fontFamily: 'Dongle-Regular', fontSize: 30 }, props.style]} />;
};
