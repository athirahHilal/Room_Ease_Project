// app/lib/services/notificationService.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: custom modules (pocketbase), external services (Twilio, email API)
// Description: 
//              - This module provides notification services for the RoomEase Portal 
//                mobile application, managing staff-related notifications.
//              - Supports SMS (via Twilio), email (via custom endpoint), and in-app 
//                notifications (via PocketBase).
//              - Handles notifications for staff transfers, room assignments, new staff 
//                registrations, staff room change requests, and transfer request outcomes.

// Imports necessary modules.
import pb from '../pocketbase';

//I DID NOT SETUP THE ENV FOR THIS YET
// Twilio and email API configuration (should be stored in environment variables).
// const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'xxxxxx';
// const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'xxxxxx';
// const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || 'xxxxxx';
// const EMAIL_API_ENDPOINT = process.env.EMAIL_API_ENDPOINT || 'xxxxxx';

// Helper function to send emails via the email API endpoint.
const sendEmail = async (emailData) => {
  const response = await fetch(EMAIL_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData),
  });
  if (!response.ok) throw new Error('Email sending failed');
  console.log("Email sent successfully via backend");
  return response;
};

// Notifies a staff member of a room transfer and informs other staff members of the change.
// Handles: SMS (to the transferred staff), email (to the transferred staff), and in-app notifications (to all relevant staff).
const notificationTransfer = async (toPhoneNumber, staffName, currentRoomName, newRoomName, transferReason, userId) => {
  const detailedBody = `Transfer Notification: ${staffName}, you have been transferred from ${currentRoomName} to ${newRoomName}. Reason: ${transferReason || "Not specified"}`;
  const genericBody = `${staffName} is being transferred to room ${newRoomName}`;

  // SMS setup for Twilio API.
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const smsBody = `Transfer Notification: ${staffName}, you have been transferred from ${currentRoomName} to ${newRoomName}.`;

  const formData = new FormData();
  formData.append("To", toPhoneNumber);
  formData.append("From", TWILIO_PHONE_NUMBER);
  formData.append("Body", smsBody);

  try {
    const user = await pb.collection('users').getOne(userId);
    const userEmail = user.email;
    const facultyID = user.facultyID;

    // Fetch faculty description from lookup collection.
    let facultyDescription = 'N/A';
    if (facultyID && facultyID !== 'N/A') {
      const facultyRecord = await pb.collection('lookup').getFirstListItem(`id="${facultyID}"`);
      facultyDescription = facultyRecord.description || 'N/A';
    }

    // SMS sending.
    const smsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData).toString(),
    });

    const smsData = await smsResponse.json();
    if (!smsResponse.ok) throw { code: smsData.code, message: smsData.message };
    console.log("SMS sent successfully:", { sid: smsData.sid, status: smsData.status });

    // Email sending.
    await sendEmail({
      to: userEmail,
      subject: 'Staff Transfer Notification',
      text: detailedBody,
      staffName,
      currentRoomName,
      newRoomName,
      transferReason,
      facultyDescription,
    });

    // In-app notification for the transferred staff.
    await pb.collection('notifications').create({
      userID: userId,
      message: detailedBody,
      read: false,
    });

    // Notify other staff members with role 'ao5a34odc1oes80' (excluding the transferred staff).
    const staffUsers = await pb.collection('users').getFullList({
      filter: `roleID = 'ao5a34odc1oes80' && id != '${userId}'`,
    });
    for (const user of staffUsers) {
      await pb.collection('notifications').create({
        userID: user.id,
        message: genericBody,
        read: false,
      });
    }
  } catch (error) {
    console.error("Email, SMS, or notification failed:", { errorCode: error.code, errorMessage: error.message });
    throw error;
  }
};

// Retrieves all notifications for a specific user from the PocketBase 'notifications' collection, sorted by creation date.
// Handles: In-app notifications only.
const fetchNotifications = async (userId) => {
  try {
    const notifications = await pb.collection('notifications').getFullList({
      filter: `userID = '${userId}'`,
      sort: '-created',
    });
    console.log("Fetched notifications:", notifications);
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw new Error("Failed to fetch notifications: " + error.message);
  }
};

