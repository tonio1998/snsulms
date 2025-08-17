import { NetworkContext } from "../../context/NetworkContext.tsx";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useAlert } from "../../components/CAlert.tsx";
import {
    Alert,
    Animated,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Vibration,
    PermissionsAndroid,
    Platform,
    FlatList,
    RefreshControl,
    Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomHeader from "../../components/layout/CustomHeader.tsx";
import { Camera } from "react-native-camera-kit";
import { useAuth } from "../../context/AuthContext.tsx";
import { globalStyles } from "../../theme/styles.ts";
import { useClass } from "../../context/SharedClassContext.tsx";
import { saveAttendanceOffline, syncOfflineAttendance } from "../../utils/sqlite/attendanceStorage";
import { handleApiError } from "../../utils/errorHandler.ts";
import { CText } from "../../components/common/CText.tsx";
import Icon from "react-native-vector-icons/Ionicons";
import CustomHeader2 from "../../components/layout/CustomHeader2.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";

export default function ClassAttendanceScanScreen() {
    const { classes } = useClass();
    const ClassID = classes.ClassID;
    const { user } = useAuth();
    const network = useContext(NetworkContext);
    const isFocused = useIsFocused();
    const { showAlert } = useAlert();

    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [recentScans, setRecentScans] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const scannedRef = useRef(false);
    const cameraRef = useRef(null);
    const flatListRef = useRef(null);

    const SCAN_BOX_SIZE = 220;

    useFocusEffect(
        useCallback(() => {
            fetchRecentScans();
            if (network?.isOnline) syncOfflineAttendance();
        }, [network?.isOnline])
    );

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: SCAN_BOX_SIZE,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        const requestPermission = async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );
                setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
            } else {
                setHasPermission(true);
            }
        };
        requestPermission();
    }, []);

    useEffect(() => {
        if (isFocused) {
            scannedRef.current = false;
            setScanned(false);
        }
    }, [isFocused]);

    const fetchRecentScans = async () => {
        try {
            const key = `recentScan_${user?.id}_${ClassID}`;
            const stored = await AsyncStorage.getItem(key);
            const list = stored ? JSON.parse(stored) : [];
            setRecentScans(list);
        } catch (e) {
            console.error("Failed to fetch recent scans", e);
        }
    };

    const storeRecentScan = async (qr_code) => {
        const key = `recentScan_${user?.id}_${ClassID}`;
        try {
            const stored = await AsyncStorage.getItem(key);
            const list = stored ? JSON.parse(stored) : [];
            const updatedList = [qr_code, ...list.filter(i => i !== qr_code)].slice(0, 10);
            await AsyncStorage.setItem(key, JSON.stringify(updatedList));
            setRecentScans(updatedList);
        } catch (e) {
            console.error("Failed to store scan locally", e);
        }
    };

    const onBarcodeRead = async (event) => {
        if (scannedRef.current) return;
        scannedRef.current = true;
        setScanned(true);

        const { codeStringValue } = event.nativeEvent;
        if (!codeStringValue) return;

        const [qr_code] = codeStringValue.split('@');
        Vibration.vibrate(100);

        try {
            console.log("qr_code: ", qr_code)
            await saveAttendanceOffline({
                student_id: qr_code,
                class_id: ClassID,
                user_id: user?.id,
                scanned_at: new Date().toISOString(),
            });
            await storeRecentScan(qr_code);

            if (network?.isOnline) {
                await syncOfflineAttendance();
            } else {
                showAlert("success", "Attendance saved offline and will sync automatically.", "warning");
            }

        } catch (err) {
            handleApiError(err, "QR Scan Error");
        } finally {
            setTimeout(() => {
                scannedRef.current = false;
                setScanned(false);
            }, 2000);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRecentScans();
        if (network?.isOnline) await syncOfflineAttendance();
        setRefreshing(false);
    };

    const scannedStudentID = recentScans[0];

    const renderItem = ({ item }) => {
        const isScanned = item.details?.StudentID === scannedStudentID;

        return (
            <View style={styles.card}>
                <Image
                    source={{
                        uri:
                            item.details?.user?.profile_pic ||
                            item.details?.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.details?.user?.name || 'User')}&background=random`,
                    }}
                    style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                    <CText style={styles.name} fontStyle="SB" fontSize={14.5}>
                        {item.details?.FirstName} {item.details?.LastName}
                    </CText>
                    <CText style={styles.email}>{item.details?.user?.email}</CText>
                </View>

                {isScanned && (
                    <Icon name="checkmark-circle" size={24} color="green" style={{ marginLeft: 8 }} />
                )}
            </View>
        );
    };

    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    return (
        <>
            {/*<BackHeader title="Scan QR Code" />*/}
            <SafeAreaView style={[globalStyles.safeArea2, {paddingTop: 20}]}>
                {/* STATIC CAMERA */}
                <View style={styles.cameraWrapper}>
                    <View style={styles.cameraContainer}>
                        <Camera
                            ref={cameraRef}
                            cameraType="back"
                            style={styles.camera}
                            scanBarcode
                            onReadCode={onBarcodeRead}
                            showFrame={false}
                        />
                        <Animated.View
                            style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]}
                        />
                    </View>
                </View>

                {/* SCROLLABLE STUDENT LIST */}
                <FlatList
                    ref={flatListRef}
                    data={classes.students}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<CText style={styles.emptyText}>No data found 😶</CText>}
                    contentContainerStyle={{ flexGrow: classes.students.length === 0 ? 1 : 0 }}
                />
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    cameraContainer: {
        width: 250,
        height: 250,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: 'limegreen',
        backgroundColor: '#000',
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    scanLine: {
        position: 'absolute',
        width: '90%',
        left: '5%',
        height: 4,
        backgroundColor: 'lime',
        borderRadius: 2,
        elevation: 10,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 10,
        marginHorizontal: 16,
        borderRadius: 8,
        elevation: 2,
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    name: {
        color: '#111',
    },
    email: {
        fontSize: 12,
        color: '#555',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});
