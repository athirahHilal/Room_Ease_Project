// app/components/ChangePassword.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, useEffect, View, Text, TextInput, 
//              TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback), 
//              @expo/vector-icons (MaterialIcons), custom modules (userService)
// Description: 
//              - This ChangePassword is a React Native component serving as a modal interface 
//                for changing a user's password in a mobile application.
//              - Allows users to input current password, new password, and confirm new password, 
//                with visibility toggles for each field.
//              - Features animated slide-in/out effects for the modal and overlay.
//              - Validates password match and integrates with userService to update the password.

// Imports necessary libraries and components for the modal.
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import userService from '../lib/services/userService';

// Main component handling the change password modal logic and rendering.
const ChangePassword = ({ visible, onClose, onSave }) => {
  // Initializes state variables for password inputs, visibility toggles, and animations.
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sheetAnim] = useState(new Animated.Value(-300));
  const [overlayOpacity] = useState(new Animated.Value(0));

  // Manages animations for modal visibility based on the visible prop.
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(sheetAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(sheetAnim, { toValue: -300, duration: 300, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Handles password change submission with validation and error handling.
  const handleSave = async () => {
    // Validates that new password matches confirmation.
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }
    const result = await userService.changePassword(currentPassword, newPassword);
    if (result.success) {
      if (onSave) onSave();
      alert('Password changed successfully');
      onClose();
    } else {
      alert('Failed to change password: ' + result.error);
    }
  };

  // Returns null if the modal is not visible to prevent rendering.
  if (!visible) return null;

  // Renders the modal UI with animated overlay, password inputs, and action buttons.
  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Change Password</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowCurrent(!showCurrent)}
          >
            <MaterialIcons
              name={showCurrent ? 'visibility' : 'visibility-off'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNew(!showNew)}
          >
            <MaterialIcons
              name={showNew ? 'visibility' : 'visibility-off'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirm(!showConfirm)}
          >
            <MaterialIcons
              name={showConfirm ? 'visibility' : 'visibility-off'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePassword;