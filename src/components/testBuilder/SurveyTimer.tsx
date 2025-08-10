import React, { useEffect, useState, useRef } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CText } from "../common/CText.tsx";
import { updateSurveyTimer } from "../../api/testBuilder/testbuilderApi.ts";

export default function SurveyTimer({ response, endSurvey, onTimeUpdate }) {
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
        AsyncStorage.removeItem(storageKey)
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const saved = await AsyncStorage.getItem(storageKey);
            if (mounted) {
                const initialSeconds = saved !== null ? parseInt(saved, 10) : (response?.RemainingTime || 0) * 60;
                setSecondsLeft(initialSeconds);
                if (onTimeUpdate) onTimeUpdate(initialSeconds);  // report initial time
            }
        })();
        return () => {
            mounted = false;
        };
    }, [storageKey, onTimeUpdate, response]);

    useEffect(() => {
        if (secondsLeft > 0 && !response?.TimeEnded) {
            const interval = setInterval(() => {
                setSecondsLeft((prev) => {
                    const newTime = prev - 1;
                    AsyncStorage.setItem(storageKey, String(newTime));

                    const decimalTime = formatMinutesDecimal(newTime);
                    if (onTimeUpdate) onTimeUpdate(decimalTime); // send updated timeR
                    if (decimalTime !== lastSentRef.current) {
                        lastSentRef.current = decimalTime;
                        updateSurveyTimer(response?.id, decimalTime);
                    }

                    if (newTime <= 0) {
                        clearInterval(interval);
                        // endSurvey(response?.id);
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [secondsLeft, storageKey, onTimeUpdate, response, endSurvey]);

    return (
        <View>
            <CText fontStyle="SB" fontSize={18}>
                {formatTime(secondsLeft)}
            </CText>
        </View>
    );
}
