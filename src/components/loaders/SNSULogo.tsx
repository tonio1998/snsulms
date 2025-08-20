import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import Svg, { G, Path, Ellipse, LinearGradient, Stop, Defs } from "react-native-svg";

// Animated wrappers
const APath = Animated.createAnimatedComponent(Path);
const AEllipse = Animated.createAnimatedComponent(Ellipse);
const AG = Animated.createAnimatedComponent(G);

export default function SNSULogoDraw({
                                         size = 220,
                                         stroke = "#1E5631",        // deep green stroke
                                         accent = "#E53935",        // torch red
                                         accent2 = "#2E7D32",       // orbit green
                                         accent3 = "#1E88E5",       // orbit blue
                                         fillTorch = ["#FFB74D", "#E65100"], // torch flame gradient
                                     }: {
    size?: number;
    stroke?: string;
    accent?: string;
    accent2?: string;
    accent3?: string;
    fillTorch?: [string, string];
}) {
    // progress per segment
    const pTorch = useRef(new Animated.Value(0)).current;
    const pOrbit1 = useRef(new Animated.Value(0)).current;
    const pOrbit2 = useRef(new Animated.Value(0)).current;
    const pOrbit3 = useRef(new Animated.Value(0)).current;
    const pBook = useRef(new Animated.Value(0)).current;

    // fades after strokes
    const fadeFill = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(0)).current; // gentle scale pulse

    // Approximated path lengths (set bigger than real)
    const LEN = {
        torchOutline: 520,
        orbit1: 700,
        orbit2: 700,
        orbit3: 700,
        book: 620,
    };

    useEffect(() => {
        const dur = 800;

        const drawTorch = Animated.timing(pTorch, {
            toValue: 1,
            duration: dur,
            easing: Easing.ease,
            useNativeDriver: true,
        });
        const drawOrbit1 = Animated.timing(pOrbit1, {
            toValue: 1,
            duration: dur,
            easing: Easing.ease,
            useNativeDriver: true,
        });
        const drawOrbit2 = Animated.timing(pOrbit2, {
            toValue: 1,
            duration: dur,
            easing: Easing.ease,
            useNativeDriver: true,
        });
        const drawOrbit3 = Animated.timing(pOrbit3, {
            toValue: 1,
            duration: dur,
            easing: Easing.ease,
            useNativeDriver: true,
        });
        const drawBook = Animated.timing(pBook, {
            toValue: 1,
            duration: dur,
            easing: Easing.ease,
            useNativeDriver: true,
        });

        const fadeIn = Animated.timing(fadeFill, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        });

        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        // Orchestrate: Torch → Orbits (stagger) → Book → Fill → Pulse
        Animated.sequence([
            drawTorch,
            Animated.stagger(140, [drawOrbit1, drawOrbit2, drawOrbit3]),
            drawBook,
            fadeIn,
            Animated.timing(new Animated.Value(0), {
                toValue: 1,
                duration: 150, // acts like delay
                useNativeDriver: true,
            }),
        ]).start(() => {
            pulseLoop.start(); // start pulse AFTER everything finishes
        });

    });


    // Helpers
    const dash = (progress: Animated.Value, len: number) => ({
        strokeDasharray: `${len}`,
        strokeDashoffset: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [len, 0],
        }),
    });

    const scalePulse = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.03],
    });

    // ViewBox & proportions
    const vb = 300; // virtual canvas
    const s = size;

    return (
        <View style={styles.wrapper}>
            <Animated.View style={{transform: [{scale: scalePulse}]}}>
                <Svg width={s} height={s} viewBox={`0 0 ${vb} ${vb}`}>
                    <Defs>
                        <LinearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor={fillTorch[0]}/>
                            <Stop offset="100%" stopColor={fillTorch[1]}/>
                        </LinearGradient>
                    </Defs>

                    {/* ——— Torch outline (simplified) ——— */}
                    <APath
                        d={`
              M150 190 
              c16 -30 16 -60 0 -90 
              c-8 -14 -8 -24 0 -38
              M135 200 h30 
              m-25 10 h20
            `}
                        stroke={stroke}
                        strokeWidth={4}
                        fill="none"
                        {...dash(pTorch, LEN.torchOutline)}
                    />

                    {/* Torch fill (flame + cup) */}
                    <AG opacity={fadeFill}>
                        {/* flame */}
                        <Path
                            d="M150 112
                 c18 -20 10 -40 0 -52
                 c-12 12 -22 24 -14 38
                 c-8 10 -6 26 14 14z"
                            fill="url(#flameGrad)"
                        />
                        {/* cup */}
                        <Path
                            d="M130 172 h40 l-8 14 h-24 z"
                            fill={stroke}
                            opacity={0.9}
                        />
                        {/* stem */}
                        <Path
                            d="M142 186 h16 v22 h-16 z"
                            fill={stroke}
                            opacity={0.8}
                        />
                    </AG>

                    {/* ——— Atomic orbits ——— */}
                    <AEllipse
                        cx="150"
                        cy="160"
                        rx="80"
                        ry="38"
                        rotation="0"
                        stroke={accent3}
                        strokeWidth={3}
                        fill="none"
                        {...dash(pOrbit1, LEN.orbit1)}
                    />
                    <AEllipse
                        cx="150"
                        cy="160"
                        rx="80"
                        ry="38"
                        rotation="60"
                        stroke={accent2}
                        strokeWidth={3}
                        fill="none"
                        {...dash(pOrbit2, LEN.orbit2)}
                    />
                    <AEllipse
                        cx="150"
                        cy="160"
                        rx="80"
                        ry="38"
                        rotation="-60"
                        stroke={accent}
                        strokeWidth={3}
                        fill="none"
                        {...dash(pOrbit3, LEN.orbit3)}
                    />

                    {/* ——— Book (base) ——— */}
                    <APath
                        d={`
              M40 220
              c36 -24 84 -24 110 0
              c36 -24 84 -24 110 0
            `}
                        stroke={stroke}
                        strokeWidth={5}
                        fill="none"
                        {...dash(pBook, LEN.book)}
                    />

                    {/* Book fill after draw */}
                    <AG opacity={fadeFill}>
                        <Path
                            d="M40 220
                 c36 -24 84 -24 110 0
                 l0 16
                 c-36 -18 -74 -18 -110 0
                 z"
                            fill="#E8F5E9"
                        />
                        <Path
                            d="M150 220
                 c36 -24 84 -24 110 0
                 l0 16
                 c-36 -18 -74 -18 -110 0
                 z"
                            fill="#E8F5E9"
                        />
                    </AG>
                </Svg>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        justifyContent: "center",
        alignItems: "center",
    },
});
