import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, PermissionsAndroid, Platform, StyleSheet } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { CText } from "./common/CText"; // ✅ your import style

const Greeting = ({ user }) => {
    const [coords, setCoords] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const requestLocationPermission = async () => {
            if (Platform.OS === "android") {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    setCoords({ lat: 9.7575, lon: 125.5133 }); // fallback Surigao
                    return;
                }
            }
            Geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                () => {
                    setCoords({ lat: 9.7575, lon: 125.5133 }); // fallback Surigao
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        };

        requestLocationPermission();
    }, []);

    useEffect(() => {
        if (!coords) return;
        fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=relativehumidity_2m`
        )
            .then((res) => res.json())
            .then((data) => {
                const humidity = data.hourly?.relativehumidity_2m?.[0] ?? null;
                console.log("weather data", data);
                setWeatherData({
                    temp: data.current_weather?.temperature,
                    wind: data.current_weather?.windspeed,
                    code: data.current_weather?.weathercode,
                    humidity: humidity,
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [coords]);

    const mapWeatherCode = (code) => {
        const weatherMap = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            56: "Light freezing drizzle",
            57: "Dense freezing drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            66: "Light freezing rain",
            67: "Heavy freezing rain",
            71: "Slight snow fall",
            73: "Moderate snow fall",
            75: "Heavy snow fall",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail",
        };

        return weatherMap[code] || "Unknown weather";
    };


    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    if (loading) {
        return <ActivityIndicator size="small" color="#004D1A" />;
    }

    return (
        <View style={styles.container}>
            {/* Greeting */}
            <CText fontSize={14} fontStyle="SB">
                {getTimeGreeting()}
                {weatherData?.code ? `, it's ${mapWeatherCode(weatherData.code)}` : ","}
            </CText>
            <CText fontSize={18} fontStyle="SB">
                {user?.name}
            </CText>

            {weatherData && (
                <View style={styles.weatherRow}>
                    <CText fontSize={12}>🌡 {weatherData.temp}°C</CText>
                    <CText fontSize={12}>💨 {weatherData.wind} km/h</CText>
                    {weatherData.humidity !== null && (
                        <CText fontSize={12}>💧 {weatherData.humidity}%</CText>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    weatherRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 2,
    },
});

export default Greeting;
