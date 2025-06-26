// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity), Ionicons, fetchNoRoomUser, AssignRoomModal
// Description:
//              - This AssignedRoom is a React Native component serving as a screen 
//                to display a list of staff members without assigned rooms in the RoomEase 
//                Portal mobile application.
//              - Fetches user data using fetchNoRoomUser service and displays it in a 
//                FlatList with a modal for assigning rooms.
//              - Handles loading, error states, and user interactions for room assignment.

// Imports necessary libraries for the component.
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchNoRoomUser } from '../lib/services/roomService';
import AssignRoomModal from '../components/assignRoomModal';

// Main component handling the assigned room screen logic and rendering.
const AssignedRoom = () => {
  // State to store list of users without rooms.
  const [users, setUsers] = useState([]);
  // State to manage loading indicator.
  const [loading, setLoading] = useState(true);
  // State to handle error messages.
  const [error, setError] = useState(null);
  // State to control visibility of room assignment modal.
  const [modalVisible, setModalVisible] = useState(false);
  // State to store selected user for room assignment.
  const [selectedUser, setSelectedUser] = useState(null);

  // Effect to fetch users without rooms on component mount.
  useEffect(() => {
    // Async function to retrieve user data.
    async function fetchUsers() {
      try {
        // Fetch user data from service.
        const usersData = await fetchNoRoomUser();
        // Update users state with fetched data.
        setUsers(usersData);
        // Clear any previous errors.
        setError(null);
      } catch (error) {
        // Log error to console.
        console.error('Failed to fetch users:', error);
        // Set error message for display.
        setError('Failed to load users. Please try again.');
      } finally {
        // Hide loading indicator.
        setLoading(false);
      }
    }
    // Execute fetch function.
    fetchUsers();
  }, []);

  // Handler for three-dot menu press to open room assignment modal.
  const handleThreeDotPress = (user) => {
    // Set selected user for modal.
    setSelectedUser(user);
    // Show modal.
    setModalVisible(true);
  };

  // Handler to close the room assignment modal.
  const closeModal = () => {
    // Hide modal.
    setModalVisible(false);
    // Clear selected user.
    setSelectedUser(null);
  };

  // Handler for successful room assignment.
  const handleRoomAssigned = (assignedUserId) => {
    // Remove assigned user from list.
    setUsers(prevUsers => prevUsers.filter(user => user.id !== assignedUserId));
    // Close modal.
    closeModal();
  };

  // Renders the screen UI with a list of users and room assignment modal.
  return (
    <View style={styles.container}>
      {/* Screen title */}
      <Text style={styles.title}>Staff without Rooms</Text>
      {/* Conditional rendering based on loading state */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : users.length > 0 ? (
        // List of users without rooms
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            // Touchable item for each user
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => handleThreeDotPress(item)}
            >
              <Text style={styles.userName}>{item.name}</Text>
              <View style={styles.menuButton}>
                <Ionicons name="ellipsis-vertical" size={24} color="black" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noData}>No users found.</Text>}
        />
      ) : (
        // Message when no users are found
        <Text style={styles.noData}>No users found.</Text>
      )}

      {/* Error message display */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal for assigning rooms */}
      <AssignRoomModal
        visible={modalVisible}
        onClose={closeModal}
        userId={selectedUser ? selectedUser.id : null}
        userName={selectedUser ? selectedUser.name : ''}
        onSuccess={handleRoomAssigned}
      />
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  menuButton: {
    padding: 5,
  },
  noData: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AssignedRoom;