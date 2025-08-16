import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../theme";
import Icon from "react-native-vector-icons/Ionicons";
import LinearRating from "./LinearRating.tsx";

const AnswerInput = React.memo(({ question, answer, onChange }) => {
    const choices = question?.Options;

    const parsedChoices = React.useMemo(() => {
        try {
            return typeof choices === "string" ? JSON.parse(choices) : choices;
        } catch {
            return [];
        }
    }, [choices]);

    const [localValue, setLocalValue] = useState(answer || "");
    const debounceTimeout = useRef(null);

    useEffect(() => {
        setLocalValue(answer || "");
    }, [answer]);

    const handleChange = (text) => {
        setLocalValue(text);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            onChange(question.id, text);
        }, 500);
    };

    switch (question?.AnswerType) {
        case "short":
            return (
                <TextInput
                    style={styles.shortInput}
                    value={localValue}
                    onChangeText={handleChange}
                    placeholder="Your answer"
                    placeholderTextColor="#ccc"
                    blurOnSubmit={false}
                />
            );

        case "par":
            return (
                <TextInput
                    style={styles.paragraphInput}
                    value={localValue}
                    onChangeText={handleChange}
                    placeholder="Your answer"
                    multiline
                    numberOfLines={4}
                    blurOnSubmit={false}
                />
            );

        case "mc":
            return (
                <View>
                    {parsedChoices.map((opt, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.optionRow}
                            onPress={() => onChange(question.id, opt)}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name={answer === opt ? "radio-button-on" : "radio-button-off"}
                                size={22}
                                color={answer === opt ? theme.colors.light.primary : "#888"}
                                style={{ marginRight: 8 }}
                            />
                            <Text style={{ fontSize: 16 }}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );

        case "checkbox":
            return (
                <View>
                    {parsedChoices.map((opt, i) => {
                        const selected = Array.isArray(answer) && answer.includes(opt);
                        return (
                            <TouchableOpacity
                                key={i}
                                style={styles.optionRow}
                                onPress={() => {
                                    let newAnswer = Array.isArray(answer) ? [...answer] : [];
                                    if (selected) {
                                        newAnswer = newAnswer.filter((a) => a !== opt);
                                    } else {
                                        newAnswer.push(opt);
                                    }
                                    onChange(question.id, newAnswer);
                                }}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name={selected ? "checkbox" : "square-outline"}
                                    size={22}
                                    color={selected ? theme.colors.light.primary : "#888"}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={{ fontSize: 16 }}>{opt}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );

        case "linear":
            return (
                <LinearRating
                    scaleMin={question.ScaleMin}
                    scaleMax={question.ScaleMax}
                    selectedValue={answer}
                    onSelect={(val) => onChange(question.id, val)}
                />
            );

        default:
            return <Text style={{ color: "#999" }}>Unsupported question type</Text>;
    }
});

const styles = StyleSheet.create({
    shortInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        height: 38,
        color: "#666",
        backgroundColor: "#f9f9f9",
    },
    paragraphInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 10,
        minHeight: 70,
        textAlignVertical: "top",
        color: "#666",
        backgroundColor: "#f9f9f9",
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
});

export default AnswerInput;
