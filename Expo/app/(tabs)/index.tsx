import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';

// Simplified map components - use web fallback by default, load native only when available
const WebMapView = ({ children, style, region, onRegionChangeComplete, showsUserLocation, showsMyLocationButton, ...props }) => (
  <View style={[style, { backgroundColor: '#e8f4f8', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', padding: 20 }}>
      Map View{'\n'}
      (Web version - use mobile app for full map functionality){'\n'}
      {region && `Lat: ${region.latitude.toFixed(4)}, Lng: ${region.longitude.toFixed(4)}`}
    </Text>
    {children}
  </View>
);

const WebMarker = ({ coordinate, title, description, children, ...props }) => (
  <View style={{ position: 'absolute', backgroundColor: 'white', padding: 5, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' }}>
    <Text style={{ fontSize: 12 }}>{title || 'Marker'}</Text>
    {children}
  </View>
);

// Use web fallback components for all platforms to avoid native import issues
const MapView = WebMapView;
const Marker = WebMarker;

const { width, height } = Dimensions.get('window');

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Campus Nav Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Something went wrong</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => this.setState({ hasError: false })}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

function HomeScreen() {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState({ x: 50, y: 300 });
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoute, setShowRoute] = useState(false);
  const [isDataInputMode, setIsDataInputMode] = useState(false);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [pendingRoomPosition, setPendingRoomPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('boswell');
  const [currentFloor, setCurrentFloor] = useState('main');
  const [showBuildingOverlay, setShowBuildingOverlay] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: 47.6868,  // North Idaho College coordinates
    longitude: -116.7808,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Enhanced building data with actual floor plans
  const [buildingData, setBuildingData] = useState({
    buildings: [
      { 
        id: 'boswell', 
        name: 'Boswell Hall', 
        floors: ['main'],
        coordinates: { latitude: 47.6868, longitude: -116.7808 },
        bounds: {
          southwest: { latitude: 47.6865, longitude: -116.7812 },
          northeast: { latitude: 47.6871, longitude: -116.7804 }
        }
      },
      { 
        id: 'emergency', 
        name: 'Emergency Building', 
        floors: ['main', '2nd'],
        coordinates: { latitude: 47.6870, longitude: -116.7810 },
        bounds: {
          southwest: { latitude: 47.6867, longitude: -116.7814 },
          northeast: { latitude: 47.6873, longitude: -116.7806 }
        }
      },
      { 
        id: 'edminster', 
        name: 'Edminster Student Union', 
        floors: ['main', '2nd'],
        coordinates: { latitude: 47.6866, longitude: -116.7806 },
        bounds: {
          southwest: { latitude: 47.6863, longitude: -116.7810 },
          northeast: { latitude: 47.6869, longitude: -116.7802 }
        }
      }
    ],
    currentBuilding: 'boswell',
    rooms: {
      boswell: {
        main: [
          { id: '101', name: 'Percussion Practice Room', x: 550, y: 200, type: 'classroom' },
          { id: '102', name: 'Music Rehearsal Room', x: 520, y: 150, type: 'classroom' },
          { id: '103', name: 'Piano Practice Room', x: 490, y: 200, type: 'classroom' },
          { id: '105', name: 'Piano Practice Room', x: 460, y: 200, type: 'classroom' },
          { id: '121', name: 'Schuler Performing Arts Center', x: 250, y: 350, type: 'theater' },
          { id: '124', name: 'Piano Lab/Classroom', x: 200, y: 150, type: 'lab' },
          { id: '144', name: 'Boswell Main Office', x: 450, y: 300, type: 'office' },
          { id: 'TOILET-M', name: "Men's Restroom", x: 180, y: 320, type: 'toilet' },
          { id: 'TOILET-W', name: "Women's Restroom", x: 220, y: 320, type: 'toilet' },
          { id: 'ELEVATOR', name: 'Elevator', x: 320, y: 320, type: 'elevator' },
          { id: 'STAIRS-1', name: 'Stairs', x: 100, y: 250, type: 'stairs' }
        ]
      },
      emergency: {
        main: [
          { id: '112', name: 'Room 112', x: 300, y: 200, type: 'classroom' },
          { id: '114', name: 'Room 114', x: 350, y: 250, type: 'classroom' },
          { id: '118', name: 'Room 118', x: 250, y: 180, type: 'classroom' },
          { id: '119', name: 'Room 119', x: 200, y: 300, type: 'classroom' },
          { id: '123', name: 'Room 123', x: 250, y: 350, type: 'classroom' },
          { id: 'TOILET-M', name: "Men's Restroom", x: 180, y: 320, type: 'toilet' },
          { id: 'TOILET-W', name: "Women's Restroom", x: 220, y: 320, type: 'toilet' },
        ],
        '2nd': [
          { id: '208', name: 'Room 208', x: 300, y: 150, type: 'classroom' },
          { id: '210', name: 'Room 210', x: 250, y: 400, type: 'classroom' },
          { id: '212', name: 'Room 212', x: 200, y: 150, type: 'classroom' },
          { id: '215', name: 'Room 215', x: 150, y: 300, type: 'classroom' },
        ]
      },
      edminster: {
        main: [
          { id: '100', name: 'Caffeinated Cardinal', x: 400, y: 300, type: 'cafeteria' },
          { id: '101', name: 'Cardinal Bookstore', x: 450, y: 200, type: 'store' },
          { id: '110', name: 'Get Involved Booth', x: 300, y: 250, type: 'office' },
          { id: '112', name: 'Student Union Operations', x: 250, y: 200, type: 'office' },
          { id: '118', name: 'Driftwood Bay', x: 200, y: 180, type: 'lounge' },
          { id: '129', name: 'The Market', x: 150, y: 250, type: 'store' },
          { id: '130', name: 'Dining Room', x: 350, y: 350, type: 'cafeteria' },
          { id: '136', name: 'The Plaza', x: 300, y: 400, type: 'lounge' },
          { id: 'TOILET-M', name: "Men's Restroom", x: 180, y: 320, type: 'toilet' },
          { id: 'TOILET-W', name: "Women's Restroom", x: 220, y: 320, type: 'toilet' },
          { id: 'ELEVATOR', name: 'Elevator', x: 320, y: 320, type: 'elevator' },
        ],
        '2nd': [
          { id: '200', name: 'Student Services', x: 300, y: 200, type: 'office' },
          { id: '204A', name: 'Blue Creek Bay', x: 400, y: 150, type: 'lounge' },
          { id: '204B', name: 'Echo Bay', x: 450, y: 150, type: 'lounge' },
          { id: '205', name: 'Lake Coeur d\'Alene', x: 200, y: 180, type: 'lounge' },
          { id: '210', name: 'Student Advising & TRIO', x: 150, y: 350, type: 'office' },
          { id: '221', name: 'TRIO Computer Lab', x: 100, y: 300, type: 'lab' },
          { id: '228', name: 'ASNIC Conference Room', x: 200, y: 400, type: 'office' },
          { id: '230', name: 'Clubs Work Room', x: 250, y: 350, type: 'office' },
        ]
      }
    }
  });

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy
        });

        // Update map region to user's location if it's on campus
        const campusCenter = { latitude: 47.6868, longitude: -116.7808 };
        const distance = getDistanceFromLatLonInKm(
          location.coords.latitude,
          location.coords.longitude,
          campusCenter.latitude,
          campusCenter.longitude
        );

        if (distance < 1) { // Within 1km of campus
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }

        // Watch position
        const watchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            setUserLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              accuracy: location.coords.accuracy
            });
          }
        );

        return () => watchId && Location.removeWatchAsync(watchId);
      } catch (error) {
        setLocationError('Error getting location: ' + error.message);
      }
    })();
  }, []);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const getCurrentBuildingRooms = () => {
    return buildingData.rooms[selectedBuilding]?.[currentFloor] || [];
  };

  const filteredRooms = getCurrentBuildingRooms().filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoomIcon = (type) => {
    const iconMap = {
      toilet: '🚻',
      elevator: '🛗',
      stairs: '🪜',
      lab: '🔬',
      office: '🏢',
      cafeteria: '🍽️',
      store: '🏪',
      classroom: '📚',
      theater: '🎭',
      lounge: '🛋️'
    };
    return iconMap[type] || '📍';
  };

  const requestLocationPermission = async () => {
    if (!Location) {
      Alert.alert('Location Unavailable', 'Location services are not available on this platform.');
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
        });
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      } else {
        Alert.alert('Permission Denied', 'Location permission is required for navigation.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location. Please check your device settings.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Navigator</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.setupButton, isDataInputMode && styles.setupButtonActive]}
            onPress={() => setIsDataInputMode(!isDataInputMode)}
          >
            <Text style={styles.setupButtonText}>
              {isDataInputMode ? 'Exit Setup' : 'Setup Mode'}
            </Text>
          </TouchableOpacity>
          {userLocation && (
            <Text style={styles.gpsText}>GPS: On</Text>
          )}
        </View>
        {locationError ? (
          <Text style={styles.errorText}>{locationError}</Text>
        ) : null}
        {userLocation && (
          <Text style={styles.locationText}>
            📍 GPS: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            {userLocation.accuracy && ` (±${Math.round(userLocation.accuracy)}m)`}
          </Text>
        )}
      </View>

      {/* Building and Floor Selection */}
      <View style={styles.controlsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buildingSelector}>
          {buildingData.buildings.map(building => (
            <TouchableOpacity
              key={building.id}
              style={[
                styles.buildingButton,
                selectedBuilding === building.id && styles.buildingButtonActive
              ]}
              onPress={() => {
                setSelectedBuilding(building.id);
                setCurrentFloor('main');
                setMapRegion({
                  latitude: building.coordinates.latitude,
                  longitude: building.coordinates.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                });
              }}
            >
              <Text style={[
                styles.buildingButtonText,
                selectedBuilding === building.id && styles.buildingButtonTextActive
              ]}>
                {building.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.floorControls}>
          {buildingData.buildings.find(b => b.id === selectedBuilding)?.floors.map(floor => (
            <TouchableOpacity
              key={floor}
              style={[
                styles.floorButton,
                currentFloor === floor && styles.floorButtonActive
              ]}
              onPress={() => setCurrentFloor(floor)}
            >
              <Text style={[
                styles.floorButtonText,
                currentFloor === floor && styles.floorButtonTextActive
              ]}>
                {floor === 'main' ? 'Main' : floor}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.overlayToggle, showBuildingOverlay && styles.overlayToggleActive]}
            onPress={() => setShowBuildingOverlay(!showBuildingOverlay)}
          >
            <Text style={styles.overlayToggleText}>
              {showBuildingOverlay ? 'Hide Overlay' : 'Show Overlay'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rooms, facilities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Building Markers */}
          {buildingData.buildings.map(building => (
            <Marker
              key={building.id}
              coordinate={building.coordinates}
              title={building.name}
              description={`${building.floors.length} floor(s)`}
            />
          ))}

          {/* Room Markers for Selected Building */}
          {getCurrentBuildingRooms().map(room => {
            const building = buildingData.buildings.find(b => b.id === selectedBuilding);
            if (!building) return null;

            // Convert room coordinates to map coordinates (simplified mapping)
            const lat = building.coordinates.latitude + (room.y - 250) * 0.00001;
            const lng = building.coordinates.longitude + (room.x - 300) * 0.00001;

            return (
              <Marker
                key={room.id}
                coordinate={{ latitude: lat, longitude: lng }}
                title={room.name}
                description={`Room ${room.id} - ${room.type}`}
              >
                <View style={styles.roomMarker}>
                  <Text style={styles.roomMarkerText}>{getRoomIcon(room.type)}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>
      </View>

      {/* Room List */}
      {searchQuery ? (
        <View style={styles.resultsContainer}>
          <ScrollView>
            {filteredRooms.map(room => (
              <TouchableOpacity
                key={room.id}
                style={styles.roomItem}
                onPress={() => {
                  setSelectedDestination(room.id);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.roomIcon}>{getRoomIcon(room.type)}</Text>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomDetails}>Room {room.id} • {room.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Quick Access Buttons */}
      <View style={styles.quickAccess}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { label: 'Toilets', search: 'toilet', icon: '🚻' },
            { label: 'Elevators', search: 'elevator', icon: '🛗' },
            { label: 'Stairs', search: 'stairs', icon: '🪜' },
            { label: 'Labs', search: 'lab', icon: '🔬' },
            { label: 'Offices', search: 'office', icon: '🏢' },
            { label: 'Cafeteria', search: 'cafeteria', icon: '🍽️' }
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickButton}
              onPress={() => setSearchQuery(item.search)}
            >
              <Text style={styles.quickButtonIcon}>{item.icon}</Text>
              <Text style={styles.quickButtonText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HomeScreen />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#2E86AB',
    padding: 15,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  setupButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  setupButtonActive: {
    backgroundColor: '#F39C12',
  },
  setupButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  gpsText: {
    color: 'white',
    fontSize: 12,
  },
  errorText: {
    color: '#FFE5E5',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  locationText: {
    color: '#E8F4FD',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
  controlsContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  buildingSelector: {
    paddingHorizontal: 15,
  },
  buildingButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  buildingButtonActive: {
    backgroundColor: '#2E86AB',
  },
  buildingButtonText: {
    fontSize: 14,
    color: '#666',
  },
  buildingButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  floorControls: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 10,
    alignItems: 'center',
  },
  floorButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  floorButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  floorButtonText: {
    fontSize: 12,
    color: '#666',
  },
  floorButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  overlayToggle: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 'auto',
  },
  overlayToggleActive: {
    backgroundColor: '#4CAF50',
  },
  overlayToggleText: {
    fontSize: 12,
    color: '#666',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  roomMarker: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#2E86AB',
  },
  roomMarkerText: {
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: 'white',
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roomIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  roomDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  quickAccess: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 15,
  },
  quickButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  quickButtonIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  quickButtonText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});