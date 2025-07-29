import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
    Text, ToastAndroid,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { theme } from '../../theme';

interface LoadingProps {
    loading: boolean;
    timeout?: number; // Optional timeout in ms, default: 6000
    onTimeout?: (errorMessage: string) => void;
    bottom?: number; // Optional bottom offset, default: 65
}

const Loading: React.FC<LoadingProps> = ({
                                             loading,
                                             timeout = 6000,
                                             onTimeout,
                                             bottom = 65,
                                         }) => {
    const [shouldShow, setShouldShow] = useState(false);
    const translateX = useRef(new Animated.Value(-100)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    const startIndeterminateAnimation = () => {
        translateX.setValue(-300);
        animationRef.current = Animated.loop(
            Animated.timing(translateX, {
                toValue: 500,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        animationRef.current.start();
    };

    useEffect(() => {
        if (loading) {
            // ToastAndroid.show('Opening file...' + bottom, ToastAndroid.SHORT);
            setShouldShow(true);
            startIndeterminateAnimation();

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
            if (animationRef.current) {
                animationRef.current.stop();
            }
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (animationRef.current) animationRef.current.stop();
        };
    }, [loading]);

    if (!shouldShow) return null;

    return (
        <View style={[styles.progressContainer]}>
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        transform: [{ translateX }],
                        backgroundColor: theme.colors.light.primary,
                    },
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
        bottom: 65,
        height: 4,
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
        zIndex: 9999,
    },
    indicator: {
        width: 100,
        height: '100%',
        borderRadius: 2,
    },
});

export default Loading;
