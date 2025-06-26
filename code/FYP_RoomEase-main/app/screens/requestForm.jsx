// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal), requestApprove, requestReject
// Description:
//              - This RequestForm is a React Native component serving as a screen 
//                to display details of a user’s pending room transfer request and allow 
//                approval or rejection in the RoomEase Portal mobile application.
//              - Retrieves user data and record ID from navigation parameters and 
//                presents it in a scrollable view.
//              - Includes modals to confirm approval or rejection actions before 
//                processing the request.

// Imports necessary libraries for the component.
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { requestApprove, requestReject } from '../lib/services/transferService';

// Main component handling the request form screen logic and rendering.
const RequestForm = ({ route, navigation }) => {
  // Extracts user data and record ID from navigation parameters.
  const { user, recordId } = route.params;
  // State to control approval modal visibility.
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  // State to control rejection modal visibility.
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  // Function to show approval confirmation modal.
  const confirmApprove = () => {
    setApproveModalVisible(true);
  };

  // Function to show rejection confirmation modal.
  const confirmReject = () => {
    setRejectModalVisible(true);
  };

  // Function to handle request approval.
  const handleApprove = async () => {
    // Hide approval modal.
    setApproveModalVisible(false);
    try {
      // Log approval action for debugging.
      console.log('Admin approving request for record ID:', recordId);
      // Send approval request to service.
      await requestApprove(recordId);
      // Navigate back to previous screen.
      navigation.goBack(); // Navigate back to ReqScreen
    } catch (error) {
      // Show error alert if approval fails.
      alert('Error', 'Failed to approve transfer request.');
      // Log error for debugging.
      console.error('Approve error:', error);
    }
  };

  // Function to handle request rejection.
  const handleReject = async () => {
    // Hide rejection modal.
    setRejectModalVisible(false);
    try {
      // Log rejection action for debugging.
      console.log('Admin rejecting request for record ID:', recordId);
      // Send rejection request to service.
      await requestReject(recordId);
      // Navigate back to previous screen.
      navigation.goBack(); // Navigate back to ReqScreen
    } catch (error) {
      // Show error alert if rejection fails.
      alert('Error', 'Failed to reject transfer request.');
      // Log error for debugging.
      console.error('Reject error:', error);
    }
  };

  // Renders the screen UI with user details, action buttons, and confirmation modals.
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.name}</Text>

          <Text style={styles.label}>Phone Number:</Text>
          <Text style={styles.value}>{user.phoneNo}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>Faculty:</Text>
          <Text style={styles.value}>{user.department}</Text>

          <Text style={styles.label}>Current Room:</Text>
          <Text style={styles.value}>{user.currentRoom}</Text>

          <Text style={styles.label}>Requested Room:</Text>
          <Text style={styles.value}>{user.reqRoom}</Text>

          <Text style={styles.label}>Reason:</Text>
          <Text style={styles.value}>{user.reason}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={confirmReject}>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={confirmApprove}>
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
      </View>

      {/* Approval Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={approveModalVisible}
        onRequestClose={() => setApproveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Approval</Text>
            <Text style={styles.modalText}>
              Are you sure you want to approve this request?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setApproveModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleApprove}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rejection Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={rejectModalVisible}
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Rejection</Text>
            <Text style={styles.modalText}>
              Are you sure you want to reject this request?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleReject}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#ff4444',
    marginRight: 10,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
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

export default RequestForm;