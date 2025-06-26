// app/components/EditRoomModal.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, View, Text, TouchableOpacity, Modal, 
//              StyleSheet, TextInput, Alert), custom modules (roomService)
// Description: 
//              - This EditRoomModal is a React Native component serving as a modal interface 
//                for editing room details in a mobile application.
//              - Allows users to update the room name and capacity, pre-filled with existing data.
//              - Validates that at least one field is changed before submission.
//              - Integrates with roomService to save changes and provides feedback via alerts.

// Imports necessary libraries and components for the modal.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, Alert } from 'react-native';
import { editRoom } from '../lib/services/roomService';

// Main component handling the edit room modal logic and rendering.
const EditRoomModal = ({ visible, onClose, roomId, roomName, currentCapacity }) => {
  // Initializes state variables for room name and capacity inputs.
  const [newRoomName, setNewRoomName] = useState(roomName);
  const [newCapacity, setNewCapacity] = useState(currentCapacity ? String(currentCapacity) : '');

  // Handles saving updated room details with validation and error handling.
  const handleSave = async () => {
    // Ensures at least one field has changed before proceeding.
    if ((!newRoomName || newRoomName === roomName) && (!newCapacity || newCapacity === String(currentCapacity))) {
      Alert.alert('Error', 'Please enter a new room name or capacity to update.');
      return;
    }

    try {
      // Uses existing room name if no new name is provided.
      const updatedRoomName = newRoomName || roomName;
      // Passes capacity as undefined if not provided.
      const updatedCapacity = newCapacity ? newCapacity : undefined;

      await editRoom(roomId, updatedRoomName, updatedCapacity);
      Alert.alert('Success', 'Room updated successfully!');
      onClose();
    } catch (error) {
      // Handles specific error for capacity conflicts.
      if (error.message.includes('please enter capacity more than current staff reside')) {
        Alert.alert('Failed', error.message);
      } else {
        Alert.alert('Error', error.message || 'Failed to update room. Please try again.');
      }
    }
  };

  // Renders the modal UI with input fields, header, and action buttons.
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <Text style={styles.modalText}>Edit Room</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={newRoomName}
            onChangeText={setNewRoomName}
            placeholder="Room Name"
          />

          <TextInput
            style={styles.input}
            value={newCapacity}
            onChangeText={setNewCapacity}
            placeholder="Capacity"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Edit Room</Text>
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
    backgroundColor: 'white',
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default EditRoomModal;