import React, {useEffect, useState} from "react";
import {
    View,
    TextInput,
    Linking,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createGoogleMeet } from "../../utils/gmeet/gmeet.ts";
import { handleApiError } from "../../utils/errorHandler.ts";
import { theme } from "../../theme";
import { CText } from "../../components/common/CText";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { globalStyles } from "../../theme/styles.ts";
import {getClassInfo} from "../../api/modules/classesApi.ts";
import {postWall} from "../../api/modules/wallApi.ts";
import {useLoading} from "../../context/LoadingContext.tsx";

const CreateMeetingScreen = ({ navigation, route }) => {
    const { ClassID } = route.params;
    const { showLoading, hideLoading } = useLoading();
    const [title, setTitle] = useState("SNSU Class Meeting");
    const [type, setType] = useState("instant");
    const [date, setDate] = useState(new Date(Date.now() + 10 * 60 * 1000));
    const [showPicker, setShowPicker] = useState(null); // 'date' | 'time' | null
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();
    const [attendees, setAttendees] = useState([]);

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const res = await getClassInfo({ClassID});
                console.log("creating meeting: ", res)
                const studentAttendees = res?.students?.map(student => student.details?.user?.email).filter(Boolean);
                // console.log("Student emails: ", studentAttendees);
                setAttendees(studentAttendees)
                setData(res)
                setTitle(res?.CourseCode)
            } catch (e) {

            } finally {

            }
        };
        fetchClass()
    }, []);

    const handleCreate = async () => {
        showLoading("Creating Meeting...");
        try {
            const res = await createGoogleMeet({
                title,
                ClassID,
                isScheduled: type === "scheduled",
                dateTime: date,
                attendees: attendees
            });

            const body = `**Meeting Created**  
                        [Join Here](${res})  
                        Course: ${data.CourseCode} - ${data.CourseName}  
                        Section: ${data.Section} (${data.ProgramCode})  
                        Schedule: ${type === "scheduled" ? new Date(date).toLocaleString() : "Now"}`;

            await postWall({
                body,
                remark: 'post',
                ClassID,
                MeetLink:res
            });

            if (type !== "scheduled") {
                Linking.openURL(res);
            }

            navigation.goBack();
        } catch (err) {
            setLoading(false);
            handleApiError(err, "gmeet");
        } finally {
            hideLoading();
        }
    };


    const handleDateChange = (event, selectedDate) => {
        setShowPicker(null);
        if (event.type === "set" && selectedDate) {
            const newDate = new Date(date);
            newDate.setFullYear(selectedDate.getFullYear());
            newDate.setMonth(selectedDate.getMonth());
            newDate.setDate(selectedDate.getDate());
            setDate(newDate);
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowPicker(null);
        if (event.type === "set" && selectedTime) {
            const newDate = new Date(date);
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            newDate.setSeconds(0);
            setDate(newDate);
        }
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <BackHeader title="Create Meeting" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <CText style={styles.label}>Meeting Title</CText>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        placeholder="Enter meeting title"
                        placeholderTextColor="#888"
                    />

                    <CText style={styles.label}>Meeting Type</CText>
                    <View style={styles.typeButtons}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                type === "instant" && styles.activeType,
                            ]}
                            onPress={() => setType("instant")}
                        >
                            <CText
                                style={[
                                    styles.typeText,
                                    type === "instant" && styles.activeText,
                                ]}
                            >
                                Instant
                            </CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                type === "scheduled" && styles.activeType,
                            ]}
                            onPress={() => setType("scheduled")}
                        >
                            <CText
                                style={[
                                    styles.typeText,
                                    type === "scheduled" && styles.activeText,
                                ]}
                            >
                                Scheduled
                            </CText>
                        </TouchableOpacity>
                    </View>

                    {type === "scheduled" && (
                        <>
                            <TouchableOpacity
                                style={styles.pickerButton}
                                onPress={() => setShowPicker("date")}
                            >
                                <CText style={styles.pickerText}>
                                    📅 Date: {date.toLocaleDateString()}
                                </CText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.pickerButton}
                                onPress={() => setShowPicker("time")}
                            >
                                <CText style={styles.pickerText}>
                                    ⏰ Time:{" "}
                                    {date.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </CText>
                            </TouchableOpacity>

                            {showPicker === "date" && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "inline" : "default"}
                                    onChange={handleDateChange}
                                    minimumDate={new Date()}
                                />
                            )}
                            {showPicker === "time" && (
                                <DateTimePicker
                                    value={date}
                                    mode="time"
                                    display={Platform.OS === "ios" ? "inline" : "default"}
                                    onChange={handleTimeChange}
                                />
                            )}
                        </>
                    )}

                    <TouchableOpacity
                        onPress={handleCreate}
                        style={[styles.createButton, loading && styles.disabled]}
                        disabled={loading}
                    >
                        <CText style={styles.createButtonText}>
                            {loading ? "Creating..." : "Create Meeting"}
                        </CText>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 80,
    },
    label: {
        fontSize: 16,
        marginBottom: 6,
        fontWeight: "600",
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        color: "#222",
    },
    typeButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        marginRight: 8,
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },
    activeType: {
        backgroundColor: theme.colors.light.primary,
        borderColor: theme.colors.light.primary,
    },
    typeText: {
        fontWeight: "500",
        fontSize: 15,
        color: "#555",
    },
    activeText: {
        color: "#fff",
    },
    pickerButton: {
        backgroundColor: theme.colors.light.primary + "15",
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
    },
    pickerText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#333",
    },
    createButton: {
        backgroundColor: theme.colors.light.primary,
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    disabled: {
        opacity: 0.6,
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default CreateMeetingScreen;
