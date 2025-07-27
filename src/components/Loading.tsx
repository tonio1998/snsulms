import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { theme } from '../theme';

interface LoadingProps {
    loading: boolean;
    timeout?: number; // default: 6000ms
    onTimeout?: (errorMessage: string) => void;
}

const Loading: React.FC<LoadingProps> = ({ loading, timeout = 6000, onTimeout }) => {
    const [shouldShow, setShouldShow] = useState(false);
    const widthAnim = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (loading) {
            setShouldShow(true);
            widthAnim.setValue(0);

            Animated.timing(widthAnim, {
                toValue: 100,
                duration: timeout,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start();

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
            widthAnim.setValue(0); // Reset animation if done early
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [loading]);

    if (!shouldShow) return null;

    const progressBarWidth = widthAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.progressContainer}>
            <Animated.View
                style={[
                    styles.progressBar,
                    { width: progressBarWidth, backgroundColor: theme.colors.light.primary },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 4,
        bottom: 65,
        backgroundColor: '#e0e0e0',
        zIndex: 9999,
    },
    progressBar: {
        height: '100%',
    },
});

export default Loading;
