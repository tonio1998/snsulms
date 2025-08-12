import React, { useEffect, useState, useRef } from "react";
import { View, Text } from "react-native";

export default function CountdownTimer({ timeLimit, timeStarted, onExpire }) {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!timeStarted || !timeLimit) {
            setSecondsLeft(0);
            return;
        }

        const startTime = new Date(timeStarted).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = timeLimit - elapsedSeconds;

        if (remaining <= 0) {
            setSecondsLeft(0);
            onExpire && onExpire();
            return;
        }

        setSecondsLeft(remaining);

        intervalRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    onExpire && onExpire();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [timeLimit, timeStarted, onExpire]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <View>
            <Text>
                Time Left: {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
            </Text>
        </View>
    );
}
