// app/screens/StaffTopSheet.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, useEffect, View, Text, TouchableOpacity, 
//              StyleSheet, Alert, Animated, TouchableWithoutFeedback), 
//              react-native-dropdown-picker (DropDownPicker), 
//              @react-navigation/native (useNavigation), custom modules (staffService)
// Description: 
//              - This StaffTopSheet is a React Native component serving as a modal interface 
//                for filtering staff by department and faculty in a mobile application.
//              - Fetches departments and faculties dynamically using staffService, with support 
//                for non-academic departments.
//              - Loads faculty-specific users and navigates to FacultyUserList screen with selected data.
//              - Features animated overlay and form reset on close, with validation to ensure 
//                valid selections.

// Imports necessary libraries and components for the modal.
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { fetchDepartment, fetchFaculty, fetchUserFaculty } from "../lib/services/staffService";

// Main component handling the staff filter modal logic and rendering.
const StaffTopSheet = ({ visible, onClose }) => {
  // Initializes navigation and state variables for dropdowns, users, and UI control.
  const navigation = useNavigation();
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [users, setUsers] = useState([]);
  const [facultyDescription, setFacultyDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [openDept, setOpenDept] = useState(false);
  const [openFaculty, setOpenFaculty] = useState(false);
  const [hasFaculties, setHasFaculties] = useState(true);
  const [isNonAcademic, setIsNonAcademic] = useState(false);

  const overlayOpacity = useState(new Animated.Value(0))[0];

  // Manages modal visibility, loads departments, and animates overlay.
  useEffect(() => {
    if (visible) {
      loadDepartments();
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Fetches departments from the server.
  const loadDepartments = async () => {
    try {
      const data = await fetchDepartment();
      setDepartments(data.map((dept) => ({ label: dept.name, value: dept.id })));
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Handles department selection and fetches corresponding faculties.
  const handleDepartmentChange = async (departmentId) => {
    setSelectedDepartment(departmentId);
    setSelectedFaculty(null);
    setUsers([]);
    setFacultyDescription("");

    const selectedDept = departments.find((dept) => dept.value === departmentId);
    const isNonAcademicSelected = selectedDept?.label.toLowerCase() === "non-academic";
    setIsNonAcademic(isNonAcademicSelected);

    if (!isNonAcademicSelected) {
      try {
        const facData = await fetchFaculty(departmentId);
        if (facData.length === 1 && facData[0].id === "no-data") {
          setHasFaculties(false);
          setFaculties([]);
        } else {
          setHasFaculties(true);
          setFaculties(
            facData.map((fac) => ({
              label: fac.name,
              value: fac.id,
              description: fac.description,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching faculties:", error);
      }
    } else {
      setHasFaculties(false);
      setFaculties([]);
    }
  };

  // Handles faculty selection and fetches associated users.
  const handleFacultyChange = async (facultyId) => {
    setSelectedFaculty(facultyId);
    const selectedFacultyObj = faculties.find((fac) => fac.value === facultyId);
    setFacultyDescription(selectedFacultyObj ? selectedFacultyObj.description : "");

    try {
      const facultyUsers = await fetchUserFaculty(facultyId);
      console.log("Fetched Faculty Users:", facultyUsers);
      setUsers(facultyUsers.users || []);
    } catch (error) {
      console.error("Error fetching faculty users:", error);
      setUsers([]);
    }
  };

  // Resets form state to initial values.
  const resetForm = () => {
    setSelectedDepartment(null);
    setSelectedFaculty(null);
    setFaculties([]);
    setUsers([]);
    setFacultyDescription("");
    setOpenDept(false);
    setOpenFaculty(false);
    setHasFaculties(true);
    setIsNonAcademic(false);
  };

  // Closes the modal and resets the form.
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validates selection and navigates to FacultyUserList with selected data.
  const handleNext = () => {
    // Ensures a faculty is selected before proceeding.
    if (!selectedFaculty) {
      Alert.alert("Selection Required", "Please select a faculty!");
      return;
    }
    // Prevents navigation for non-academic departments.
    if (isNonAcademic) {
      Alert.alert("Invalid Selection", "Cannot proceed with Non-academic department!");
      return;
    }
    const facultyName = faculties.find((fac) => fac.value === selectedFaculty)?.label || "Unknown Faculty";
    console.log("Passing Data to FacultyUserList:", { users, facultyName, facultyDescription });

    navigation.navigate("FacultyUserList", {
      users: users,
      facultyName,
      facultyDescription,
    });

    handleClose();
  };

  // Renders the modal UI with department and faculty dropdowns and action buttons.
  return (
    <>
      {visible && (
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>
      )}

      <View style={[styles.sheet, visible ? styles.visible : styles.hidden]}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>

        <DropDownPicker
          open={openDept}
          value={selectedDepartment}
          items={departments}
          setOpen={setOpenDept}
          setValue={setSelectedDepartment}
          placeholder="Select Department"
          onChangeValue={handleDepartmentChange}
          style={styles.dropdown}
          zIndex={2000}
        />

        {selectedDepartment && hasFaculties && !isNonAcademic && (
          <View style={{ marginTop: openDept ? 100 : 10 }}>
            <DropDownPicker
              open={openFaculty}
              value={selectedFaculty}
              items={faculties}
              setOpen={setOpenFaculty}
              setValue={setSelectedFaculty}
              placeholder="Select Faculty"
              onChangeValue={handleFacultyChange}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              maxHeight={150}
              listMode="SCROLLVIEW"
              zIndex={1000}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.nextButton, (isNonAcademic || !selectedFaculty) && styles.disabledButton]}
          onPress={handleNext}
          disabled={isNonAcademic || !selectedFaculty}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9,
  },
  sheet: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
    zIndex: 10,
  },
  visible: {
    transform: [{ translateY: 0 }],
    opacity: 1,
  },
  hidden: {
    transform: [{ translateY: -200 }],
    opacity: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dropdown: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  nextButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default StaffTopSheet;