// app/components/RequestSelectedRoom.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, View, Text, Modal, TouchableOpacity, 
//              StyleSheet, TextInput, Alert), custom modules (userService)
// Description: 
//              - This RequestSelectedRoom is a React Native component serving as a modal interface 
//                for staff to request a specific room in a mobile application.
//              - Allows users to input a reason for the room request, with a character limit of 200.
//              - Validates that a reason is provided before submission.
//              - Integrates with userService to submit the room request and provides feedback via alerts.

// Imports necessary libraries and components for the modal.
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import userService from '../lib/services/userService';

// Main component handling the request selected room modal logic and rendering.
const RequestSelectedRoom = ({ visible, onClose, roomName, roomId, currentRoomID }) => {
  // Initializes state variable for the reason input.
  const [reason, setReason] = useState('');

  // Handles submission of the room request with validation and error handling.
  const handleRequestPress = async () => {
    // Ensures a reason is provided before proceeding.
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the request.');
      return;
    }

    try {
      const result = await userService.staffRequest(roomId, currentRoomID, reason);
      if (result.success) {
        Alert.alert('Success', 'Room request submitted successfully!');
        onClose();
      } else {
        Alert.alert('Error', `Failed to submit request: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting room request:', error);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    }
  };

  // Determines if the request button should be disabled based on reason input.
  const isButtonDisabled = !reason.trim();

  // Renders the modal UI with room name, reason input, and action buttons.
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Request Room: {roomName}</Text>
            <TouchableOpacity style={styles.closeXButton} onPress={onClose}>
              <Text style={styles.closeXButtonText}>x</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.reasonInput}
            placeholder="Reason for request"
            value={reason}
            onChangeText={setReason}
            multiline
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{reason.length}/200</Text>

          <TouchableOpacity
            style={[styles.requestButton, isButtonDisabled && styles.requestButtonDisabled]}
            onPress={handleRequestPress}
            disabled={isButtonDisabled}
          >
            <Text style={styles.requestButtonText}>Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  reasonInput: {
    width: '100%',
    height: 80,
    borderColor: '#007bff',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  requestButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  requestButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RequestSelectedRoom;