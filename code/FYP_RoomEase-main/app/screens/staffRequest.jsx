// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, StyleSheet, StatusBar, Text, TouchableOpacity, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView), Colors, useNavigation, DropDownPicker, FetchAvailableFloor, FetchAvailableRoom, userService, pb
// Description:
//              - This StaffRequest is a React Native component serving as a screen 
//                for staff to request room changes in the RoomEase Portal mobile application.
//              - Fetches available floors, rooms, and user profile data, allowing selection 
//                of a new room with a reason for the request.
//              - Includes a modal for confirming requests and displays pending request status 
//                with navigation to request history.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { FetchAvailableFloor, FetchAvailableRoom } from '../lib/services/roomService';
import userService from '../lib/services/userService';
import pb from '../lib/pocketbase';

// Main component handling the staff request screen logic and rendering.
const StaffRequest = () => {
  // Hook to access navigation functionality.
  const navigation = useNavigation();
  // State to store list of floors.
  const [floors, setFloors] = useState([]);
  // State to store list of rooms.
  const [rooms, setRooms] = useState([]);
  // State to manage loading indicator.
  const [loading, setLoading] = useState(true);
  // State to manage submitting indicator.
  const [submitting, setSubmitting] = useState(false);
  // State to control floor dropdown visibility.
  const [floorOpen, setFloorOpen] = useState(false);
  // State to control room dropdown visibility.
  const [roomOpen, setRoomOpen] = useState(false);
  // State to store selected floor ID.
  const [selectedFloor, setSelectedFloor] = useState(null);
  // State to store selected room ID.
  const [selectedRoom, setSelectedRoom] = useState(null);
  // State for reason input.
  const [reason, setReason] = useState('');
  // State to store current user’s profile.
  const [currentUser, setCurrentUser] = useState(null);
  // State to track if user has a pending request.
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  // State to store pending request room name.
  const [pendingRequestRoom, setPendingRequestRoom] = useState(null);
  // State for success/error messages.
  const [successMessage, setSuccessMessage] = useState(null);
  // State to control confirmation modal visibility.
  const [modalVisible, setModalVisible] = useState(false);

  // Function to initialize data.
  const initialize = async () => {
    // Show loading indicator.
    setLoading(true);
    // Fetch user data.
    await fetchUserData();
    // Fetch available floors.
    await handleFetchFloors();
    // Hide loading indicator.
    setLoading(false);
  };

  // Effect to run initialization on component mount.
  useEffect(() => {
    // Execute initialization.
    initialize();
  }, []);

  // Function to fetch user profile and pending request status.
  const fetchUserData = async () => {
    try {
      // Fetch user profile.
      const result = await userService.fetchUserProfile();
      // Check if fetch was successful.
      if (result.success) {
        // Update current user state.
        setCurrentUser(result.data);
        // Check for pending requests.
        const pending = await userService.hasPendingRequest();
        // Update pending request state.
        setHasPendingRequest(pending);

        // Fetch pending request details if applicable.
        if (pending) {
          const records = await pb.collection('transferRoom').getList(1, 1, {
            filter: `requestBy = "${result.data.id}" && status = "pending"`,
            expand: 'transferRoomID',
          });
          if (records.items.length > 0) {
            const roomData = records.items[0].expand?.transferRoomID;
            // Update pending request room state.
            setPendingRequestRoom(roomData?.name || records.items[0].transferRoomID);
          }
        }
      } else {
        // Log error if profile fetch fails.
        console.error('Failed to fetch user profile:', result.error);
      }
    } catch (error) {
      // Log error for debugging.
      console.error('Error fetching user data:', error);
    }
  };

  // Function to fetch available floors.
  const handleFetchFloors = async () => {
    try {
      // Fetch available floors.
      const { availableFloors } = await FetchAvailableFloor();
      // Format floors for dropdown.
      const formattedFloors = availableFloors.map(floor => ({ label: floor.name, value: floor.id }));

      // Sort floors: Ground Floor first, then numerically.
      formattedFloors.sort((a, b) => {
        if (a.label === 'Ground Floor') return -1;
        if (b.label === 'Ground Floor') return 1;
        const floorA = parseInt(a.label.replace('Floor ', '')) || 0;
        const floorB = parseInt(b.label.replace('Floor ', '')) || 0;
        return floorA - floorB;
      });

      // Update floors state.
      setFloors(formattedFloors);
    } catch (error) {
      // Log error for debugging.
      console.error('Failed to fetch floors:', error);
    }
  };

  // Function to handle floor selection and fetch rooms.
  const handleFloorSelect = async (floorId) => {
    // Update selected floor state.
    setSelectedFloor(floorId);
    // Clear selected room.
    setSelectedRoom(null);
    // Clear rooms list.
    setRooms([]);

    try {
      // Fetch available rooms for the selected floor.
      const availableRooms = await FetchAvailableRoom(floorId);
      // Filter out current user’s room and format for dropdown.
      const filteredRooms = availableRooms
        .filter(room => room.id !== currentUser?.roomID)
        .map(room => ({ label: room.name, value: room.id }));
      // Update rooms state.
      setRooms(filteredRooms);
    } catch (error) {
      // Log error for debugging.
      console.error('Failed to fetch available rooms:', error);
    }
  };

  // Function to validate and confirm room change request.
  const confirmRequestChange = () => {
    // Check if a room is selected.
    if (!selectedRoom) {
      setSuccessMessage('Please select a room to request.');
      return;
    }
    // Check if reason is provided.
    if (!reason.trim()) {
      setSuccessMessage('Please provide a reason for the request.');
      return;
    }
    // Check if user data is available.
    if (!currentUser || !currentUser.id) {
      setSuccessMessage('User information is missing.');
      return;
    }

    // Get current room ID.
    const currentRoomID = currentUser.roomID === 'N/A' ? null : currentUser.roomID;
    // Check if selected room is the same as current room.
    if (selectedRoom === currentRoomID && currentRoomID !== null) {
      const selectedRoomName = rooms.find(room => room.value === selectedRoom)?.label || selectedRoom;
      setSuccessMessage(`Cannot change to room ${selectedRoomName}, you are currently residing in ${selectedRoomName}`);
      return;
    }

    // Show confirmation modal.
    setModalVisible(true);
  };

  // Function to submit room change request.
  const handleRequestChange = async () => {
    // Hide confirmation modal.
    setModalVisible(false);
    // Show submitting indicator.
    setSubmitting(true);
    try {
      // Get current room ID.
      const currentRoomID = currentUser.roomID === 'N/A' ? null : currentUser.roomID;
      // Submit room change request.
      const result = await userService.staffRequest(selectedRoom, currentRoomID, reason);
      // Check if request was successful.
      if (result.success) {
        // Reinitialize data.
        await initialize();
      } else {
        // Set error message for display.
        setSuccessMessage(`Failed to submit request: ${result.error}`);
      }
    } catch (error) {
      // Log error for debugging.
      console.error('Error submitting request:', error);
      // Set error message for display.
      setSuccessMessage('An unexpected error occurred. Please try again.');
    } finally {
      // Hide submitting indicator.
      setSubmitting(false);
    }
  };

  // Function to navigate to request history screen.
  const navigateToRequestHistory = () => {
    // Navigate to RequestHistory screen.
    navigation.navigate('RequestHistory');
  };

  // Get selected room name for display.
  const selectedRoomName = rooms.find(room => room.value === selectedRoom)?.label || selectedRoom;

  // Renders the screen UI with room selection, reason input, and buttons.
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80} // Adjusted for better spacing
    >
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled" // Ensures dropdown interaction isn’t blocked
      >
        <View style={styles.contentContainer}>
          {loading ? (
            // Display loading indicator
            <ActivityIndicator size="large" color={Colors.primary} style={styles.loading} />
          ) : (
            <View style={styles.content}>
              {hasPendingRequest ? (
                <>
                  <Text style={styles.pendingText}>Your request is still in process</Text>
                  <View style={styles.roomItemContainer}>
                    <Text style={styles.roomInfoText}>
                      Current Room: {currentUser?.roomID && currentUser.roomID !== 'N/A' ? currentUser.roomName : 'No Room Assigned'}
                    </Text>
                  </View>
                  <View style={styles.roomItemContainer}>
                    <Text style={styles.roomInfoText}>
                      Request Room: {pendingRequestRoom || 'Loading...'}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.currentRoomText}>
                    Current Room: {currentUser?.roomID && currentUser.roomID !== 'N/A' ? currentUser.roomName : 'No Room Assigned'}
                  </Text>
                  <View style={styles.dropdownWrapper}>
                    <DropDownPicker
                      open={floorOpen}
                      value={selectedFloor}
                      items={floors}
                      setOpen={setFloorOpen}
                      setValue={setSelectedFloor}
                      setItems={setFloors}
                      placeholder="Select a floor"
                      style={styles.dropdown}
                      containerStyle={styles.dropdownContainer}
                      onChangeValue={handleFloorSelect}
                      disabled={submitting}
                      dropDownDirection="BOTTOM"
                      listMode="SCROLLVIEW" // Keep SCROLLVIEW, but with maxHeight
                      maxHeight={200} // Limit height and enable scrolling
                      zIndex={3000}
                    />
                  </View>
                  {selectedFloor && (
                    <View style={styles.dropdownWrapper}>
                      <DropDownPicker
                        open={roomOpen}
                        value={selectedRoom}
                        items={rooms}
                        setOpen={setRoomOpen}
                        setValue={setSelectedRoom}
                        setItems={setRooms}
                        placeholder="Select a room"
                        style={styles.dropdown}
                        containerStyle={styles.dropdownContainer}
                        disabled={submitting}
                        dropDownDirection="BOTTOM"
                        listMode="SCROLLVIEW" // Keep SCROLLVIEW, but with maxHeight
                        maxHeight={200} // Limit height and enable scrolling
                        zIndex={2000}
                      />
                    </View>
                  )}
                  <TextInput
                    style={styles.reasonInput}
                    placeholder="Reason for request"
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    maxLength={200}
                    editable={!submitting}
                  />
                  <Text style={styles.charCount}>{reason.length}/200</Text>
                </>
              )}
            </View>
          )}
        </View>

        {!hasPendingRequest ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.historyButton} 
              onPress={navigateToRequestHistory}
            >
              <Text style={styles.historyButtonText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.requestButton,
                (!selectedFloor || !selectedRoom || !reason.trim() || submitting) && styles.disabledButton,
              ]}
              onPress={confirmRequestChange}
              disabled={!selectedFloor || !selectedRoom || !reason.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.requestButtonText}>Request Change</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.historyButton} 
              onPress={navigateToRequestHistory}
            >
              <Text style={styles.historyButtonText}>Request History</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Request</Text>
            <Text style={styles.modalText}>
              Are you sure you want to request a change to room {selectedRoomName}?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRequestChange}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 100,
  },
  content: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  currentRoomText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  pendingText: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  roomItemContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roomInfoText: {
    fontSize: 16,
    color: '#333',
  },
  loading: {
    marginTop: 20,
  },
  dropdownWrapper: {
    width: '100%',
    marginBottom: 15,
    zIndex: 3000,
  },
  dropdown: {
    width: '100%',
  },
  dropdownContainer: {
    width: '100%',
  },
  reasonInput: {
    width: '100%',
    height: 80,
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyButton: {
    flex: 1,
    padding: 15,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  requestButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#28A745', // Changed to green
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 16, // Matched to requestButtonText
    fontWeight: 'bold',
  },
  requestButtonText: {
    color: 'white',
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
    marginBottom: 10,
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

export default StaffRequest;