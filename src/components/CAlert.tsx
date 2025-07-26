import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme';

type AlertStatus = 'success' | 'error' | 'info' | 'warning' | 'neutral';

interface AlertContextType {
    showAlert: (icon: AlertStatus, title: string, message: string, duration?: number) => void;
}

interface AlertData {
    icon: AlertStatus;
    title: string;
    message: string;
    duration?: number;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const CAlert: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [alertData, setAlertData] = useState<AlertData>({
        icon: 'neutral',
        title: '',
        message: '',
    });

    const showAlert = (icon: AlertStatus, title: string, message: string, duration?: number) => {
        setAlertData({ icon, title, message, duration });
        setVisible(true);
    };

    const hideAlert = () => setVisible(false);

    useEffect(() => {
        if (visible && alertData.duration !== undefined) {
            const timer = setTimeout(() => {
                hideAlert();
            }, alertData.duration || 0);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const getIconProps = () => {
        switch (alertData.icon) {
            case 'success':
                return {
                    name: 'checkmark-circle',
                    color: theme.colors.light.secondary,
                    borderColor: theme.colors.light.secondary,
                };
            case 'error':
                return {
                    name: 'close-circle',
                    color: '#FF3B30',
                    borderColor: '#FF3B30',
                };
            case 'info':
                return {
                    name: 'information-circle',
                    color: '#007AFF',
                    borderColor: '#007AFF',
                };
            case 'warning':
                return {
                    name: 'alert-circle',
                    color: '#FF9500',
                    borderColor: '#FF9500',
                };
            case 'neutral':
            default:
                return {
                    name: 'help-circle',
                    color: '#8E8E93',
                    borderColor: '#8E8E93',
                };
        }
    };

    const { name, color, borderColor } = getIconProps();

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Modal transparent visible={visible} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.alertBox}>
                        <View style={styles.iconWrapper}>
                            <View style={[styles.iconCircle, { borderColor }]}>
                                <Icon name={name} size={60} color={color} />
                            </View>
                        </View>
                        <Text style={styles.title}>{alertData.title}</Text>
                        <Text style={styles.message}>{alertData.message}</Text>
                        <TouchableOpacity onPress={hideAlert} style={styles.button}>
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};

export const useAlert = (): AlertContextType => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within a CAlert provider');
    }
    return context;
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(28,28,30,0.8)',
    },
    alertBox: {
        width: 280,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        paddingTop: 30,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconWrapper: {
        marginBottom: 10,
    },
    iconCircle: {
        borderRadius: 100,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C1C1E',
        textAlign: 'center',
        marginBottom: 6,
    },
    message: {
        fontSize: 15,
        color: '#3A3A3C',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#EFEFF4',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    buttonText: {
        fontSize: 17,
        color: '#000',
        fontWeight: '600',
        textAlign: 'center',
    },
});
