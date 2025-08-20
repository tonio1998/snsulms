import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const DonutProgress = ({
                           percentage = 75,
                           radius = 50,
                           strokeWidth = 10,
                           percentTextSize = 18,
                           strokeColor = '#3B82F6'
}) => {
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    return (
        <View style={styles.container}>
            <Svg height={radius * 2} width={radius * 2}>
                <Circle
                    stroke="#e6e6e6"
                    fill="transparent"
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    strokeWidth={strokeWidth}
                />
                <Circle
                    stroke={strokeColor}
                    fill="transparent"
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    originX={radius}
                    originY={radius}
                />
            </Svg>
            <View style={styles.textContainer}>
                <Text style={[styles.text, {fontSize: percentTextSize}]}>{percentage}%</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontWeight: 'bold',
    },
});

export default DonutProgress;
