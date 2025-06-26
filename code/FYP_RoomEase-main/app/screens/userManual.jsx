// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, StyleSheet, FlatList, Image), Colors, firstLoginManual
// Description:
//              - This UserManualScreen is a React Native component serving as a screen 
//                to display a role-specific user manual in the RoomEase Portal mobile application.
//              - Retrieves user role from navigation parameters and fetches corresponding 
//                manual data to display steps with images, titles, and descriptions.
//              - Renders a FlatList with a header containing the manual title and introduction.

// Imports necessary libraries for the component.
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Colors } from '../styles/theme';
import { firstLoginManual } from '../lib/manualData';

// Main component handling the user manual screen logic and rendering.
const UserManualScreen = ({ route }) => {
  // Extracts user role from navigation parameters, defaults to undefined if not provided.
  const { userRole } = route.params || {}; // Get userRole from navigation params
  // Fetches manual data based on user role.
  const manual = firstLoginManual(userRole); // Fetch manual based on role

  // Function to render individual manual step.
  const renderManualItem = ({ item }) => (
    <View style={styles.manualItem}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  // Renders the screen UI with a FlatList of manual steps and a header.
  return (
    <FlatList
      data={manual.steps}
      renderItem={renderManualItem}
      keyExtractor={(item) => item.title}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{manual.title}</Text>
          <Text style={styles.headerIntro}>{manual.intro}</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  headerIntro: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  manualItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default UserManualScreen;