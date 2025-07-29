import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { theme } from '../../theme';

const currentColors = theme.colors['light'];

interface CTextProps extends TextProps {
    fontSize?: number;
    fontStyle?: 'R' | 'B' | 'SB' | 'L';
}

export const CText = ({
                          fontSize = 13,
                          fontStyle = 'L',
                          style,
                          ...props
                      }: CTextProps) => {
    let fontFamily: string;
    
    switch (fontStyle) {
        case 'B':
            fontFamily = theme.font.bold;
            break;
        case 'SB':
            fontFamily = theme.font.semiBold;
            break;
        case 'R':
            fontFamily = theme.font.regular;
            break;
        case 'L':
        default:
            fontFamily = theme.font.light;
            break;
    }
    
    const textStyle: TextStyle = {
        fontFamily,
        fontSize,
        color: currentColors.text,
    };
    
    return <Text {...props} style={[textStyle, style]} allowFontScaling={false} />;
};
