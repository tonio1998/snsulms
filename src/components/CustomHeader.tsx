import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext.tsx';
import { APP_NAME, FILE_BASE_URL } from '../api/api_configuration.ts';
import { navigate } from '../utils/navigation.ts';
import { CText } from './CText.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSidebar } from '../context/SidebarContext.tsx';

const CustomHeader = ({
                          title = '',
                          leftContent = null,
                          rightContent = null
                      }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const data = useAuth();
    const user = data.user;
    const handleProfile = async () => {
        navigate('Profile');
    };


    return (
        <View style={styles.header}>
            <View style={styles.left}>
                {/*<TouchableOpacity activeOpacity={.6} onPress={() => setSidebarVisible(true)}>*/}
                {/*    <Icon name={"menu"} color={theme.colors.light.card} size={30} />*/}
                {/*</TouchableOpacity>*/}
                <CText
                    fontSize={30}
                    fontStyle={'SB'}
                    style={{
                        marginLeft: 10,
                        marginTop: 4,
                        color: theme.colors.light.primary,
                        // textShadowColor: theme.colors.light.primary_soft,
                        // textShadowOffset: { width: 1, height: 1 },
                        // textShadowRadius: 10,
                }}
                >{APP_NAME}</CText>
            </View>

            <View style={styles.right}>
                <TouchableOpacity activeOpacity={0.5} onPress={handleProfile}>
                    <Image
                        source={
                            user?.profile_pic
                                ? { uri: `${FILE_BASE_URL}/${user?.profile_pic}` }
                                : user?.avatar
                                    ? { uri: user?.avatar }
                                    : {
                                        uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            user?.name || 'User'
                                        )}&background=random`
                                    }
                        }
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        padding: 4,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    right: {
        width: 40,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: theme.colors.light.primary,
    },
});

export default CustomHeader;
