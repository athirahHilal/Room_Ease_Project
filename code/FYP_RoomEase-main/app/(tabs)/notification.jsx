// app/screens/NotificationScreen.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, useEffect, View, Text, StyleSheet, 
//              FlatList, ActivityIndicator, RefreshControl), 
//              custom modules (notificationService, pocketbase)
// Description: 
//              - This NotificationScreen is a React Native component serving as the interface 
//                for displaying user notifications in a mobile application.
//              - Fetches and displays notifications for the authenticated user using PocketBase.
//              - Supports pull-to-refresh functionality to update the notification list.
//              - Handles loading states, errors, and empty notification scenarios.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { fetchNotifications } from '../lib/services/notificationService';
import pb from '../lib/pocketbase';

// Main component handling the notification screen logic and rendering.
const NotificationScreen = () => {
  // Initializes state variables for notifications, loading, error, and refresh control.
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetches notifications for the authenticated user.
  const fetchUserNotifications = async () => {
    // Checks if the user is authenticated before fetching notifications.
    if (!pb.authStore.isValid || !pb.authStore.record) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const userId = pb.authStore.record.id;
    try {
      const fetchedNotifications = await fetchNotifications(userId);
      setNotifications(fetchedNotifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetches notifications on component mount.
  useEffect(() => {
    fetchUserNotifications();
  }, []);

  // Handles pull-to-refresh functionality to update notifications.
  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchUserNotifications();
    setRefreshing(false);
  };

  // Renders individual notification items in the FlatList.
  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>{item.message}</Text>
      <Text style={styles.notificationDate}>
        {new Date(item.created).toLocaleString()}
      </Text>
    </View>
  );

  // Renders a loading indicator while fetching notifications.
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  // Renders an error message if fetching notifications fails.
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Renders the main UI with a FlatList of notifications or a message if none exist.
  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications available</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0000ff']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    paddingBottom: 16,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  noNotifications: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotificationScreen;