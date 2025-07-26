// components/Sidebar.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Sidebar = ({ onClose }: { onClose: () => void }) => {
    const navigation = useNavigation();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const toggleSubmenu = (menu: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedMenu(expandedMenu === menu ? null : menu);
    };

    const navigateTo = (screen: string) => {
        onClose();
        navigation.navigate(screen as never);
    };

    return (
        <View style={styles.sidebar}>
            <Text style={styles.title}>🚀 My Sidebar</Text>

            <TouchableOpacity style={styles.link} onPress={() => navigateTo('Home')}>
                <Icon name="home-outline" size={20} />
                <Text style={styles.linkText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.link} onPress={() => toggleSubmenu('settings')}>
                <Icon name="settings-outline" size={20} />
                <Text style={styles.linkText}>Settings</Text>
                <Icon
                    name={expandedMenu === 'settings' ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    style={{ marginLeft: 'auto' }}
                />
            </TouchableOpacity>

            {expandedMenu === 'settings' && (
                <View style={styles.subMenu}>
                    <TouchableOpacity onPress={() => navigateTo('Settings')}>
                        <Text style={styles.subText}>General</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.subText}>Account</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity style={styles.link} onPress={() => toggleSubmenu('reports')}>
                <Icon name="analytics-outline" size={20} />
                <Text style={styles.linkText}>Reports</Text>
                <Icon
                    name={expandedMenu === 'reports' ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    style={{ marginLeft: 'auto' }}
                />
            </TouchableOpacity>

            {expandedMenu === 'reports' && (
                <View style={styles.subMenu}>
                    <TouchableOpacity onPress={() => navigateTo('Reports')}>
                        <Text style={styles.subText}>Daily</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.subText}>Monthly</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close-circle-outline" size={30} color="gray" />
            </TouchableOpacity>
        </View>
    );
};

export default Sidebar;

const styles = StyleSheet.create({
    sidebar: {
        width: '80%',
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 16,
        height: '100%',
        position: 'absolute',
        zIndex: 999,
        elevation: 5,
        // margin: 10,
        borderRadius: 20,
        marginLeft: 0,
        borderRightWidth: 1,
        borderColor: '#ccc',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    linkText: {
        marginLeft: 10,
        fontSize: 16,
    },
    subMenu: {
        paddingLeft: 30,
        paddingBottom: 10,
    },
    subText: {
        paddingVertical: 6,
        fontSize: 14,
        color: '#555',
    },
    closeButton: {
        position: 'absolute',
        bottom: 30,
        left: 16,
    },
});
