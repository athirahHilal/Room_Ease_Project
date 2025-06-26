// app/components/RegisterStaffModal.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, useEffect, View, Text, TextInput, 
//              TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, FlatList, 
//              KeyboardAvoidingView, Platform), @expo/vector-icons (Ionicons), 
//              react-native-dropdown-picker (DropDownPicker), 
//              custom modules (staffService, notificationService)
// Description: 
//              - This RegisterStaffModal is a React Native component serving as a modal interface 
//                for registering new staff members in a mobile application.
//              - Allows input of email prefix, name, phone number, department, and faculty, with 
//                real-time validation and dynamic faculty loading based on department selection.
//              - Features a confirmation modal to verify details before submission.
//              - Integrates with staffService for registration and notificationService to notify 
//                new staff, with refresh callback for parent screen.

// Imports necessary libraries and components for the modal.
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  insertStaffUser,
  fetchDepartment,
  fetchFaculty,
} from '../lib/services/staffService';
import { notifyNewStaffRegistration } from '../lib/services/notificationService';

// Main component handling the register staff modal logic and rendering.
const RegisterStaffModal = ({ visible, onClose, onRefresh }) => {
  // Initializes state variables for form inputs, errors, loading, and dropdowns.
  const [emailPrefix, setEmailPrefix] = useState('');
  const [emailPrefixError, setEmailPrefixError] = useState('');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [openDepartment, setOpenDepartment] = useState(false);
  const [department, setDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [openFaculty, setOpenFaculty] = useState(false);
  const [faculty, setFaculty] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [isNonAcademic, setIsNonAcademic] = useState(false);

  // Fetches departments when the modal becomes visible.
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchDepartment();
        const formattedDepartments = data.map((dept) => ({ label: dept.name, value: dept.id }));
        setDepartments(formattedDepartments);
        console.log('Loaded departments:', formattedDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    if (visible) loadDepartments();
  }, [visible]);

  // Fetches faculties based on selected department, clearing if non-academic.
  useEffect(() => {
    const loadFaculties = async () => {
      if (department && !isNonAcademic) {
        try {
          const facData = await fetchFaculty(department);
          const formattedFaculties =
            facData.length === 1 && facData[0].id === 'no-data'
              ? []
              : facData.map((fac) => ({ label: fac.name, value: fac.id }));
          setFaculties(formattedFaculties);
          console.log('Loaded faculties:', formattedFaculties);
        } catch (error) {
          console.error('Error fetching faculties:', error);
          setFaculties([]);
        }
      } else {
        setFaculties([]);
        console.log('Faculties cleared: department=', department, 'isNonAcademic=', isNonAcademic);
      }
    };

    loadFaculties();
  }, [department, isNonAcademic]);

  // Updates department selection and checks for non-academic status.
  const handleDepartmentChange = (selectedDepartment) => {
    setDepartment(selectedDepartment);
    setFaculty(null);
    const selectedDept = departments.find((dept) => dept.value === selectedDepartment);
    const isNonAcademicSelected = selectedDept?.label.toLowerCase() === 'non-academic';
    setIsNonAcademic(isNonAcademicSelected);
    console.log('Department changed:', selectedDept?.label, 'isNonAcademic:', isNonAcademicSelected);
  };

  // Validates email prefix to ensure it’s not empty or numbers-only.
  const validateEmailPrefix = (input) => {
    if (!input) {
      return 'Email prefix is required.';
    }
    const numberOnlyPattern = /^\d+$/;
    if (numberOnlyPattern.test(input)) {
      return 'Please enter a proper email prefix (e.g., Athirah02, not just numbers).';
    }
    return '';
  };

  // Updates email prefix and validates input.
  const handleEmailPrefixChange = (text) => {
    setEmailPrefix(text);
    const error = validateEmailPrefix(text);
    setEmailPrefixError(error);
  };

  // Validates name to ensure it’s not empty or numbers-only.
  const validateName = (input) => {
    if (!input) {
      return 'Name is required.';
    }
    const numberOnlyPattern = /^\d+$/;
    if (numberOnlyPattern.test(input)) {
      return 'Please enter a proper name (e.g., Athirah, not just numbers).';
    }
    return '';
  };

  // Updates name and validates input.
  const handleNameChange = (text) => {
    setName(text);
    const error = validateName(text);
    setNameError(error);
  };

  // Validates phone number to match 10 or 11-digit formats.
  const validatePhoneNo = (input) => {
    const tenDigitPattern = /^0\d{9}$/;
    const elevenDigitPattern = /^60\d{9}$/;

    if (!input) {
      return 'Phone number is required.';
    }
    if (!tenDigitPattern.test(input) && !elevenDigitPattern.test(input)) {
      return 'Phone number must be 10 digits starting with 0 (e.g., 0123456789) or 11 digits starting with 60 (e.g., 60123456789).';
    }
    return '';
  };

  // Updates phone number and validates input.
  const handlePhoneChange = (text) => {
    setPhoneNo(text);
    const error = validatePhoneNo(text);
    setPhoneError(error);
  };

  // Validates form and opens confirmation modal if valid.
  const handleConfirmSubmit = () => {
    if (!emailPrefix || !name || !phoneNo || !department || (!isNonAcademic && !faculty)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (emailPrefixError || nameError || phoneError) {
      Alert.alert('Error', emailPrefixError || nameError || phoneError);
      return;
    }
    if (isNonAcademic) {
      Alert.alert('Error', 'Cannot register staff with Non-academic department.');
      return;
    }
    setModalVisible(true);
  };

  // Submits staff registration, sends notification, and refreshes parent screen.
  const handleSubmit = async () => {
    setModalVisible(false);
    setLoading(true);
    try {
      const result = await insertStaffUser(emailPrefix, name, department, faculty, phoneNo);
      if (result.success) {
        const departmentName = departments.find((dept) => dept.value === department)?.label || 'N/A';
        const facultyName = faculties.find((fac) => fac.value === faculty)?.label || '';
        const newStaffId = result.record.id;
        console.log('New staff ID from result:', newStaffId);

        if (!newStaffId) {
          console.error('No valid ID found in result.record');
          throw new Error('Failed to get new staff ID');
        }

        await notifyNewStaffRegistration(name, departmentName, facultyName, newStaffId, phoneNo);

        // Close modal and trigger refresh via callback
        onClose();
        resetForm();
        onRefresh();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error registering staff:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resets form fields to initial state.
  const resetForm = () => {
    setEmailPrefix('');
    setEmailPrefixError('');
    setName('');
    setNameError('');
    setPhoneNo('');
    setPhoneError('');
    setDepartment(null);
    setFaculty(null);
    setIsNonAcademic(false);
    setFaculties([]);
  };

  // Determines if submit button should be disabled based on form state.
  const isSubmitDisabled = Boolean(
    !emailPrefix ||
    !name ||
    !phoneNo ||
    emailPrefixError.length > 0 ||
    nameError.length > 0 ||
    phoneError.length > 0 ||
    !department ||
    (!isNonAcademic && !faculty) ||
    loading ||
    isNonAcademic
  );

  // Returns null if modal is not visible to prevent rendering.
  if (!visible) return null;

  // Retrieves display names for department and faculty.
  const departmentName = departments.find((dept) => dept.value === department)?.label || 'N/A';
  const facultyName = faculties.find((fac) => fac.value === faculty)?.label || 'N/A';
  // Constructs full email address for display.
  const fullEmail = emailPrefix.includes('@') ? emailPrefix : `${emailPrefix}@uptm.edu.my`;

  // Renders the form UI with input fields and dropdowns.
  const renderForm = () => (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <Text style={styles.title}>Register New Staff</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, emailPrefixError && styles.inputError]}
        placeholder="Email Prefix (e.g., ali.babu)"
        value={emailPrefix}
        onChangeText={handleEmailPrefixChange}
      />
      {emailPrefixError ? <Text style={styles.errorText}>{emailPrefixError}</Text> : null}

      <TextInput
        style={[styles.input, nameError && styles.inputError]}
        placeholder="Full Name"
        value={name}
        onChangeText={handleNameChange}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

      <TextInput
        style={[styles.input, phoneError && styles.inputError]}
        placeholder="Phone Number (e.g., 0123456789 or 60123456789)"
        value={phoneNo}
        onChangeText={handlePhoneChange}
        keyboardType="phone-pad"
        maxLength={11}
      />
      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

      <DropDownPicker
        open={openDepartment}
        value={department}
        items={departments}
        setOpen={setOpenDepartment}
        setValue={handleDepartmentChange}
        setItems={setDepartments}
        placeholder="Select Department"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={3000}
      />

      <DropDownPicker
        open={openFaculty}
        value={faculty}
        items={faculties}
        setOpen={(open) => {
          if (!department || isNonAcademic) {
            console.log('Faculty dropdown prevented from opening: isNonAcademic=', isNonAcademic);
            return;
          }
          setOpenFaculty(open);
        }}
        setValue={setFaculty}
        setItems={setFaculties}
        placeholder="Select Faculty"
        style={[styles.dropdown, (!department || isNonAcademic) && styles.disabledDropdown]}
        dropDownContainerStyle={styles.dropdownContainer}
        maxHeight={150}
        zIndex={2000}
        disabled={!department || isNonAcademic}
        listMode="SCROLLVIEW"
      />

      <TouchableOpacity
        style={[styles.submitButton, isSubmitDisabled && styles.disabledButton]}
        onPress={handleConfirmSubmit}
        disabled={isSubmitDisabled}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Confirm Register</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Renders the modal UI with form and confirmation modal.
  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <FlatList
          data={[0]}
          renderItem={() => renderForm()}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.flatListContent}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Register</Text>
            <Text style={styles.modalText}>Name: {name}</Text>
            <Text style={styles.modalText}>Phone Number: {phoneNo}</Text>
            <Text style={styles.modalText}>Email: {fullEmail}</Text>
            <Text style={styles.modalText}>Department: {departmentName}</Text>
            <Text style={styles.modalText}>Faculty: {facultyName}</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSubmit}
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  flatListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  sheet: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 15,
    marginTop: -10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  disabledDropdown: {
    opacity: 0.5,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  submitButtonText: {
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

export default RegisterStaffModal;