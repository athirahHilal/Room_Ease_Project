// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, StyleSheet, ScrollView)
// Description:
//              - This RejectForm is a React Native component serving as a screen 
//                to display details of a user’s rejected room transfer request in the RoomEase 
//                Portal mobile application.
//              - Retrieves user data from navigation parameters and presents it in a 
//                scrollable view.
//              - Displays fields such as name, phone number, email, faculty, current 
//                room, requested room, and reason for the request.

// Imports necessary libraries for the component.
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Main component handling the reject form screen logic and rendering.
const RejectForm = ({ route }) => {
  // Extracts the selected user’s details from navigation parameters.
  const { user } = route.params; // Get the selected user's details from navigation params

  // Renders the screen UI with a scrollable container for user transfer request details.
  return (
    <View style={styles.container}>
      {/* Scrollable details container */}
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
});

export default RejectForm;