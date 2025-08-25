import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    RefreshControl,
} from "react-native";
import { globalStyles } from "../../theme/styles.ts";
import { CText } from "../../components/common/CText.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { handleApiError } from "../../utils/errorHandler.ts";
import { loadEventToLocal, updateEventToLocal } from "../../utils/cache/events/localEvents";
import { formatDate } from "../../utils/dateFormatter";
import { getAttendanceById } from "../../api/modules/attendanceApi.ts";
import { LastUpdatedBadge } from "../../components/common/LastUpdatedBadge";

const AttendanceHistory = ({ route }) => {
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
                    const cachedEvent = cache.data.find(e => e.id === AttendanceID);
                    if (cachedEvent) {
                        setAttendance(cachedEvent);
                        setLastUpdated(cache?.date);
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
        const res = await getAttendanceById(AttendanceID);
        const now = await updateEventToLocal(user?.id, AttendanceID, res);
        setAttendance(res);
        setLastUpdated(now);
        setRefreshing(false);
    };

    if (loading) {
        return (
            <SafeAreaView style={[globalStyles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#004D1A" />
                <CText fontStyle="SB" fontSize={14} style={{ marginTop: 12 }}>
                    Loading history...
                </CText>
            </SafeAreaView>
        );
    }

    if (!attendance) {
        return (
            <SafeAreaView style={globalStyles.safeArea}>
                <BackHeader title="Attendance History" />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <CText fontStyle="B" fontSize={16}>No history found.</CText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <BackHeader title="Attendance History" />
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
                    <LastUpdatedBadge date={lastUpdated} onReload={onRefresh} />
                </View>
                <FlatList
                    data={
                        attendance?.logs
                            ?.slice()
                            ?.sort((a, b) => new Date(b.ScannedAt).getTime() - new Date(a.ScannedAt).getTime())
                    }
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <View>
                                    <CText fontStyle="SB" fontSize={16} numberOfLines={1}>
                                        {item?.user?.name}
                                    </CText>
                                    <CText fontStyle="R" fontSize={13} style={styles.email} numberOfLines={1}>
                                        {item?.user?.email}
                                    </CText>
                                </View>
                            </View>

                            {/* BODY */}
                            <View style={styles.body}>
                                <CText fontStyle="R" fontSize={14} style={styles.date}>
                                    {formatDate(item?.ScannedAt, "MMM dd, yyyy • hh:mm a")}
                                </CText>
                            </View>
                        </View>
                    )}

                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        marginBottom: 8,
    },
    email: {
        color: "#666",
        marginTop: 2,
    },
    body: {
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 6,
    },
    date: {
        fontSize: 13,
        color: "#444",
    },
    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    email: {
        color: "#555",
    },
    date: {
        color: "#777",
    },
});

export default AttendanceHistory;
