// app/lib/services/staffService.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: custom modules (pocketbase)
// Description: 
//              - This module provides staff-related services for the RoomEase Portal 
//                mobile application using PocketBase.
//              - Includes functions to fetch departments, faculties, users by faculty or 
//                department, staff profiles, and timetables.
//              - Supports staff registration with default credentials and status updates.
//              - Handles data formatting and validation for consistent API responses.

// Imports the PocketBase module.
import pb from '../pocketbase'; 

// Defines default password and email domain for staff registration.
const STAFF_PASSWORD = '12345678'; // Default password
const DEFAULT_DOMAIN = '@uptm.edu.my'; // Default email domain

// Fetches academic and non-academic departments from the lookup collection.
export async function fetchDepartment() {
  try {
    const records = await pb.collection('lookup').getFullList({
      filter: 'group = "2" && parent = "6lspw6slrpexfzy"',
    });

    console.log("Fetched Departments:", records);
    return records;
  } catch (error) {
    console.error('Error fetching department:', error);
    return [];
  }
}

// Fetches faculties under a specific department.
export async function fetchFaculty(parentId) {
  try {
    const records = await pb.collection('lookup').getFullList({
      filter: `group = "2" && parent = "${parentId}"`,
    });

    // Returns a placeholder if no faculties are found.
    if (records.length === 0) {
      console.log(`No faculty found for parentId: ${parentId}`);
      return [{ id: 'no-data', name: 'No Data' }];
    }

    console.log("Fetched Faculty:", records);
    return records;
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return [{ id: 'error', name: 'Error loading data' }];
  }
}

// Fetches active users and their room assignments for a specific faculty.
export async function fetchUserFaculty(facultyId) {
  try {
    // Validates the faculty ID.
    if (!facultyId || typeof facultyId !== "string") {
      console.log("Invalid facultyId provided:", facultyId);
      return null;
    }

    // Fetches faculty details.
    const faculty = await pb.collection("lookup").getOne(facultyId, {
      fields: "id,name,description",
    });

    // Returns null if faculty is not found.
    if (!faculty || !faculty.name) {
      console.log(`No faculty found for facultyId: ${facultyId}`);
      return null;
    }

    // Fetches active users for the specified faculty.
    const users = await pb.collection("users").getFullList({
      filter: `facultyID = "${facultyId}" && status = "active"`,
      expand: "roomID",
    });

    console.log(`Active users for faculty ${facultyId}:`, users);

    // Maps users to include room information.
    const mappedUsers = users.map((user) => {
      // Handles both array and single object roomID expansions.
      const roomData = user.expand?.roomID;
      const roomName = Array.isArray(roomData)
        ? roomData[0]?.name || "No Room Assigned"
        : roomData?.name || "No Room Assigned";

      return {
        id: user.id,
        name: user.name,
        room: roomName,
      };
    });

    // Returns faculty details and mapped users.
    return {
      facultyName: faculty.name,
      facultyDescription: faculty.description || "No description available",
      users: mappedUsers,
    };
  } catch (error) {
    console.error("Error fetching active users for faculty:", error);
    return null;
  }
}

// Fetches users from academic and non-academic departments, prioritizing those without rooms.
export async function fetchDepartmentUser() {
  try {
    // Fetches faculty IDs for academic and non-academic departments.
    const lookupRecords = await pb.collection("lookup").getFullList({
      filter: `parent = "086xp050jfn7v8m" || parent = "19xl43f2380z694"`
    });

    const facultyIDs = lookupRecords.map(record => record.id);
    if (facultyIDs.length === 0) return [];

    // Fetches active users with matching faculty IDs.
    const users = await pb.collection("users").getFullList({
      filter: facultyIDs.map(id => `(facultyID="${id}" && status="active")`).join(" || "),
      expand: "roomID"
    });

    // Maps users to include room names.
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      room: user.expand?.roomID?.name || "No Room Assigned"
    }));

    // Sorts users to prioritize those without assigned rooms.
    formattedUsers.sort((a, b) => (a.room === "No Room Assigned" ? -1 : 1));

    return formattedUsers;
  } catch (error) {
    console.error("Error fetching department users:", error);
    return [];
  }
}

// Fetches only staff names from department users.
export async function fetchUserNames() {
  const users = await fetchDepartmentUser();
  return users.map(user => user.name);
}

// Fetches detailed staff data including faculty and room assignments.
export async function fetchStaffData() {
  try {
    // Fetches faculty IDs for academic and non-academic departments.
    const lookupRecords = await pb.collection("lookup").getFullList({
      filter: `parent = "086xp050jfn7v8m" || parent = "19xl43f2380z694"`
    });

    console.log("Lookup Records:", lookupRecords);

    const facultyIDs = lookupRecords.map(record => record.id);
    if (facultyIDs.length === 0) {
      console.log("No faculty IDs found");
      return [];
    }

    // Fetches users with matching faculty IDs or staff role.
    const users = await pb.collection("users").getFullList({
      filter: `${facultyIDs.map(id => `facultyID="${id}"`).join(" || ")} || roleID="ao5a34odc1oes80"`,
      expand: "roomID"
    });

    console.log("Users Data:", users);

    // Maps faculty IDs to their names.
    const facultyNames = lookupRecords.reduce((acc, record) => {
      acc[record.id] = record.name;
      return acc;
    }, {});

    // Maps users to include faculty and room details.
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      faculty: facultyNames[user.facultyID] || "Unknown Faculty",
      room: user.expand?.roomID?.name || "No Room Assigned"
    }));

    // Sorts users to prioritize those without assigned rooms.
    formattedUsers.sort((a, b) => (a.room === "No Room Assigned" ? -1 : 1));

    return formattedUsers;
  } catch (error) {
    console.error("Error fetching staff data:", error);
    return [];
  }
}

