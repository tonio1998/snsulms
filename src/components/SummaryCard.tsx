import {View} from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";

export const SummaryCard = ({
                                title,
                                stats,
                                loading,
                                formatNumber = v => v,
                                CText,
                                backgroundColor = '#28a74515',
                                textColor = '#259644',
                                cardStyle = {} // 🔥 dynamic style here
                            }) => {
    return (
        <View
            style={[
                {
                    backgroundColor,
                    padding: 16,
                    paddingVertical: 16,
                    borderRadius: 8,
                    minWidth: 280,
                    flex: 1,
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 6,
                    elevation: 6,
                    marginVertical: 5
                },
                cardStyle // 👈 override or extend
            ]}
        >
            {title && (
                <CText fontSize={18} fontStyle="B" style={{ color: textColor, marginBottom: 12 }}>
                    {title}
                </CText>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
                {stats.map((stat, index) => (
                    <View key={index} style={{ flex: 1 }}>
                        {stat.label && (
                            <CText fontSize={14} fontStyle="M" style={{ color: textColor }}>
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
    );
};
