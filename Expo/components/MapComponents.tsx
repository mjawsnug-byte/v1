
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // This shouldn't be reached on web, but just in case
  const WebComponents = require('./MapComponents.web');
  export const MapView = WebComponents.MapView;
  export const Marker = WebComponents.Marker;
  export const Overlay = WebComponents.Overlay;
  export const PROVIDER_GOOGLE = WebComponents.PROVIDER_GOOGLE;
} else {
  // Native platforms
  const RNMaps = require('react-native-maps');
  export const MapView = RNMaps.default;
  export const Marker = RNMaps.Marker;
  export const Overlay = RNMaps.Overlay;  
  export const PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
}
