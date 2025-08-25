import React from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import {theme} from "../theme";

const { height } = Dimensions.get('window');

type HeaderBackgroundProps = {
    heightRatio?: number;
    style?: ViewStyle;
    borderRadius?: number;
};

const HeaderBackground: React.FC<HeaderBackgroundProps> = ({
                                                               heightRatio = 0.25,
                                                               style,
    borderRadius = 0,
                                                           }) => {

    return (
        <View
            style={[
                styles.container,
                {
                    height: height * heightRatio,
                    backgroundColor: theme.colors.light.primary,
                    borderBottomLeftRadius: borderRadius,
                    borderBottomRightRadius: borderRadius,
                },
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        // borderBottomLeftRadius: 10,
        // borderBottomRightRadius: 10,
        elevation: 0,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
    },
});

export default HeaderBackground;
