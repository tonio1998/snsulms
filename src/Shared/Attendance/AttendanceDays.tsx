import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { format, parseISO, isToday, isFuture } from "date-fns";
import { globalStyles } from "../../theme/styles.ts";
import { CText } from "../../components/common/CText.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { handleApiError } from "../../utils/errorHandler.ts";
import { getAttendanceById } from "../../api/modules/attendanceApi.ts";
import { loadEventToLocal, updateEventToLocal } from "../../utils/cache/events/localEvents";
import { LastUpdatedBadge } from "../../components/common/LastUpdatedBadge";
import CButton from "../../components/buttons/CButton.tsx";
import {SummaryBox} from "../../components/common/SummaryBox.tsx";

const AttendanceDays = ({ navigation, route }) => {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const { AttendanceID } = route.params;

    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const cache = await loadEventToLocal(user?.id);
                if (cache?.data) {
                    const cachedEvent = cache.data.find((e) => e.id === AttendanceID);
                    if (cachedEvent) {
                        setAttendance(cachedEvent);
                        setLastUpdated(cache.date);
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

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await getAttendanceById(AttendanceID);
            console.log(res)
            const now = await updateEventToLocal(user?.id, AttendanceID, res);
            setAttendance(res);
            setLastUpdated(now);
        } catch (error) {
            handleApiError(error);
            showAlert("error", "Error", "Could not refresh data");
        } finally {
            setRefreshing(false);
        }
    };

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
                <View style={styles.emptyContainer}>
                    <CText fontStyle="B" fontSize={16}>No details found.</CText>
                </View>
            </SafeAreaView>
        );
    }

    // Split days into Today, Incoming, Past
    const today = [];
    const incoming = [];
    const past = [];

    attendance.days.forEach((day) => {
        const date = parseISO(day.EventDate);
        if (isToday(date)) today.push(day);
        else if (isFuture(date)) incoming.push(day);
        else past.push(day);
    });

    const renderDays = (days) =>
        days.map((day) => (
            <View key={day.id} style={[globalStyles.card, isToday(parseISO(day.EventDate)) && styles.todayCard]}>
                <CText fontStyle="SB" fontSize={15} style={styles.dayDate}>
                    {format(parseISO(day.EventDate), "EEE, MMM dd, yyyy")}
                </CText>

                {day.sessions?.map((s, idx) => (
                    <View
                        key={s.id}
                        style={[
                            styles.sessionCard,
                            idx !== day.sessions.length - 1 && styles.sessionSeparator,
                        ]}
                    >
                        <View style={{ flex: 1 }}>
                            <CText fontStyle="SB" fontSize={14} style={styles.sessionName}>
                                {s.SessionName}
                            </CText>

                            <View style={styles.sessionInfoRow}>
                                <CText fontSize={12} style={styles.sessionStatus}>
                                    {s.isInOut ? "Track IN/OUT" : "No IN/OUT"}
                                </CText>
                                <SummaryBox label="Logs" value={s.logs.length} />
                            </View>
                        </View>

                        <CButton
                            icon="qr-code"
                            type="success"
                            style={styles.qrButton}
                            onPress={() => navigation.navigate("ClassAttendanceScan", {
                                AttendanceID,
                                session: s,
                                event: attendance
                            })}
                        />
                    </View>
                ))}
            </View>
        ));

    return (
        <>
            <BackHeader title="Attendance Details" />
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={{ marginHorizontal: 12, marginVertical: 8 }}>
                    <LastUpdatedBadge date={lastUpdated} onReload={onRefresh} />
                </View>
                <ScrollView
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {today.length > 0 && (
                        <>
                            <CText fontStyle="SB" fontSize={16} style={styles.sectionHeader}>Today</CText>
                            {renderDays(today)}
                        </>
                    )}

                    {incoming.length > 0 && (
                        <>
                            <CText fontStyle="SB" fontSize={16} style={styles.sectionHeader}>Upcoming</CText>
                            {renderDays(incoming)}
                        </>
                    )}

                    {past.length > 0 && (
                        <>
                            <CText fontStyle="SB" fontSize={16} style={styles.sectionHeader}>Past</CText>
                            {renderDays(past)}
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    sessionCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        marginVertical: 6,
        borderRadius: 10,
        backgroundColor: "#F4F7F9", // subtle contrast inside day card
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 1,
    },
    sessionSeparator: {
        borderBottomWidth: 0,
    },
    sessionName: {
        marginBottom: 6,
        color: "#333",
    },
    sessionInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sessionStatus: {
        fontSize: 12,
        color: "#555",
    },
    qrButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    dayCard: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
    },
    todayCard: {
        backgroundColor: "#E6F4EA", // subtle green highlight for today
    },
    dayDate: {
        marginBottom: 10,
        color: "#333",
    },
    sessionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    sessionSeparator: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
    },
    sessionStatus: {
        color: "#666",
        marginTop: 2,
    },
    qrButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    sectionHeader: {
        marginVertical: 8,
        color: "#004D1A",
    },
});

export default AttendanceDays;
