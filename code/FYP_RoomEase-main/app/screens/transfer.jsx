// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform), useNavigation, DropDownPicker, FetchAvailableFloor, FetchAvailableRoom, transferStaff, pb
// Description:
//              - This Transfer is a React Native component serving as a screen 
//                for initiating a staff room transfer in the RoomEase Portal mobile application.
//              - Fetches available floors and rooms, allowing selection of a new room 
//                with an optional reason for the transfer.
//              - Submits the transfer request and navigates back to the staff profile 
//                upon completion.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { FetchAvailableFloor, FetchAvailableRoom } from '../lib/services/roomService';
import { transferStaff } from '../lib/services/transferService';
import pb from '../lib/pocketbase';

// Main component handling the transfer screen logic and rendering.
const Transfer = ({ route }) => {
  // Extracts user ID, name, and current room from navigation parameters.
  const { userId, userName, currentRoom } = route.params;
  // State to store list of floors.
  const [floors, setFloors] = useState([]);
  // State to store list of rooms.
  const [rooms, setRooms] = useState([]);
  // State to manage loading indicator.
  const [loading, setLoading] = useState(true);
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
  // Hook to access navigation functionality.
  const navigation = useNavigation();

  // Effect to fetch floors on component mount.
  useEffect(() => {
    // Execute fetch floors function.
    handleFetchFloors();
  }, []);

  // Function to fetch available floors.
  const handleFetchFloors = async () => {
    // Show loading indicator.
    setLoading(true);
    try {
      // Fetch available floors.
      const { availableFloors } = await FetchAvailableFloor();
      // Log floors for debugging.
      console.log('Available Floors:', availableFloors);
      // Format floors for dropdown.
      const formattedFloors = availableFloors.map(floor => ({ label: floor.name, value: floor.id }));
      // Update floors state.
      setFloors(formattedFloors);
    } catch (error) {
      // Log error for debugging.
      console.error('Failed to fetch floors:', error);
    } finally {
      // Hide loading indicator.
      setLoading(false);
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
      // Log rooms for debugging.
      console.log('Available Rooms from Fetch:', availableRooms);
      // Filter out current room.
      const filteredRooms = availableRooms.filter(room => room.name !== currentRoom);
      // Log filtered rooms for debugging.
      console.log('Filtered Rooms:', filteredRooms);
      // Format rooms for dropdown.
      const mappedRooms = filteredRooms.map(room => ({ label: room.name, value: room.id }));
      // Log mapped rooms for debugging.
      console.log('Mapped Rooms set to state:', mappedRooms);
      // Update rooms state.
      setRooms(mappedRooms);
    } catch (error) {
      // Log error for debugging.
      console.error('Failed to fetch available rooms:', error);
    }
  };

  // Function to handle transfer submission.
  const handleTransfer = async () => {
    // Log user ID for debugging.
    console.log('User ID from params:', userId);
    // Log selected room ID for debugging.
    console.log('Selected Room ID:', selectedRoom);
    // Check if a room is selected.
    if (!selectedRoom) {
      return;
    }

    // Show loading indicator.
    setLoading(true);
    try {
      // Submit transfer request.
      await transferStaff(userId, selectedRoom, reason);
      // Navigate to StaffProfile with refresh flag.
      navigation.navigate('StaffProfile', { userId, refresh: true });
    } catch (error) {
      // Log error for debugging.
      console.error('Error in transfer process:', error);
    } finally {
      // Hide loading indicator.
      setLoading(false);
    }
  };

  // Conditional rendering for loading state.
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  // Renders the screen UI with floor/room selection and transfer form.
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Transfer</Text>
        <Text style={styles.title}>{userName}</Text>
        <Text style={styles.subtitle}>Current Room: {currentRoom}</Text>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Select New Room</Text>
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
            zIndex={floorOpen ? 3000 : 1}
            dropDownDirection="BOTTOM"
            maxHeight={150} // Constrain dropdown height
          />
          {selectedFloor && (
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
              zIndex={roomOpen ? 2000 : 1}
              dropDownDirection="BOTTOM"
              maxHeight={150} // Constrain dropdown height
            />
          )}
          <Text style={styles.sectionTitle}>Reason (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the reason for transfer (optional)"
            value={reason}
            onChangeText={setReason}
            multiline
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.transferButton, !selectedRoom && styles.disabledButton]}
          onPress={handleTransfer}
          disabled={!selectedRoom || loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Confirm Transfer'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  contentContainer: {
    flex: 1,
    padding: 16
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  dropdown: {
    width: '100%',
    marginBottom: 10
  },
  dropdownContainer: {
    width: '100%'
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center'
  },
  transferButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loading: {
    flex: 1,
    justifyContent: 'center'
  }
});

export default Transfer;