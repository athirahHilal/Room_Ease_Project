// app/components/AddRoomModal.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, View, Text, TouchableOpacity, TextInput, 
//              StyleSheet, Alert), custom modules (roomService)
// Description: 
//              - This AddRoomModal is a React Native component serving as a modal interface 
//                for adding a new room to a specific floor in a mobile application.
//              - Allows users to input room name and capacity, with validation for numeric 
//                capacity and no decimals.
//              - Integrates with roomService to add the room and refreshes the parent screen 
//                upon successful addition.
//              - Includes a close button to dismiss the modal and disables the add button 
//                when inputs are incomplete.

// Imports necessary libraries for the component.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { AddRoom } from '../lib/services/roomService';

// Main component handling the add room modal logic and rendering.
const AddRoomModal = ({ closeModal, floorId, floorName, onRefresh }) => {
  // Initializes state variables for room name and capacity inputs.
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('');

  // Handles the addition of a new room with input validation and error handling.
  const handleAddRoom = async () => {
    // Ensures inputs are not empty before proceeding.
    if (!roomName || !roomCapacity) {
      return;
    }

    // Validates that capacity contains only numbers.
    if (/[a-zA-Z]/.test(roomCapacity)) {
      Alert.alert('Error', 'Insert number only');
      return;
    }

    // Validates that capacity does not contain decimals.
    if (roomCapacity.includes('.')) {
      Alert.alert('Error', 'Cannot use decimal');
      return;
    }

    // Constructs the new room object for submission.
    const newRoom = {
      name: roomName,
      group: 3,
      parent: floorId,
      description: parseInt(roomCapacity, 10),
      category: 'capacity'
    };

    // Attempts to add the room and handles potential errors.
    try {
      const result = await AddRoom(newRoom);
      if (result === null) {
        Alert.alert('Error', 'Room name exists');
        return;
      }
      Alert.alert('Success', 'Room added successfully!');
      onRefresh();
      closeModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to add room. Please try again.');
      console.error(error);
    }
  };

  // Determines if the add button should be disabled based on input completeness.
  const isButtonDisabled = !roomName || !roomCapacity;

  // Renders the modal UI with input fields, floor information, and action buttons.
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.modalTitle}>Add Room</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
    
        <Text style={styles.floorText}>{`Level: ${String(floorName)}`}</Text>
    
        <TextInput
          style={styles.input}
          placeholder="Room Name"
          value={roomName}
          onChangeText={setRoomName}
        />
        <TextInput
          style={styles.input}
          placeholder="Room Capacity"
          value={roomCapacity}
          onChangeText={setRoomCapacity}
          keyboardType="numeric"
        />
    
        <TouchableOpacity 
          style={[styles.addButton, isButtonDisabled && styles.addButtonDisabled]}
          onPress={handleAddRoom}
          disabled={isButtonDisabled}
        >
          <Text style={styles.addButtonText}>Add Room</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  floorText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  addButton: {
    marginTop: 15,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddRoomModal;