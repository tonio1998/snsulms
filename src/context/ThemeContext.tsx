import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme as baseTheme } from "../theme";

type Mode = "light" | "dark";
type ThemeColors = typeof baseTheme.colors.light;

type ThemeContextType = {
    mode: Mode;
    colors: ThemeColors;
    toggleTheme: () => Promise<void>;
    spacing: typeof baseTheme.spacing;
    fontSizes: typeof baseTheme.fontSizes;
    radius: typeof baseTheme.radius;
    elevation: typeof baseTheme.elevation;
    opacity: typeof baseTheme.opacity;
    fonts: typeof baseTheme.font;
};

const ThemeContext = createContext<ThemeContextType>({
    mode: "light",
    colors: baseTheme.colors.light,
    toggleTheme: async () => {},
    spacing: baseTheme.spacing,
    fontSizes: baseTheme.fontSizes,
    radius: baseTheme.radius,
    elevation: baseTheme.elevation,
    opacity: baseTheme.opacity,
    fonts: baseTheme.font,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<Mode>("light");
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        console.log("🔍 Fetching theme from AsyncStorage", mode);
        (async () => {
            try {
                const saved = await AsyncStorage.getItem("appTheme");
                if (saved === "dark" || saved === "light") setMode(saved);
                console.log("🔍 Fetching theme from AsyncStorage", mode);
            } finally {
                setHydrated(true);
            }
        })();
    }, []);

    const toggleTheme = async () => {
        const next: Mode = mode === "light" ? "dark" : "light";
        setMode(next);
        await AsyncStorage.setItem("appTheme", next);
    };

    const value = useMemo(
        () => ({
            mode,
            colors: baseTheme.colors[mode],
            toggleTheme,
            spacing: baseTheme.spacing,
            fontSizes: baseTheme.fontSizes,
            radius: baseTheme.radius,
            elevation: baseTheme.elevation,
            opacity: baseTheme.opacity,
            fonts: baseTheme.font,
        }),
        [mode]
    );

    if (!hydrated) return null; // avoids flicker on first load
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
