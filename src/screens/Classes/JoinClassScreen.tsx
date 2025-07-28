import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    StyleSheet,
} from 'react-native';
import { globalStyles } from '../../theme/styles.ts';
import { theme } from '../../theme';
import CustomHeader from '../../components/CustomHeader.tsx';
import { CText } from '../../components/CText.tsx';
import { joinClassByCode } from '../../api/modules/classesApi.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { useLoading } from '../../context/LoadingContext.tsx';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import {useAlert} from "../../components/CAlert.tsx";

const JoinClassScreen = ({ navigation }) => {
    const [classCode, setCode] = useState('');
    const { showLoading, hideLoading } = useLoading();
    const { showAlert } = useAlert();
    const network = useContext(NetworkContext);

    const handleJoinClass = async () => {
        if (!classCode.trim()) {
            Alert.alert('Hold up', 'Please enter a valid class code.');
            return;
        }

        if (!network?.isOnline) {
            Alert.alert('No Internet', 'You need to be online to join a class.');
            return;
        }

        try {
            showLoading('Joining class...');
            const res = await joinClassByCode(classCode.trim());
            console.log('res', res);
            if(res.success) {
                showAlert('success', 'Success', 'You’ve successfully joined the class!');
                navigation.goBack();
            } else {
                showAlert('error', 'Error', res.message);
            }
        } catch (error) {
            handleApiError(error, 'Failed to join class');
        } finally {
            hideLoading();
        }
    };

    return (
        <>
            <CustomHeader title="Join Class" />
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={styles.container}>
                    <CText fontStyle="B" fontSize={16} style={styles.label}>
                        Enter the class code provided by your teacher
                    </CText>

                    <TextInput
                        style={styles.input}
                        placeholder="e.g., ABC123"
                        placeholderTextColor="#999"
                        value={classCode}
                        onChangeText={setCode}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleJoinClass}>
                        <CText fontStyle="B" fontSize={16} style={{ color: '#fff' }}>
                            Join
                        </CText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    label: {
        marginBottom: 12,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 14,
        fontSize: 18,
        backgroundColor: '#fff',
        color: '#000',
        textAlign: 'center',
        letterSpacing: 2,
    },
    button: {
        backgroundColor: theme.colors.light.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
});

export default JoinClassScreen;
