// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, FlatList, StyleSheet, TouchableOpacity), Ionicons, useNavigation, userService
// Description:
//              - This FacultyUserList is a React Native component serving as a screen 
//                to display a list of users associated with a specific faculty in the RoomEase 
//                Portal mobile application.
//              - Retrieves faculty and user data from navigation parameters and fetches the 
//                current user's role to conditionally style users without assigned rooms.
//              - Sorts users to prioritize those without rooms and navigates to a staff profile 
//                on user selection.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import userService from '../lib/services/userService'; // Import userService (adjust path as needed)

// Main component handling the faculty user list screen logic and rendering.
const FacultyUserList = ({ route }) => {
  // Extracts faculty and user data from navigation parameters.
  const { facultyName, facultyDescription, users } = route.params;
  // Hook to access navigation functionality.
  const navigation = useNavigation();
  // State to store the current user's role.
  const [currentUserRole, setCurrentUserRole] = useState(null); // State for user's role

  // Fetch current user's role on component mount
  useEffect(() => {
    // Async function to retrieve user role.
    const fetchUserRole = async () => {
      try {
        // Fetch user profile data from service.
        const userProfileResult = await userService.fetchUserProfile();
        // Check if fetch was successful.
        if (userProfileResult.success) {
          // Update role state.
          setCurrentUserRole(userProfileResult.data.role);
        } else {
          // Log error if fetch fails.
          console.error('Failed to fetch user role:', userProfileResult.error);
        }
      } catch (err) {
        // Log unexpected errors.
        console.error('Error fetching user role:', err);
      }
    };

    // Execute fetch function.
    fetchUserRole();
  }, []);

  // Debug logs for faculty and user data.
  console.log("Faculty Name:", facultyName);
  console.log("Faculty Description:", facultyDescription);
  console.log("Users Data:", users);

  // Sort users: "No Room Assigned" comes first, others follow
  const sortedUsers = [...users].sort((a, b) => {
    // Prioritize users with no room assigned.
    if (a.room === "No Room Assigned" && b.room !== "No Room Assigned") return -1;
    if (a.room !== "No Room Assigned" && b.room === "No Room Assigned") return 1;
    // Maintain original order for other cases.
    return 0; // Maintain original order for other cases
  });

  // Check if the red border should be shown based on the user's role
  const showRedBorder = (item) => {
    // Show red border for users with no room if current user is admin or staff.
    return (
      item.room === "No Room Assigned" &&
      (currentUserRole === 'admin' || currentUserRole === 'staff')
    );
  };

  // Handler for navigating to staff profile on item press.
  const handleItemPress = (userId) => {
    // Navigate to StaffProfile screen with user ID.
    navigation.navigate("StaffProfile", { userId });
  };

  // Renders the screen UI with faculty details and user list.
  return (
    <View style={styles.container}>
      {/* Faculty Name */}
      <Text style={styles.facultyName}>{facultyName}</Text>
      {/* Separator line */}
      <View style={styles.separator} />

      {/* Faculty Description */}
      <Text style={styles.facultyDescription}>{facultyDescription}</Text>

      {/* Users List */}
      <FlatList
        data={sortedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // Touchable item for each user
          <TouchableOpacity
            style={[
              styles.userContainer,
              showRedBorder(item) ? styles.noRoomBorder : null, // Conditionally apply red border
            ]}
            onPress={() => handleItemPress(item.id)}
          >
            {/* User Name and Room */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.roomText}>Room: {item.room}</Text>
            </View>

            {/* Three-dot Icon (for show only) */}
            <View style={styles.iconContainer}>
              <Ionicons name="ellipsis-vertical" size={24} color="#555" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  facultyName: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  separator: {
    height: 2,
    backgroundColor: "#000",
    marginBottom: 10,
  },
  facultyDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  userContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  noRoomBorder: {
    borderWidth: 2,
    borderColor: "red", 
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  roomText: {
    fontSize: 16,
    color: "#555",
  },
  iconContainer: {
    marginLeft: 10,
  },
});

export default FacultyUserList;