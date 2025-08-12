import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../../theme";
import LinearRating from "./LinearRating.tsx";

export const renderAnswerPreview = ({ type, choices, items }) => {
    let parsedChoices = [];
    try {
        parsedChoices = typeof choices === "string" ? JSON.parse(choices) : choices;
    } catch {
        parsedChoices = [];
    }
    if (type === "mc" || type === "checkbox") return <SelectableChoices choices={parsedChoices} isRadio={type === "mc"} />;

    const baseInputStyle = {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
        color: theme.colors.light.text || "#222",
        backgroundColor: "#fff",
        marginTop: 5
    };

    switch (type) {
        case "short":
            return <TextInput
                style={baseInputStyle}
                editable={false}
                placeholder="Short answer"
                placeholderTextColor={theme.colors.light.text || "#999"} />;
        case "par":
            return <TextInput {...{editable:false, multiline:true, placeholder:"Paragraph answer", placeholderTextColor:theme.colors.light.muted||"#999"}} style={[baseInputStyle, { height: 120, textAlignVertical: "top" }]} />;
        case "uploadfile":
        case "date":
            return (
                <TouchableOpacity disabled style={[baseInputStyle, {flexDirection: "row", alignItems: "center", borderWidth: 1}]}>
                    <Icon name={type === "uploadfile" ? "cloud-upload-outline" : "calendar-outline"} size={22} color={theme.colors.light.disabled || "#999"} />
                    <Text style={{ marginLeft: 12, color: theme.colors.light.disabled || "#999", fontSize: 16 }}>{type === "uploadfile" ? "Upload file" : "Select date"}</Text>
                </TouchableOpacity>
            );
        case "linear":
            return <LinearRating
                scaleMin={items.ScaleMin}
                scaleMax={items.ScaleMax}
            />
        default:
            return (
                <Text style={{ fontStyle: "italic", color: theme.colors.light.disabled || "#999", textAlign: "center", paddingVertical: 20, fontSize: 16 }}>
                    No preview available
                </Text>
            );
    }
};

const SelectableChoices = ({ choices = [], isRadio }) => {
    const [selected, setSelected] = useState(isRadio ? null : []);

    const onPress = (index) => {
        if (isRadio) setSelected(index);
        else setSelected(selected.includes(index) ? selected.filter(i => i !== index) : [...selected, index]);
    };

    return (
        <View style={{ marginVertical: 8 }}>
            {(choices.length ? choices : ["Option 1", "Option 2"]).map((choice, i) => {
                const checked = isRadio ? selected === i : selected.includes(i);
                return (
                    <TouchableOpacity
                        key={i}
                        onPress={() => onPress(i)}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginVertical: 2,
                            padding: 8,
                            borderRadius: 8,
                            borderWidth: checked ? 1 : 0,
                            borderColor: "#ccc",
                            backgroundColor: checked ? (theme.colors.light.background || "#e6f0ff") : "transparent",
                            // shadowColor: checked ? theme.colors.light.primary : "transparent",
                            // shadowOpacity: checked ? 0.3 : 0,
                            // shadowRadius: checked ? 6 : 0,
                            // shadowOffset: checked ? { width: 0, height: 2 } : { width: 0, height: 0 },
                            // elevation: checked ? 3 : 0,
                        }}
                    >
                        <View style={{
                            width: 20,
                            height: 20,
                            borderRadius: isRadio ? 12 : 6,
                            borderWidth: 1,
                            borderColor: checked ? theme.colors.light.primary : "#999",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                            backgroundColor: checked ? theme.colors.light.primary : "transparent"
                        }}>
                            {checked && (isRadio
                                ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#fff" }} />
                                : <Icon name="checkmark" size={18} color="#fff" />)}
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: "500", color: checked ? (theme.colors.light.text || "#222") : "#444" }}>
                            {choice}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
