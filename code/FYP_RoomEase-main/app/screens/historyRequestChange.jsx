// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar), Colors, fetchRequestHistory, userService
// Description:
//              - This HistoryRequestChange is a React Native component serving as a screen 
//                to display a user’s room change request history in the RoomEase Portal 
//                mobile application.
//              - Fetches user profile and request history data, rendering them in a FlatList 
//                with status indicators and handles loading and error states.
//              - Displays details like current room, requested room, reason, and status for 
//                each request.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Colors } from '../styles/theme';
import { fetchRequestHistory } from '../lib/services/transferService'; 
import userService from '../lib/services/userService';

// Main component handling the history request change screen logic and rendering.
const HistoryRequestChange = ({ navigation }) => {
  // State to store user’s request history.
  const [userHistory, setUserHistory] = useState([]);
  // State to manage loading indicator.
  const [loading, setLoading] = useState(true);
  // State to store current user’s profile.
  const [currentUser, setCurrentUser] = useState(null);
  // State to handle error messages.
  const [errorMessage, setErrorMessage] = useState(null);

  // Effect to fetch user profile and request history on component mount.
  useEffect(() => {
    // Async function to retrieve user and history data.
    const fetchUserAndHistory = async () => {
      try {
        // Fetch user profile
        const userResult = await userService.fetchUserProfile();
        // Check if user profile fetch was successful.
        if (!userResult.success) {
          // Log error if profile fetch fails.
          console.error('Failed to fetch user profile:', userResult.error);
          // Set error message for display.
          setErrorMessage('Unable to load user profile.');
          // Stop loading indicator.
          setLoading(false);
          return;
        }
        // Update current user state.
        setCurrentUser(userResult.data);

        // Fetch history
        const historyResult = await fetchRequestHistory(userResult.data.id);
        // Check if history fetch was successful.
        if (historyResult.success) {
          // Update history state with fetched data.
          setUserHistory(historyResult.data);
        } else {
          // Log error if history fetch fails.
          console.error('Failed to fetch history:', historyResult.error);
          // Set error message for display.
          setErrorMessage(historyResult.error);
          // Clear history data.
          setUserHistory([]);
        }
      } catch (error) {
        // Log unexpected errors.
        console.error('Unexpected error fetching user or history:', error);
        // Set error message for display.
        setErrorMessage('An unexpected error occurred.');
        // Clear history data.
        setUserHistory([]);
      } finally {
        // Hide loading indicator.
        setLoading(false);
      }
    };

    // Execute fetch function.
    fetchUserAndHistory();
  }, []);

  // Function to determine status badge color based on request status.
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFB300'; // Amber
      case 'approved':
        return '#388E3C'; // Dark Green
      case 'rejected':
        return '#D32F2F'; // Dark Red
      default:
        return '#757575'; // Gray
    }
  };

  // Renders individual history item with request details.
  const renderHistoryItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{item.created}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.label}>
          Current Room: <Text style={styles.value}>{item.currentRoom === 'N/A' ? 'No Room Assigned' : item.currentRoom}</Text>
        </Text>
        <Text style={styles.label}>
          Requested Room: <Text style={styles.value}>{item.requestedRoom}</Text>
        </Text>
        <Text style={styles.reason}>Reason: {item.reason}</Text>
      </View>
    </View>
  );

  // Conditional rendering for loading state.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Renders the screen UI with history list or error/empty messages.
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {errorMessage ? (
        // Display error message if fetch fails
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : userHistory.length === 0 ? (
        // Display message if no history found
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No room change requests found.</Text>
        </View>
      ) : (
        // Display history list
        <FlatList
          data={userHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  label: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontWeight: '400',
    color: '#424242',
  },
  reason: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default HistoryRequestChange;