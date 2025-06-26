// app/components/AssignRoomModal.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, useEffect, Modal, View, Text, 
//              TouchableOpacity, StyleSheet, ActivityIndicator), 
//              react-native-dropdown-picker (DropDownPicker), 
//              custom modules (roomService)
// Description: 
//              - This AssignRoomModal is a React Native component serving as a modal interface 
//                for assigning a room to a specific user in a mobile application.
//              - Fetches available floors and rooms dynamically using roomService, with sorted 
//                floor display prioritizing 'Ground Floor'.
//              - Features dropdown pickers for floor and room selection, with a confirmation 
//                modal to verify the assignment.
//              - Includes loading states, error handling, and callbacks to notify parent components 
//                of assignment success or failure.

// Imports necessary libraries and components for the modal.
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { FetchAvailableFloor, FetchAvailableRoom, AssignUserRoom } from '../lib/services/roomService';

// Main component handling the assign room modal logic and rendering.
const AssignRoomModal = ({ visible, onClose, userId, userName, onSuccess, onAssignResult }) => {
  // Initializes state variables for floors, rooms, selections, and UI control.
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [floorOpen, setFloorOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetches floors when the modal becomes visible.
  useEffect(() => {
    if (visible) {
      handleFetchFloors();
    }
  }, [visible, userId]);

  // Fetches and formats available floors, sorting them with Ground Floor first.
  const handleFetchFloors = async () => {
    setLoading(true);
    try {
      const { availableFloors } = await FetchAvailableFloor();
      const formattedFloors = availableFloors.map(floor => ({ label: floor.name, value: floor.id }));
      
      formattedFloors.sort((a, b) => {
        if (a.label === 'Ground Floor') return -1;
        if (b.label === 'Ground Floor') return 1;
        const floorA = parseInt(a.label.replace('Floor ', '')) || 0;
        const floorB = parseInt(b.label.replace('Floor ', '')) || 0;
        return floorA - floorB;
      });
      
      setFloors(formattedFloors);
    } catch (error) {
      console.error('Failed to fetch floors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetches available rooms for the selected floor and resets room selection.
  const handleFloorSelect = async (floorId) => {
    setSelectedFloor(floorId);
    setSelectedRoom(null);
    setRooms([]);
    try {
      const availableRooms = await FetchAvailableRoom(floorId);
      setRooms(availableRooms.map(room => ({ label: room.name, value: room.id })));
    } catch (error) {
      console.error('Failed to fetch available rooms:', error);
    }
  };

  // Opens the confirmation modal if a room is selected.
  const handleConfirmAssignRoom = () => {
    if (!selectedRoom) {
      alert('Please select a room.');
      return;
    }
    setConfirmModalVisible(true);
  };

  // Assigns the selected room to the user and notifies the parent component.
  const handleAssignRoom = async () => {
    if (isAssigning) return;
    setIsAssigning(true);
    setConfirmModalVisible(false);
    try {
      await AssignUserRoom(userId, selectedRoom);
      if (onSuccess) onSuccess(userId);
      if (onAssignResult) onAssignResult(true);
      onClose();
    } catch (error) {
      console.error('Error assigning room:', error);
      if (onAssignResult) onAssignResult(false);
    } finally {
      setIsAssigning(false);
    }
  };

  // Determines if the assign button should be disabled based on selections.
  const isAssignDisabled = !selectedFloor || !selectedRoom;
  // Retrieves the name of the selected room for display in the confirmation modal.
  const selectedRoomName = rooms.find(room => room.value === selectedRoom)?.label || 'N/A';

  // Renders the modal UI with dropdowns, loading state, and confirmation modal.
  return (
    <Modal transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalText}>Assign Room to:</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <>
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
                />
              )}
              <TouchableOpacity 
                onPress={handleConfirmAssignRoom} 
                style={[styles.assignButton, isAssignDisabled && styles.disabledButton]}
                disabled={isAssignDisabled}
              >
                <Text style={styles.assignButtonText}>Confirm Assign Room</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Assign Room</Text>
            <Text style={styles.modalText}>
              Assign {userName} to room {selectedRoomName}?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAssignRoom}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  userName: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  dropdown: {
    width: '100%',
    marginBottom: 10,
  },
  dropdownContainer: {
    width: '100%',
  },
  assignButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  assignButtonText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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

export default AssignRoomModal;