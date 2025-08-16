import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../../theme";
import LinearRating from "./LinearRating.tsx";

/**
 * Renders a preview component for a survey answer depending on its type.
 * @param type - The question type (mc, checkbox, short, par, etc.)
 * @param choices - Answer choices (JSON string or array)
 * @param items - Extra parameters (scaleMin, scaleMax, etc.)
 */
export const RenderAnswerPreview = ({ type, choices, items }) => {
    let parsedChoices: string[] = [];

    try {
        if (typeof choices === "string") {
            const parsed = JSON.parse(choices);
            parsedChoices = Array.isArray(parsed) ? parsed : [];
        } else if (Array.isArray(choices)) {
            parsedChoices = choices;
        } else {
            parsedChoices = [];
        }
    } catch {
        parsedChoices = [];
    }

    // Handle multiple-choice and checkbox
    if (type === "mc" || type === "checkbox") {
        return (
            <SelectableChoices
                choices={parsedChoices}
                isRadio={type === "mc"}
            />
        );
    }

    // Base input style shared across inputs
    const baseInputStyle = {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
        color: theme.colors.light.text || "#222",
        backgroundColor: "#fff",
        marginTop: 5,
    };

    switch (type) {
        case "short":
            return (
                <TextInput
                    style={baseInputStyle}
                    editable={false}
                    placeholder="Short answer"
                    placeholderTextColor={theme.colors.light.text || "#999"}
                />
            );

        case "par":
            return (
                <TextInput
                    style={[baseInputStyle, { height: 120, textAlignVertical: "top" }]}
                    editable={false}
                    multiline
                    placeholder="Paragraph answer"
                    placeholderTextColor={theme.colors.light.muted || "#999"}
                />
            );

        case "uploadfile":
        case "date":
            return (
                <TouchableOpacity
                    disabled
                    style={[
                        baseInputStyle,
                        { flexDirection: "row", alignItems: "center", borderWidth: 1 },
                    ]}
                >
                    <Icon
                        name={
                            type === "uploadfile"
                                ? "cloud-upload-outline"
                                : "calendar-outline"
                        }
                        size={22}
                        color={theme.colors.light.disabled || "#999"}
                    />
                    <Text
                        style={{
                            marginLeft: 12,
                            color: theme.colors.light.disabled || "#999",
                            fontSize: 16,
                        }}
                    >
                        {type === "uploadfile" ? "Upload file" : "Select date"}
                    </Text>
                </TouchableOpacity>
            );

        case "linear":
            return (
                <LinearRating
                    scaleMin={items?.ScaleMin || 1}
                    scaleMax={items?.ScaleMax || 5}
                />
            );

        default:
            return (
                <Text
                    style={{
                        fontStyle: "italic",
                        color: theme.colors.light.disabled || "#999",
                        textAlign: "center",
                        paddingVertical: 20,
                        fontSize: 16,
                    }}
                >
                    No preview available
                </Text>
            );
    }
};

/**
 * SelectableChoices component
 * Handles both multiple choice (radio) and checkbox options.
 */
const SelectableChoices = ({ choices = [], isRadio }) => {
    const [selected, setSelected] = useState(isRadio ? null : []);

    const toggleSelection = (index: number) => {
        if (isRadio) {
            setSelected(index);
        } else {
            setSelected((prev) =>
                prev.includes(index)
                    ? prev.filter((i) => i !== index)
                    : [...prev, index]
            );
        }
    };

    const defaultChoices = ["Option 1", "Option 2"];
    const safeChoices = Array.isArray(choices) ? choices : [];

    return (
        <View style={{ marginVertical: 8 }}>
            {(safeChoices.length ? safeChoices : defaultChoices).map((choice, i) => {
                const checked = isRadio ? selected === i : selected.includes(i);

                return (
                    <TouchableOpacity
                        key={i}
                        onPress={() => toggleSelection(i)}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginVertical: 2,
                            padding: 8,
                            borderRadius: 8,
                            borderWidth: checked ? 1 : 0,
                            borderColor: "#ccc",
                            backgroundColor: checked
                                ? theme.colors.light.background || "#e6f0ff"
                                : "transparent",
                        }}
                    >
                        {/* Radio/Checkbox Icon */}
                        <View
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: isRadio ? 12 : 6,
                                borderWidth: 1,
                                borderColor: checked ? theme.colors.light.primary : "#999",
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 10,
                                backgroundColor: checked
                                    ? theme.colors.light.primary
                                    : "transparent",
                            }}
                        >
                            {checked &&
                                (isRadio ? (
                                    <View
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: 6,
                                            backgroundColor: "#fff",
                                        }}
                                    />
                                ) : (
                                    <Icon name="checkmark" size={18} color="#fff" />
                                ))}
                        </View>

                        {/* Choice Label */}
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: "500",
                                color: checked
                                    ? theme.colors.light.text || "#222"
                                    : "#444",
                            }}
                        >
                            {choice}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