// Notifies a newly registered staff member of their registration and informs other staff of the new addition.
// Handles: SMS (to the new staff), email (to the new staff), and in-app notifications (to other staff).
const notifyNewStaffRegistration = async (staffName, departmentName, facultyName, newStaffId, phoneNo) => {
  const detailedBody = `${staffName}, you've been registered in the RoomEase Portal App in the ${departmentName} department at ${facultyName || 'N/A'}. Contact admin for login details.`;
  const genericBody = `New staff member ${staffName} is registered in the ${departmentName} department at ${facultyName || 'N/A'}.`;

  // SMS setup for Twilio API.
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const smsBody = `${staffName}, you've been registered in the RoomEase Portal App. Contact admin for login details.`;

  const formData = new FormData();
  const formattedPhoneNo = phoneNo.startsWith('60') ? `+${phoneNo}` : `+6${phoneNo}`;
  formData.append("To", formattedPhoneNo);
  formData.append("From", TWILIO_PHONE_NUMBER);
  formData.append("Body", smsBody);

  try {
    const user = await pb.collection('users').getOne(newStaffId);
    const userEmail = user.email;
    const facultyID = user.facultyID;

    // Fetch faculty description from lookup collection.
    let facultyDescription = 'N/A';
    if (facultyID && facultyID !== 'N/A') {
      const facultyRecord = await pb.collection('lookup').getFirstListItem(`id="${facultyID}"`);
      facultyDescription = facultyRecord.description || 'N/A';
    }

    // SMS sending.
    const smsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData).toString(),
    });

    const smsData = await smsResponse.json();
    if (!smsResponse.ok) throw { code: smsData.code, message: smsData.message };
    console.log("SMS sent successfully to new staff:", { sid: smsData.sid, status: smsData.status });

    // Email sending.
    await sendEmail({
      to: userEmail,
      subject: 'Welcome to RoomEase Portal',
      text: detailedBody,
      staffName,
      departmentName,
      facultyName,
      facultyDescription,
    });

    // Notify other staff members with role 'ao5a34odc1oes80' (excluding the new staff).
    const staffUsers = await pb.collection('users').getFullList({
      filter: `roleID = 'ao5a34odc1oes80' && id != '${newStaffId}'`,
    });

    for (const user of staffUsers) {
      await pb.collection('notifications').create({
        userID: user.id,
        message: genericBody,
        read: false,
      });
      console.log(`In-app notification created for staff ${user.id}: ${genericBody}`);
    }
  } catch (error) {
    console.error('Failed to send SMS, email, or notifications:', { errorCode: error.code, errorMessage: error.message });
    throw error;
  }
};

// Notifies a staff member of a new room assignment and informs other staff of the change.
// Handles: SMS (to the assigned staff), email (to the assigned staff), and in-app notifications (to all relevant staff).
const notifyRoomAssignment = async (staffName, selectedRoomName, userId, phoneNo) => {
  const detailedBody = `You have been assigned to room ${selectedRoomName}`;
  const genericBody = `Staff ${staffName} is being assigned to room ${selectedRoomName}`;

  // SMS setup for Twilio API.
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const smsBody = `${staffName}, you have been assigned to room ${selectedRoomName}.`;

  const formData = new FormData();
  const formattedPhoneNo = phoneNo.toString().startsWith('60') ? `+${phoneNo}` : `+6${phoneNo}`;
  formData.append("To", formattedPhoneNo);
  formData.append("From", TWILIO_PHONE_NUMBER);
  formData.append("Body", smsBody);

  try {
    const user = await pb.collection('users').getOne(userId);
    const userEmail = user.email;
    const facultyID = user.facultyID;

    // Fetch faculty description from lookup collection.
    let facultyDescription = 'N/A';
    if (facultyID && facultyID !== 'N/A') {
      const facultyRecord = await pb.collection('lookup').getFirstListItem(`id="${facultyID}"`);
      facultyDescription = facultyRecord.description || 'N/A';
    }

    // SMS sending.
    const smsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData).toString(),
    });

    const smsData = await smsResponse.json();
    if (!smsResponse.ok) throw { code: smsData.code, message: smsData.message };
    console.log("SMS sent successfully to selected staff:", { sid: smsData.sid, status: smsData.status });

    // Email sending.
    await sendEmail({
      to: userEmail,
      subject: 'Room Assignment Notification',
      text: detailedBody,
      staffName,
      selectedRoomName,
      facultyDescription,
    });

    // In-app notification for the assigned staff.
    await pb.collection('notifications').create({
      userID: userId,
      message: detailedBody,
      read: false,
    });
    console.log(`Notification created for selected staff ${userId}: ${detailedBody}`);

    // Notify other staff members with role 'ao5a34odc1oes80' (excluding the assigned staff).
    const staffUsers = await pb.collection('users').getFullList({
      filter: `roleID = 'ao5a34odc1oes80' && id != '${userId}'`,
    });

    for (const staff of staffUsers) {
      await pb.collection('notifications').create({
        userID: staff.id,
        message: genericBody,
        read: false,
      });
      console.log(`Notification created for staff ${staff.id}: ${genericBody}`);
    }
  } catch (error) {
    console.error('Failed to send SMS, email, or notifications for room assignment:', { errorCode: error.code, errorMessage: error.message });
    throw error;
  }
};

