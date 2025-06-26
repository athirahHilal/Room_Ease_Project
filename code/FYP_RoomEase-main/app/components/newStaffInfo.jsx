// app/components/NewStaffInfoModal.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, Modal, TouchableOpacity, StyleSheet), 
//              custom modules (Colors)
// Description: 
//              - This NewStaffInfoModal is a React Native component serving as a modal interface 
//                to welcome new staff members in a mobile application.
//              - Displays instructions for new staff to obtain their login email from the Admin Office.
//              - Features a simple slide-in modal with a close button for dismissal.

// Imports necessary libraries and components for the modal.
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../styles/theme';

// Main component handling the new staff info modal logic and rendering.
const NewStaffInfoModal = ({ visible, onClose }) => {
  // Renders the modal UI with welcome message and close button.
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Welcome, New Staff!</Text>
          <Text style={styles.modalText}>
            To get your login email, visit the Admin Office on Level G.{'\n'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    width: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NewStaffInfoModal;