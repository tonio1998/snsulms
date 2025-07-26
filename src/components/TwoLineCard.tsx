import React from 'react';
import { View } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

export const TwoLineCard = ({
                         label,
                         value,
                         loading = false,
                         formatNumber = v => v,
                         CText,
                         backgroundColor = '#2196f315', // default: translucent blue
                         textColor = '#2196F3', // default: blue text
                     }) => {
    return (
        <View
            style={{
                backgroundColor,
                padding: 16,
                borderRadius: 20,
                minWidth: 140,
                flex: 1,
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
            }}
        >
            <CText fontSize={14} fontStyle="M" style={{ color: textColor }}>
                {label}
            </CText>

            {loading ? (
                <ShimmerPlaceHolder
                    style={{ width: 80, height: 28, borderRadius: 4, marginTop: 4 }}
                    autoRun
                />
            ) : (
                <CText fontSize={24} fontStyle="B" style={{ color: textColor, marginTop: 4 }}>
                    {formatNumber(value)}
                </CText>
            )}
        </View>
    );
};

export default TwoLineCard;