// Notifies admin users of a staff member's request for a room change.
// Handles: SMS (to admins), email (to admins), and in-app notifications (to admins).
const notifyStaffRequest = async (staffName, transferRoomID, currentRoomID) => {
  try {
    console.log('notifyStaffRequest called with:', { staffName, transferRoomID, currentRoomID });

    // Fetch the requested room details.
    const roomRecord = await pb.collection('lookup').getFirstListItem(`id="${transferRoomID}"`).catch((error) => {
      console.error('Error fetching requested room:', error);
      return null;
    });
    if (!roomRecord) {
      console.error(`Requested room not found for ID: ${transferRoomID}`);
      throw new Error('Requested room not found');
    }
    const roomName = roomRecord.name;
    console.log('Requested room name fetched:', roomName);

    // Fetch or set the current room name.
    let currentRoomName = currentRoomID;
    if (currentRoomID && currentRoomID !== 'N/A') {
      const currentRoomRecord = await pb.collection('lookup').getFirstListItem(`id="${currentRoomID}"`).catch((error) => {
        console.error('Error fetching current room:', error);
        return null;
      });
      currentRoomName = currentRoomRecord ? currentRoomRecord.name : currentRoomID;
      console.log('Current room name fetched:', currentRoomName);
    } else {
      currentRoomName = 'No Room Assigned';
      console.log('No current room assigned for staff');
    }

    // Construct the notification message.
    const message = `${staffName} requests a room change from ${currentRoomName} to ${roomName}`;
    console.log('Notification message:', message);

    // Fetch admin users.
    const adminRoleID = 'ic7u2611314cq76';
    const adminUsers = await pb.collection('users').getFullList({
      filter: `roleID = "${adminRoleID}"`,
    });
    console.log('Admin users found:', adminUsers.length, 'Details:', adminUsers);

    if (adminUsers.length === 0) {
      console.warn('No admin users found to notify.');
      return;
    }

    // Fetch staff user details.
    const staffUser = await pb.collection('users').getFirstListItem(`name="${staffName}"`);
    const staffPhoneNo = staffUser.phoneNo;
    const staffEmail = staffUser.email;
    console.log('Staff details fetched:', { staffPhoneNo, staffEmail });

    // Notify each admin.
    for (const admin of adminUsers) {
      // In-app notification.
      await pb.collection('notifications').create({
        userID: admin.id,
        message: message,
        read: false,
      });
      console.log(`Notification created for admin ${admin.id}: ${message}`);

      // SMS sending.
      const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
      const smsBody = `${staffName} requests a room change from ${currentRoomName} to ${roomName}`;

      const formData = new FormData();
      formData.append("To", `+${admin.phoneNo}`);
      formData.append("From", TWILIO_PHONE_NUMBER);
      formData.append("Body", smsBody);

      const smsResponse = await fetch(url, {
        method: 'POST',
        headers: {
          "Authorization": auth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData).toString(),
      });
      const smsData = await smsResponse.json();
      if (!smsResponse.ok) throw { code: smsData.code, message: smsData.message };
      console.log('SMS sent successfully to admin:', { sid: smsData.sid, status: smsData.status });

      // Email sending.
      await sendEmail({
        to: admin.email,
        subject: 'Staff Room Change Request',
        text: message,
        staffName,
        currentRoomName,
        roomName,
        adminName: admin.name,
        staffPhoneNo,
        staffEmail,
      });
    }
  } catch (error) {
    console.error('Error in notifyStaffRequest:', error);
    throw error;
  }
};

