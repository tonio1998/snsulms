import React, { useEffect, useState, useRef } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CText } from "../common/CText.tsx";
import { updateSurveyTimer } from "../../api/testBuilder/testbuilderApi.ts";

export default function SurveyTimer({ response, endSurvey }) {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const lastSentRef = useRef(null);
    const storageKey = `surveyTimer_${response?.id}`;

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const formatMinutesDecimal = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return parseFloat(`${m}.${s.toString().padStart(2, "0")}`);
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            const saved = await AsyncStorage.getItem(storageKey);
            if (mounted) {
                setSecondsLeft(
                    saved !== null ? parseInt(saved, 10) : (response?.RemainingTime || 0) * 60
                );
            }
        })();
        return () => {
            mounted = false;
        };
    }, [storageKey]);

    useEffect(() => {
        if (secondsLeft > 0) {
            const interval = setInterval(() => {
                setSecondsLeft((prev) => {
                    const newTime = prev - 1;
                    AsyncStorage.setItem(storageKey, String(newTime));

                    const decimalTime = formatMinutesDecimal(newTime);
                    if (decimalTime !== lastSentRef.current) {
                        lastSentRef.current = decimalTime;
                        updateSurveyTimer(response?.id, decimalTime);
                    }

                    if (newTime <= 0) {
                        clearInterval(interval);
                        endSurvey(response?.id);
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [secondsLeft, storageKey]);

    return (
        <View>
            <CText fontStyle="SB" fontSize={18}>
                {formatTime(secondsLeft)}
            </CText>
        </View>
    );
}
