// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl), fetchDepartmentUser, TopSheet, RegisterStaffModal, Ionicons, useNavigation, useFocusEffect, userService
// Description:
//              - This StaffScreen is a React Native component serving as a screen 
//                to display a list of staff members with search and filter capabilities 
//                in the RoomEase Portal mobile application.
//              - Fetches department users and user role, sorting users with no room 
//                assigned at the top, and supports refreshing and admin-specific actions.
//              - Includes modals for filtering and registering new staff, with role-based 
//                UI visibility.

// Imports necessary libraries for the component.
import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { fetchDepartmentUser } from '../lib/services/staffService';
import TopSheet from '../components/staffTopSheet';
import RegisterStaffModal from '../components/registerStaffModal';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import userService from '../lib/services/userService';

// Main component handling the staff screen logic and rendering.
const StaffScreen = () => {
  // State to store list of users.
  const [users, setUsers] = useState([]);
  // State to store filtered users for display.
  const [filteredUsers, setFilteredUsers] = useState([]);
  // State for search query input.
  const [searchQuery, setSearchQuery] = useState('');
  // State to manage loading indicator.
  const [loading, setLoading] = useState(true);
  // State to handle error messages.
  const [error, setError] = useState(null);
  // State to control filter sheet visibility.
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  // State to control register staff modal visibility.
  const [isRegisterSheetVisible, setIsRegisterSheetVisible] = useState(false);
  // State to store current user’s role.
  const [currentUserRole, setCurrentUserRole] = useState(null);
  // State to manage refresh control.
  const [refreshing, setRefreshing] = useState(false);

  // Hook to access navigation functionality.
  const navigation = useNavigation();

  // Function to fetch department users and user role.
  const fetchData = async () => {
    // Show loading indicator.
    setLoading(true);
    try {
      // Fetch department users.
      const departmentUsers = await fetchDepartmentUser();
      // Sort users: "No Room Assigned" first, then alphabetically by name.
      departmentUsers.sort((a, b) => {
        if (a.room === "No Room Assigned" && b.room !== "No Room Assigned") return -1;
        if (a.room !== "No Room Assigned" && b.room === "No Room Assigned") return 1;
        return a.name.localeCompare(b.name);
      });
      // Update users state.
      setUsers(departmentUsers);
      // Update filtered users state.
      setFilteredUsers(departmentUsers);

      // Fetch user profile.
      const userProfileResult = await userService.fetchUserProfile();
      // Check if profile fetch was successful.
      if (userProfileResult.success) {
        // Update user role state.
        setCurrentUserRole(userProfileResult.data.role);
      } else {
        // Log error if profile fetch fails.
        console.error('Failed to fetch user role:', userProfileResult.error);
        // Set error message for display.
        setError('Failed to load user role.');
      }
    } catch (err) {
      // Set error message for display.
      setError('Failed to load users. Please try again later.');
      // Log error for debugging.
      console.error(err);
    } finally {
      // Hide loading indicator.
      setLoading(false);
    }
  };

  // Effect to fetch data when screen gains focus.
  useFocusEffect(
    React.useCallback(() => {
      // Execute fetch function.
      fetchData();
    }, [])
  );

  // Function to handle pull-to-refresh.
  const onRefresh = async () => {
    // Start refreshing.
    setRefreshing(true);
    // Clear previous errors.
    setError(null); // Clear any previous errors
    // Fetch updated data.
    await fetchData();
    // Stop refreshing.
    setRefreshing(false);
  };

  // Function to filter users based on search query.
  const searchUsers = (query) => {
    // Update search query state.
    setSearchQuery(query);
    // Filter users by name or room.
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.room.toLowerCase().includes(query.toLowerCase())
    );
    // Sort filtered users: "No Room Assigned" first, then alphabetically.
    filtered.sort((a, b) => {
      if (a.room === "No Room Assigned" && b.room !== "No Room Assigned") return -1;
      if (a.room !== "No Room Assigned" && b.room === "No Room Assigned") return 1;
      return a.name.localeCompare(b.name);
    });
    // Update filtered users state.
    setFilteredUsers(filtered);
  };

  // Function to determine if red border should be shown.
  const showRedBorder = (item) => {
    // Show red border for users with no room if user is admin or staff.
    return (
      item.room === "No Room Assigned" &&
      (currentUserRole === 'admin' || currentUserRole === 'staff')
    );
  };

  // Function to handle user item press.
  const handleItemPress = (userId) => {
    // Navigate to StaffProfile screen with user ID.
    navigation.navigate('StaffProfile', { userId });
  };

  // Renders the screen UI with search bar, user list, and role-specific features.
  return (
    <View style={styles.container}>
      {/* Search Bar with Filter Icon */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBox}
          placeholder="Search staff..."
          value={searchQuery}
          onChangeText={searchUsers}
        />
        <TouchableOpacity onPress={() => setIsSheetVisible(true)} style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        // Display loading indicator
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        // Display error message
        <Text style={styles.error}>{error}</Text>
      ) : (
        // Display filtered user list
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            // Touchable item for each user
            <TouchableOpacity
              style={[
                styles.item,
                showRedBorder(item) && styles.noRoomItem,
              ]}
              onPress={() => handleItemPress(item.id)}
            >
              <View style={styles.userInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.room}>Room: {item.room}</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="ellipsis-vertical" size={24} color="#000" />
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0000ff']} // Customize the refresh indicator color
            />
          }
        />
      )}

      {/* Existing TopSheet */}
      <TopSheet visible={isSheetVisible} onClose={() => setIsSheetVisible(false)} />

      {/* Bottom Buttons Container - Only show Register button for admins */}
      {currentUserRole === 'admin' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.registerButton]}
            onPress={() => setIsRegisterSheetVisible(true)}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Register Staff Modal with onRefresh callback */}
      <RegisterStaffModal
        visible={isRegisterSheetVisible}
        onClose={() => setIsRegisterSheetVisible(false)}
        onRefresh={fetchData} // Pass fetchData as the refresh callback
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    padding: 10,
  },
  filterButton: {
    padding: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  item: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noRoomItem: {
    borderWidth: 2,
    borderColor: 'red',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  room: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StaffScreen;