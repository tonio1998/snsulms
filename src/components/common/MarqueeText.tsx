import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, Dimensions } from 'react-native';

interface MarqueeTextProps {
    text: string;
    speed?: number; // ms per pixel
    gap?: number;   // space between repeats
}

export default function MarqueeText({ text, speed = 20, gap = 50 }: MarqueeTextProps) {
    const screenWidth = Dimensions.get('window').width;
    const scrollX = useRef(new Animated.Value(0)).current;
    const [textWidth, setTextWidth] = useState(0);

    useEffect(() => {
        if (textWidth === 0) return;

        const distance = textWidth + gap;
        const duration = distance * speed;

        const loopAnim = Animated.loop(
            Animated.timing(scrollX, {
                toValue: -distance,
                duration,
                useNativeDriver: true,
            })
        );

        loopAnim.start();
        return () => loopAnim.stop();
    }, [textWidth, speed, gap]);

    return (
        <View style={{ overflow: 'hidden', height: 30 }}>
            <Animated.View
                style={{
                    flexDirection: 'row',
                    transform: [{ translateX: scrollX }],
                }}
            >
                {/* First copy of the text */}
                <Text
                    numberOfLines={1}
                    style={{ fontSize: 18, paddingRight: gap, flexShrink: 0 }}
                    onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
                >
                    {text}
                </Text>

                {/* Second copy of the text for seamless loop */}
                <Text
                    numberOfLines={1}
                    style={{ fontSize: 18, paddingRight: gap, flexShrink: 0 }}
                >
                    {text}
                </Text>
            </Animated.View>
        </View>
    );
}
