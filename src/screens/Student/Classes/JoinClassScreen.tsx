import React, { useState, useContext } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import CustomHeader from '../../../components/layout/CustomHeader.tsx';
import { CText } from '../../../components/common/CText.tsx';
import { joinClassByCode } from '../../../api/modules/classesApi.ts';
import { handleApiError } from '../../../utils/errorHandler.ts';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { NetworkContext } from '../../../context/NetworkContext.tsx';
import { useAlert } from '../../../components/CAlert.tsx';
import BackHeader from "../../../components/layout/BackHeader.tsx";

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
            if (res.success) {
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
            <BackHeader title="Join Class" />
            <SafeAreaView style={globalStyles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.wrapper}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.container}>
                        <CText fontStyle="B" fontSize={18} style={styles.label}>
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

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleJoinClass}
                            activeOpacity={0.85}
                        >
                            <CText fontStyle="B" fontSize={16} style={styles.buttonText}>
                                Join
                            </CText>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    label: {
        marginBottom: 16,
        textAlign: 'center',
        color: theme.colors.light.primary,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.light.primary,
        borderRadius: theme.radius.sm,
        paddingVertical: 14,
        paddingHorizontal: 18,
        fontSize: 18,
        backgroundColor: '#fff',
        color: '#000',
        textAlign: 'center',
        letterSpacing: 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
    },
    button: {
        backgroundColor: theme.colors.light.primary,
        paddingVertical: 14,
        borderRadius: theme.radius.sm,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: theme.colors.light.primary,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
    },
});

export default JoinClassScreen;
