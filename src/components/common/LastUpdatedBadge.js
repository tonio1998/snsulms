import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../theme';
import {CText} from "./CText";

export const LastUpdatedBadge = ({ date, onReload, style }) => {
    if (!date && !onReload) return null;

    const formatted = date
        ? new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
        : '';

    return (
        <>
            {date && (
                <View style={[styles.container, style]}>
                    <View style={styles.left}>
                        <Icon
                            name="time-outline"
                            size={16}
                            color={theme.colors.light.primary}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.text]}>
                            {date ? `${formatted}` : ''}
                        </Text>
                    </View>

                    {onReload && (
                        <TouchableOpacity style={styles.reloadBtn} onPress={onReload}>
                            <Icon
                                name="refresh-outline"
                                size={18}
                                color="#fff"
                            />
                            <CText fontSize={12} style={{color: '#fff'}}>Refresh</CText>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.light.primary + '22',
        borderRadius: 50,
        // paddingVertical: 8,
        // paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        marginVertical: 10
        // elevation: 2,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    text: {
        fontSize: 12,
        color: theme.colors.light.text,
        fontWeight: '500',
    },
    reloadBtn: {
        // marginLeft: 12,
        backgroundColor: theme.colors.light.primary,
        padding: 3,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5
    },
});
