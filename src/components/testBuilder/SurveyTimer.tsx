import { useEffect, useState, useRef, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateSurveyTimer } from "../../api/testBuilder/testbuilderApi.ts";

export function useSurveyTimer(response, endSurvey) {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const secondsRef = useRef(secondsLeft);
    const [SurveyStatus, setSurveyStatus] = useState(false);
    secondsRef.current = secondsLeft;

    const storageKey = `surveyTimer_${response?.id}`;
    const debounceTimeout = useRef(null);


    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
    };

    const debouncedUpdateTimer = (id, seconds) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            updateSurveyTimer(id, seconds);
        }, 2000);
    };

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const SurveyStatus = await AsyncStorage.getItem('SurveyStatus_'+response?.id)
                console.log('🔍 Survey Status', SurveyStatus);
                setSurveyStatus(SurveyStatus);
                const saved = await AsyncStorage.getItem(storageKey);
                const savedSeconds = saved ? parseInt(saved, 10) : NaN;

                let initialSeconds = response?.RemainingTime
                    ? parseInt(response.RemainingTime, 10)
                    : 0;

                if (
                    !isNaN(savedSeconds) &&
                    savedSeconds > 0 &&
                    savedSeconds < initialSeconds
                ) {
                    initialSeconds = savedSeconds;
                }

                if (mounted) {
                    setSecondsLeft(initialSeconds);
                }
            } catch (err) {
                console.error("Error loading timer:", err);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [storageKey, response?.id, response?.RemainingTime]);

    useEffect(() => {
        // if (secondsLeft <= 0) return;
        if(SurveyStatus === '1' && secondsLeft > 0){
            const intervalId = setInterval(() => {
                if (secondsRef.current <= 1) {
                    clearInterval(intervalId);
                    if (endSurvey) endSurvey(response?.id);
                    setSecondsLeft(0);
                } else {
                    setSecondsLeft((prev) => prev - 1);
                }
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [secondsLeft, endSurvey, response?.id]);

    useEffect(() => {
        AsyncStorage.setItem(storageKey, String(secondsLeft)).catch((err) =>
            console.error("Error saving timer:", err)
        );
    }, [secondsLeft, storageKey]);

    useEffect(() => {
        if (secondsLeft > 0 && response?.id) {
            debouncedUpdateTimer(response.id, secondsLeft);
        }
    }, [secondsLeft, response?.id]);

    const formattedTime = useMemo(() => formatTime(secondsLeft), [secondsLeft]);

    return useMemo(
        () => ({
            formattedTime,
            seconds: secondsLeft,
        }),
        [formattedTime, secondsLeft]
    );
}
