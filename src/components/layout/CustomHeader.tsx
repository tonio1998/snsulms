import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Image,
    StatusBar,
    Platform,
    Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';
import { globalStyles } from '../../theme/styles';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME, FILE_BASE_URL } from '../../../env';
import { navigate } from '../../utils/navigation';
import { CText } from '../common/CText';
import { getAcademicInfo } from '../../utils/getAcademicInfo';
import { formatAcad } from '../../utils/format';

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
        return { key: `circle-${index}`, size, top, left };
    });
};

const CustomHeader = ({ title = '', leftContent = null, rightContent = null }) => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [acad, setAcad] = useState(null);
    const circles = useMemo(() => generateCircles(), []);

    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const scaleAnim = useMemo(() => new Animated.Value(0.8), []);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                const acadInfo = await getAcademicInfo();
                setAcad(acadInfo);
            })();

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    useNativeDriver: true,
                }),
            ]).start();
        }, [fadeAnim, scaleAnim])
    );

    const handleProfile = () => navigate('Profile');
    const handleAcad = () => navigation.navigate('AcademicYear');

    return (
        <>
            <LinearGradient
                colors={[theme.colors.light.primary, 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradientBg}
            >
                {circles.map(({ key, size, top, left }) => (
                    <Animated.View
                        key={key}
                        style={[
                            styles.circle,
                            {
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                top,
                                left,
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    />
                ))}
            </LinearGradient>

            <View style={styles.header}>
                <View style={styles.leftSection}>
                    <CText
                        fontSize={26}
                        fontStyle="SB"
                        style={[styles.appName, globalStyles.shadowText]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {APP_NAME}
                    </CText>
                    {leftContent}
                </View>

                <View style={styles.rightSection}>
                    <TouchableOpacity
                        onPress={handleAcad}
                        style={styles.acadBtn}
                        activeOpacity={0.85}
                    >
                        <CText
                            fontSize={13}
                            fontStyle="SB"
                            numberOfLines={1}
                            style={styles.acadText}
                        >
                            {formatAcad(acad?.semester, acad?.from, acad?.to)}
                        </CText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleProfile}
                        activeOpacity={0.8}
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
                        />
                    </TouchableOpacity>

                    {rightContent}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    gradientBg: {
        height: 120,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    circle: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appName: {
        color: theme.colors.light.card,
        marginRight: 10,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    acadBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 12,
    },
    acadText: {
        color: theme.colors.light.text,
    },
    avatarWrapper: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: theme.colors.light.primary,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
});

export default CustomHeader;
