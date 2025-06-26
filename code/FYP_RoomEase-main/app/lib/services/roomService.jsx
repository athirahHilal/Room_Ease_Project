// app/lib/services/roomService.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: custom modules (pocketbase, notificationService)
// Description: 
//              - This module provides room-related services for the RoomEase Portal 
//                mobile application using PocketBase.
//              - Includes functions to fetch floors, rooms, users by room, room capacity, 
//                and staff without rooms.
//              - Supports adding new rooms, assigning rooms to users, editing room details, 
//                and fetching available floors and rooms based on capacity.
//              - Integrates with notificationService for room assignment notifications.

// Imports necessary modules.
import pb from '../pocketbase';
import { notifyRoomAssignment } from './notificationService';

// Fetches all floors from the lookup collection.
export async function fetchFloors() {
    try {
        const records = await pb.collection('lookup').getFullList({
            filter: 'name ~ "Floor"'
        });

        console.log('Fetched floors:', records);
        return records;
    } catch (error) {
        console.error('Error fetching floors:', error);
        return [];
    }
}

// Fetches rooms for a specific floor and determines their full status.
export async function fetchRooms(floorId) {
    try {
        // Fetches rooms for the given floorId.
        const rooms = await pb.collection('lookup').getFullList({
            filter: `parent = "${floorId}"`
        });

        // Fetches all users to calculate room occupancy.
        const users = await pb.collection('users').getFullList();

        // Maps rooms to include their full status based on user count and capacity.
        const roomsWithStatus = rooms.map(room => {
            // Counts users assigned to this room.
            const usersInRoom = users.filter(user => user.roomID === room.id).length;

            // Retrieves room capacity from the description field.
            const capacity = parseInt(room.description, 10) || 0;

            // Determines if the room is full based on occupancy vs. capacity.
            const isFull = usersInRoom >= capacity;

            // Returns room data with added isFull property.
            return {
                ...room,
                isFull
            };
        });

        console.log('Fetched rooms with status:', roomsWithStatus);
        return roomsWithStatus;
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
}

// Fetches active users assigned to a specific room.
export async function fetchUsersByRoom(roomId) {
    try {
        // Validates that a room ID is provided.
        if (!roomId) {
            throw new Error("Room ID is required");
        }

        console.log("Fetching active users for Room ID:", roomId);

        // Fetches active users for the specified room.
        const users = await pb.collection('users').getFullList({
            filter: `roomID = "${roomId.toString()}" && status = "active"`
        });

        console.log("Fetched active users:", users);

        // Returns empty array if no users are found.
        if (!users || users.length === 0) {
            console.warn("No active users found for room:", roomId);
            return [];
        }

        // Maps user data to include only relevant fields.
        return users.map(user => ({
            id: user.id,
            name: user.name,
            roomID: user.roomID,
        }));
    } catch (error) {
        console.error("Error fetching active users by room:", error.message || error);
        return [];
    }
}

// Fetches the capacity of a specific room.
export async function fetchRoomCapacity(roomId) {
    try {
        // Validates that a room ID is provided.
        if (!roomId) {
            throw new Error("Room ID is required");
        }

        console.log("Fetching capacity for Room ID:", roomId);

        // Fetches room records matching the ID and capacity category.
        const records = await pb.collection('lookup').getFullList({
            filter: `id = "${roomId.toString()}" && category = "capacity"`
        });

        console.log("Fetched capacity records:", records);

        // Returns null if no capacity record is found.
        if (!records || records.length === 0) {
            console.warn("No capacity found for room:", roomId);
            return null;
        }

        // Extracts and returns the capacity from the first matching record.
        const capacity = parseInt(records[0].description, 10);
        return isNaN(capacity) ? null : capacity;
    } catch (error) {
        console.error("Error fetching room capacity:", error.message || error);
        return null;
    }
}

// Fetches active staff users who have no assigned room.
export async function fetchNoRoomUser() {
    try {
        // Fetches the staff role ID from the lookup collection.
        const staffRole = await pb.collection('lookup').getFirstListItem('name = "staff" && group = "1"');
        console.log('Fetched staffRole:', staffRole);

        // Validates that the staff role exists.
        if (!staffRole) {
            console.error('Staff role not found');
            return [];
        }

        // Fetches active staff users with no assigned room.
        const users = await pb.collection('users').getFullList({
            filter: `roleID = "${staffRole.id}" && status = "active" && (roomID = "" || roomID = null)`
        });

        console.log('Fetched active users with no room:', users);
        return users;
    } catch (error) {
        console.error('Error fetching active staff users with no room:', error);
        return [];
    }
}

// Fetches floors with at least one available room based on capacity.
export async function FetchAvailableFloor() {
    try {
        // Fetches all floors from the lookup collection.
        const floors = await pb.collection('lookup').getFullList({
            filter: 'group = 3 && parent = null'
        });

        // Fetches all rooms from the lookup collection.
        const rooms = await pb.collection('lookup').getFullList({
            filter: 'group = 3 && parent != null'
        });

        // Fetches all users to calculate room occupancy.
        const users = await pb.collection('users').getFullList();

        // Calculates the number of users per room.
        const roomOccupancy = {};
        users.forEach(user => {
            if (user.roomID) {
                roomOccupancy[user.roomID] = (roomOccupancy[user.roomID] || 0) + 1;
            }
        });

        // Filters rooms to include only those with available capacity.
        const availableRooms = rooms.filter(room => {
            const capacity = parseInt(room.description, 10) || 0;
            const currentOccupancy = roomOccupancy[room.id] || 0;
            return currentOccupancy < capacity;
        });

        // Maps floors to their available rooms.
        const floorToRoomsMap = {};
        availableRooms.forEach(room => {
            if (!floorToRoomsMap[room.parent]) {
                floorToRoomsMap[room.parent] = [];
            }
            floorToRoomsMap[room.parent].push(room);
        });

        // Filters floors to include only those with available rooms.
        const availableFloors = floors.filter(floor => floorToRoomsMap[floor.id]);

        console.log('Available floors:', availableFloors);
        return { availableFloors, floorToRoomsMap };
    } catch (error) {
        console.error('Error fetching available floors:', error);
        return { availableFloors: [], floorToRoomsMap: {} };
    }
}

// Fetches available rooms for a specific floor based on capacity.
export async function FetchAvailableRoom(floorId) {
    try {
        // Fetches rooms for the specified floor.
        const rooms = await pb.collection('lookup').getFullList({
            filter: `group = 3 && parent = "${floorId}"`
        });

        // Fetches all users to calculate room occupancy.
        const users = await pb.collection('users').getFullList();

        // Calculates room occupancy.
        const roomOccupancy = {};
        users.forEach(user => {
            if (user.roomID) {
                roomOccupancy[user.roomID] = (roomOccupancy[user.roomID] || 0) + 1;
            }
        });

        // Filters rooms to include only those with available capacity.
        const availableRooms = rooms.filter(room => {
            const capacity = parseInt(room.description, 10) || 0;
            const currentOccupancy = roomOccupancy[room.id] || 0;
            return currentOccupancy < capacity;
        });

        console.log('Filtered available rooms:', availableRooms);
        return availableRooms;
    } catch (error) {
        console.error('Error fetching available rooms:', error);
        return [];
    }
}

// Adds a new room to the lookup collection.
export async function AddRoom(roomData) {
    try {
        // Checks for duplicate room names.
        const existingRoom = await pb.collection('lookup').getFirstListItem(`name = "${roomData.name}"`, {
            requestKey: null
        }).catch(() => null);

        // Returns null if a room with the same name exists.
        if (existingRoom) {
            return null;
        }

        // Creates a new room record in the lookup collection.
        const record = await pb.collection('lookup').create(roomData);
        return record;
    } catch (error) {
        console.error('Error adding room:', error);
        throw error;
    }
}

// Assigns a room to a user and creates a transfer record.
export async function AssignUserRoom(userId, roomId) {
    try {
        console.log('Attempting to assign room:', { userId, roomId });

        // Verifies user existence and retrieves their details.
        const user = await pb.collection('users').getOne(userId);
        console.log('User found:', user);
        const staffName = user.name;
        const phoneNo = user.phoneNo;

        // Verifies room existence and retrieves its name.
        const room = await pb.collection('lookup').getOne(roomId);
        console.log('Room found:', room);
        const selectedRoomName = room.name;

        // Ensures an authenticated admin is present.
        if (!pb.authStore.isValid) {
            throw new Error('No authenticated admin found. Please log in.');
        }
        const adminUser = pb.authStore.record;
        if (!adminUser || !adminUser.id) {
            throw new Error('Admin user data is missing or invalid.');
        }
        const adminId = adminUser.id;
        console.warn('Using deprecated pb.authStore.model. Consider updating to a future-proof method.');
        console.log('Admin ID:', adminId);

        // Updates the user's roomID field.
        const updatedUser = await pb.collection('users').update(userId, {
            roomID: roomId
        });
        console.log('User updated with room:', updatedUser);

        // Prepares data for the transferRoom record.
        const transferRoomData = {
            transferRoomID: roomId,
            status: 'assigned',
            reason: 'N/A',
            requestBy: userId,
            processedBy: adminId,
            currentRoomID: null
        };
        console.log('Transfer room data to be sent:', transferRoomData);

        // Creates a record in the transferRoom collection.
        try {
            const transferRoomRecord = await pb.collection('transferRoom').create(transferRoomData);
            console.log('Transfer room record created:', transferRoomRecord);
        } catch (createError) {
            console.error('Detailed error creating transferRoom record:', createError.response?.data || createError);
            throw createError;
        }

        // Sends SMS and in-app notifications for the room assignment.
        await notifyRoomAssignment(staffName, selectedRoomName, userId, phoneNo);

        return updatedUser;
    } catch (error) {
        console.error('Error assigning room:', error);
        throw error;
    }
}

// Edits room name and/or capacity with validation.
export async function editRoom(roomId, newRoomName, newCapacity) {
    try {
        // Fetches the current room data.
        const currentRoom = await pb.collection('lookup').getOne(roomId);
        const currentRoomName = currentRoom.name;

        // Counts the number of staff assigned to the room.
        const staffCount = await pb.collection('users').getList(1, 500, {
            filter: `roomID = "${roomId}" && roleID = "ao5a34odc1oes80"`,
            requestKey: null
        }).then((response) => response.totalItems);

        // Logs the staff count for debugging.
        console.log(`Staff count for room "${currentRoomName}" (ID: ${roomId}): ${staffCount}`);

        // Validates new capacity if provided.
        if (newCapacity !== undefined) {
            const newCapacityNum = parseInt(newCapacity, 10);
            if (isNaN(newCapacityNum) || newCapacityNum < 0) {
                throw new Error('Please enter a valid capacity');
            }
            if (staffCount > newCapacityNum) {
                throw new Error(`Room ${currentRoomName} has ${staffCount} staff, please enter capacity more than current staff reside`);
            }
        }

        // Prepares update data for changed fields only.
        const updateData = {};
        if (newRoomName && newRoomName !== currentRoomName) updateData.name = newRoomName;
        if (newCapacity !== undefined) updateData.description = newCapacity;

        // Updates the room record in PocketBase.
        const updatedRoom = await pb.collection('lookup').update(roomId, updateData);
        return updatedRoom;
    } catch (error) {
        console.error('Error editing room:', error);
        throw error;
    }
}