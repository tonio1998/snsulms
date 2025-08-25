import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    Vibration,
    Animated,
    ScrollView,
} from "react-native";
import { Camera } from "react-native-camera-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveLogs } from "../../api/modules/attendanceApi.ts";
import { handleApiError } from "../../utils/errorHandler.ts";
import { CText } from "../../components/common/CText.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { theme } from "../../theme";
import { useLoading } from "../../context/LoadingContext.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { globalStyles } from "../../theme/styles.ts";

export default function QrCodeScannerScreen({ route }) {
    const { AttendanceID, session, event } = route.params;
    const [scanHistory, setScanHistory] = useState<any[]>([]);
    const [cameraActive, setCameraActive] = useState(false);
    const scannedRef = useRef(new Set<string>());
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [selectedInOut, setSelectedInOut] = useState(session.isInOut ? "IN" : "NONE");

    const { showLoading, hideLoading } = useLoading();
    const { showAlert } = useAlert();

    useEffect(() => {
        (async () => {
            const history = await AsyncStorage.getItem(`scanHistory_${AttendanceID}_${session?.id}`);
            if (history) setScanHistory(JSON.parse(history));
        })();
    }, []);

    useEffect(() => {
        if (cameraActive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanLineAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                    Animated.timing(scanLineAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
                ])
            ).start();
        } else {
            scanLineAnim.stopAnimation();
        }
    }, [cameraActive]);

    const resetIdleTimer = () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(stopCamera, 20000);
    };

    const stopCamera = () => {
        setCameraActive(false);
        scannedRef.current.clear();
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    const toggleCamera = () => {
        cameraActive ? stopCamera() : (setCameraActive(true), resetIdleTimer());
    };

    const storeScan = async (sessionID: number, inOut: string, encryptedID:string, name: string) => {
        const storageKey = `scanHistory_${AttendanceID}_${sessionID}`;
        let existingHistory: any[] = [];

        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) existingHistory = JSON.parse(stored);

        const now = new Date().toISOString();

        const isDuplicate = existingHistory.some(
            (item) =>
                item.encryptedID === encryptedID &&
                item.sessionID === sessionID &&
                item.inOut === inOut
        );
        if (isDuplicate) return;

        const newScan = { AttendanceID, sessionID, inOut, date: now, encryptedID, name };
        const updatedHistory = [newScan, ...existingHistory];

        setScanHistory(updatedHistory);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    };

    const onBarcodeRead = (event: any) => {
        const code = event?.nativeEvent?.codeStringValue ?? event?.codeStringValue ?? "";
        if (!code) return;

        const [encryptedID, name] = code.split("@");

        storeScan(session.id, selectedInOut, encryptedID, name);
        Vibration.vibrate(100);
        resetIdleTimer();
    };

    const saveAllOnline = async () => {
        if (!scanHistory.length) return showAlert("info", "No scans", "There is nothing to save.");
        showLoading("Saving scans...");
        try {
            await saveLogs({ scanHistory });
            await AsyncStorage.removeItem(`scanHistory_${AttendanceID}_${session?.id}`);
            setScanHistory([]);
            scannedRef.current.clear();
            showAlert("success", "Saved!", "All scans uploaded successfully.");
        } catch (err) {
            handleApiError(err, "Failed to save logs");
            showAlert("error", "Failed", "Could not save scans online. They are still stored offline.");
        } finally {
            hideLoading();
        }
    };

    return (
        <>
            <BackHeader title={event?.Title} />
            <SafeAreaView style={globalStyles.safeArea}>
                <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
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
                                    style={[styles.scanLine, {
                                        transform: [
                                            {
                                                translateY: scanLineAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }),
                                            },
                                        ],
                                    }]}
                                />
                            </View>
                        ) : (
                            <View style={[styles.cameraContainer, { justifyContent: "center", alignItems: "center" }]}>
                                <Text style={{ color: "#888" }}>Camera is off</Text>
                            </View>
                        )}

                        <View style={styles.cameraButtons}>
                            <TouchableOpacity style={styles.toggleButton} onPress={toggleCamera}>
                                <Text style={styles.toggleButtonText}>{cameraActive ? "Stop Camera" : "Start Scanning"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={saveAllOnline}>
                                <Text style={styles.saveButtonText}>Save {scanHistory.length} Scans</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.historyTitle}>Scan History</Text>
                    <FlatList
                        data={scanHistory}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.historyItem}>
                                <CText fontStyle="SB" fontSize={14}>{item.inOut} | {item.name}</CText>
                                <CText fontStyle="R" fontSize={12}>{new Date(item.date).toLocaleString()}</CText>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 12, color: "#888" }}>No scans yet</Text>}
                    />
                </ScrollView>
                <View style={[globalStyles.card, {marginHorizontal: 12, padding: 10}]}>
                    <CText fontStyle="SB" fontSize={14}>{session.SessionName}</CText>

                    {session.isInOut ? (
                        <View style={styles.inOutRow}>
                            {["IN", "OUT"].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.inOutButton,
                                        { backgroundColor: selectedInOut === type ? (type === "IN" ? "#4CAF50" : "#F44336") : "#ccc" }
                                    ]}
                                    onPress={() => setSelectedInOut(type)}
                                >
                                    <Text style={styles.inOutText}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.statusRow}>
                            <Text style={[styles.statusText, { color: "#888" }]}>No IN/OUT</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    cameraWrapper: { alignItems: "center", marginVertical: 12 },
    cameraContainer: { width: 250, height: 250, borderRadius: 16, overflow: "hidden", backgroundColor: "#000", shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
    camera: { flex: 1 },
    scanFrame: { position: "absolute", top: "18%", left: "18%", width: "64%", height: "64%", borderWidth: 1.5, borderColor: "#fff", borderRadius: 10 },
    scanLine: { position: "absolute", top: 0, left: "18%", width: "64%", height: 2, backgroundColor: "red" },
    cameraButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, marginHorizontal: 12 },
    toggleButton: { padding: 10, backgroundColor: theme.colors.light.primary, borderRadius: 6, flex: 1, marginRight: 4 },
    toggleButtonText: { color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 14 },
    saveButton: { padding: 10, backgroundColor: "#2196F3", borderRadius: 6, flex: 1, marginLeft: 4 },
    saveButtonText: { color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 14 },
    historyTitle: { fontSize: 16, fontWeight: "600", marginHorizontal: 12, marginTop: 16, marginBottom: 4 },
    historyItem: { backgroundColor: "#fff", padding: 8, marginHorizontal: 12, marginVertical: 2, borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 1 },
    inOutRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
    inOutButton: { padding: 8, borderRadius: 6, flex: 1, marginHorizontal: 3 },
    inOutText: { color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 14 },
    statusRow: { paddingVertical: 6 },
    statusText: { fontSize: 14 },
});
