import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    TextInput,
    ScrollView,
    Alert,
    Platform,
    Switch,
    TouchableOpacity,
    Text,
    StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import { useAlert } from "../../components/CAlert.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { addAttendance } from "../../api/modules/attendanceApi.ts";
import { handleApiError } from "../../utils/errorHandler.ts";
import { globalStyles } from "../../theme/styles.ts";
import { CText } from "../../components/common/CText.tsx";
import CButton from "../../components/buttons/CButton.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";
import {theme} from "../../theme";

const AddAttendanceScreen = ({ navigation, route }) => {
    const { ClassID } = route.params;
    const { showAlert } = useAlert();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventType] = useState("class");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [sessions, setSessions] = useState([
        { name: "Morning", isInOut: true },
        { name: "Afternoon", isInOut: true },
    ]);
    const [loading, setLoading] = useState(false);

    const updateSession = (i, field, val) => {
        const tmp = [...sessions];
        tmp[i][field] = val;
        setSessions(tmp);
    };

    const removeSession = (i) => {
        setSessions(sessions.filter((_, idx) => idx !== i));
    };

    const onSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            return Alert.alert("Validation", "Fill all fields");
        }
        if (!startDate || !endDate) {
            return Alert.alert("Validation", "Select dates");
        }

        try {
            setLoading(true);

            const eventDays = [];
            let cur = new Date(startDate);

            while (cur <= endDate) {
                eventDays.push({
                    EventDate: cur.toISOString().split("T")[0],
                    Sessions: sessions.map((s) => ({ SessionName: s.name, isInOut: s.isInOut })),
                });
                cur.setDate(cur.getDate() + 1);
            }

            await addAttendance({
                Title: title,
                Description: description,
                EventType: eventType,
                ClassID: ClassID || null,
                EventDays: eventDays,
                StartDate: startDate,
                EndDate: endDate
            });

            showAlert("success", "Success", "Attendance added");
            navigation.goBack();
        } catch (e) {
            handleApiError(e);
            showAlert("error", "Error", e?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const DateInput = ({ label, date, setDate, showPicker, setShowPicker, minDate }) => (
        <>
            <CText fontStyle="SB" fontSize={15} style={{ marginBottom: 8, marginTop: 16 }}>
                {label}
            </CText>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
                <Text>{date.toDateString()}</Text>
                <Icon name="calendar-outline" size={20} color={theme.colors.light.primary} />
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    minimumDate={minDate || new Date()}
                    onChange={(e, d) => {
                        setShowPicker(false);
                        if (d) setDate(d);
                    }}
                />
            )}
        </>
    );

    return (
        <>
            <BackHeader title="Add Attendance" />
            <SafeAreaView style={globalStyles.safeArea}>
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {/* Title */}
                    <CText fontStyle="SB" fontSize={15}>
                        Title
                    </CText>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter title"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <CText fontStyle="SB" fontSize={15} style={{ marginTop: 16 }}>
                        Description
                    </CText>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                        placeholder="Enter description"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <View style={[globalStyles.cardRow]}>
                        <View>
                            <DateInput
                                label="Start Date"
                                date={startDate}
                                setDate={setStartDate}
                                showPicker={showStartPicker}
                                setShowPicker={setShowStartPicker}
                            />
                        </View>
                        <View>
                            <DateInput
                                label="End Date"
                                date={endDate}
                                setDate={setEndDate}
                                showPicker={showEndPicker}
                                setShowPicker={setShowEndPicker}
                                minDate={startDate}
                            />
                        </View>
                    </View>

                    <CText fontStyle="SB" fontSize={15} style={{ marginTop: 16, marginBottom: 10 }}>
                        Sessions
                    </CText>
                    {sessions.map((s, idx) => (
                        <View key={idx} style={styles.sessionCard}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Session name"
                                value={s.name}
                                onChangeText={(t) => updateSession(idx, "name", t)}
                            />
                            <View style={styles.sessionActions}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <CText fontSize={13}>IN/OUT</CText>
                                    <Switch
                                        value={s.isInOut}
                                        onValueChange={(v) => updateSession(idx, "isInOut", v)}
                                        style={{ marginLeft: 8 }}
                                        trackColor={{
                                            false: theme.colors.light.muted_soft,
                                            true: theme.colors.light.primary,
                                        }}
                                        thumbColor={s.isInOut ? theme.colors.light.primary : theme.colors.light.muted_soft}
                                        ios_backgroundColor={theme.colors.light.muted_soft}
                                    />

                                </View>
                                <TouchableOpacity onPress={() => removeSession(idx)}>
                                    <Icon name="trash-outline" size={22} color="#f55" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <CButton
                        title="Add Session"
                        type="success"
                        onPress={() => setSessions([...sessions, { name: "", isInOut: false }])}
                        style={{ marginBottom: 24, padding: 12 }}
                    />
                </ScrollView>

                <View style={{ margin: 16 }}>
                    <CButton
                        title="Submit"
                        type="success"
                        onPress={onSubmit}
                        icon="save-outline"
                        style={{ padding: 12 }}
                        loading={loading}
                    />
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: "#fff",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    dateInput: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        backgroundColor: "#fff",
    },
    sessionCard: {
        backgroundColor: "#f9f9f9",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    sessionActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
});

export default AddAttendanceScreen;
