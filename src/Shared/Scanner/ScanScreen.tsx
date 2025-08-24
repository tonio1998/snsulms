import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Animated,
    FlatList, Vibration, SafeAreaView,
} from "react-native";
import { Camera } from "react-native-camera-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {saveLogs} from "../../api/modules/attendanceApi.ts";
import {handleApiError} from "../../utils/errorHandler.ts";
import {CText} from "../../components/common/CText.tsx";
import {globalStyles} from "../../theme/styles.ts";
import BackHeader from "../../components/layout/BackHeader.tsx";
import {theme} from "../../theme";
import {useLoading} from "../../context/LoadingContext.tsx";
import {useAlert} from "../../components/CAlert.tsx";

export default function QrCodeScannerScreen({ route}) {
    const [scanned, setScanned] = useState(false);
    const [scanHistory, setScanHistory] = useState<any[]>([]);
    const [cameraActive, setCameraActive] = useState(false);
    const AttendanceID = route.params?.AttendanceID;

    const { showLoading, hideLoading } = useLoading();
    const { showAlert } = useAlert();

    const scannedRef = useRef(false);
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    const stopCamera = () => {
        setCameraActive(false);
        scannedRef.current = false;
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
    };

    const resetIdleTimer = () => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        idleTimerRef.current = setTimeout(() => {
            console.log("⏳ Camera auto-stopped due to inactivity");
            stopCamera();
        }, 20000);
    };

    useEffect(() => {
        const loadHistory = async () => {
            const history = await AsyncStorage.getItem("scanHistory_"+AttendanceID);
            if (history) setScanHistory(JSON.parse(history));
        };
        loadHistory();
    }, []);

    useEffect(() => {
        if (cameraActive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanLineAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanLineAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            scanLineAnim.stopAnimation();
        }
    }, [cameraActive]);

    const storeScan = async (code: string) => {
        const newHistory = [{ code, date: new Date() }, ...scanHistory];
        setScanHistory(newHistory);
        await AsyncStorage.setItem("scanHistory_"+AttendanceID, JSON.stringify(newHistory));
    };

    const onBarcodeRead = (event: any) => {
        if (scannedRef.current) return;
        scannedRef.current = true;

        Vibration.vibrate(100);

        const value =
            event?.nativeEvent?.codeStringValue ??
            event?.codeStringValue ??
            "";

        if (value) {
            setScanned(true);
            storeScan(value);
            resetIdleTimer();
        }
    };

    const toggleCamera = () => {
        if (!cameraActive) {
            setCameraActive(true);
            resetIdleTimer();
        } else {
            stopCamera();
        }
    };

    const saveAllOnline = async () => {
        if (scanHistory.length === 0) {
            return;
        }

        showLoading("Saving "+scanHistory.length+" scans to server...");

        try {
            const datasss = {
                AttendanceID: AttendanceID,
                Logs: scanHistory,
            }
            const response = await saveLogs(datasss);
            await clearScans();
            showAlert('success', 'Success', "All scans saved online!")
        } catch (error) {
            // Alert.alert("Error", "Failed to save online");
            showAlert('error', 'Error', "Failed to save online")
            handleApiError(error, "Failed to save logs");
        } finally {
            hideLoading();
        }
    };

    const clearScans = async () => {
        await AsyncStorage.removeItem("scanHistory_"+AttendanceID);
        setScanHistory([]);
    };

    useEffect(() => {
        return () => {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, []);

    return (
        <>
            <BackHeader title="QR Code Scanner" />
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={styles.cameraWrapper}>
                    {cameraActive ? (
                        <View style={styles.cameraContainer}>
                            <Camera
                                style={styles.camera}
                                cameraType="back"
                                scanBarcode={true}
                                showFrame={true}
                                laserColor="red"
                                frameColor="white"
                                onReadCode={onBarcodeRead}
                            />
                            <View style={styles.scanFrame} />
                            <Animated.View
                                style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]}
                            />
                        </View>
                    ) : (
                        <View
                            style={[
                                styles.cameraContainer,
                                { justifyContent: "center", alignItems: "center" },
                            ]}
                        >
                            <Text style={{ color: "#888" }}>Camera is off</Text>
                        </View>
                    )}
                </View>

                <View style={{ flexDirection: "row", gap: 0, justifyContent: "space-between", marginHorizontal: 16 }}>
                    <TouchableOpacity style={styles.toggleButton} onPress={toggleCamera}>
                        <Text style={styles.toggleButtonText}>
                            {cameraActive ? "Stop Camera" : "Start Scanning"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveButton} onPress={saveAllOnline}>
                        <Text style={styles.saveButtonText}>Save {scanHistory.length} Scans</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.historyTitle}>Scan History</Text>
                <FlatList
                    data={scanHistory}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => {
                        const code = item.code;
                        const decryptedId = code.split("@")[1];
                        const userId = decryptedId ?? 0;
                        const name = userId ? userId : "UNKNOWN";

                        return (
                            <View style={styles.historyItem}>
                                <CText fontStyle={'SB'} fontSize={17}>{name}</CText>
                                <CText fontStyle={'R'} fontSize={15}>
                                    {new Date(item.date).toLocaleString()}
                                </CText>
                            </View>
                        );
                    }}
                />

            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
    title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    cameraWrapper: { alignItems: "center", marginBottom: 20 },
    cameraContainer: {
        width: 250,
        height: 250,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#000",
    },
    camera: { flex: 1 },
    scanFrame: {
        position: "absolute",
        top: "20%",
        left: "20%",
        width: "60%",
        height: "60%",
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 10,
    },
    scanLine: {
        position: "absolute",
        top: "20%",
        left: "20%",
        width: "60%",
        height: 2,
        backgroundColor: "red",
    },
    toggleButton: {
        marginTop: 10,
        padding: 12,
        backgroundColor: theme.colors.light.primary,
        borderRadius: 8,
        // width: 200,
    },
    toggleButtonText: { color: "#fff", fontWeight: "600", textAlign: "center" },
    saveButton: {
        marginTop: 10,
        padding: 12,
        backgroundColor: theme.colors.light.primary,
        borderRadius: 8,
        width: 200,
    },
    saveButtonText: { color: "#fff", fontWeight: "600", textAlign: "center" },
    historyTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, marginHorizontal: 16, marginTop: 20 },
    historyItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    historyCode: { fontSize: 16, fontWeight: "600" },
    historyDate: { fontSize: 12, color: "gray" },
});
