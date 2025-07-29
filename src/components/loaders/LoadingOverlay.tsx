import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';

const LoadingOverlay = ({ message = 'Loading...' }) => {
    return (
        <>
        <View style={styles.overlay}>
            <View style={[styles.loaderContainer]}>
                <ActivityIndicator size="large" color={theme.colors.light.primary} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </View>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 9999,
    },

    message: {
        marginTop: 10,
        color: '#fff',
        fontSize: 16,
    },
     loaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        maxWidth: '80%',
    },
});

export default LoadingOverlay;
