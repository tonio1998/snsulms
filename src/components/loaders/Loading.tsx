import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
    Text,
    ActivityIndicator,
    Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {theme} from "../../theme";

interface LoadingProps {
    loading: boolean;
    timeout?: number;
    onTimeout?: (errorMessage: string) => void;
}

const Loading: React.FC<LoadingProps> = ({
                                             loading,
                                             timeout = 6000,
                                             onTimeout,
                                         }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fadeIn = () => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const fadeOut = () => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        if (loading) {
            fadeIn();

            timeoutRef.current = setTimeout(() => {
                NetInfo.fetch().then(state => {
                    const message = !state.isConnected
                        ? 'No internet connection.'
                        : 'Server is not responding.';

                    if (onTimeout) onTimeout(message);
                });
            }, timeout);
        } else {
            fadeOut();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [loading]);

    if (!loading) return null;

    return (
        <Animated.View style={[styles.overlay, { opacity }]}>
            <View style={styles.loaderContainer}>
                <ActivityIndicator
                    size="large"
                    color={theme.colors.light.primary}
                />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        zIndex: 9999,
    },
    loaderContainer: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        paddingVertical: 20,
        paddingHorizontal: 30,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        // elevation: 5,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

export default Loading;
