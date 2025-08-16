import React, { useRef, useState } from "react";
import {ScrollView, TouchableOpacity, Text, View, Dimensions, Linking, Alert} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {theme} from "../theme";

const screenWidth = Dimensions.get("window").width;
async function openApp(url: string, fallbackUrl?: string) {
    try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else if (fallbackUrl) {
            Alert.alert(
                'App not found',
                'App is not installed. Opening website instead.',
                [
                    { text: 'OK', onPress: () => Linking.openURL(fallbackUrl) }
                ]
            );
        } else {
            Alert.alert('Cannot open link', 'No fallback URL available.');
        }
    } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred.');
    }
}
export default function LinkScroll({ buttons }) {
    const scrollRef = useRef(null);
    const [scrollX, setScrollX] = useState(0);
    const [contentWidth, setContentWidth] = useState(0);

    const handleArrowPress = (direction) => {
        if (scrollRef.current) {
            const newX = Math.max(
                0,
                Math.min(
                    scrollX + direction * 150,
                    contentWidth - screenWidth
                )
            );
            scrollRef.current.scrollTo({ x: newX, animated: true });
            setScrollX(newX);
        }
    };

    return (
        <View style={{ marginVertical: 10, marginHorizontal: 0 }}>
            <View>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.link_container}
                    onContentSizeChange={(w) => setContentWidth(w)}
                    onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
                    scrollEventThrottle={16}
                >
                    {buttons.map(({ url, iconSet, iconName, name, fallbackUrl }, idx) => {
                        const IconComponent = iconSet === "Ionicons" ? Icon : FontAwesome;
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={styles.link_button}
                                onPress={() => openApp(url, fallbackUrl)}
                            >
                                <View style={styles.icon_box}>
                                    <IconComponent name={iconName} size={24} color={theme.colors.light.text} />
                                </View>
                                <Text numberOfLines={1} style={styles.link_button_text}>
                                    {name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {scrollX > 0 && (
                    <TouchableOpacity
                        style={[styles.arrow_button, { left: 0 }]}
                        onPress={() => handleArrowPress(-1)}
                    >
                        <Icon name="chevron-back" size={20} color={theme.colors.light.primary} />
                    </TouchableOpacity>
                )}

                {scrollX < contentWidth - screenWidth && (
                    <TouchableOpacity
                        style={[styles.arrow_button, { right: 0 }]}
                        onPress={() => handleArrowPress(1)}
                    >
                        <Icon name="chevron-forward" size={20} color={theme.colors.light.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = {
    link_container: {
        // paddingHorizontal: 10,
        alignItems: "center",
    },
    link_button: {
        alignItems: "center",
        width: 70,
        marginHorizontal: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    icon_box: {
        // backgroundColor: theme.colors.light.primary + '22',
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    link_button_text: {
        color: theme.colors.light.text,
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
    arrow_button: {
        position: "absolute",
        top: "50%",
        marginTop: -18,
        backgroundColor: theme.colors.light.primary + '44',
        padding: 6,
        borderRadius: 20,
        // elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        zIndex: 10,
    },
};