// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, ScrollView, Dimensions, TextInput), useNavigation, fetchFloors, fetchRooms, AddRoom, userService, Ionicons
// Description:
//              - This RoomScreen is a React Native component serving as a screen 
//                to display floors and rooms, allowing users to browse and select rooms 
//                in the RoomEase Portal mobile application.
//              - Fetches floor and room data, supports room search and filtering by floor, 
//                and provides admin/staff-specific features like adding rooms and viewing 
//                assigned rooms.
//              - Includes a modal for adding new rooms and conditional UI based on user role.

// Imports necessary libraries for the component.
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchFloors, fetchRooms } from '../lib/services/roomService';
import AddRoom from '../components/addRoom';
import userService from '../lib/services/userService';
import { Ionicons } from '@expo/vector-icons';

// Get screen height for responsive design.
const { height } = Dimensions.get('window');

// Main component handling the room screen logic and rendering.
const RoomScreen = () => {
  // Hook to access navigation functionality.
  const navigation = useNavigation();
  // State to store list of floors.
  const [floors, setFloors] = useState([]);
  // State to store all rooms data.
  const [allRooms, setAllRooms] = useState([]);
  // State to store filtered rooms for display.
  const [filteredRooms, setFilteredRooms] = useState([]);
  // State to store selected floor ID.
  const [selectedFloor, setSelectedFloor] = useState(null);
  // State to store selected floor name.
  const [selectedFloorName, setSelectedFloorName] = useState('');
  // State to manage initial loading indicator.
  const [loading, setLoading] = useState(true);
  // State to manage room-specific loading indicator.
  const [roomLoading, setRoomLoading] = useState(false);
  // State to handle error messages.
  const [error, setError] = useState(null);
  // State to control add room modal visibility.
  const [modalVisible, setModalVisible] = useState(false);
  // State to store user’s role.
  const [userRole, setUserRole] = useState(null);
  // State for search query input.
  const [searchQuery, setSearchQuery] = useState('');

  // Function to fetch floors and rooms data.
  const fetchData = async () => {
    try {
      // Fetch floor records.
      const records = await fetchFloors();
      // Sort floors with Ground Floor first, then numerically.
      const sortedFloors = records.sort((a, b) => {
        if (a.name === 'Ground Floor') return -1;
        if (b.name === 'Ground Floor') return 1;
        const floorANumber = parseInt(a.name.replace('Floor ', ''), 10);
        const floorBNumber = parseInt(b.name.replace('Floor ', ''), 10);
        return floorANumber - floorBNumber;
      });
      // Update floors state.
      setFloors(sortedFloors);

      // Collect all rooms data for each floor.
      const allRoomsData = [];
      for (const floor of sortedFloors) {
        // Fetch rooms for the current floor.
        const roomsData = await fetchRooms(floor.id);
        // Add floor ID and name to room data.
        allRoomsData.push(...roomsData.map(room => ({ ...room, floorId: floor.id, floorName: floor.name })));
      }
      // Update all rooms state.
      setAllRooms(allRoomsData);
      // Update filtered rooms for initial display.
      setFilteredRooms(allRoomsData);
      // Clear selected floor.
      setSelectedFloor(null);
      // Clear selected floor name.
      setSelectedFloorName('');
      // Clear search query.
      setSearchQuery('');
      // Clear error message.
      setError(null);
    } catch (error) {
      // Log error for debugging.
      console.error('Failed to fetch floors or rooms:', error);
      // Set error message for display.
      setError('Failed to load data. Please try again.');
    }
  };

  // Effect to initialize data and user role on component mount.
  useEffect(() => {
    // Async function to fetch data and role.
    async function initialize() {
      // Show loading indicator.
      setLoading(true);
      // Fetch user role.
      await fetchUserRole();
      // Fetch floors and rooms.
      await fetchData();
      // Hide loading indicator.
      setLoading(false);
    }
    // Execute initialization.
    initialize();
  }, []);

  // Function to fetch current user’s role.
  const fetchUserRole = async () => {
    try {
      // Fetch user profile data.
      const result = await userService.fetchUserProfile();
      // Check if fetch was successful.
      if (result.success) {
        // Update user role state.
        setUserRole(result.data.role);
      } else {
        // Log error if fetch fails.
        console.error('Failed to fetch user role:', result.error);
      }
    } catch (error) {
      // Log unexpected errors.
      console.error('Error fetching user role:', error);
    }
  };

  // Function to handle floor selection.
  const handleFloorSelect = async (floorId, floorName) => {
    // Update selected floor ID.
    setSelectedFloor(floorId);
    // Update selected floor name.
    setSelectedFloorName(floorName);
    // Show room loading indicator.
    setRoomLoading(true);
    try {
      // Fetch rooms for the selected floor.
      const roomsData = await fetchRooms(floorId);
      // Update filtered rooms state.
      setFilteredRooms(roomsData);
      // Clear search query.
      setSearchQuery('');
      // Clear error message.
      setError(null);
    } catch (error) {
      // Log error for debugging.
      console.error('Failed to fetch rooms:', error);
      // Set error message for display.
      setError('Failed to load rooms. Please try again.');
    } finally {
      // Hide room loading indicator.
      setRoomLoading(false);
    }
  };

  // Function to handle room selection.
  const handleRoomSelect = (roomId, roomName) => {
    // Navigate to RoomUserList screen with room details.
    navigation.navigate('RoomUserList', { roomId, roomName });
  };

  // Function to handle navigation to assigned room screen.
  const handleAssignedRoomPress = () => {
    // Navigate to AssignedRoom screen.
    navigation.navigate('AssignedRoom');
  };

  // Function to handle adding a new room.
  const handleAddRoom = () => {
    // Check if a floor is selected.
    if (selectedFloor) {
      // Show add room modal.
      setModalVisible(true);
    } else {
      // Alert user to select a floor.
      alert('Please select a floor first.');
    }
  };

  // Function to filter rooms based on search query.
  const searchRooms = (query) => {
    // Update search query state.
    setSearchQuery(query);
    // Reset filters if query is empty.
    if (!query.trim()) {
      setFilteredRooms(allRooms);
      setSelectedFloor(null);
      setSelectedFloorName('');
      return;
    }

    // Filter rooms by name.
    const filtered = allRooms.filter(room =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );
    // Update filtered rooms state.
    setFilteredRooms(filtered);

    // Update floor selection based on first match.
    if (filtered.length > 0) {
      const firstMatch = filtered[0];
      setSelectedFloor(firstMatch.floorId);
      setSelectedFloorName(firstMatch.floorName);
    } else {
      setSelectedFloor(null);
      setSelectedFloorName('');
    }
  };

  // Check if user is admin or staff.
  const isAdminOrStaff = userRole === 'admin' || userRole === 'staff';

  // Function to determine marginBottom based on user role.
  const getMainContentMarginBottom = () => {
    // Extra space for admin button and indicator.
    if (userRole === 'admin') return 120; // Space for button + indicator
    // Space for staff indicator only.
    if (userRole === 'staff') return 60;  // Space for indicator only
    // Minimal space for students.
    return 16; // Minimal space for student (matches container padding)
  };

  // Renders the screen UI with floors, rooms, and role-specific features.
  return (
    <View style={styles.container}>
      <View style={[styles.mainContent, { marginBottom: getMainContentMarginBottom() }]}>
        <View style={styles.floorContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search rooms..."
              value={searchQuery}
              onChangeText={searchRooms}
            />
            <Ionicons name="search-outline" size={24} color="#333" style={styles.searchIcon} />
          </View>
          <Text style={styles.title}>Floors</Text>
          {loading ? (
            // Display loading indicator during initial fetch
            <ActivityIndicator size="large" color="#007bff" />
          ) : floors.length > 0 ? (
            // Display floors in a scrollable grid
            <ScrollView style={styles.floorsScrollView}>
              <View style={styles.floorsGrid}>
                {floors.map((item) => (
                  // Touchable floor item
                  <TouchableOpacity
                    key={item.id.toString()}
                    style={[styles.item, selectedFloor === item.id && styles.selectedItem]}
                    onPress={() => handleFloorSelect(item.id, item.name)}
                  >
                    <Text style={[styles.itemText, selectedFloor === item.id && styles.selectedItemText]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            // Display message if no floors found
            <Text style={styles.noData}>No floors found.</Text>
          )}
        </View>

        <View style={styles.roomContainer}>
          <View style={styles.roomsHeader}>
            <Text style={styles.title}>Rooms</Text>
            {userRole === 'admin' && selectedFloor && (
              // Button to add room for admins
              <TouchableOpacity style={styles.addRoomButton} onPress={handleAddRoom}>
                <Text style={styles.addRoomButtonText}>Add Room</Text>
              </TouchableOpacity>
            )}
          </View>

          {roomLoading ? (
            // Display loading indicator for rooms
            <ActivityIndicator size="large" color="#28a745" />
          ) : filteredRooms.length > 0 ? (
            // Display rooms in a two-column grid
            <FlatList
              data={[...filteredRooms].sort((a, b) => a.isFull - b.isFull)}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.row}
              renderItem={({ item }) => (
                // Touchable room item
                <TouchableOpacity
                  style={[
                    styles.roomItem,
                    isAdminOrStaff && item.isFull ? styles.fullRoom : null,
                    isAdminOrStaff && !item.isFull ? styles.availableRoom : null,
                  ]}
                  onPress={() => handleRoomSelect(item.id, item.name)}
                >
                  <Text style={styles.roomText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.noData}>No rooms found.</Text>}
            />
          ) : (
            // Display message if no rooms match search
            <Text style={styles.noData}>No rooms found matching your search.</Text>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {isAdminOrStaff && (
        // Bottom container for admin/staff features
        <View style={styles.bottomContainer}>
          <View style={styles.statusIndicator}>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: 'green' }]} />
              <Text style={styles.indicatorText}>Available</Text>
            </View>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: 'red' }]} />
              <Text style={styles.indicatorText}>Full</Text>
            </View>
          </View>

          {userRole === 'admin' && (
            // Button to navigate to assigned room screen for admins
            <TouchableOpacity
              style={styles.assignedRoomButton}
              onPress={handleAssignedRoomPress}
            >
              <Text style={styles.assignedRoomButtonText}>Assigned Room</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <AddRoom
          closeModal={() => setModalVisible(false)}
          floorId={selectedFloor}
          floorName={selectedFloorName}
          onRefresh={fetchData}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  mainContent: {
    flex: 1,
  },
  floorContainer: {
    height: height * 0.3,
    marginBottom: 16,
  },
  roomContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  searchIcon: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  floorsScrollView: {
    flex: 1,
  },
  floorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '48%',
    padding: 16,
    marginVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedItem: {
    backgroundColor: '#007bff',
  },
  selectedItemText: {
    color: 'white',
  },
  itemText: {
    fontSize: 16,
  },
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  addRoomButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addRoomButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  roomItem: {
    width: '48%',
    padding: 16,
    marginVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  fullRoom: {
    borderColor: 'red',
  },
  availableRoom: {
    borderColor: 'green',
  },
  roomText: {
    fontSize: 14,
  },
  noData: {
    textAlign: 'center',
    marginTop: 16,
    color: '#888',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  assignedRoomButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  assignedRoomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RoomScreen;