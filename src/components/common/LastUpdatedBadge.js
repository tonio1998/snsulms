import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../theme';
import { CText } from "./CText";

export const LastUpdatedBadge = ({ date, onReload, style }) => {
    if (!date && !onReload) return null;

    const formatted = date
        ? new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
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
                                size={14}
                                color={theme.colors.light.textSecondary || '#6B7280'}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={styles.text}>{formatted}</Text>
                        </View>

                    {onReload && (
                        <TouchableOpacity style={styles.reloadBtn} onPress={onReload} activeOpacity={0.7}>
                            <Icon name="refresh-outline" size={14} color={theme.colors.light.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 12,
        backgroundColor: 'transparent',
        marginVertical: 4,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontSize: 12,
        color: theme.colors.light.text,
    },
    reloadBtn: {
        marginLeft: 6,
        padding: 2,
        borderRadius: 12,
    },
});
