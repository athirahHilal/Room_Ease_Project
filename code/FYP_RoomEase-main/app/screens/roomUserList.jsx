// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet), fetchUsersByRoom, fetchRoomCapacity, AssignSelectedNoRoomUsers, RequestSelectedRoom, EditRoomModal, Ionicons, useNavigation, userService
// Description:
//              - This RoomUserList is a React Native component serving as a screen 
//                to display users assigned to a specific room in the RoomEase Portal 
//                mobile application.
//              - Fetches room user data, capacity, and user role, rendering a list of 
//                occupied and available slots with role-specific actions.
//              - Includes modals for assigning rooms, requesting rooms, and editing room 
//                details, with conditional UI based on user role.

// Imports necessary libraries for the component.
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { fetchUsersByRoom, fetchRoomCapacity } from '../lib/services/roomService';
import AssignSelectedNoRoomUsers from '../components/selectedNoRoomUserModal';
import RequestSelectedRoom from '../components/requestSelectedRoom';
import EditRoomModal from '../components/editRoomModal';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import userService from '../lib/services/userService';

// Main component handling the room user list screen logic and rendering.
const RoomUserList = ({ route }) => {
  // Extracts room ID and name from navigation parameters.
  const { roomId, roomName } = route.params;
  // State to store list of users in the room.
  const [users, setUsers] = useState([]);
  // State to store room capacity.
  const [capacity, setCapacity] = useState(null);
  // State to manage loading indicator.
  const [loading, setLoading] = useState(true);
  // State to handle error messages.
  const [error, setError] = useState(null);
  // State to control assign room modal visibility.
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  // State to control request room modal visibility.
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  // State to control edit room modal visibility.
  const [isEditRoomModalVisible, setIsEditRoomModalVisible] = useState(false);
  // State to store user’s role.
  const [userRole, setUserRole] = useState(null);
  // State to store current user’s room ID.
  const [currentRoomID, setCurrentRoomID] = useState(null);
  // State to track if user has a pending request.
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  // Hook to access navigation functionality.
  const navigation = useNavigation();

  // Function to fetch room users, capacity, and user profile data.
  const fetchData = async () => {
    try {
      // Show loading indicator.
      setLoading(true);
      // Fetch data concurrently.
      const [userList, roomCapacity, userProfile] = await Promise.all([
        fetchUsersByRoom(roomId),
        fetchRoomCapacity(roomId),
        userService.fetchUserProfile(),
      ]);
      // Update users state.
      setUsers(userList);
      // Update capacity state.
      setCapacity(roomCapacity);
      // Check if user profile fetch was successful.
      if (userProfile.success) {
        // Update user role state.
        setUserRole(userProfile.data.role);
        // Update current room ID state.
        setCurrentRoomID(userProfile.data.roomID === 'N/A' ? null : userProfile.data.roomID);
        // Check for pending requests if user is staff.
        if (userProfile.data.role === 'staff') {
          const pending = await userService.hasPendingRequest();
          // Update pending request state.
          setHasPendingRequest(pending);
        }
      }
      // Clear error message.
      setError(null);
    } catch (error) {
      // Log error for debugging.
      console.error('Failed to fetch data:', error);
      // Set error message for display.
      setError('Failed to load data. Please try again.');
    } finally {
      // Hide loading indicator.
      setLoading(false);
    }
  };

  // Effect to fetch data when room ID changes.
  useEffect(() => {
    // Execute fetch function.
    fetchData();
  }, [roomId]);

  // Check if room is fully occupied.
  const isRoomFullyOccupied = users.length >= capacity;
  // Check if user is admin or staff.
  const isAdminOrStaff = userRole === 'admin' || userRole === 'staff';
  // Determine if request button should be disabled for staff.
  const isRequestDisabled = userRole === 'staff' && 
    (isRoomFullyOccupied || hasPendingRequest || currentRoomID === roomId);

  // Function to generate user list with occupied and available slots.
  const generateUserList = () => {
    // Return empty array if capacity is not available.
    if (!capacity) return [];
    const userList = [];
    // Create slots based on capacity.
    for (let i = 1; i <= capacity; i++) {
      const user = users[i - 1];
      const slot = {
        id: i,
        name: user ? user.name : 'Available',
        isOccupied: !!user,
        userId: user ? user.id : null,
      };
      // Filter for students: show only occupied slots.
      if (userRole === 'student') {
        if (slot.isOccupied) userList.push(slot);
      } else {
        // Show all slots for admin/staff.
        userList.push(slot);
      }
    }
    return userList;
  };

  // Function to handle edit room button press.
  const handleEditRoomPress = () => {
    // Show edit room modal.
    setIsEditRoomModalVisible(true);
  };

  // Function to handle action button press (assign or request).
  const handleActionPress = () => {
    // Open assign modal for admin.
    if (userRole === 'admin') {
      setIsAssignModalVisible(true);
    } else if (userRole === 'staff' && !hasPendingRequest) {
      // Open request modal for staff.
      setIsRequestModalVisible(true);
    }
  };

  // Function to close assign modal.
  const handleAssignModalClose = () => {
    // Hide assign modal.
    setIsAssignModalVisible(false);
  };

  // Function to close request modal and refresh pending status.
  const handleRequestModalClose = () => {
    // Hide request modal.
    setIsRequestModalVisible(false);
    // Refresh pending request status for staff.
    if (userRole === 'staff') {
      userService.hasPendingRequest().then(setHasPendingRequest);
    }
  };

  // Function to close edit room modal and refresh data.
  const handleEditRoomModalClose = () => {
    // Hide edit room modal.
    setIsEditRoomModalVisible(false);
    // Refresh room data.
    fetchData();
  };

  // Function to handle user selection.
  const handleUserPress = (item) => {
    // Navigate to staff profile if slot is occupied.
    if (item.isOccupied) {
      navigation.navigate('StaffProfile', { userId: item.userId });
    }
  };

  // Renders the screen UI with room details, user list, and role-specific actions.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room: {roomName}</Text>
      {isAdminOrStaff && (
        capacity !== null ? (
          // Display room capacity for admin/staff
          <Text style={styles.capacityText}>Capacity: {capacity}</Text>
        ) : (
          // Display message if capacity unavailable
          <Text style={styles.capacityText}>Capacity not available</Text>
        )
      )}

      {loading ? (
        // Display loading indicator
        <ActivityIndicator size="large" color="#007bff" />
      ) : error ? (
        // Display error message
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        // Display user list
        <FlatList
          data={generateUserList()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            // Touchable item for each slot
            <TouchableOpacity
              style={[
                styles.userItem,
                isAdminOrStaff
                  ? { borderColor: item.isOccupied ? 'red' : 'green' }
                  : { borderColor: '#ccc' },
              ]}
              onPress={() => handleUserPress(item)}
              disabled={!item.isOccupied}
            >
              <Text style={styles.userNumber}>{item.id}.</Text>
              <Text style={styles.userText}>{item.name}</Text>
              {item.isOccupied && (
                // Display menu icon for occupied slots
                <View style={styles.menuButton}>
                  <Ionicons name="ellipsis-vertical" size={24} color="#555" />
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noData}>No users found.</Text>}
          contentContainerStyle={[
            styles.flatListContent,
            { paddingBottom: userRole === 'admin' ? 160 : userRole === 'staff' ? 50 : 20 },
          ]}
        />
      )}

      {isAdminOrStaff && (
        // Bottom container for admin/staff features
        <View style={styles.bottomContainer}>
          <View style={styles.statusIndicator}>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: 'green' }]} />
              <Text style={styles.indicatorText}>Unoccupied</Text>
            </View>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: 'red' }]} />
              <Text style={styles.indicatorText}>Occupied</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.assignedRoomButton,
                (userRole === 'admin' && isRoomFullyOccupied) || isRequestDisabled
                  ? styles.disabledButton
                  : null,
              ]}
              onPress={handleActionPress}
              disabled={userRole === 'admin' ? isRoomFullyOccupied : isRequestDisabled}
            >
              <Text style={styles.assignedRoomButtonText}>
                {userRole === 'admin' ? 'Assign Room' : 'Request Room'}
              </Text>
            </TouchableOpacity>

            {userRole === 'admin' && (
              // Button to edit room for admins
              <TouchableOpacity
                style={styles.editRoomButton}
                onPress={handleEditRoomPress}
              >
                <Text style={styles.editRoomButtonText}>Edit Room</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <AssignSelectedNoRoomUsers
        visible={isAssignModalVisible}
        onClose={handleAssignModalClose}
        roomName={roomName}
        roomId={roomId}
        onRefresh={fetchData}
      />

      <RequestSelectedRoom
        visible={isRequestModalVisible}
        onClose={handleRequestModalClose}
        roomName={roomName}
        roomId={roomId}
        currentRoomID={currentRoomID}
      />

      <EditRoomModal
        visible={isEditRoomModalVisible}
        onClose={handleEditRoomModalClose}
        roomId={roomId}
        roomName={roomName}
        currentCapacity={capacity}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    capacityText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
        color: '#555',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 2,
    },
    userNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
        color: '#555',
    },
    userText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    menuButton: {
        marginLeft: 10,
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
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    assignedRoomButton: {
        backgroundColor: '#007BFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    assignedRoomButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    editRoomButton: {
        backgroundColor: '#007bff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        marginLeft: 8,
    },
    editRoomButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RoomUserList;