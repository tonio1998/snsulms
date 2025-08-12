import React, { memo, useState, useRef } from "react";
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../../theme";

// LinearRating component - controlled version
const LinearRating = ({
                                 scaleMin = 1,
                                 scaleMax = 5,
                                 onSelect,
                                 selectedValue,
                             }) => {
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const scrollRef = useRef(null);

    const circleSize = 32;
    const scaleRange = Array.from(
        { length: scaleMax - scaleMin + 1 },
        (_, i) => scaleMin + i
    );

    const handleScroll = (e) => {
        const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
        setCanScrollLeft(contentOffset.x > 5);
        setCanScrollRight(
            contentOffset.x + layoutMeasurement.width < contentSize.width - 5
        );
    };

    const selected = selectedValue ?? null;

    return (
        <View
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}
        >
            {canScrollLeft && (
                <Icon name="chevron-back" size={20} color="#999" style={{ marginRight: 4 }} />
            )}

            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingHorizontal: 10 }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {scaleRange.map((val) => {
                        const isSelected = selected === val;
                        return (
                            <TouchableOpacity
                                key={val}
                                onPress={() => {
                                    if (onSelect) {
                                        onSelect(val);
                                    }
                                }}
                                activeOpacity={0.7}
                                style={{
                                    height: circleSize,
                                    width: circleSize,
                                    borderRadius: circleSize / 2,
                                    marginHorizontal: 6,
                                    backgroundColor: isSelected
                                        ? theme.colors.light.primary
                                        : theme.colors.light.background || "#f0f0f0",
                                    borderWidth: 1,
                                    borderColor: isSelected ? theme.colors.light.primary : "#ccc",
                                    elevation: isSelected ? 3 : 0,
                                    shadowColor: isSelected ? theme.colors.light.primary : "transparent",
                                    shadowOpacity: isSelected ? 0.3 : 0,
                                    shadowRadius: 4,
                                    shadowOffset: { width: 0, height: 2 },
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        color: isSelected ? "#fff" : "#666",
                                        fontWeight: "600",
                                        fontSize: 16,
                                        userSelect: "none",
                                    }}
                                >
                                    {val}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {canScrollRight && (
                <Icon name="chevron-forward" size={20} color="#999" style={{ marginLeft: 4 }} />
            )}
        </View>
    );
};

export default LinearRating;