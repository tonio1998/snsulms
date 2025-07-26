import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { CText } from './CText';
import { theme } from '../theme';

interface LoadingProps {
    loading: boolean;
    text?: string;
    timeout?: number; // optional timeout in ms (default: 10s)
    onTimeout?: (errorMessage: string) => void; // optional callback on fail
}

const Ball = ({ delay }: { delay: number }) => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -12,
                    duration: 400,
                    delay,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.ball,
                {
                    transform: [{ translateY }],
                    backgroundColor: theme.colors.light.primary,
                },
            ]}
        />
    );
};

const Loading: React.FC<LoadingProps> = ({ loading, text, timeout = 6000, onTimeout }) => {
    const [shouldShow, setShouldShow] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (loading) {
            setShouldShow(true);

            timeoutRef.current = setTimeout(() => {
                NetInfo.fetch().then(state => {
                    const message = !state.isConnected
                        ? 'No internet connection.'
                        : 'Server took too long to respond.';

                    setShouldShow(false);
                    if (onTimeout) onTimeout(message);
                });
            }, timeout);
        } else {
            setShouldShow(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [loading]);

    if (!shouldShow) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.loaderBox}>
                <View style={styles.ballRow}>
                    <Ball delay={0} />
                    <Ball delay={150} />
                    <Ball delay={300} />
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
        backgroundColor: 'rgba(0,0,0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    loaderBox: {
        backgroundColor: '#fff',
        paddingVertical: 25,
        paddingHorizontal: 100,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        gap: 16,
    },
    ballRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 12,
        height: 24,
    },
    ball: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    text: {
        marginTop: 8,
        textAlign: 'center',
        color: theme.colors.light.primary,
    },
});

export default Loading;
