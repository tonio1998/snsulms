import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import Svg, { Circle, Rect } from "react-native-svg";
import {theme} from "../theme";

export const SummaryCard = ({
                                title,
                                stats,
                                loading,
                                formatNumber = (v) => v,
                                CText,
                                gradientColors = [theme.colors.light.primary, '#fff'],
                                textColor = "#fff",
                                cardStyle = {}
                            }) => {
    return (
        <View style={[styles.cardContainer, cardStyle]}>
            {/* Gradient Background */}
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Circle cx="85%" cy="20%" r="50" fill="#ffffff20" />
                <Rect
                    x="10%"
                    y="70%"
                    width="60"
                    height="60"
                    rx="12"
                    fill="#ffffff15"
                    transform="rotate(15 50 50)"
                />
            </Svg>

            <View style={{ padding: 16 }}>
                {title && (
                    <CText fontSize={18} fontStyle="B" style={{ color: textColor, marginBottom: 12 }}>
                        {title}
                    </CText>
                )}

                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
                    {stats.map((stat, index) => (
                        <View key={index} style={{ flex: 1 }}>
                            {stat.label && (
                                <CText fontSize={14} fontStyle="M" numberOfLines={1} style={{ color: textColor }}>
                                    {stat.label}
                                </CText>
                            )}

                            {loading ? (
                                <ShimmerPlaceHolder
                                    LinearGradient={LinearGradient}
                                    style={{ width: 80, height: 28, borderRadius: 4, marginTop: 4 }}
                                    shimmerStyle={{ borderRadius: 4 }}
                                    autoRun
                                />
                            ) : (
                                <CText fontSize={24} fontStyle="B" style={{ color: textColor }}>
                                    {formatNumber(stat.value)}
                                </CText>
                            )}
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: theme.radius.md,
        overflow: "hidden",
        minWidth: 150,
        flex: 1,
        marginVertical: 8,
        shadowColor: theme.colors.light.primary,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 5
    }
});
