import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Users, Wifi, Search, Menu, Target, Navigation2, ArrowUp } from 'lucide-react';

// Room Input Form Component
const RoomInputForm = ({ onSubmit, onCancel, position }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'classroom'
  });

  const roomTypes = [
    { value: 'classroom', label: 'Classroom' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'toilet', label: 'Toilet' },
    { value: 'elevator', label: 'Elevator' },
    { value: 'stairs', label: 'Stairs' },
    { value: 'study', label: 'Study Room' },
    { value: 'office', label: 'Office' },
    { value: 'library', label: 'Library' },
    { value: 'cafeteria', label: 'Cafeteria' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id && formData.name) {
      onSubmit(formData);
      setFormData({ id: '', name: '', type: 'classroom' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room ID *
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
            placeholder="e.g., A101"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {roomTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Room Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Computer Science Lab"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div className="text-sm text-gray-600">
        Position: ({position.x}, {position.y})
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Room
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const CampusNavApp = () => {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState({ x: 50, y: 300 });
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoute, setShowRoute] = useState(false);
  const [isDataInputMode, setIsDataInputMode] = useState(false);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [pendingRoomPosition, setPendingRoomPosition] = useState(null);

  // Real university building data based on North Idaho College floor plans
  const [buildingData, setBuildingData] = useState({
    buildings: [
      { id: 'boswell', name: 'Boswell Hall', floors: ['main'] },
      { id: 'emergency', name: 'Emergency Building', floors: ['main', '2nd'] },
      { id: 'edminster', name: 'Edminster Student Union', floors: ['main', '2nd'] }
    ],
    currentBuilding: 'boswell',
    floors: ['main'],
    rooms: {
      boswell: {
        main: [
          { id: '101', name: 'Percussion Practice Room', x: 550, y: 200, type: 'classroom' },
          { id: '102', name: 'Music Rehearsal Room', x: 520, y: 150, type: 'classroom' },
          { id: '102A', name: 'Music Locker Room', x: 520, y: 180, type: 'storage' },
          { id: '103', name: 'Piano Practice Room', x: 490, y: 200, type: 'classroom' },
          { id: '105', name: 'Piano Practice Room', x: 460, y: 200, type: 'classroom' },
          { id: '107', name: 'Piano Practice Room', x: 430, y: 200, type: 'classroom' },
          { id: '109', name: 'Piano Practice Room', x: 400, y: 200, type: 'classroom' },
          { id: '111', name: 'Applied Lesson Room', x: 370, y: 200, type: 'classroom' },
          { id: '115', name: 'Green Room', x: 300, y: 250, type: 'study' },
          { id: '115A', name: 'Piano Lesson Room', x: 290, y: 270, type: 'classroom' },
          { id: '121', name: 'Schuler Performing Arts Center', x: 250, y: 350, type: 'theater' },
          { id: '121A', name: 'Stage', x: 250, y: 320, type: 'theater' },
          { id: '124', name: 'Piano Lab/Classroom', x: 200, y: 150, type: 'lab' },
          { id: '128', name: 'Music Classroom', x: 180, y: 150, type: 'classroom' },
          { id: '130', name: 'Corner Gallery', x: 150, y: 150, type: 'gallery' },
          { id: '138', name: 'Speech Classroom', x: 120, y: 200, type: 'classroom' },
          { id: '142', name: 'Speech Classroom', x: 100, y: 300, type: 'classroom' },
          { id: '144', name: 'Boswell Main Office', x: 450, y: 300, type: 'office' },
          { id: '146', name: 'Photography Classroom', x: 420, y: 350, type: 'lab' },
          { id: '148A', name: 'Journalism Lab', x: 450, y: 350, type: 'lab' },
          { id: '148B', name: 'Photography Classroom', x: 480, y: 350, type: 'lab' },
          { id: '148C', name: 'Lab', x: 510, y: 350, type: 'lab' },
          { id: '156', name: 'Ceramics Lab', x: 540, y: 350, type: 'lab' },
          { id: '158', name: 'Ceramics Lab', x: 570, y: 350, type: 'lab' },
          { id: 'TOILET-M', name: "Men's Restroom", x: 180, y: 320, type: 'toilet' },
          { id: 'TOILET-W', name: "Women's Restroom", x: 220, y: 320, type: 'toilet' },
          { id: 'TOILET-MA', name: "Men's Accessible Restroom", x: 160, y: 340, type: 'toilet' },
          { id: 'TOILET-WA', name: "Women's Accessible Restroom", x: 240, y: 340, type: 'toilet' },
          { id: 'ELEVATOR', name: 'Elevator', x: 320, y: 320, type: 'elevator' },
          { id: 'STAIRS-1', name: 'Stairs', x: 100, y: 250, type: 'stairs' },
          { id: 'STAIRS-2', name: 'Stairs to Basement 001', x: 550, y: 380, type: 'stairs' }
        ]
      },
      edminster: {
        main: [
          { id: '100', name: 'Caffeinated Cardinal', x: 400, y: 250, type: 'cafeteria' },
          { id: '101', name: 'Cardinal Bookstore', x: 450, y: 200, type: 'store' },
          { id: '110', name: 'Get Involved Booth', x: 200, y: 280, type: 'office' },
          { id: '112', name: 'Student Union Operations', x: 250, y: 200, type: 'office' },
          { id: '118', name: 'Driftwood Bay', x: 150, y: 150, type: 'study' },
          { id: '129', name: 'The Market', x: 100, y: 200, type: 'store' },
          { id: '130', name: 'Dining Room', x: 80, y: 250, type: 'cafeteria' },
          { id: '136', name: 'The Plaza', x: 300, y: 300, type: 'plaza' },
          { id: '136A', name: 'Half Round Bay', x: 350, y: 320, type: 'study' },
          { id: 'TOILET-M', name: "Men's Restroom", x: 180, y: 350, type: 'toilet' },
          { id: 'TOILET-W', name: "Women's Restroom", x: 220, y: 350, type: 'toilet' },
          { id: 'TOILET-ALL', name: "All Gender Restroom", x: 250, y: 350, type: 'toilet' },
          { id: 'ELEVATOR', name: 'Elevator', x: 200, y: 320, type: 'elevator' },
          { id: 'STAIRS-MAIN', name: 'Main Stairs', x: 300, y: 180, type: 'stairs' },
          { id: 'STAIRS-1', name: 'Stairs', x: 100, y: 180, type: 'stairs' },
          { id: 'STAIRS-2', name: 'Stairs', x: 450, y: 300, type: 'stairs' }
        ],
        '2nd': [
          { id: '200', name: 'Student Services', x: 300, y: 200, type: 'office' },
          { id: '204A', name: 'Blue Creek Bay', x: 400, y: 150, type: 'study' },
          { id: '204B', name: 'Echo Bay', x: 450, y: 150, type: 'study' },
          { id: '205', name: "Lake Coeur d'Alene", x: 500, y: 200, type: 'study' },
          { id: '210', name: 'Student Advising & TRiO', x: 150, y: 250, type: 'office' },
          { id: '221', name: 'TRiO Computer Lab', x: 100, y: 300, type: 'lab' },
          { id: '228', name: 'ASNIC Conference Room', x: 200, y: 320, type: 'conference' },
          { id: '229', name: 'ASNIC Offices & Student Involvement', x: 150, y: 340, type: 'office' },
          { id: '230', name: 'Clubs Work Room', x: 250, y: 300, type: 'study' },
          { id: '233', name: 'ASNIC', x: 300, y: 320, type: 'office' },
          { id: '234', name: 'Silver Beach Gallery', x: 180, y: 200, type: 'gallery' },
          { id: 'TOILET-M', name: "Men's Restroom", x: 180, y: 280, type: 'toilet' },
          { id: 'TOILET-W', name: "Women's Restroom", x: 220, y: 280, type: 'toilet' },
          { id: 'TOILET-ALL', name: "All Gender Restroom", x: 250, y: 280, type: 'toilet' },
          { id: 'ELEVATOR', name: 'Elevator / Area of Assistance', x: 280, y: 250, type: 'elevator' },
          { id: 'STAIRS-MAIN', name: 'Main Stairs', x: 320, y: 180, type: 'stairs' },
          { id: 'STAIRS-EMERGENCY', name: 'Stairs to Emergency Exit', x: 450, y: 300, type: 'stairs' }
        ]
      }
    }
  });

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Get user's GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          setLocationError('Location access denied or unavailable');
        }
      );
    }
  }, []);

  const getRoomIcon = (type) => {
    switch (type) {
      case 'toilet': return <Users className="w-4 h-4" />;
      case 'elevator': return <div className="w-4 h-4 bg-blue-500 rounded" />;
      case 'stairs': return <ArrowUp className="w-4 h-4" />;
      case 'lab': return <Wifi className="w-4 h-4" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded" />;
    }
  };

  const getRoomColor = (type) => {
    switch (type) {
      case 'classroom': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'lab': return 'bg-green-100 border-green-300 text-green-800';
      case 'toilet': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'elevator': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'stairs': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'study': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const currentRooms = buildingData.rooms[currentFloor] || [];
  const filteredRooms = currentRooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startNavigation = (roomId) => {
    setSelectedDestination(roomId);
    setIsNavigating(true);
    setShowRoute(true);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setSelectedDestination('');
    setShowRoute(false);
  };

  // Room management functions
  const addRoom = (roomData) => {
    setBuildingData(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [currentFloor]: [
          ...(prev.rooms[currentFloor] || []),
          { ...roomData, x: pendingRoomPosition.x, y: pendingRoomPosition.y }
        ]
      }
    }));
    setPendingRoomPosition(null);
    setIsAddingRoom(false);
  };

  const deleteRoom = (roomId) => {
    setBuildingData(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [currentFloor]: (prev.rooms[currentFloor] || []).filter(room => room.id !== roomId)
      }
    }));
  };

  const handleMapClick = (event) => {
    if (!isAddingRoom) return;
    
    try {
      const rect = event.currentTarget.getBoundingClientRect();
      const svgElement = event.currentTarget;
      const viewBox = svgElement.viewBox?.baseVal;
      
      if (!viewBox) {
        console.warn('ViewBox not available, using fallback');
        setPendingRoomPosition({ x: 300, y: 200 });
        return;
      }
      
      const x = ((event.clientX - rect.left) / rect.width) * viewBox.width;
      const y = ((event.clientY - rect.top) / rect.height) * viewBox.height;
      
      setPendingRoomPosition({ x: Math.round(x), y: Math.round(y) });
    } catch (error) {
      console.error('Error handling map click:', error);
      setPendingRoomPosition({ x: 300, y: 200 });
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(buildingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'campus_data.json';
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedData = JSON.parse(result);
          if (importedData && importedData.rooms && importedData.floors) {
            setBuildingData(importedData);
          } else {
            alert('Invalid data format. Please ensure the JSON contains "rooms" and "floors" properties.');
          }
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Invalid JSON file. Please check the file format.');
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsText(file);
  };

  const getRouteInstructions = () => {
    if (!selectedDestination) return [];
    
    const destRoom = currentRooms.find(r => r.id === selectedDestination);
    if (!destRoom) return [];

    return [
      "Head towards the main corridor",
      "Turn right at the junction",
      "Continue straight for 20 meters",
      `${destRoom.name} will be on your left`,
      "You have arrived at your destination"
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6" />
            <span>Campus Navigator</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDataInputMode(!isDataInputMode)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                isDataInputMode ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isDataInputMode ? 'Exit Setup' : 'Setup Mode'}
            </button>
            {userLocation && (
              <div className="flex items-center space-x-1 text-sm">
                <Target className="w-4 h-4" />
                <span>GPS: On</span>
              </div>
            )}
            <Menu className="w-6 h-6" />
          </div>
        </div>

        {/* Data Input Controls */}
        {isDataInputMode && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => {
                  setIsAddingRoom(!isAddingRoom);
                  setPendingRoomPosition(null);
                }}
                className={`px-3 py-1 rounded ${
                  isAddingRoom ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isAddingRoom ? 'Cancel Add Room' : 'Add Room'}
              </button>
              <button
                onClick={exportData}
                className="px-3 py-1 rounded bg-white/10 text-white hover:bg-white/20"
              >
                Export Data
              </button>
              <label className="px-3 py-1 rounded bg-white/10 text-white hover:bg-white/20 cursor-pointer">
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
            {isAddingRoom && (
              <div className="text-yellow-200 text-sm">
                Click on the map to place a new room
              </div>
            )}
          </div>
        )}
        
        {locationError && (
          <div className="mt-2 text-yellow-200 text-sm">
            {locationError}
          </div>
        )}
      </div>

      {/* Floor Selector */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Building A - Science Block</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Floor:</span>
            <select 
              value={currentFloor} 
              onChange={(e) => setCurrentFloor(parseInt(e.target.value))}
              className="border rounded px-2 py-1 text-sm font-medium"
            >
              {buildingData.floors.map(floor => (
                <option key={floor} value={floor}>
                  {floor === 0 ? 'Ground' : `Level ${floor}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms, toilets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation Status */}
      {isNavigating && (
        <div className="bg-green-50 border-b border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Navigation2 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                Navigating to {currentRooms.find(r => r.id === selectedDestination)?.name}
              </span>
            </div>
            <button 
              onClick={stopNavigation}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Map Area */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-96 bg-gray-100">
              {/* Floor Plan SVG */}
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 600 400" 
                className={`absolute inset-0 ${isAddingRoom ? 'cursor-crosshair' : ''}`}
                onClick={handleMapClick}
              >
                {/* Building outline */}
                <rect x="50" y="50" width="500" height="300" fill="none" stroke="#ccc" strokeWidth="2" />
                
                {/* Corridors */}
                <rect x="75" y="180" width="450" height="40" fill="#f0f0f0" stroke="#ddd" />
                <rect x="75" y="330" width="450" height="40" fill="#f0f0f0" stroke="#ddd" />
                
                {/* Current user location */}
                <circle 
                  cx={currentLocation.x} 
                  cy={currentLocation.y} 
                  r="8" 
                  fill="#3b82f6" 
                  stroke="white" 
                  strokeWidth="2"
                />
                <text x={currentLocation.x} y={currentLocation.y - 15} textAnchor="middle" className="text-xs font-bold fill-blue-600">You</text>

                {/* Route line */}
                {showRoute && selectedDestination && (
                  <line 
                    x1={currentLocation.x} 
                    y1={currentLocation.y}
                    x2={currentRooms.find(r => r.id === selectedDestination)?.x}
                    y2={currentRooms.find(r => r.id === selectedDestination)?.y}
                    stroke="#ef4444" 
                    strokeWidth="3" 
                    strokeDasharray="5,5"
                  />
                )}

                {/* Pending room position */}
                {pendingRoomPosition && (
                  <g>
                    <rect 
                      x={pendingRoomPosition.x - 25} 
                      y={pendingRoomPosition.y - 15} 
                      width="50" 
                      height="30" 
                      fill="#fbbf24"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />
                    <text 
                      x={pendingRoomPosition.x} 
                      y={pendingRoomPosition.y + 3} 
                      textAnchor="middle" 
                      className="text-xs font-medium fill-gray-700"
                    >
                      NEW
                    </text>
                  </g>
                )}

                {/* Rooms */}
                {currentRooms.map(room => (
                  <g key={room.id}>
                    <rect 
                      x={room.x - 25} 
                      y={room.y - 15} 
                      width="50" 
                      height="30" 
                      fill={selectedDestination === room.id ? "#fef3c7" : "white"}
                      stroke={selectedDestination === room.id ? "#f59e0b" : "#ccc"}
                      strokeWidth={selectedDestination === room.id ? "2" : "1"}
                      className="cursor-pointer hover:fill-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isNavigating && !isAddingRoom) startNavigation(room.id);
                      }}
                    />
                    <text 
                      x={room.x} 
                      y={room.y + 3} 
                      textAnchor="middle" 
                      className="text-xs font-medium fill-gray-700 pointer-events-none"
                    >
                      {room.id}
                    </text>
                    {isDataInputMode && (
                      <g>
                        <circle
                          cx={room.x + 20}
                          cy={room.y - 10}
                          r="8"
                          fill="#ef4444"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRoom(room.id);
                          }}
                        />
                        <text
                          x={room.x + 20}
                          y={room.y - 7}
                          textAnchor="middle"
                          className="text-xs font-bold fill-white pointer-events-none"
                        >
                          ×
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Route Instructions */}
          {isNavigating && (
            <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold mb-3 text-gray-800">Route Instructions</h3>
              <div className="space-y-2">
                {getRouteInstructions().map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-1">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Room Input Form */}
        {pendingRoomPosition && (
          <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-800">Add New Room</h3>
            <RoomInputForm 
              onSubmit={addRoom}
              onCancel={() => {
                setPendingRoomPosition(null);
                setIsAddingRoom(false);
              }}
              position={pendingRoomPosition}
            />
          </div>
        )}

        {/* Room List Sidebar */}
        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">
              Rooms on {currentFloor === 0 ? 'Ground Floor' : `Level ${currentFloor}`}
            </h3>
            {isDataInputMode && (
              <span className="text-xs text-orange-600 font-medium">EDIT MODE</span>
            )}
          </div>
          <div className="space-y-2">
            {filteredRooms.map(room => (
              <div 
                key={room.id} 
                className={`p-3 border rounded-lg transition-shadow ${getRoomColor(room.type)} ${
                  isDataInputMode ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
                }`}
                onClick={() => !isDataInputMode && startNavigation(room.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRoomIcon(room.type)}
                    <div>
                      <div className="font-medium text-sm">{room.id}</div>
                      <div className="text-xs opacity-75">{room.name}</div>
                      {isDataInputMode && (
                        <div className="text-xs text-gray-500 mt-1">
                          Position: ({room.x}, {room.y})
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!isDataInputMode && <Navigation className="w-4 h-4 opacity-60" />}
                    {isDataInputMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoom(room.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No rooms found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="bg-white border-t p-4">
        <div className="flex justify-around">
          <button 
            onClick={() => setSearchQuery('toilet')}
            className="flex flex-col items-center space-y-1 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <Users className="w-6 h-6 text-purple-600" />
            <span className="text-xs text-gray-600">Toilets</span>
          </button>
          <button 
            onClick={() => setSearchQuery('lift')}
            className="flex flex-col items-center space-y-1 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-6 h-6 bg-gray-500 rounded" />
            <span className="text-xs text-gray-600">Elevators</span>
          </button>
          <button 
            onClick={() => setSearchQuery('stairs')}
            className="flex flex-col items-center space-y-1 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowUp className="w-6 h-6 text-yellow-600" />
            <span className="text-xs text-gray-600">Stairs</span>
          </button>
          <button 
            onClick={() => setSearchQuery('lab')}
            className="flex flex-col items-center space-y-1 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <Wifi className="w-6 h-6 text-green-600" />
            <span className="text-xs text-gray-600">Labs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampusNavApp;