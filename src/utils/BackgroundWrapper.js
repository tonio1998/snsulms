import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

const BackgroundWrapper = ({ children }) => {
    return (
        <ImageBackground
            source={require('../../assets/img/main_bg.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            {children}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        // paddingHorizontal: 40,
        justifyContent: 'space-between',
        // paddingTop: 100
    },
});

export default BackgroundWrapper;
