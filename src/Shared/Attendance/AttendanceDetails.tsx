import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl, TouchableOpacity,
} from "react-native";
import { globalStyles } from "../../theme/styles.ts";
import { CText } from "../../components/common/CText.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { handleApiError } from "../../utils/errorHandler.ts";
import { getAttendanceById } from "../../api/modules/attendanceApi.ts";
import { loadEventToLocal, updateEventToLocal } from "../../utils/cache/events/localEvents";
import { format } from "date-fns";
import { SummaryBox } from "../../components/common/SummaryBox.tsx";
import { LastUpdatedBadge } from "../../components/common/LastUpdatedBadge";
import {formatDate} from "../../utils/dateFormatter";
import CButton from "../../components/buttons/CButton.tsx";
import {theme} from "../../theme";

const AttendanceDetails = ({ navigation, route }) => {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const { AttendanceID, ClassID } = route.params;

    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const cache = await loadEventToLocal(user?.id, ClassID);
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
                <ActivityIndicator size="large" color={theme.colors.light.primary} />
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
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={{ marginHorizontal: 10 }}>
                    <LastUpdatedBadge date={lastUpdated} onReload={onRefresh} />
                </View>
                <ScrollView
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <CText fontStyle="R" fontSize={13}>Title</CText>
                            <CText fontStyle="SB" fontSize={15}>{attendance?.Title}</CText>
                        </View>
                        <View style={styles.row}>
                            <CText fontStyle="R" fontSize={13}>Description</CText>
                            <CText fontSize={15} fontStyle="SB" style={styles.description}>
                                {attendance?.Description}
                            </CText>
                        </View>
                        <View style={styles.row}>
                            <CText fontStyle="R" fontSize={13}>Date of Event</CText>
                            <CText fontSize={15} fontStyle="SB">
                                {attendance?.StartDate ? formatDate(attendance?.StartDate, "date") : "-"} - {attendance?.EndDate ? formatDate(attendance?.EndDate, "date") : "-"}
                            </CText>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <CText fontStyle="SB" fontSize={15} style={styles.sectionTitle}>Statistics</CText>
                        <View style={globalStyles.cardRow}>
                            {attendance?.class?.students?.length > 0 && (
                                <SummaryBox label="Total Students" value={attendance?.class?.students.length} />
                            )}
                            <SummaryBox label="Total Logs" value={attendance?.logs?.length ?? 0} />
                        </View>
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
        color: "#555",
    },
    row: {
        marginBottom: 12,
    },
    dayCard: {
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    sessionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 2,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
    },
});

export default AttendanceDetails;
