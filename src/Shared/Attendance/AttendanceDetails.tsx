import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { globalStyles } from "../../theme/styles.ts";
import { CText } from "../../components/common/CText.tsx";
import CButton from "../../components/buttons/CButton.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { handleApiError } from "../../utils/errorHandler.ts";
import { getAttendanceDetails } from "../../api/modules/attendanceApi.ts";
import {loadEventToLocal, saveEventToLocal} from "../../utils/cache/events/localEvents";
import {formatDate} from "date-fns";

const AttendanceDetails = ({ navigation, route }) => {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const { AttendanceID } = route.params;

    console.log("🔍 Fetching attendance details", route.params);

    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);

                const cache = await loadEventToLocal(user?.id);
                if (cache?.data) {
                    const cachedEvent = cache.data.find(e => e.id === AttendanceID);
                    if (cachedEvent) {
                        setAttendance(cachedEvent);
                    }
                }
            } catch (error) {
                handleApiError(error, "Failed to fetch attendance details");
                showAlert("error", "Error", "Could not load attendance details");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [AttendanceID]);

    if (loading) {
        return (
            <SafeAreaView style={[globalStyles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#004D1A" />
                <CText fontStyle="SB" fontSize={14} style={{ marginTop: 12 }}>
                    Loading details...
                </CText>
            </SafeAreaView>
        );
    }

    if (!attendance) {
        return (
            <SafeAreaView style={globalStyles.safeArea}>
                <BackHeader title="Attendance Details" />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <CText fontStyle="B" fontSize={16}>No details found.</CText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <BackHeader title="Attendance Details" />
            <SafeAreaView style={[globalStyles.safeArea]}>
                <ScrollView contentContainerStyle={{ padding: 16 }}>

                    <View style={styles.section}>
                        <CText fontStyle="SB" fontSize={13} style={styles.sectionTitle}>
                            Event Details
                        </CText>
                        <CText fontStyle="SB" fontSize={15}>{attendance?.Title}</CText>
                        <CText fontSize={14} style={styles.description}>
                            {attendance?.Description}
                        </CText>
                        <CText fontSize={14} style={{ marginTop: 6 }}>
                            {formatDate(attendance?.DateofEvent, "MMM dd, yyyy")}
                        </CText>
                    </View>

                    {/* Statistics */}
                    <View style={styles.section}>
                        <CText fontStyle="B" fontSize={18} style={styles.sectionTitle}>
                            Statistics
                        </CText>
                        <CText fontSize={14}>Total Students: {attendance?.TotalStudents ?? 0}</CText>
                        <CText fontSize={14} style={{ color: "green" }}>
                            Present: {attendance?.PresentCount ?? 0}
                        </CText>
                        <CText fontSize={14} style={{ color: "red" }}>
                            Absent: {attendance?.AbsentCount ?? 0}
                        </CText>
                    </View>

                    <View style={styles.section}>
                        <CText fontStyle="SB" fontSize={14} style={styles.sectionTitle}>
                            Attendance (QR)
                        </CText>
                        <CButton
                            title="Scan QR"
                            type="info"
                            icon="qr-code-outline"
                            style={{ marginBottom: 12 }}
                            onPress={() => navigation.navigate("AttendanceQRScanner", { AttendanceID })}
                        />
                        <CButton
                            title="Show QR for Students"
                            type="success"
                            icon="qr-code-outline"
                            onPress={() => navigation.navigate("AttendanceQRDisplay", { AttendanceID })}
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        marginBottom: 10,
    },
    description: {
        marginTop: 6,
        color: "#555",
    },
});

export default AttendanceDetails;
