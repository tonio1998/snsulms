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
import Icon from "react-native-vector-icons/Ionicons";
import {BlurView} from "@react-native-community/blur";
import {getGreeting} from "../../utils/greetings";

const generateCircles = (count = 2) => {
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

const CustomHeader2 = ({ title = '', leftContent = null, rightContent = null, style }) => {
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
            <StatusBar
                barStyle="dark-content"
                translucent
                backgroundColor="transparent"
            />
            <View
                colors={[theme.colors.light.primary, 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradientBg}
            >
                {/*{circles.map(({ key, size, top, left }) => (*/}
                {/*    <Animated.View*/}
                {/*        key={key}*/}
                {/*        style={[*/}
                {/*            styles.circle,*/}
                {/*            {*/}
                {/*                width: size,*/}
                {/*                height: size,*/}
                {/*                borderRadius: size / 2,*/}
                {/*                top,*/}
                {/*                left,*/}
                {/*                opacity: fadeAnim,*/}
                {/*                transform: [{ scale: scaleAnim }],*/}
                {/*            },*/}
                {/*        ]}*/}
                {/*    />*/}
                {/*))}*/}
            </View>

            <View style={[styles.headerWrapper, style]}>
                {/*<BlurView*/}
                {/*    style={StyleSheet.absoluteFill}*/}
                {/*    blurType="light"*/}
                {/*    blurAmount={5}*/}
                {/*    reducedTransparencyFallbackColor={theme.colors.light.card}*/}
                {/*/>*/}
                <View style={styles.headerContent}>
                    <View style={styles.leftSection}>
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
                        <View style={{ marginLeft: 10 }}>
                            <CText fontSize={14} style={{ color: '#000'}} fontStyle="SB">{getGreeting()}👋</CText>
                            <CText fontSize={20} style={{ color: '#000'}} fontStyle="SB">{user?.name?.split(" ")[0]}</CText>
                        </View>
                    </View>

                    <View style={styles.rightSection}>
                        <TouchableOpacity
                            onPress={handleAcad}
                            style={styles.acadBtn}
                            activeOpacity={0.85}
                        >
                            <Icon name={'school'} size={25} color={theme.colors.light.primary} />
                        </TouchableOpacity>
                        {rightContent}
                    </View>
                </View>
            </View>

        </>
    );
};

const styles = StyleSheet.create({
    headerWrapper: {
        position: 'absolute',
        top: StatusBar.currentHeight + 5,
        left: 0,
        right: 0,
        paddingHorizontal: 10,
        // borderRadius: 100,
        overflow: 'hidden',
        // zIndex: -9,
        zIndex: 1,
        // borderBottomWidth: 1,
        // borderBottomColor: '#ddd',
        // backgroundColor: theme.colors.light.primary,
    },
    headerContent: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    gradientBg: {
        height: 150,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: -9,
        // backgroundColor: theme.colors.light.primary,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    circle: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        position: 'absolute',
        top: StatusBar.currentHeight + 5,
        left: '3%',
        right: '3%',
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // zIndex: 1,
        borderRadius: 100,
        backgroundColor: theme.colors.light.card,
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
        paddingHorizontal: 11,
        paddingVertical: 10,
        borderRadius: 100,
        backgroundColor: theme.colors.light.primary + '18',
        // marginRight: 12,
    },
    acadText: {
        color: theme.colors.light.primary,
    },
    avatarWrapper: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 0,
        // borderColor: theme.colors.light.primary,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
});

export default CustomHeader2;
