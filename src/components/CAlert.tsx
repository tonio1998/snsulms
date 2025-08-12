import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
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
    const [alertData, setAlertData] = useState<AlertData>({ icon: 'neutral', title: '', message: '' });
    const scaleAnim = useState(new Animated.Value(0.8))[0];
    const opacityAnim = useState(new Animated.Value(0))[0];

    const showAlert = (icon: AlertStatus, title: string, message: string, duration?: number) => {
        setAlertData({ icon, title, message, duration });
        setVisible(true);
    };

    const hideAlert = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => setVisible(false));
    };

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(scaleAnim, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        }

        if (visible && alertData.duration !== undefined) {
            const timer = setTimeout(hideAlert, alertData.duration);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const getIconProps = () => {
        switch (alertData.icon) {
            case 'success': return { name: 'checkmark-circle', color: theme.colors.light.primary, borderColor: theme.colors.light.primary, bg: '#E8F8F0' };
            case 'error': return { name: 'close-circle', color: '#FF3B30', borderColor: '#FF3B30', bg: '#FDECEC' };
            case 'info': return { name: 'information-circle', color: '#007AFF', borderColor: '#007AFF', bg: '#E7F0FD' };
            case 'warning': return { name: 'alert-circle', color: '#FF9500', borderColor: '#FF9500', bg: '#FFF4E5' };
            default: return { name: 'help-circle', color: '#8E8E93', borderColor: '#8E8E93', bg: '#F1F1F2' };
        }
    };

    const { name, color, borderColor, bg } = getIconProps();

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Modal transparent visible={visible} animationType="fade">
                <View style={styles.overlay}>
                    <Animated.View style={[styles.alertBox, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
                        <View style={[styles.iconWrapper, { backgroundColor: bg }]}>
                            <Icon name={name} size={60} color={color} />
                        </View>
                        <Text style={styles.title}>{alertData.title}</Text>
                        <Text style={styles.message}>{alertData.message}</Text>
                        <TouchableOpacity
                            onPress={hideAlert}
                            style={[styles.button, { backgroundColor: color }]}
                        >
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};

export const useAlert = (): AlertContextType => {
    const context = useContext(AlertContext);
    if (!context) throw new Error('useAlert must be used within a CAlert provider');
    return context;
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 20,
    },
    alertBox: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    iconWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 25,
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});