// Notifies a staff member of the outcome (approved/rejected) of their room transfer request and, if approved, informs other staff.
// Handles: SMS (to the requesting staff), email (to the requesting staff), and in-app notifications (to the requesting staff and, if approved, all relevant staff).
const notifyTransferRequestOutcome = async (requestBy, transferRoomID, currentRoomID, status, staffName) => {
  try {
    console.log('notifyTransferRequestOutcome called with:', { requestBy, transferRoomID, currentRoomID, status, staffName });

    // Fetch staff details.
    const staffRecord = await pb.collection('users').getOne(requestBy);
    const userEmail = staffRecord.email;
    const facultyID = staffRecord.facultyID;
    const rawPhoneNo = staffRecord.phoneNo;
    console.log('Raw phone number from staff record:', rawPhoneNo);

    // Normalize phone number for SMS.
    const formattedPhoneNo = rawPhoneNo && !rawPhoneNo.toString().startsWith('+') 
      ? `+${rawPhoneNo}` 
      : rawPhoneNo || null;
    console.log('Formatted phone number for SMS:', formattedPhoneNo);

    // Fetch faculty description from lookup collection.
    let facultyDescription = 'N/A';
    if (facultyID && facultyID !== 'N/A') {
      const facultyRecord = await pb.collection('lookup').getFirstListItem(`id="${facultyID}"`);
      facultyDescription = facultyRecord.description || 'N/A';
    }

    // Fetch room names.
    const transferRoomRecord = await pb.collection('lookup').getFirstListItem(`id="${transferRoomID}"`).catch((error) => {
      console.error('Error fetching transfer room:', error);
      return null;
    });
    if (!transferRoomRecord) {
      console.error(`Transfer room not found for ID: ${transferRoomID}`);
      throw new Error('Transfer room not found');
    }
    const transferRoomName = transferRoomRecord.name;
    console.log('Transfer room name fetched:', transferRoomName);

    let currentRoomName = currentRoomID;
    if (currentRoomID && currentRoomID !== 'N/A') {
      const currentRoomRecord = await pb.collection('lookup').getFirstListItem(`id="${currentRoomID}"`).catch((error) => {
        console.error('Error fetching current room:', error);
        return null;
      });
      currentRoomName = currentRoomRecord ? currentRoomRecord.name : currentRoomID;
      console.log('Current room name fetched:', currentRoomName);
    } else {
      currentRoomName = 'No Room Assigned';
      console.log('No current room assigned for staff');
    }

    // Prepare notification messages.
    const staffMessage = `Your request to change from ${currentRoomName} to ${transferRoomName} has been ${status}.`;
    console.log('Staff notification message:', staffMessage);

    // SMS sending (if phone number exists).
    if (formattedPhoneNo) {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
      const smsBody = `${staffName}, your request to change from ${currentRoomName} to ${transferRoomName} has been ${status}.`;

      const formData = new FormData();
      formData.append("To", formattedPhoneNo);
      formData.append("From", TWILIO_PHONE_NUMBER);
      formData.append("Body", smsBody);

      const smsResponse = await fetch(url, {
        method: 'POST',
        headers: {
          "Authorization": auth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData).toString(),
      });
      const smsData = await smsResponse.json();
      if (!smsResponse.ok) throw { code: smsData.code, message: smsData.message };
      console.log('SMS sent successfully to staff:', { sid: smsData.sid, status: smsData.status });
    } else {
      console.warn('No phone number available for SMS. Skipping SMS notification.');
    }

    // Email sending.
    await sendEmail({
      to: userEmail,
      subject: 'Transfer Request Outcome',
      text: staffMessage,
      staffName,
      currentRoomName,
      transferRoomName,
      status,
      facultyDescription,
    });

    // In-app notification for the requesting staff.
    await pb.collection('notifications').create({
      userID: requestBy,
      message: staffMessage,
      read: false,
    });
    console.log(`Notification created for staff ${requestBy}: ${staffMessage}`);

    // If approved, notify all other staff.
    if (status === 'approved') {
      const allStaffMessage = `${staffName} has been assigned to room ${transferRoomName}.`;
      console.log('All staff notification message:', allStaffMessage);

      const staffRoleID = 'ao5a34odc1oes80';
      const allStaff = await pb.collection('users').getFullList({
        filter: `roleID = "${staffRoleID}" && id != "${requestBy}"`,
      });

      for (const staff of allStaff) {
        await pb.collection('notifications').create({
          userID: staff.id,
          message: allStaffMessage,
          read: false,
        });
        console.log(`Notification created for staff ${staff.id}: ${allStaffMessage}`);
      }
    }
  } catch (error) {
    console.error('Failed to send SMS, email, or notifications for transfer request outcome:', { errorCode: error.code, errorMessage: error.message });
    throw error;
  }
};

export { notificationTransfer, fetchNotifications, notifyNewStaffRegistration, notifyRoomAssignment, notifyStaffRequest, notifyTransferRequestOutcome };