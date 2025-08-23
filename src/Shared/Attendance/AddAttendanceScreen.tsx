import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAlert } from "../../components/CAlert.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { addAttendance } from "../../api/modules/attendanceApi.ts";
import { handleApiError } from "../../utils/errorHandler.ts";
import { globalStyles } from "../../theme/styles.ts";
import { CText } from "../../components/common/CText.tsx";
import CButton from "../../components/buttons/CButton.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";

const AddAttendanceScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const { ClassID } = route.params;
    const { data } = route.params;
    const { showAlert } = useAlert();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dateOfEvent, setDateOfEvent] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if (!title.trim()) {
            Alert.alert("Validation", "Please enter a title");
            return;
        }
        if (!description.trim()) {
            Alert.alert("Validation", "Please enter a description");
            return;
        }
        if (!dateOfEvent) {
            Alert.alert("Validation", "Please select a date");
            return;
        }

        try {
            setLoading(true);
            await addAttendance({
                ClassID,
                Title: title,
                Description: description,
                DateOfEvent: dateOfEvent.toISOString().split("T")[0], // YYYY-MM-DD
            });

            showAlert("success", "Success", "Attendance added successfully.");
            navigation.goBack();
        } catch (error) {
            handleApiError(error, "Failed to add attendance");
            showAlert(
                "error",
                "Error",
                error?.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <BackHeader title="Add Attendance" />
            <SafeAreaView style={[globalStyles.safeArea]}>
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {/* Title */}
                    <CText fontStyle="SB" fontSize={15} style={{ marginBottom: 12 }}>
                        Title
                    </CText>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter title"
                        value={title}
                        onChangeText={setTitle}
                    />

                    {/* Description */}
                    <CText fontStyle="SB" fontSize={15} style={{ marginBottom: 12, marginTop: 12 }}>
                        Description
                    </CText>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                        placeholder="Enter description"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    {/* Date of Event */}
                    <CText fontStyle="SB" fontSize={15} style={{ marginBottom: 12, marginTop: 12 }}>
                        Date of Event
                    </CText>
                    <CButton
                        title={dateOfEvent.toDateString()}
                        type="info"
                        onPress={() => setShowDatePicker(true)}
                        icon="calendar-outline"
                        style={{ padding: 12 }}
                    />
                    {showDatePicker && (
                        <DateTimePicker
                            value={dateOfEvent}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setDateOfEvent(selectedDate);
                            }}
                        />
                    )}

                    <CButton
                        title={"Submit"}
                        type={"success"}
                        onPress={onSubmit}
                        icon={"save-outline"}
                        style={{ marginTop: 24, padding: 12 }}
                        loading={loading}
                    />
                </ScrollView>
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
});

export default AddAttendanceScreen;
