import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator, FlatList, RefreshControl,
} from "react-native";
import { globalStyles } from "../../theme/styles.ts";
import { CText } from "../../components/common/CText.tsx";
import CButton from "../../components/buttons/CButton.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { handleApiError } from "../../utils/errorHandler.ts";
import {loadEventToLocal, saveEventToLocal, updateEventToLocal} from "../../utils/cache/events/localEvents";
import {formatDate} from "../../utils/dateFormatter";
import {getAttendanceById} from "../../api/modules/attendanceApi.ts";
import {LastUpdatedBadge} from "../../components/common/LastUpdatedBadge";

const AttendanceHistory = ({ navigation, route }) => {
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
        console.log("🔍 Fetching attendance details from API", res);
        const now = await updateEventToLocal(user?.id, AttendanceID, res);
        setAttendance(res);
        setRefreshing(false);
        setLastUpdated(now)
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
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <CText fontStyle="B" fontSize={16}>No details found.</CText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <BackHeader title="Attendance List" />
            <SafeAreaView style={[globalStyles.safeArea]}>
                <LastUpdatedBadge date={lastUpdated} onReload={onRefresh} />
                <FlatList
                    data={
                        attendance?.logs
                            ?.slice()
                            ?.sort((a, b) => new Date(b.ScannedAt).getTime() - new Date(a.ScannedAt).getTime())
                    }
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={[globalStyles.card, { marginHorizontal: 16 }]}>
                            <CText fontStyle="SB" fontSize={17}>
                                {item?.user?.name}
                            </CText>
                            <CText fontStyle="R" fontSize={15}>
                                {item?.user?.email}
                            </CText>
                            <CText fontStyle="R" fontSize={15}>
                                {formatDate(item?.ScannedAt, "MMM dd, yyyy")}
                            </CText>
                        </View>
                    )}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />

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
        marginHorizontal: 16,
    },
    description: {
        color: "#555",
    },
});

export default AttendanceHistory;
