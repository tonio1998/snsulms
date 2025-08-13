import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import {theme} from "../../theme";
import Icon from "react-native-vector-icons/Ionicons";
import {CText} from "./CText.tsx";

const ProgressBar = ({ percent }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: percent,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [percent]);

    const barColor =
        percent < 50 ? '#ef4444' : percent < 80 ? '#facc15' : theme.colors.light.primary;

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
                <Icon name="checkmark-done" size={16} color={barColor} />
                <CText fontSize={13} fontStyle="SB" style={{ color: '#111' }}>
                    {percent}%  have submitted
                </CText>
            </View>
            <View style={styles.progressBarBg}>
                <Animated.View
                    style={[
                        styles.progressBarFill,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: barColor,
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        marginTop: 10,
        width: '100%',
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    progressBarBg: {
        height: 3,
        backgroundColor: '#e5e7eb',
        borderRadius: theme.radius.xs,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: theme.radius.xs,
    },
});

export default ProgressBar;
