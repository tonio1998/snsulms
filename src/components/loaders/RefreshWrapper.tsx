import React, { useRef } from 'react';
import {
    Animated,
    RefreshControl,
    StyleSheet,
    View,
    Text,
} from 'react-native';

export default function FancyRefreshScreen() {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000); // fake loading
    };

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.content}>
                    <Text style={styles.text}>Swipe down to refresh 👇</Text>
                </View>
            </Animated.ScrollView>

            {/* Elastic animation effect */}
            <Animated.View
                style={[
                    styles.elastic,
                    {
                        transform: [
                            {
                                translateY: scrollY.interpolate({
                                    inputRange: [-150, 0],
                                    outputRange: [80, 0], // pulls down
                                    extrapolate: 'clamp',
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Text style={styles.loader}>🔄</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 700,
    },
    text: { fontSize: 20 },
    elastic: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: { fontSize: 28 },
});
