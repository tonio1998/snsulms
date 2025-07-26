import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
    Image,
} from 'react-native';
import { CText } from './CText';
import { theme } from '../theme';

interface LoadingProps {
    loading: boolean;
    text?: string;
}

const Dot = ({ delay, color }: { delay: number; color: string }) => {
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 400,
                    delay,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(scale, {
                    toValue: 0.2,
                    duration: 400,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.dot,
                {
                    transform: [{ scale }],
                    backgroundColor: color,
                },
            ]}
        />
    );
};

const Loading: React.FC<LoadingProps> = ({ loading, text }) => {
    if (!loading) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.loaderContainer}>
                <View style={styles.dotRow}>
                    <Dot delay={0} color="#60a5fa" />
                    <Dot delay={200} color="#2563eb" />
                    <Dot delay={400} color="#facc15" />
                </View>

                {text && (
                    <CText fontSize={14} numberOfLines={2} style={styles.text}>
                        {text}
                    </CText>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    loaderContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 24,
        paddingHorizontal: 36,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        alignItems: 'center',
        gap: 16,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 8,
    },
    dotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 9999,
    },
    text: {
        marginTop: 12,
        textAlign: 'center',
    },
});

export default Loading;