// Fetches detailed profile data for a specific staff member.
export async function fetchStaffProfile(userId) {
  try {
    // Fetches user data with expanded room and faculty details.
    const users = await pb.collection('users').getFullList({
      filter: `id = "${userId}"`,
      expand: 'roomID,facultyID',
    });

    // Validates that a user was found.
    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Extracts room and faculty names with fallbacks.
    const room = user.expand?.roomID?.name || 'No Room Assigned';
    const faculty = user.expand?.facultyID?.name || 'No Faculty Assigned';

    // Constructs avatar URL if available.
    const avatar = user.avatar 
      ? pb.files.getURL(user, user.avatar)
      : 'No Avatar Provided';

    // Returns formatted staff profile data.
    return {
      id: user.id,
      name: user.name,
      room: room,
      faculty: faculty,
      email: user.email || 'No Email Provided',
      phoneNo: user.phoneNo || 'No Phone Number Provided',
      status: user.status || 'No Status Provided',
      avatar: avatar,
    };
  } catch (error) {
    console.error("Error fetching staff profile:", error.message || error);
    throw error;
  }
}

// Fetches a user’s avatar URL.
export async function fetchAvatar(userId) {
  try {
    // Fetches user record with avatar field.
    const response = await pb.collection('users').getOne(userId, {
      fields: 'avatar',
    });
    return response.avatar ? pb.files.getURL(response, response.avatar) : 'No Avatar Provided';
  } catch (err) {
    console.error("Error fetching avatar: ", err);
    throw new Error("Failed to fetch avatar");
  }
}

// Registers a new staff user with provided details.
export async function insertStaffUser(emailPrefix, name, department, facultyID, phoneNo) {
  try {
    // Constructs full email address if domain is not included.
    const email = emailPrefix.includes('@') ? emailPrefix : `${emailPrefix}${DEFAULT_DOMAIN}`;

    // Checks for existing users with the same email.
    const existingUser = await pb.collection('users').getFirstListItem(`email="${email}"`).catch(() => null);
    if (existingUser) {
      return { success: false, message: 'Email is already taken.' };
    }

    // Fetches staff role ID.
    const staffRole = await pb.collection('lookup').getFirstListItem(`name="staff" && parent="rr60s2z257q009o"`).catch(() => null);
    if (!staffRole) {
      console.error('Staff role not found! Check lookup collection.');
      return { success: false, message: 'Staff role not found.' };
    }
    const staffRoleID = staffRole.id;

    // Verifies faculty existence.
    const facultyRecord = await pb.collection('lookup').getFirstListItem(`id='${facultyID}' && group=2`).catch(() => null);
    if (!facultyRecord) {
      console.error(`Faculty not found for ID: ${facultyID}`);
      return { success: false, message: 'Faculty not found.' };
    }

    // Formats phone number by prepending '6' if needed.
    let formattedPhoneNo = phoneNo;
    if (phoneNo.startsWith('0') && phoneNo.length === 10) {
      formattedPhoneNo = `6${phoneNo}`;
      console.log('Formatted phone number:', formattedPhoneNo);
    } else {
      console.warn('Phone number not in expected format (10 digits starting with 0):', phoneNo);
    }

    // Creates a new user record with provided details.
    const record = await pb.collection('users').create({
      email: email,
      emailVisibility: true,
      name: name,
      password: STAFF_PASSWORD,
      passwordConfirm: STAFF_PASSWORD,
      roleID: staffRoleID,
      facultyID: facultyID,
      department: department,
      phoneNo: formattedPhoneNo,
      status: 'active',
      isFirstLogin: true
    });

    console.log('Staff user inserted successfully:', record);
    return { success: true, message: 'Staff registered successfully!', record };
  } catch (error) {
    console.error('Error inserting staff user:', error);
    return { success: false, message: 'Failed to register staff. Please try again.' };
  }
}

// Updates a user’s status and removes room assignment if inactive.
export async function userStatus(userId, newStatus) {
  try {
    // Validates the user ID.
    if (!userId || typeof userId !== "string") {
      console.log("Invalid userId provided:", userId);
      return null;
    }

    // Fetches user details.
    const user = await pb.collection("users").getOne(userId, {
      fields: "id,name,roomID,status",
    });

    // Returns null if user is not found.
    if (!user) {
      console.log(`No user found for userId: ${userId}`);
      return null;
    }

    // Prepares update data, removing roomID if status is inactive.
    const updatedData = {
      status: newStatus,
      roomID: newStatus === "inactive" ? null : user.roomID,
    };

    // Updates the user record.
    await pb.collection("users").update(userId, updatedData);

    console.log(`User ${user.name} status changed to ${newStatus}`);
    return { id: user.id, name: user.name, status: newStatus, room: updatedData.roomID || "n/a" };
  } catch (error) {
    console.error("Error updating user status:", error);
    return null;
  }
}

// Fetches a user’s timetable file URL.
export async function fetchTimetable(userId) {
  try {
    // Fetches user data with timetable field.
    const users = await pb.collection('users').getFullList({
      filter: `id = "${userId}"`,
    });

    // Validates that a user was found.
    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Constructs timetable URL if available.
    const timetableUrl = user.timetable 
      ? pb.files.getURL(user, user.timetable)
      : 'No Timetable Available';

    // Returns formatted timetable data.
    return {
      id: user.id,
      name: user.name,
      timetable: timetableUrl,
    };
  } catch (error) {
    console.error("Error fetching timetable:", error.message || error);
    throw error;
  }
}