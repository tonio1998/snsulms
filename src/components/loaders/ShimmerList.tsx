// components/ShimmerList.tsx
import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ViewStyle,
    ListRenderItem,
    RefreshControl,
} from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from "../../theme";

interface ShimmerListProps<T> {
    data: T[];
    loading: boolean;
    renderItem: ListRenderItem<T>;
    keyExtractor: (item: T, index: number) => string;
    refreshing?: boolean;
    onRefresh?: () => void;
    onEndReached?: () => void;
    ListFooterComponent?: React.ReactElement;
    ListEmptyComponent?: React.ReactElement;
    containerStyle?: ViewStyle;
    shimmerCount?: number;
}

export function ShimmerList<T>({
                                   data,
                                   loading,
                                   renderItem,
                                   keyExtractor,
                                   refreshing = false,
                                   onRefresh,
                                   onEndReached,
                                   ListFooterComponent,
                                   ListEmptyComponent,
                                   containerStyle,
                                   shimmerCount = 2,
                               }: ShimmerListProps<T>) {
    const shimmerItems = Array.from({ length: shimmerCount });

    const renderShimmer = (_: any, index: number) => (
        <View
            key={`shimmer-${index}`}
            style={{
                padding: 16,
                backgroundColor: theme.colors.light.card,
                borderRadius: 8,
                marginBottom: 10,
            }}
        >
            <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={{ width: '80%', height: 20, marginBottom: 8, borderRadius: 4 }}
                autoRun
            />
            <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={{ width: '50%', height: 16, borderRadius: 4, marginBottom: 8, }}
                autoRun
            />
            <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={{ width: '60%', height: 16, borderRadius: 4 }}
                autoRun
            />
        </View>
    );

    return (
        <>
            <FlatList
                data={loading ? shimmerItems : data}
                keyExtractor={(item, index) =>
                    loading ? `shimmer-${index}` : keyExtractor(item as T, index)
                }
                renderItem={loading ? renderShimmer : renderItem}
                refreshControl={
                    !loading && onRefresh ? (
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    ) : undefined
                }
                onEndReached={!loading ? onEndReached : undefined}
                onEndReachedThreshold={0.3}
                ListFooterComponent={!loading ? ListFooterComponent : null}
                ListEmptyComponent={!loading ? ListEmptyComponent : null}
                contentContainerStyle={containerStyle}
            />
        </>
    );
}
