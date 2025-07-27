import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';

const { width } = Dimensions.get('window');

export const GlassmorphicCard = ({ title, icon }) => {
    return (
        <View style={styles.cardWrapper}>
            {Platform.OS === 'ios' ? (
                <BlurView
                    style={styles.card}
                    blurType="light"
                    blurAmount={20}
                    reducedTransparencyFallbackColor="white"
                >
                    <CardContent title={title} icon={icon} />
                </BlurView>
            ) : (
                <View style={[styles.card, styles.androidFallback]}>
                    <CardContent title={title} icon={icon} />
                </View>
            )}
        </View>
    );
};

const CardContent = ({ title, icon }) => (
    <>
        <View style={styles.iconContainer}>
            <Image source={icon} style={styles.icon} />
        </View>
        <Text style={styles.label}>{title}</Text>
    </>
);

const styles = StyleSheet.create({
    cardWrapper: {
        width: width / 4,
        height: width / 4,
        borderRadius: 20,
        overflow: 'hidden',
        margin: 10,
    },

    card: {
        flex: 1,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },

    androidFallback: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },

    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },

    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});
