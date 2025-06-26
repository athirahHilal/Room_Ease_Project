// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Modal, ScrollView), fetchStaffProfile, userStatus, AssignRoomModal, useNavigation, userService
// Description:
//              - This StaffProfile is a React Native component serving as a screen 
//                to display a staff member’s profile details in the RoomEase Portal 
//                mobile application.
//              - Fetches staff profile and current user role, displaying details like 
//                room, email, faculty, and phone number based on role permissions.
//              - Includes admin-specific actions like deactivating users, transferring 
//                rooms, assigning rooms, and viewing timetables, with confirmation modals.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { fetchStaffProfile, userStatus } from '../lib/services/staffService';
import AssignRoomModal from '../components/assignRoomModal';
import { useNavigation } from '@react-navigation/native';
import userService from '../lib/services/userService';

// Main component handling the staff profile screen logic and rendering.
const StaffProfile = ({ route }) => {
  // Extracts user ID from navigation parameters.
  const { userId } = route.params;
  // State to store user profile data.
  const [user, setUser] = useState(null);
  // State to manage loading indicator.
  const [loading, setLoading] = useState(true);
  // State to handle error messages.
  const [error, setError] = useState(null);
  // State to control deactivate confirmation modal visibility.
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  // State to control assign room modal visibility.
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  // State to store current user’s role.
  const [currentUserRole, setCurrentUserRole] = useState(null);
  // Hook to access navigation functionality.
  const navigation = useNavigation();

  // Effect to fetch user data when user ID or refresh param changes.
  useEffect(() => {
    // Execute fetch function.
    fetchUserData();
  }, [userId, route.params?.refresh]);

  // Function to fetch staff profile and current user role.
  const fetchUserData = async () => {
    // Show loading indicator.
    setLoading(true);
    try {
      // Fetch staff profile data.
      const userProfile = await fetchStaffProfile(userId);
      // Update user state.
      setUser(userProfile);

      // Fetch current user profile.
      const currentUserProfile = await userService.fetchUserProfile();
      // Check if profile fetch was successful.
      if (currentUserProfile.success) {
        // Update current user role state.
        setCurrentUserRole(currentUserProfile.data.role);
      } else {
        // Log error if role fetch fails.
        console.error('Failed to fetch current user role:', currentUserProfile.error);
        // Set error message for display.
        setError('Failed to load user role.');
      }
    } catch (err) {
      // Set error message for display.
      setError('Failed to load profile. Please try again later.');
      // Log error for debugging.
      console.error(err);
    } finally {
      // Hide loading indicator.
      setLoading(false);
    }
  };

  // Function to handle deactivate button press.
  const handleDeactivate = () => {
    // Check if user exists and is active.
    if (!user || user.status === 'inactive') return;
    // Show deactivate confirmation modal.
    setDeactivateModalVisible(true);
  };

  // Function to confirm user deactivation.
  const confirmDeactivate = async () => {
    // Hide deactivate modal.
    setDeactivateModalVisible(false);
    try {
      // Update user status to inactive.
      await userStatus(user.id, 'inactive');
      // Update user state with inactive status and no room.
      setUser((prevUser) => ({
        ...prevUser,
        status: 'inactive',
        room: 'No Room Assigned',
      }));
    } catch (error) {
      // Log error for debugging.
      console.error('Error deactivating user:', error);
      // Show error alert.
      alert('Error', 'Failed to deactivate user. Please try again.');
    }
  };

  // Function to handle transfer button press.
  const handleTransfer = () => {
    // Navigate to Transfer screen with user details.
    navigation.navigate('Transfer', {
      userId: user.id,
      userName: user.name,
      currentRoom: user.room,
    });
  };

  // Function to handle assign room button press.
  const handleAssignRoom = () => {
    // Show assign room modal.
    setAssignModalVisible(true);
  };

  // Function to handle timetable button press.
  const handleTimetable = () => {
    // Navigate to TimetableScreen with user ID.
    navigation.navigate('TimetableScreen', { userId: user.id });
  };

  // Function to handle successful room assignment.
  const handleAssignSuccess = () => {
    // Hide assign room modal.
    setAssignModalVisible(false);
    // Refresh user data.
    fetchUserData();
  };

  // Conditional rendering for loading state.
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // Conditional rendering for error state.
  if (error) {
    return <Text>{error}</Text>;
  }

  // Conditional rendering if user data is unavailable.
  if (!user) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // Set default avatar or use provided URL.
  const defaultAvatar = require('../assets/default.jpg');
  const avatarUrl = user.avatar && user.avatar !== 'No Avatar Provided' ? { uri: user.avatar } : defaultAvatar;

  // Array of user details to display based on role.
  const details = [
    { label: 'Room', value: user.room || 'Not Available' },
    { label: 'Email', value: user.email || 'Not Provided' },
    { label: 'Faculty', value: user.faculty || 'Not Specified' },
    ...(currentUserRole !== 'student'
      ? [{ label: 'Phone', value: user.phoneNo || 'Not Provided' }]
      : []),
    ...(currentUserRole === 'admin'
      ? [{ label: 'Status', value: user.status || 'Unknown' }]
      : []),
  ];

  // Renders the screen UI with user details, avatar, and role-specific actions.
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={avatarUrl} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>

        <View style={styles.detailsContainer}>
          {details.map((detail, index) => (
            // Render each detail row
            <DetailRow
              key={detail.label}
              label={detail.label}
              value={detail.value}
              isLast={index === details.length - 1}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.timetableButton} onPress={handleTimetable}>
          <Text style={styles.buttonText}>Timetable</Text>
        </TouchableOpacity>
      </ScrollView>

      {currentUserRole === 'admin' && (
        // Button container for admin actions
        <View style={styles.buttonContainer}>
          {user.status === 'active' && (
            // Button to deactivate user
            <TouchableOpacity style={[styles.button, styles.deactivateButton]} onPress={handleDeactivate}>
              <Text style={styles.buttonText}>Deactivate User</Text>
            </TouchableOpacity>
          )}

          {user.room !== 'No Room Assigned' && user.status === 'active' && (
            // Button to initiate transfer
            <TouchableOpacity style={[styles.button, styles.transferButton]} onPress={handleTransfer}>
              <Text style={styles.buttonText}>Transfer</Text>
            </TouchableOpacity>
          )}

          {user.room === 'No Room Assigned' && user.status === 'active' && (
            // Button to assign room
            <TouchableOpacity style={[styles.button, styles.assignButton]} onPress={handleAssignRoom}>
              <Text style={styles.buttonText}>Assign Room</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Deactivation Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deactivateModalVisible}
        onRequestClose={() => setDeactivateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deactivation</Text>
            <Text style={styles.modalText}>
              Are you sure you want to deactivate {user.name}?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeactivateModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDeactivate}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AssignRoomModal
        visible={assignModalVisible}
        onClose={() => setAssignModalVisible(false)}
        onSuccess={handleAssignSuccess}
        userId={user.id}
        userName={user.name}
      />
    </View>
  );
};

// Component to render individual detail row.
const DetailRow = ({ label, value, isLast }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
    {!isLast && <View style={styles.separator} />}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 12,
  },
  timetableButton: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#16509e',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    flex: 1,
    alignItems: 'center',
  },
  assignButton: {
    backgroundColor: '#007bff',
  },
  transferButton: {
    backgroundColor: '#FFA500',
  },
  deactivateButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  confirmButton: {
    backgroundColor: '#007BFF',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StaffProfile;