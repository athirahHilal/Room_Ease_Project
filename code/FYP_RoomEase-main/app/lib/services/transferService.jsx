// app/lib/services/transferService.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: custom modules (pocketbase, auth, notificationService)
// Description: 
//              - This module provides transfer-related services for the RoomEase Portal 
//                mobile application using PocketBase.
//              - Includes functions to approve or reject room transfer requests, fetch 
//                transfer requests by status, transfer staff to new rooms, and retrieve 
//                a user’s transfer request history.
//              - Integrates with notificationService for sending transfer-related notifications.

// Imports necessary modules.
import pb from '../pocketbase';
import authService from './auth';
import { notificationTransfer, notifyTransferRequestOutcome } from './notificationService'; 

// Approves a room transfer request and updates user and transfer records.
export async function requestApprove(recordId) {
  try {
    console.log('Approving transfer request...');
    // Fetches the current authenticated user.
    const currentUser = await authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('No authenticated admin found');
    }

    // Fetches the transfer record by ID.
    const transferRecord = await pb.collection('transferRoom').getOne(recordId);
    const { transferRoomID, requestBy, currentRoomID } = transferRecord;

    // Updates the user’s room assignment.
    await pb.collection('users').update(requestBy, {
      roomID: transferRoomID,
    });
    console.log(`Updated user ${requestBy} roomID to ${transferRoomID}`);

    // Updates the transfer record with approved status and processor.
    const updatedRecord = await pb.collection('transferRoom').update(recordId, {
      status: 'approved',
      processedBy: currentUser.id,
    });
    console.log('Transfer request approved:', updatedRecord);

    // Notifies the staff member of the approval.
    const staffName = (await pb.collection('users').getOne(requestBy)).name;
    await notifyTransferRequestOutcome(requestBy, transferRoomID, currentRoomID, 'approved', staffName);

    return updatedRecord;
  } catch (error) {
    console.error('Error approving transfer request:', error);
    console.error('Full error details:', error.data);
    throw error;
  }
}

// Rejects a room transfer request and updates the transfer record.
export async function requestReject(recordId) {
  try {
    console.log('Rejecting transfer request...');
    // Fetches the current authenticated user.
    const currentUser = await authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('No authenticated admin found');
    }

    // Fetches the transfer record by ID.
    const transferRecord = await pb.collection('transferRoom').getOne(recordId);
    const { transferRoomID, requestBy, currentRoomID } = transferRecord;

    // Updates the transfer record with rejected status and processor.
    const updatedRecord = await pb.collection('transferRoom').update(recordId, {
      status: 'rejected',
      processedBy: currentUser.id,
    });
    console.log('Transfer request rejected:', updatedRecord);

    // Notifies the staff member of the rejection.
    const staffName = (await pb.collection('users').getOne(requestBy)).name;
    await notifyTransferRequestOutcome(requestBy, transferRoomID, currentRoomID, 'rejected', staffName);

    return updatedRecord;
  } catch (error) {
    console.error('Error rejecting transfer request:', error);
    console.error('Full error details:', error.data);
    throw error;
  }
}

// Fetches transfer requests filtered by status.
export async function fetchStatus(status) {
  let transferRecords = [];
  let result = [];
  try {
    console.log(`Fetching transfer records with status "${status}"...`);
    // Fetches transfer records with the specified status.
    transferRecords = await pb.collection('transferRoom').getFullList({
      filter: `status = "${status}"`,
    });
    console.log('Transfer records:', transferRecords);

    // Returns empty array if no records are found.
    if (transferRecords.length === 0) {
      console.log(`No ${status} transfer requests found.`);
      return [];
    }

    // Collects user IDs from transfer records.
    const userIds = transferRecords.map((record) => record.requestBy);
    console.log('User IDs:', userIds);

    console.log('Fetching user details...');
    // Fetches user details for the collected IDs.
    const users = await pb.collection('users').getFullList({
      filter: userIds.map((id) => `id = "${id}"`).join(' || '),
    });
    console.log('Users:', users);

    // Returns empty array if no users are found.
    if (users.length === 0) {
      console.log('No users found for the given IDs.');
      return [];
    }

    // Fetches faculty details for users.
    const facultyIds = users.map((user) => user.facultyID);
    const faculties = await pb.collection('lookup').getFullList({
      filter: facultyIds.map((id) => `id = "${id}"`).join(' || '),
    });
    console.log('Faculties:', faculties);

    // Fetches room details for current and requested rooms.
    const roomIds = [
      ...transferRecords.map((record) => record.currentRoomID),
      ...transferRecords.map((record) => record.transferRoomID),
    ];
    const rooms = await pb.collection('lookup').getFullList({
      filter: roomIds.map((id) => `id = "${id}"`).join(' || '),
    });
    console.log('Rooms:', rooms);

    // Maps transfer records to formatted result with user, faculty, and room details.
    result = transferRecords.map((record) => {
      const user = users.find((u) => u.id === record.requestBy);
      const faculty = user ? faculties.find((f) => f.id === user.facultyID) : null;
      const currentRoom = rooms.find((r) => r.id === record.currentRoomID);
      const reqRoom = rooms.find((r) => r.id === record.transferRoomID);

      return {
        id: record.id,
        name: user ? user.name : 'Unknown',
        phoneNo: user?.phoneNo || 'No phone provided',
        email: user?.email || 'No email provided',
        department: faculty ? faculty.description : 'No department provided',
        currentRoom: currentRoom ? currentRoom.name : 'No current room provided',
        reqRoom: reqRoom ? reqRoom.name : 'No requested room provided',
        reason: record.reason || 'No reason provided',
        date: record.created,
      };
    });

    console.log('Combined data:', result);
    return result;
  } catch (error) {
    console.warn(`Non-critical error fetching ${status} transfer requests:`, error);
    return transferRecords.length > 0 ? result : [];
  }
}

