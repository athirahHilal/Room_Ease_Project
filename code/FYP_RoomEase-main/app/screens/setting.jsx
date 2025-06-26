// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, Text, StyleSheet, TouchableOpacity, FlatList, View), Colors, Ionicons, userService, authService
// Description:
//              - This SettingsScreen is a React Native component serving as a screen 
//                to display a list of settings options in the RoomEase Portal mobile application.
//              - Fetches user role to filter options and provides navigation to FAQ, User Manual, 
//                About, and logout functionality.
//              - Filters options based on user role to restrict staff-only features.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, FlatList, View } from 'react-native';
import { Colors } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import userService from '../lib/services/userService';
import authService from '../lib/services/auth';

// Main component handling the settings screen logic and rendering.
const SettingsScreen = ({ navigation }) => { 
  // State to store user’s role.
  const [userRole, setUserRole] = useState(null);
  // State to manage loading indicator.
  const [loading, setLoading] = useState(true);

  // Effect to fetch user role on component mount.
  useEffect(() => {
    // Async function to retrieve user profile data.
    const fetchUserData = async () => {
      try {
        // Fetch user profile from service.
        const result = await userService.fetchUserProfile();
        // Check if fetch was successful.
        if (result.success) {
          // Update user role state.
          setUserRole(result.data.role);
        }
      } catch (error) {
        // Log error for debugging.
        console.error('Error fetching user role:', error);
      } finally {
        // Hide loading indicator.
        setLoading(false);
      }
    };
    // Execute fetch function.
    fetchUserData();
  }, []);

  // Array of settings options with navigation handlers.
  const settingsOptions = [
    { 
      id: '1', 
      title: 'FAQ', 
      icon: 'help-circle-outline', 
      onPress: () => navigation.navigate('FAQ'),
      staffOnly: true 
    },
    { 
      id: '2', 
      title: 'User Manual', 
      icon: 'book-outline', 
      onPress: () => navigation.navigate('UserManual', { userRole })
    },
    { 
      id: '3', 
      title: 'About', 
      icon: 'information-circle-outline', 
      onPress: () => navigation.navigate('About') // Updated to navigate to About
    },
    { 
      id: '4', 
      title: 'Log Out', 
      icon: 'log-out-outline', 
      onPress: () => authService.logout().then(() => navigation.navigate('Login'))
    },
  ];

  // Filter options to show staff-only items to staff/admin only.
  const filteredOptions = settingsOptions.filter(
    (option) => !option.staffOnly || userRole === 'staff' || userRole === 'admin'
  );

  // Function to render individual settings option.
  const renderOption = ({ item }) => (
    <TouchableOpacity style={styles.option} onPress={item.onPress}>
      <Ionicons name={item.icon} size={24} color={Colors.primary} style={styles.icon} />
      <Text style={styles.optionText}>{item.title}</Text>
      <Ionicons 
        name="ellipsis-vertical" 
        size={24} 
        color="#666" 
        style={styles.kebabIcon}
      />
    </TouchableOpacity>
  );

  // Conditional rendering for loading state.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Renders the screen UI with a list of settings options.
  return (
    <FlatList
      data={filteredOptions}
      renderItem={renderOption}
      keyExtractor={(item) => item.id}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  kebabIcon: {
    marginLeft: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingsScreen;