import React, {useCallback, useMemo, useState} from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Image,
    StatusBar,
    Text,
    Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext.tsx';
import { APP_NAME, FILE_BASE_URL } from '../../../env.ts';
import { navigate } from '../../utils/navigation.ts';
import { CText } from '../common/CText.tsx';
import { getAcademicInfo } from '../../utils/getAcademicInfo.ts';
import { formatAcad } from '../../utils/format.ts';
import LinearGradient from 'react-native-linear-gradient';
import {globalStyles} from "../../theme/styles.ts";

const generateCircles = (count = 4) => {
    const fixedPositions = [
        { top: 20, left: 20 },
        { top: 20, left: 100 },
        { top: 10, left: 200 },
        { top: 20, left: 250 },
    ];

    return Array.from({ length: count }).map((_, index) => {
        const size = Math.floor(Math.random() * 40) + 70;
        const { top, left } = fixedPositions[index] || { top: 0, left: 0 };

        return {
            key: `circle-${index}`,
            size,
            top,
            left,
        };
    });
};


const CustomHeader = ({ title = '', leftContent = null, rightContent = null }) => {
    const navigation = useNavigation();
    const circles = useMemo(() => generateCircles(), []);
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
        <>
            <StatusBar
                barStyle="light-content"
                translucent={false}
                backgroundColor="transparent"
            />

            <LinearGradient
                colors={[theme.colors.light.primary, 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.statusBarBackground}
            >
                {circles.map(({ key, size, top, left }) => (
                    <View
                        key={key}
                        style={{
                            position: 'absolute',
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            top,
                            left,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        }}
                    />
                ))}
            </LinearGradient>

            <View style={styles.header}>
                <View style={styles.left}>
                    <CText
                        fontSize={30}
                        fontStyle="SB"
                        style={[
                            styles.appName,
                            globalStyles.shadowText
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {APP_NAME}
                    </CText>
                    {leftContent}
                </View>

                <View style={styles.right}>
                    <TouchableOpacity
                        onPress={handleAcad}
                        style={styles.acadBtn}
                        activeOpacity={0.7}
                    >
                        <CText
                            fontSize={14}
                            fontStyle="SB"
                            numberOfLines={1}
                            style={styles.acadText}
                        >
                            {formatAcad(acad?.semester, acad?.from, acad?.to)}
                        </CText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleProfile}
                        activeOpacity={0.7}
                        style={styles.avatarWrapper}
                    >
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
        </>
    );
};

const styles = StyleSheet.create({
    gradientContainer: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },

    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    statusBarSpacer: {
        alignItems: 'center',
        paddingBottom: 4,
    },

    statusBarBackground: {
        // height: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
        height: 120,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    header: {
        position: 'absolute',
        top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        color: theme.colors.light.text,
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
