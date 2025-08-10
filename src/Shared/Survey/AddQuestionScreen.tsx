import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { globalStyles } from "../../theme/styles.ts";
import { theme } from "../../theme";
import { addQuestion, getQuestionInfo } from "../../api/testBuilder/testbuilderApi.ts";
import { handleApiError } from "../../utils/errorHandler.ts";
import { useAlert } from "../../components/CAlert.tsx";
import { useLoading } from "../../context/LoadingContext.tsx";
import { CText } from "../../components/common/CText.tsx";
import DropDownPicker from "react-native-dropdown-picker";

// Dummy fetch for sections - replace with your real API call
async function fetchYourSectionsApi() {
    return [
        { id: 1, name: "Section A" },
        { id: 2, name: "Section B" },
        { id: 3, name: "Section C" },
    ];
}

const questionTypes = [
    { label: "Short Answer", value: "short", icon: "create-outline", needsOptions: false },
    { label: "Paragraph", value: "par", icon: "document-text-outline", needsOptions: false },
    { label: "Multiple Choice", value: "mc", icon: "radio-button-on-outline", needsOptions: true },
    { label: "Checkboxes", value: "checkbox", icon: "checkbox-outline", needsOptions: true },
    // { label: "Dropdown", value: "dropdown", icon: "caret-down-outline", needsOptions: true },
    { label: "Scale", value: "linear", icon: "options-outline", needsOptions: false },
    { label: "File Upload", value: "uploadfile", icon: "cloud-upload-outline", needsOptions: false },
];

