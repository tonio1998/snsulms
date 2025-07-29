import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../theme/styles.ts';
import { WebView } from 'react-native-webview';
import CButton from '../../components/buttons/CButton.tsx';
import { CText } from '../../components/common/CText.tsx';
import { getAddressFromCoords } from '../../utils/format.ts';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext.tsx';

export default function MapScreen({ navigation, route }) {
	const { coordinate } = route.params || {};
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	
	let latitude = null;
	let longitude = null;
	
	try {
		if (coordinate) {
			const parsed = JSON.parse(coordinate);
			latitude = parsed.latitude;
			longitude = parsed.longitude;
		}else{
			if(user?.current_location){
				const parsed = JSON.parse(user?.current_location);
				latitude = parsed.latitude;
				longitude = parsed.longitude;
			}
		}
	} catch (error) {
		console.warn('Invalid coordinate format:', error);
	}
	
	const [location, setLocation] = useState();
	const [address, setAddress] = useState();
	
	const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <style>
        #map { height: 100%; width: 100%; margin: 0; padding: 0; }
        html, body { height: 100%; margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>
        function initMap(lat, lng) {
          const map = L.map('map').setView([lat, lng], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          let marker = L.marker([lat, lng]).addTo(map).openPopup();

          map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            if (marker) {
              marker.setLatLng([lat, lng]);
            } else {
              marker = L.marker([lat, lng]).addTo(map);
            }
            window.ReactNativeWebView?.postMessage(JSON.stringify({ lat, lng }));
          });
        }

        const initialLat = ${latitude ?? 'null'};
        const initialLng = ${longitude ?? 'null'};

        if (initialLat && initialLng) {
          initMap(initialLat, initialLng);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(position) {
              initMap(position.coords.latitude, position.coords.longitude);
            },
            function() {
              initMap(9.6075, 125.5233); // fallback: Surigao City
            }
          );
        } else {
          initMap(9.6075, 125.5233); // fallback if geolocation is unavailable
        }
      </script>
    </body>
    </html>
  `;
	
	const getMyLocation = () => {
		navigation.goBack();
	};
	
	return (
		<SafeAreaView style={[globalStyles.safeArea, { flex: 1, paddingHorizontal: 0 }]}>
			<View style={styles.container}>
				<WebView
					originWhitelist={['*']}
					source={{ html: leafletHtml }}
					style={{ flex: 1 }}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					mixedContentMode="always"
					onMessage={async (event) => {
						const { data } = event.nativeEvent;
						try {
							setLoading(true);
							const coords = JSON.parse(data);
							
							const { lat, lng } = coords;
							const resolvedAddress = await getAddressFromCoords(lat, lng);
							setAddress(resolvedAddress);
							setLocation(coords);
							setLoading(false);
							
							const locationData = {
								...coords,
								address: resolvedAddress,
							};
							
							route.params?.onCoordinateSelected?.(locationData);
						} catch (e) {
							console.error('Error processing WebView data:', e);
						}
					}}
				/>
				
				<View style={[globalStyles.card, { padding: 15, position: 'absolute', bottom: -10, left: 0, right: 0 }]}>
					<CText fontSize={16} style={{ fontWeight: 'bold', marginBottom: 10 }}>
						{loading ? <ActivityIndicator size="small" color={theme.colors.light.primary} /> : address}
					</CText>
					{!loading && (
						<CButton
							title={'Use Location'}
							type={'success'}
							style={{ padding: 8, borderRadius: 5 }}
							onPress={getMyLocation}
							icon={'map'}
						/>
					)}
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 0,
	},
});
