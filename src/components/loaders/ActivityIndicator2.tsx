import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { theme } from "../../theme";

export default function ActivityIndicator2() {
    const distance = 20; // travel distance

    const dot1X = useRef(new Animated.Value(0)).current;
    const dot2X = useRef(new Animated.Value(distance)).current;
    const dot1Scale = useRef(new Animated.Value(1)).current;
    const dot2Scale = useRef(new Animated.Value(0.6)).current; // start smaller

    useEffect(() => {
        const loopAnim = () => {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(dot1X, {
                        toValue: distance,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    Animated.timing(dot2X, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    // Shrink dot1, grow dot2
                    Animated.timing(dot1Scale, {
                        toValue: 0.6,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    Animated.timing(dot2Scale, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(dot1X, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    Animated.timing(dot2X, {
                        toValue: distance,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    // Grow dot1, shrink dot2
                    Animated.timing(dot1Scale, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    Animated.timing(dot2Scale, {
                        toValue: 0.6,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                ]),
            ]).start(loopAnim);
        };

        loopAnim();
    }, [dot1X, dot2X, dot1Scale, dot2Scale]);

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.dot,
                        {
                            transform: [
                                { translateX: dot1X },
                                { scale: dot1Scale }
                            ]
                        }
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        styles.dot2,
                        {
                            transform: [
                                { translateX: dot2X },
                                { scale: dot2Scale }
                            ]
                        }
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    container: {
        width: 50,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.light.primary,
        position: 'absolute',
    },
    dot2: {
        backgroundColor: theme.colors.light.secondary,
    },
});