export default function AddQuestionScreen({ route, navigation }) {
    const SectionID = route.params?.sectionId;
    const QuestionID = route.params?.questionId;

    const { showAlert } = useAlert();
    const { showLoading, hideLoading } = useLoading();

    const [openSectionPicker, setOpenSectionPicker] = useState(false);
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(SectionID || null);
    const [sectionItems, setSectionItems] = useState([]);

    const [AnswerType, setAnswerType] = useState("");
    const [Question, setQuestion] = useState("");
    const [Options, setOptions] = useState([""]);
    const [GridRows, setGridRows] = useState([""]);
    const [GridColumns, setGridColumns] = useState([""]);
    const [ScaleMin, setScaleMin] = useState("");
    const [ScaleMax, setScaleMax] = useState("");
    const [isRequired, setIsRequired] = useState(false);
    const [Points, setPoints] = useState("1"); // Default score is 1

    const fetchSections = async () => {
        try {
            showLoading("Loading sections...");
            const data = await fetchYourSectionsApi();
            setSections(data);
            const formattedItems = data.map((sec) => ({
                label: sec.name,
                value: sec.id,
            }));
            setSectionItems(formattedItems);
            if (!selectedSection && formattedItems.length) setSelectedSection(formattedItems[0].value);
        } catch (err) {
            console.error("Failed to fetch sections", err);
            Alert.alert("Error", "Failed to load sections");
        } finally {
            hideLoading();
        }
    };

    const fetchQuestion = async () => {
        showLoading("Loading question...");
        try {
            const res = await getQuestionInfo(QuestionID);
            setQuestion(res?.Question || "");
            setAnswerType(res?.AnswerType || "");
            if (res?.Options) setOptions(JSON.parse(res?.Options));
            if (res?.Rows) setGridRows(res?.Rows);
            if (res?.Columns) setGridColumns(res?.Columns);
            if (res?.ScaleMin) setScaleMin(res?.ScaleMin.toString());
            if (res?.ScaleMax) setScaleMax(res?.ScaleMax.toString());
            if (res?.isRequired !== undefined) setIsRequired(res?.isRequired);
            if (res?.Points) setPoints(res?.Points.toString());
            if (res?.SectionID) setSelectedSection(res.SectionID);
        } catch (error) {
            console.error("Failed to fetch question:", error);
            handleApiError(error, "Failed to fetch question");
        } finally {
            hideLoading();
        }
    };

    useEffect(() => {
        fetchSections();
        if (QuestionID) fetchQuestion();
    }, []);

    const updateArrayValue = (setter, arr, text, index) => {
        const newArr = [...arr];
        newArr[index] = text;
        setter(newArr);
    };

    const addArrayItem = (setter, arr) => {
        setter([...arr, ""]);
    };

    const removeArrayItem = (setter, arr, index) => {
        if (arr.length === 1) return;
        const newArr = arr.filter((_, i) => i !== index);
        setter(newArr);
    };

    const onSelectType = (type) => {
        setAnswerType(type);
        setQuestion("");
        setOptions([""]);
        setGridRows([""]);
        setGridColumns([""]);
        setScaleMin("");
        setScaleMax("");
        setIsRequired(false);
        setPoints("1"); // Reset score to 1 by default
    };

    const saveQuestion = async () => {
        if (!AnswerType) {
            Alert.alert("Error", "Please select a question type");
            return;
        }
        if (!Question.trim()) {
            Alert.alert("Error", "Please enter question text");
            return;
        }
        if (!selectedSection) {
            Alert.alert("Error", "Please select a section");
            return;
        }
        if (
            (AnswerType === "mc" || AnswerType === "checkbox" || AnswerType === "dropdown") &&
            Options.some((opt) => !opt.trim())
        ) {
            Alert.alert("Error", "All options must be filled out");
            return;
        }
        if (
            (AnswerType === "multipleChoiceGrid" || AnswerType === "checkboxGrid") &&
            (GridRows.some((r) => !r.trim()) || GridColumns.some((c) => !c.trim()))
        ) {
            Alert.alert("Error", "All grid rows and columns must be filled out");
            return;
        }
        if (AnswerType === "linear") {
            const min = parseInt(ScaleMin);
            const max = parseInt(ScaleMax);
            if (isNaN(min) || isNaN(max) || min >= max) {
                Alert.alert("Error", "Please enter valid scale min and max values (min < max)");
                return;
            }
        }
        if (Points === "" || isNaN(parseInt(Points)) || parseInt(Points) < 0) {
            Alert.alert("Error", "Please enter a valid Points (0 or more)");
            return;
        }

        const payload = {
            SectionID: selectedSection,
            AnswerType,
            Question: Question.trim(),
            isRequired:isRequired,
            Points: parseInt(Points),
        };

        if (AnswerType === "mc" || AnswerType === "checkbox" || AnswerType === "dropdown") {
            payload.Options = Options.map((o) => o.trim());
        }
        if (AnswerType === "multipleChoiceGrid" || AnswerType === "checkboxGrid") {
            payload.Rows = GridRows.map((r) => r.trim());
            payload.Columns = GridColumns.map((c) => c.trim());
        }
        if (AnswerType === "linear") {
            payload.ScaleMin = parseInt(ScaleMin);
            payload.ScaleMax = parseInt(ScaleMax);
        }

        if (QuestionID) {
            payload.QuestionID = QuestionID;
        }

        showLoading("Saving question...");
        try {
            await addQuestion(selectedSection, payload);
            showAlert("success", "Success", "Question saved successfully.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || error.message || "Something went wrong");
        } finally {
            hideLoading();
        }
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <BackHeader title="Add Question" onPress={() => navigation.goBack()} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 120}
                style={{ flex: 1, paddingHorizontal: 12, paddingTop: 8 }}
            >
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}>
                    <Text style={styles.label}>Question Type</Text>
                    <View style={styles.typeGrid}>
                        {questionTypes.map((item) => {
                            const selected = AnswerType === item.value;
                            return (
                                <TouchableOpacity
                                    key={item.value}
                                    style={[styles.typeCard, selected && styles.typeCardSelected]}
                                    onPress={() => onSelectType(item.value)}
                                    activeOpacity={0.8}
                                >
                                    <Icon
                                        name={item.icon}
                                        size={20}
                                        color={selected ? "#fff" : theme.colors.light.primary}
                                        style={{ marginBottom: 6 }}
                                    />
                                    <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>{item.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={styles.label}>Question Text</Text>
                    <TextInput
                        style={[styles.input, { minHeight: 50, marginBottom: 16 }]}
                        placeholder="Enter your question here"
                        value={Question}
                        onChangeText={setQuestion}
                        multiline
                        textAlignVertical="top"
                        autoFocus={true}
                    />

                    {(AnswerType === "mc" || AnswerType === "checkbox" || AnswerType === "dropdown") && (
                        <>
                            <Text style={styles.label}>Options</Text>
                            {Options.map((opt, i) => (
                                <View key={i} style={styles.optionRow}>
                                    <TextInput
                                        style={[styles.input, styles.optionInput]}
                                        placeholder={`Option ${i + 1}`}
                                        value={opt}
                                        onChangeText={(text) => updateArrayValue(setOptions, Options, text, i)}
                                        maxLength={100}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeOptionBtn}
                                        onPress={() => removeArrayItem(setOptions, Options, i)}
                                        activeOpacity={0.7}
                                    >
                                        <Icon name="close-circle" size={22} color={theme.colors.light.danger || "#FF4C4C"} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={styles.addOptionBtn}
                                onPress={() => addArrayItem(setOptions, Options)}
                                activeOpacity={0.7}
                            >
                                <Icon name="add-circle-outline" size={22} color={theme.colors.light.primary} />
                                <Text style={styles.addOptionText}>Add Option</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {(AnswerType === "multipleChoiceGrid" || AnswerType === "checkboxGrid") && (
                        <>
                            <Text style={styles.label}>Rows</Text>
                            {GridRows.map((row, i) => (
                                <View key={`row-${i}`} style={styles.optionRow}>
                                    <TextInput
                                        style={[styles.input, styles.optionInput]}
                                        placeholder={`Row ${i + 1}`}
                                        value={row}
                                        onChangeText={(text) => updateArrayValue(setGridRows, GridRows, text, i)}
                                        maxLength={100}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeOptionBtn}
                                        onPress={() => removeArrayItem(setGridRows, GridRows, i)}
                                        activeOpacity={0.7}
                                    >
                                        <Icon name="close-circle" size={22} color={theme.colors.light.danger || "#FF4C4C"} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={styles.addOptionBtn}
                                onPress={() => addArrayItem(setGridRows, GridRows)}
                                activeOpacity={0.7}
                            >
                                <Icon name="add-circle-outline" size={22} color={theme.colors.light.primary} />
                                <Text style={styles.addOptionText}>Add Row</Text>
                            </TouchableOpacity>

                            <Text style={[styles.label, { marginTop: 10 }]}>Columns</Text>
                            {GridColumns.map((col, i) => (
                                <View key={`col-${i}`} style={styles.optionRow}>
                                    <TextInput
                                        style={[styles.input, styles.optionInput]}
                                        placeholder={`Column ${i + 1}`}
                                        value={col}
                                        onChangeText={(text) => updateArrayValue(setGridColumns, GridColumns, text, i)}
                                        maxLength={100}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeOptionBtn}
                                        onPress={() => removeArrayItem(setGridColumns, GridColumns, i)}
                                        activeOpacity={0.7}
                                    >
                                        <Icon name="close-circle" size={22} color={theme.colors.light.danger || "#FF4C4C"} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={styles.addOptionBtn}
                                onPress={() => addArrayItem(setGridColumns, GridColumns)}
                                activeOpacity={0.7}
                            >
                                <Icon name="add-circle-outline" size={22} color={theme.colors.light.primary} />
                                <Text style={styles.addOptionText}>Add Column</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {AnswerType === "linear" && (
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6, marginBottom: 18 }}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.label}>Min Value</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={ScaleMin}
                                    onChangeText={setScaleMin}
                                    placeholder="Min"
                                    maxLength={3}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Max Value</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={ScaleMax}
                                    onChangeText={setScaleMax}
                                    placeholder="Max"
                                    maxLength={3}
                                />
                            </View>
                        </View>
                    )}

                    <View style={{ marginBottom: 20 }}>
                        <CText fontSize={16} fontStyle="SB">Question Settings</CText>
                    </View>
                    <View style={styles.switchContainer}>
                        <Text style={styles.label}>Required</Text>
                        <TouchableOpacity
                            onPress={() => setIsRequired(!isRequired)}
                            style={[styles.switch, isRequired ? styles.switchOn : styles.switchOff]}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.switchCircle, isRequired ? styles.switchCircleOn : styles.switchCircleOff]} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.switchContainer}>
                        <Text style={styles.label}>Points</Text>
                        <TextInput
                            style={[styles.input, { width: 70, textAlign: "center", fontWeight: "bold" }]}
                            keyboardType="numeric"
                            placeholder="Enter score points"
                            value={Points}
                            onChangeText={(text) => {
                                if (/^\d{0,3}$/.test(text)) setPoints(text);
                            }}
                            maxLength={3}
                        />
                    </View>
                    {/*<Text style={styles.label}>Move to Section</Text>*/}
                    {/*<DropDownPicker*/}
                    {/*    open={openSectionPicker}*/}
                    {/*    value={selectedSection}*/}
                    {/*    items={sectionItems}*/}
                    {/*    setOpen={setOpenSectionPicker}*/}
                    {/*    setValue={setSelectedSection}*/}
                    {/*    setItems={setSectionItems}*/}
                    {/*    containerStyle={{ marginBottom: 16 }}*/}
                    {/*    style={{*/}
                    {/*        borderColor: "#bbb",*/}
                    {/*        backgroundColor: "#fff",*/}
                    {/*    }}*/}
                    {/*    dropDownContainerStyle={{*/}
                    {/*        borderColor: "#bbb",*/}
                    {/*        backgroundColor: "#fff",*/}
                    {/*    }}*/}
                    {/*    zIndex={5000}*/}
                    {/*/>*/}
                    <TouchableOpacity style={styles.saveBtn} onPress={saveQuestion} activeOpacity={0.9}>
                        <Text style={styles.saveBtnText}>Save Question</Text>
                    </TouchableOpacity>

                    <Text>{'\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'}</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        color: "#333",
    },
    typeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    typeCard: {
        width: "31%",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.light.primary + "99",
        paddingVertical: 10,
        alignItems: "center",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    typeCardSelected: {
        backgroundColor: theme.colors.light.primary,
        borderColor: theme.colors.light.primary,
        shadowOpacity: 0.2,
    },
    typeLabel: {
        fontSize: 13,
        color: theme.colors.light.primary,
        fontWeight: "600",
    },
    typeLabelSelected: {
        color: "#fff",
    },
    input: {
        borderWidth: 1,
        borderColor: "#bbb",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: "#fff",
        color: "#333",
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    optionInput: {
        flex: 1,
    },
    removeOptionBtn: {
        marginLeft: 10,
    },
    addOptionBtn: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    addOptionText: {
        marginLeft: 6,
        color: theme.colors.light.primary,
        fontWeight: "600",
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    switch: {
        width: 40,
        height: 22,
        borderRadius: 12,
        padding: 2,
    },
    switchOn: {
        backgroundColor: theme.colors.light.primary,
    },
    switchOff: {
        backgroundColor: "#bbb",
    },
    switchCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    switchCircleOn: {
        backgroundColor: "#fff",
        alignSelf: "flex-end",
    },
    switchCircleOff: {
        backgroundColor: "#fff",
        alignSelf: "flex-start",
    },
    saveBtn: {
        backgroundColor: theme.colors.light.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 30,
    },
    saveBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});
