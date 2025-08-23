import React from "react";
import { View, Dimensions, StyleSheet, ScrollView } from "react-native";
import { WebView } from "react-native-webview";

const FacebookFeed = () => {
    const screenWidth = Math.floor(Dimensions.get("window").width - 20);
    const height = 400;

    const pageUrl = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
        "https://www.facebook.com/SNSUOfficial"
    )}&tabs=timeline&width=${screenWidth}&height=${height}&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true`;

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <WebView
                    source={{ uri: pageUrl }}
                    style={{ width: screenWidth, height }}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
    },
    container: {
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default FacebookFeed;
