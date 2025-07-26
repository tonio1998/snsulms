import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

type LeafletMapProps = {
	coordinates?: any;
	zoom?: number;
	markerTitle?: string;
	height?: number;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
	                                               coordinates,
	                                               zoom = 13,
	                                               markerTitle = 0,
													height = 300,
                                               }) => {
	const { latitude, longitude } = JSON.parse(coordinates);
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
	  var map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
	
	  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; OpenStreetMap contributors'
	  }).addTo(map);
	
	  var marker = L.marker([${latitude}, ${longitude}]).addTo(map);
	
	  if (markerTitle !== 0) {
	    marker.bindPopup("${markerTitle}").openPopup();
	  }
	</script>
    </body>
    </html>
  `;
	
	return (
		<View style={[styles.container, { height: height }]}>
			<WebView
				originWhitelist={['*']}
				source={{ html: leafletHtml }}
				style={{ flex: 1 }}
				javaScriptEnabled={true}
				domStorageEnabled={true}
				mixedContentMode="always"
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default LeafletMap;
