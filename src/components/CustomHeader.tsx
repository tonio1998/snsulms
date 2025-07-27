import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext.tsx';
import { APP_NAME, FILE_BASE_URL } from '../api/api_configuration.ts';
import { navigate } from '../utils/navigation.ts';
import { CText } from './CText.tsx';
import { getAcademicInfo } from '../utils/getAcademicInfo.ts';
import { formatAcad } from '../utils/format.ts';

const CustomHeader = ({ title = '', leftContent = null, rightContent = null }) => {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [acad, setAcad] = useState(null);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                const acadInfo = await getAcademicInfo();
                setAcad(acadInfo);
            })();
        }, [])
    );

    const handleProfile = () => navigate('Profile');
    const handleAcad = () => navigation.navigate('AcademicYear');

    return (
        <View style={styles.header}>
            <View style={styles.left}>
                <CText
                    fontSize={30}
                    fontStyle="SB"
                    style={styles.appName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {APP_NAME}
                </CText>
                {leftContent}
            </View>

            <View style={styles.right}>
                <TouchableOpacity onPress={handleAcad} style={styles.acadBtn} activeOpacity={0.7}>
                    <CText fontSize={14} fontStyle="SB" numberOfLines={1} style={styles.acadText}>
                        {formatAcad(acad?.semester, acad?.from, acad?.to)}
                    </CText>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleProfile} activeOpacity={0.7} style={styles.avatarWrapper}>
                    <Image
                        source={
                            user?.profile_pic
                                ? { uri: `${FILE_BASE_URL}/${user.profile_pic}` }
                                : user?.avatar
                                    ? { uri: user.avatar }
                                    : {
                                        uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            user?.name || 'User'
                                        )}&background=random`,
                                    }
                        }
                        style={styles.avatar}
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                {rightContent}
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
        paddingHorizontal: 16,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
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
        overflow: 'hidden',
    },
    appName: {
        color: theme.colors.light.card,
        marginLeft: 10,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 200,
        justifyContent: 'flex-end',
    },
    acadBtn: {
        maxWidth: 150,
        marginRight: 16,
    },
    acadText: {
        marginTop: 2,
        color: theme.colors.light.card,
    },
    avatarWrapper: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: theme.colors.light.primary,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 19,
    },
});

export default CustomHeader;
