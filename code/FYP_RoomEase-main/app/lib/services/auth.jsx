// app/lib/services/auth.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: @react-native-async-storage/async-storage (AsyncStorage), 
//              custom modules (pocketbase)
// Description: 
//              - This module provides authentication services for the RoomEase Portal 
//                mobile application using PocketBase.
//              - Handles user login, logout, and retrieval of current user data.
//              - Includes role-based access control checks for admin, staff, and student roles.
//              - Uses AsyncStorage to persist authentication data locally.

// Imports necessary libraries and modules.
import AsyncStorage from '@react-native-async-storage/async-storage';
import pb from '../pocketbase';

// Defines the authentication service object with related methods.
const authService = {
  // Authenticates a user with email and password, storing auth data.
  async login(email, password) {
    try {
      // Validates that email and password are provided.
      if (!email || !password) {
        return {
          success: false,
          error: 'Please enter both email and password'
        };
      }

      // Validates email format using a regular expression.
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        };
      }

      // Clears any existing authentication data.
      pb.authStore.clear();

      // Attempts to authenticate with PocketBase using provided credentials.
      const authData = await pb.collection('users').authWithPassword(email, password);

      // Retrieves user role ID from authentication data.
      const userRoleId = authData.record.roleID;

      // Fetches role details from the lookup collection.
      const roleData = await pb.collection('lookup').getOne(userRoleId);
      const roleName = roleData.name;

      // Checks if this is the user's first login.
      const isFirstLogin = authData.record.isFirstLogin;

      // Prepares authentication data for storage.
      const authStorage = {
        token: pb.authStore.token,
        model: pb.authStore.model,
        role: roleName
      };

      // Stores authentication data in AsyncStorage.
      await AsyncStorage.setItem('pb_auth', JSON.stringify(authStorage));

      // Returns successful login response with user details.
      return {
        success: true,
        user: {
          id: authData.record.id,
          name: authData.record.name,
          email: authData.record.email,
          role: roleName,
          isFirstLogin: isFirstLogin
        }
      };
    } catch (error) {
      // Handles specific error cases for invalid credentials or network issues.
      if (error.status === 400) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      } else if (error.status === 0) {
        return {
          success: false,
          error: 'Network error. Please check your connection'
        };
      } else {
        return {
          success: false,
          error: 'An unexpected error occurred. Please try again later'
        };
      }
    }
  },

  // Logs out the user by clearing auth data and storage.
  async logout() {
    try {
      // Clears PocketBase auth store.
      pb.authStore.clear();
      // Removes authentication data from AsyncStorage.
      await AsyncStorage.removeItem('pb_auth');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  },

  // Retrieves the current authenticated user’s data from storage.
  async getCurrentUser() {
    try {
      // Fetches stored authentication data.
      const storedAuth = await AsyncStorage.getItem('pb_auth');
      if (!storedAuth) return null;

      // Parses stored authentication data.
      const { token, model, role } = JSON.parse(storedAuth);
      // Restores auth state in PocketBase.
      pb.authStore.save(token, model);

      // Returns user details if authentication is valid.
      if (pb.authStore.isValid) {
        return {
          id: model.id,
          name: model.name,
          email: model.email,
          role: role
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving current user:', error);
      return null;
    }
  },

  // Checks if the user has a specific role.
  hasRole(user, roleName) {
    return user && user.role.toLowerCase() === roleName.toLowerCase();
  },

  // Checks if the user is an admin.
  isAdmin(user) {
    return this.hasRole(user, 'admin');
  },

  // Checks if the user is a staff member.
  isStaff(user) {
    return this.hasRole(user, 'staff');
  },

  // Checks if the user is a student.
  isStudent(user) {
    return this.hasRole(user, 'student');
  }
};

// Exports the authentication service as the default export.
export default authService;