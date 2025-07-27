// screens/Grades/GradesScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CText } from '../../components/CText.tsx';

const GradesScreen = () => {
    return (
        <View style={styles.container}>
            <CText fontSize={20} fontStyle="B">Your Grades</CText>
            <CText style={{ marginTop: 8 }}>Coming soon...</CText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    }
});

export default GradesScreen;