// Transfers a staff member to a new room and creates a transfer record.
export async function transferStaff(userId, selectedRoomId, reason) {
  try {
    // Fetches user details and current room assignment.
    const user = await pb.collection('users').getOne(userId);
    const currentRoomId = user.roomID;
    console.log('User fetched:', user);

    // Verifies admin authentication.
    if (!pb.authStore.isValid || !pb.authStore.record) {
      throw new Error('No authenticated admin found. Please log in.');
    }
    const adminUser = pb.authStore.record;
    const adminId = adminUser.id;
    console.log('Admin ID:', adminId);

    // Prepares transfer data for the transferRoom collection.
    const transferData = {
      transferRoomID: selectedRoomId,
      status: 'transfer',
      reason: reason || '',
      requestBy: userId,
      processedBy: adminId,
      currentRoomID: currentRoomId,
    };
    console.log('Transfer data to be sent:', transferData);

    // Creates a transfer record.
    const record = await pb.collection('transferRoom').create(transferData);
    console.log('Transfer record created:', record);

    // Updates the user’s room assignment.
    await pb.collection('users').update(userId, {
      roomID: selectedRoomId,
    });
    console.log('User room updated:', { userId, roomID: selectedRoomId });

    // Fetches room names for notification.
    const currentRoomRecord = await pb.collection('lookup').getOne(currentRoomId);
    const newRoomRecord = await pb.collection('lookup').getOne(selectedRoomId);
    const currentRoomName = currentRoomRecord.name;
    const newRoomName = newRoomRecord.name;

    // Sends a transfer notification.
    const toPhoneNumber = `+${user.phoneNo}`;
    await notificationTransfer(
      toPhoneNumber,
      user.name,
      currentRoomName,
      newRoomName,
      reason,
      userId
    );
    console.log('Notification sent for transfer:', { toPhoneNumber, staffName: user.name, currentRoomName, newRoomName });

    return record;
  } catch (error) {
    console.error('Error in transferStaff:', error);
    if (error.response && error.response.data) {
      console.error('Detailed error response:', error.response.data);
    }
    throw new Error('Failed to create transfer request, update user, or send notification: ' + error.message);
  }
}

// Fetches a user’s transfer request history.
export async function fetchRequestHistory(userId) {
  try {
    console.log('Fetching history for user:', userId);
    console.log('PocketBase URL:', pb.baseUrl);
    console.log('Auth status:', pb.authStore.isValid, pb.authStore.token);

    // Fetches transfer records for the user with specific statuses.
    const transferRecords = await pb.collection('transferRoom').getFullList({
      filter: `requestBy = "${userId}" && (status = "pending" || status = "rejected" || status = "approved")`,
      sort: '-created',
    });
    console.log('Transfer records fetched:', transferRecords);

    // Returns empty history if no records are found.
    if (!transferRecords || transferRecords.length === 0) {
      console.log('No transfer records found for user:', userId);
      return { success: true, data: [] };
    }

    // Processes each transfer record to include room details.
    const historicalData = await Promise.all(
      transferRecords.map(async (record) => {
        let currentRoomDetails = null;
        let requestedRoomDetails = null;

        // Fetches current room details with error handling.
        if (record.currentRoomID && typeof record.currentRoomID === 'string') {
          try {
            currentRoomDetails = await pb.collection('lookup').getOne(record.currentRoomID);
            console.log(`Current room ${record.currentRoomID}:`, currentRoomDetails);
          } catch (err) {
            console.warn(`Failed to fetch current room ${record.currentRoomID}:`, err.message);
            currentRoomDetails = null;
          }
        } else {
          console.log(`Skipping currentRoomID lookup for record ${record.id}: ID is invalid or missing`);
        }

        // Fetches requested room details with error handling.
        if (record.transferRoomID && typeof record.transferRoomID === 'string') {
          try {
            requestedRoomDetails = await pb.collection('lookup').getOne(record.transferRoomID);
            console.log(`Requested room ${record.transferRoomID}:`, requestedRoomDetails);
          } catch (err) {
            console.warn(`Failed to fetch requested room ${record.transferRoomID}:`, err.message);
            requestedRoomDetails = null;
          }
        } else {
          console.log(`Skipping transferRoomID lookup for record ${record.id}: ID is invalid or missing`);
        }

        // Formats the historical data for the record.
        return {
          id: record.id,
          currentRoom: currentRoomDetails ? currentRoomDetails.name : 'N/A',
          requestedRoom: requestedRoomDetails ? requestedRoomDetails.name : 'N/A',
          reason: record.reason || 'No reason provided',
          status: record.status || 'Unknown',
          created: new Date(record.created).toLocaleDateString(),
        };
      })
    );

    console.log('Processed historical data:', historicalData);
    return { success: true, data: historicalData };
  } catch (error) {
    console.error('Error fetching request history:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return { success: false, error: error.message || 'Failed to fetch history' };
  }
}