import { useEffect, useState } from "react";

export const Countdown({ start = 60 }) {
    const [time, setTime] = useState(start);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return <span>{time}</span>;
}
