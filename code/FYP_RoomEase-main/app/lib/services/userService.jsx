// app/lib/services/userService.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: custom modules (pocketbase, auth, notificationService)
// Description: 
//              - This module provides user-related services for the RoomEase Portal 
//                mobile application using PocketBase.
//              - Includes functions to fetch and edit user profiles, submit staff room 
//                change requests, check for pending requests, and change user passwords.
//              - Integrates with authService for user authentication and notificationService 
//                for staff request notifications.

// Imports necessary modules.
import pb from '../pocketbase';
import authService from './auth';
import { notifyStaffRequest } from './notificationService';

// Defines the user service object with related methods.
const userService = {
  // Fetches the authenticated user’s profile with expanded role and faculty details.
  async fetchUserProfile() {
    try {
      // Verifies that a user is authenticated.
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Fetches the user record with expanded role and faculty fields.
      const userRecord = await pb.collection('users').getOne(currentUser.id, {
        expand: 'roleID,facultyID',
      });

      // Initializes room name with fallback.
      let roomName = 'N/A';
      if (userRecord.roomID && userRecord.roomID !== 'N/A') {
        try {
          // Fetches room details with parent floor information.
          const roomRecord = await pb.collection('lookup').getOne(userRecord.roomID, {
            expand: 'parent',
          });
          const parentName = roomRecord.expand?.parent?.name || '';
          roomName = parentName ? `${parentName}, ${roomRecord.name}` : roomRecord.name;
        } catch (error) {
          console.warn(`No matching room found in lookup for roomID: ${userRecord.roomID}`, error);
          roomName = userRecord.roomID;
        }
      }

      // Constructs the user profile object.
      const userProfile = {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        phoneNo: userRecord.phoneNo,
        roomID: userRecord.roomID,
        roomName: roomName,
        role: userRecord.expand?.roleID?.name || 'Unknown',
        faculty: null,
        avatar: userRecord.avatar 
          ? pb.files.getURL(userRecord, userRecord.avatar)
          : null,
        isFirstLogin: userRecord.isFirstLogin,
      };

      // Handles faculty information if available.
      if (userRecord.facultyID) {
        const facultyRecord = userRecord.expand?.facultyID;
        if (facultyRecord) {
          userProfile.faculty = {
            id: facultyRecord.id,
            name: facultyRecord.name,
            fullName: facultyRecord.description || facultyRecord.name,
          };
        } else {
          console.warn(`Faculty ID ${userRecord.facultyID} not found in expand data`);
          userProfile.faculty = { id: userRecord.facultyID, name: 'Unknown', fullName: 'Unknown' };
        }
      } else {
        userProfile.faculty = { id: null, name: 'N/A', fullName: 'Not Applicable' };
      }

      // Returns successful profile fetch response.
      return {
        success: true,
        data: userProfile,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch user profile',
      };
    }
  },

  // Updates the authenticated user’s profile with provided data.
  async editProfile(updatedData) {
    try {
      // Verifies that a user is authenticated.
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Prepares data for update, including only provided fields.
      const dataToUpdate = {};
      if (updatedData.name !== undefined) dataToUpdate.name = updatedData.name;
      if (updatedData.phoneNo !== undefined) dataToUpdate.phoneNo = updatedData.phoneNo;
      if (updatedData.avatar) {
        dataToUpdate.avatar = updatedData.avatar;
      }

      console.log('Updating user with data:', dataToUpdate);
      // Updates the user record in PocketBase.
      await pb.collection('users').update(currentUser.id, dataToUpdate);
      // Fetches the updated profile to return complete data.
      const updatedProfile = await userService.fetchUserProfile();
      return updatedProfile;
    } catch (error) {
      console.error('Error editing user profile:', error);
      if (error.response) console.error('Error details:', error.response.data);
      return {
        success: false,
        error: error.message || 'Failed to update record',
      };
    }
  },

  // Submits a staff room change request.
  async staffRequest(transferRoomID, currentRoomID, reason) {
    try {
      // Verifies that a user is authenticated.
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('No authenticated user found');
      }

      // Prepares transfer request data.
      const data = {
        transferRoomID,
        status: 'pending',
        reason,
        requestBy: currentUser.id,
        processedBy: null,
        currentRoomID,
      };
      console.log('Submitting staff request data:', data);
      // Creates a new transfer request record.
      const record = await pb.collection('transferRoom').create(data);

      // Sends a notification for the staff request.
      await notifyStaffRequest(currentUser.name, transferRoomID, currentRoomID);
      
      return { success: true, data: record };
    } catch (error) {
      console.error('Error creating staff request:', error);
      return { success: false, error: error.message };
    }
  },

  // Checks if the authenticated user has a pending room transfer request.
  async hasPendingRequest() {
    try {
      // Verifies that a user is authenticated.
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('No authenticated user found');
      }

      // Checks for pending transfer requests by the user.
      const records = await pb.collection('transferRoom').getList(1, 1, {
        filter: `requestBy = "${currentUser.id}" && status = "pending"`,
      });
      return records.totalItems > 0;
    } catch (error) {
      console.error('Error checking pending requests:', error);
      return false;
    }
  },

  // Changes the authenticated user’s password.
  async changePassword(currentPassword, newPassword) {
    try {
      // Verifies that a user is authenticated.
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('No authenticated user found');
      
      // Validates password inputs.
      if (!currentPassword || !newPassword) {
        throw new Error('Both current and new passwords are required');
      }
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      // Verifies current password.
      await pb.collection('users').authWithPassword(currentUser.email, currentPassword);
      // Updates the user’s password.
      const updatedRecord = await pb.collection('users').update(currentUser.id, {
        oldPassword: currentPassword,
        password: newPassword,
        passwordConfirm: newPassword,
      });
      console.log('Password updated:', updatedRecord);
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.data) console.error('Error details:', error.data);
      return { success: false, error: error.message || 'Failed to change password' };
    }
  },
};

// Exports the user service as the default export.
export default userService;