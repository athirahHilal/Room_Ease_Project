// app/components/AssignSelectedNoRoomUsers.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, View, Text, Modal, TouchableOpacity, 
//              StyleSheet, Alert), custom modules (roomService, SearchableNoRoomStaff)
// Description: 
//              - This AssignSelectedNoRoomUsers is a React Native component serving as a modal 
//                interface for assigning a room to a staff member without an assigned room in a 
//                mobile application.
//              - Uses SearchableNoRoomStaff component to select a user and includes a confirmation 
//                modal to verify the assignment.
//              - Integrates with roomService to assign the room and triggers a refresh callback 
//                upon success.
//              - Validates user selection before allowing assignment.

// Imports necessary libraries and components for the modal.
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SearchableNoRoomStaff from './searchableNoRoomStaff';
import { AssignUserRoom } from '../lib/services/roomService';

// Main component handling the assign no-room users modal logic and rendering.
const AssignSelectedNoRoomUsers = ({ visible, onClose, roomName, roomId, onRefresh }) => {
  // Initializes state variables for selected user and confirmation modal visibility.
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Handles the initial assign button press with user selection validation.
  const handleAssignPress = () => {
    console.log('Assign button pressed', selectedUser);
    // Ensures a user is selected before proceeding.
    if (!selectedUser) {
      Alert.alert('Error', 'Please select a user to assign.');
      return;
    }
    setConfirmModalVisible(true);
  };

  // Confirms and processes the room assignment with error handling.
  const handleConfirmAssign = async () => {
    console.log('Confirm assign triggered', selectedUser?.value, roomId);
    try {
      await AssignUserRoom(selectedUser.value, roomId);
      console.log('Assignment successful');
      Alert.alert('Success', 'User assigned to room successfully!');
      onRefresh(); // Trigger parent component refresh
      setConfirmModalVisible(false);
      onClose();
    } catch (error) {
      console.error('Error assigning room:', error);
      Alert.alert('Error', 'Failed to assign user to room. Please try again.');
      setConfirmModalVisible(false);
    }
  };

  // Determines if the assign button should be disabled based on user selection.
  const isButtonDisabled = !selectedUser;

  console.log('Current state:', { visible, confirmModalVisible, selectedUser });

  // Renders the modal UI with user selection and confirmation modal.
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Main Modal Content */}
        {!confirmModalVisible ? (
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Room: {roomName}</Text>
              <TouchableOpacity style={styles.closeXButton} onPress={onClose}>
                <Text style={styles.closeXButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <SearchableNoRoomStaff onSelectUser={setSelectedUser} />

            <TouchableOpacity
              style={[styles.assignButton, isButtonDisabled && styles.assignButtonDisabled]}
              onPress={handleAssignPress}
              disabled={isButtonDisabled}
            >
              <Text style={styles.assignButtonText}>Confirm Assign</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Confirmation Modal Content */
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Assign Room</Text>
            <Text style={styles.modalText}>
              Assign {selectedUser?.label || 'user'} to room {roomName}?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  console.log('No button clicked');
                  setConfirmModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  console.log('Yes button clicked');
                  handleConfirmAssign();
                }}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeXButton: {
    padding: 5,
  },
  closeXButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  assignButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  assignButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
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
    backgroundColor: '#dc3545',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AssignSelectedNoRoomUsers;