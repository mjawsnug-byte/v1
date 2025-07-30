
import React from 'react';
import { View, Text } from 'react-native';

export const MapView = ({ children, style, region, onRegionChangeComplete, showsUserLocation, showsMyLocationButton, ...props }) => (
  <View style={[style, { backgroundColor: '#e8f4f8', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', padding: 20 }}>
      Campus Map View{'\n'}
      (Interactive map coming soon){'\n'}
      {region && `Location: ${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}`}
    </Text>
    {children}
  </View>
);

export const Marker = ({ coordinate, title, description, children, ...props }) => (
  <View style={{ position: 'absolute', backgroundColor: 'white', padding: 5, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' }}>
    <Text style={{ fontSize: 12 }}>{title || 'Marker'}</Text>
    {children}
  </View>
);

export const Overlay = ({ bounds, image }) => null;
export const PROVIDER_GOOGLE = null;

export default MapView;
