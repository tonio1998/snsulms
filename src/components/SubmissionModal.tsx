import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const SubmissionModal = ({
                                    visible,
                                    onClose,
                                    link,
                                    setLink,
                                    onFileSelect,
                                    onSubmitLink,
                                    uploading,
                                }) => {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Choose Submission Type</Text>

                    <TouchableOpacity style={styles.optionBtn} onPress={onFileSelect} disabled={uploading}>
                        <Icon name="document-text-outline" size={20} color="#333" />
                        <Text style={styles.optionText}>
                            {uploading ? 'Uploading...' : 'Upload PDF or Image (max 10MB)'}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.linkLabel}>Or submit a link:</Text>
                        <TextInput
                            placeholder="https://example.com"
                            value={link}
                            onChangeText={setLink}
                            style={styles.input}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={styles.submitBtn} onPress={onSubmitLink}>
                            <Text style={styles.submitBtnText}>Submit Link</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 10,
    },
    optionText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    linkLabel: {
        fontSize: 14,
        marginBottom: 6,
        color: '#333',
    },
    input: {
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderRadius: 8,
    },
    submitBtn: {
        backgroundColor: '#28a745',
        padding: 12,
        marginTop: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    cancelBtn: {
        marginTop: 20,
        alignItems: 'center',
    },
    cancelText: {
        color: 'red',
        fontSize: 14,
    },
});
