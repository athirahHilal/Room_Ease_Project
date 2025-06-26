// app/screens/ProfileScreen.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, useEffect, useCallback, View, StyleSheet, 
//              Image, TouchableOpacity, Text, ScrollView, Dimensions, Alert, RefreshControl), 
//              @expo/vector-icons (MaterialIcons), @react-navigation/native (useNavigation), 
//              custom modules (authService, userService, EditProfile, ChangePassword)
// Description: 
//              - This ProfileScreen is a React Native component serving as the interface 
//                for displaying and managing user profile information in a mobile application.
//              - Fetches and displays user profile data, including avatar, name, email, phone, 
//                and role-specific details (faculty, room) using userService.
//              - Supports profile editing, password changes, and logout functionality.
//              - Includes pull-to-refresh functionality to reload profile data.

// Imports necessary libraries and assets for the component.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import authService from '../lib/services/auth';
import userService from '../lib/services/userService';
import EditProfile from '../components/editProfile';
import ChangePassword from '../components/changePassword';

// Defines constants for layout calculations.
const { width } = Dimensions.get('window');

// Main component handling the profile screen logic and rendering.
const ProfileScreen = () => {
  // Initializes navigation and state variables for profile data and UI control.
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);

  // Fetches user profile data with error handling and loading state.
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const result = await userService.fetchUserProfile();
      if (result.success) {
        setProfile(result.data);
      } else {
        Alert.alert('Error', 'Failed to load profile. Please try again.');
        console.error('Failed to load profile:', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Loads profile data on component mount.
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handles pull-to-refresh functionality to reload profile data.
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await userService.fetchUserProfile();
      if (result.success) {
        setProfile(result.data);
      } else {
        Alert.alert('Error', 'Failed to refresh profile.');
        console.error('Failed to refresh profile:', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during refresh.');
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handles user logout with navigation to the login screen.
  const handleLogout = async () => {
    try {
      const success = await authService.logout();
      if (success) {
        const navRef = navigation.getParent()?.getParent()?.checkAuth;
        if (navRef) await navRef();
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Logout failed. Please try again.');
        console.error('Logout failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during logout.');
      console.error('Logout error:', error);
    }
  };

  // Updates profile state and closes edit modal after saving changes.
  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditVisible(false);
  };

  // Displays success message and closes password change modal.
  const handlePasswordChange = () => {
    Alert.alert('Success', 'Password changed successfully');
    setIsChangePasswordVisible(false);
  };

  // Navigates to the settings screen with error handling.
  const handleSettingsPress = () => {
    try {
      navigation.navigate('SettingsStack', { screen: 'Settings' });
    } catch (error) {
      Alert.alert('Error', 'Failed to navigate to settings.');
      console.error('Navigation error:', error);
    }
  };

  // Renders a loading screen while profile data is being fetched.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Renders an error screen with a retry option if profile data fails to load.
  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Failed to load profile</Text>
        <TouchableOpacity onPress={loadProfile} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Defines default avatar and determines visibility of role-specific fields.
  const defaultAvatar = require('../assets/default.jpg');
  const avatarUrl = profile.avatar ? { uri: profile.avatar } : defaultAvatar;
  const canSeeFacultyAndRoom = profile.role === 'staff';

  // Adjusts font size based on text length for better readability.
  const getFontSize = (text) => {
    if (!text) return 14;
    return text.length > 30 ? 12 : text.length > 20 ? 13 : 14;
  };

  // Renders the main UI with profile details, actions, and modals.
  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={handleSettingsPress}
          style={styles.settingsButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="settings" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.profileSection}>
          <Image source={avatarUrl} style={styles.profileImage} />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <Text style={styles.nameText}>{profile.name || 'N/A'}</Text>

          {/* Profile Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={[styles.infoValue, { fontSize: getFontSize(profile.email) }]}>
                {profile.email || 'N/A'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={[styles.infoValue, { fontSize: getFontSize(profile.phoneNo) }]}>
                {profile.phoneNo || 'N/A'}
              </Text>
            </View>
            {canSeeFacultyAndRoom && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Faculty</Text>
                  <Text
                    style={[styles.infoValue, { fontSize: getFontSize(profile.faculty?.fullName) }]}
                  >
                    {profile.faculty?.fullName || 'N/A'}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Room</Text>
                  <Text style={[styles.infoValue, { fontSize: getFontSize(profile.roomName) }]}>
                    {profile.roomName || 'N/A'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionCard}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => setIsChangePasswordVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>Change Password</Text>
              <MaterialIcons name="lock" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>Log Out</Text>
              <MaterialIcons name="logout" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      {isEditVisible && (
        <EditProfile
          visible={isEditVisible}
          onClose={() => setIsEditVisible(false)}
          initialData={profile}
          onSave={handleSaveProfile}
        />
      )}
      {isChangePasswordVisible && (
        <ChangePassword
          visible={isChangePasswordVisible}
          onClose={() => setIsChangePasswordVisible(false)}
          onSave={handlePasswordChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  profileSection: {
    width: '90%',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  actionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;