// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, createStackNavigator), StaffScreen, FacultyUserList, StaffProfile, Transfer, TimetableScreen
// Description:
//              - This StaffStack is a React Native component defining a navigation 
//                stack for staff-related screens in the RoomEase Portal mobile application.
//              - Configures screens for browsing staff, viewing faculty user lists, 
//                staff profiles, transferring rooms, and timetables with custom titles 
//                where specified.
//              - Sets the initial route to the Staff screen.

// Imports necessary libraries for the component.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StaffScreen from '../screens/staff';
import FacultyUserList from '../screens/facultyUserList';
import StaffProfile from '../screens/staffProfile'; 
import Transfer from '../screens/transfer'; 
import TimetableScreen from '../screens/timetable';

// Creates a stack navigator instance.
const Stack = createStackNavigator();

// Main component defining the staff navigation stack.
const StaffStack = () => {
  // Renders the navigation stack with staff-related screens.
  return (
    <Stack.Navigator>
      <Stack.Screen name="Staff" component={StaffScreen} />
      <Stack.Screen name="FacultyUserList" component={FacultyUserList} options={{ title: "Faculty" }}/>
      <Stack.Screen name="StaffProfile" component={StaffProfile} options={{ title: "Staff Profile" }}/> 
      <Stack.Screen name="Transfer" component={Transfer} options={{ title: "Transfer Room" }}/> 
      <Stack.Screen name="TimetableScreen" component={TimetableScreen} options={{ title: "Timetable" }}/>
    </Stack.Navigator>
  );
};

export default StaffStack;