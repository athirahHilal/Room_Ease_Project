// app/components/EditProfile.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, useEffect, View, Text, TextInput, 
//              TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback), 
//              custom modules (userService)
// Description: 
//              - This EditProfile is a React Native component serving as a modal interface 
//                for editing a user's profile details in a mobile application.
//              - Allows users to update their name and phone number, pre-filled with initial data.
//              - Features animated slide-in/out effects for the modal and overlay.
//              - Integrates with userService to save profile changes and notifies the parent 
//                component upon success.

// Imports necessary libraries and components for the modal.
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import userService from '../lib/services/userService';

// Main component handling the edit profile modal logic and rendering.
const EditProfile = ({ visible, onClose, initialData, onSave }) => {
  // Initializes state variables for profile inputs and animations.
  const [name, setName] = useState(initialData?.name || '');
  const [phoneNo, setPhoneNo] = useState(initialData?.phoneNo || '');
  const overlayOpacity = useState(new Animated.Value(0))[0];
  const sheetAnim = useState(new Animated.Value(-200))[0];

  // Manages animations for modal visibility based on the visible prop.
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Handles saving updated profile data with error handling.
  const handleSave = async () => {
    const updatedData = {
      name,
      phoneNo,
    };
    const result = await userService.editProfile(updatedData);
    if (result.success) {
      onSave(result.data);
      onClose();
    } else {
      console.error('Failed to save profile:', result.error);
      alert('Failed to save profile: ' + result.error);
    }
  };

  // Renders the modal UI with animated overlay, input fields, and action buttons.
  return (
    <>
      {visible && (
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>
      )}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: sheetAnim }],
            opacity: visible ? 1 : 0,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNo}
          onChangeText={setPhoneNo}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
  },
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;