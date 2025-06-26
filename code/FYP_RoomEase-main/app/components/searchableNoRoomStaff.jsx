// app/components/SearchableNoRoomStaff.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useEffect, useState, View, Text), 
//              react-native-dropdown-picker (DropDownPicker), 
//              custom modules (roomService)
// Description: 
//              - This SearchableNoRoomStaff is a React Native component providing a searchable 
//                dropdown for selecting staff members without assigned rooms in a mobile application.
//              - Fetches users without rooms using roomService and formats them for the dropdown.
//              - Notifies the parent component when a user is selected via a callback.
//              - Features a searchable dropdown for easy staff selection.

// Imports necessary libraries and components for the dropdown.
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { fetchNoRoomUser } from '../lib/services/roomService';

// Main component handling the searchable no-room staff dropdown logic and rendering.
const SearchableNoRoomStaff = ({ onSelectUser }) => {
  // Initializes state variables for users, dropdown open state, and selected value.
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);

  // Fetches users without assigned rooms on component mount.
  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchNoRoomUser();
      setUsers(fetchedUsers.map(user => ({ label: user.name, value: user.id })));
    };

    loadUsers();
  }, []);

  // Notifies parent component when a user is selected.
  useEffect(() => {
    if (value) {
      const selectedUser = users.find(user => user.value === value);
      onSelectUser(selectedUser);
    }
  }, [value]);

  // Renders the searchable dropdown UI for staff selection.
  return (
    <View>
      <DropDownPicker
        open={open}
        value={value}
        items={users}
        setOpen={setOpen}
        setValue={setValue}
        placeholder="Select Staff"
        searchable={true}
      />
    </View>
  );
};

export default SearchableNoRoomStaff;