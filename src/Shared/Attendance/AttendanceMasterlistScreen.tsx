import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert, RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { deleteAttendance, getAttendanceByClass } from "../../api/modules/attendanceApi.ts";
import { handleApiError } from "../../utils/errorHandler.ts";
import { CText } from "../../components/common/CText.tsx";
import Icon from "react-native-vector-icons/Ionicons";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { globalStyles } from "../../theme/styles.ts";
import CButton from "../../components/buttons/CButton.tsx";
import ActivityIndicator2 from "../../components/loaders/ActivityIndicator2.tsx";
import {theme} from "../../theme";
import {formatDate} from "date-fns";
import {loadEventToLocal, saveEventToLocal} from "../../utils/cache/events/localEvents";
import {LastUpdatedBadge} from "../../components/common/LastUpdatedBadge";

const AttendanceMasterlistScreen = ({ navigation, route }) => {
    const { ClassID } = route.params;
    const { user } = useAuth();
    const { showAlert } = useAlert();

    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const loadLocal = async () => {
        try {
            setLoading(true);
            const { data, date } = await loadEventToLocal(user?.id, ClassID);
            if (data) {
                setAttendances(data);
                setLastUpdated(date);
            } else {
                await loadData();
            }
        } catch (err) {
            handleApiError(err, "Failed to load attendance list");
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getAttendanceByClass({ ClassID });
            console.log("🔍 Fetched attendance list", res.data);
            const now = await saveEventToLocal(user?.id, ClassID, res.data);
            setLastUpdated(now);
            setAttendances(res.data || []);
        } catch (error) {
            handleApiError(error, "Failed to load attendance list");
            showAlert("error", "Error", "Could not load attendance masterlist.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLocal();
    }, [ClassID]);

    const handleDelete = (id: number) => {
        Alert.alert("Confirm", "Are you sure you want to delete this attendance?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteAttendance(id);
                        showAlert("success", "Deleted", "Attendance deleted successfully.");
                        loadData();
                    } catch (error) {
                        handleApiError(error, "Failed to delete");
                        showAlert("error", "Error", "Failed to delete attendance.");
                    }
                },
            },
        ]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[globalStyles.card, { padding: 14, marginBottom: 12 }]}
            onPress={() =>
                navigation.navigate("Events", {
                    AttendanceID: item.id,
                    ClassID: ClassID
                })
            }
            activeOpacity={0.7}
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <CText fontStyle="SB" fontSize={16} numberOfLines={1}>
                    {item.Title}
                </CText>

                <View
                    style={{
                        backgroundColor: theme.colors.light.primary+'22',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: theme.radius.sm,
                    }}
                >
                    <CText fontSize={theme.fontSizes.sm} fontStyle={'SB'} style={{ color: theme.colors.light.primary }}>
                        {item.logs?.length ?? 0} logs
                    </CText>
                </View>
            </View>

            {item.Description?.trim() !== "" && (
                <CText fontSize={14} style={{ color: "#555", marginTop: 6 }} numberOfLines={2}>
                    {item.Description}
                </CText>
            )}

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: "#ddd",
                    paddingTop: 6,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon name="calendar-outline" size={14} color="#555" />
                    <CText fontSize={13} style={{ color: "#555" }}>
                        {formatDate(item.StartDate, "MMM dd, yyyy")} - {formatDate(item.EndDate, "MMM dd, yyyy")}
                    </CText>
                </View>
            </View>
        </TouchableOpacity>
    );



    return (
        <SafeAreaView style={globalStyles.safeArea2}>
            {loading && (
                <ActivityIndicator2 />
            )}
            <View style={{ marginHorizontal: 10 }}>
                <LastUpdatedBadge date={lastUpdated} onReload={onRefresh} />
            </View>
            <FlatList
                data={attendances}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="document-text-outline" size={50} color="#999" />
                        <CText fontSize={14} style={styles.emptyText}>
                            No attendance records found.
                        </CText>
                    </View>
                }
                contentContainerStyle={{ padding: 16, flexGrow: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.light.primary]}
                        tintColor={theme.colors.light.warning}
                    />
                }
            />

            <TouchableOpacity
                style={globalStyles.fab}
                onPress={() => navigation.navigate("AddAttendanceScreen", { ClassID })}
            >
                <Icon name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    description: {
        color: "#555",
        marginTop: 4,
    },
    deleteBtn: {
        marginLeft: 12,
        padding: 6,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
    },
    emptyText: {
        color: "#777",
        marginTop: 8,
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 20,
        backgroundColor: "#004D1A",
        borderRadius: 50,
        padding: 16,
        elevation: 5,
    },
});

export default AttendanceMasterlistScreen;
