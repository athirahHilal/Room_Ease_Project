// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, createStackNavigator), RoomScreen, RoomUserList, AssignedRoom, StaffProfile, TimetableScreen
// Description:
//              - This RoomStack is a React Native component defining a navigation 
//                stack for room-related screens in the RoomEase Portal mobile application.
//              - Configures screens for browsing rooms, viewing room user lists, assigning 
//                rooms, staff profiles, and timetables with custom titles where specified.
//              - Sets the initial route to the Room screen.

// Imports necessary libraries for the component.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RoomScreen from '../screens/room';
import RoomUserList from '../screens/roomUserList';
import AssignedRoom from '../screens/assignedRoom';
import StaffProfile from '../screens/staffProfile';
import TimetableScreen from '../screens/timetable';

// Creates a stack navigator instance.
const Stack = createStackNavigator();

// Main component defining the room navigation stack.
const RoomStack = () => {
  // Renders the navigation stack with room-related screens.
  return (
    <Stack.Navigator>
      <Stack.Screen name="Room" component={RoomScreen} />
      <Stack.Screen name="RoomUserList" component={RoomUserList} options={{ title: "Staff Room" }}/>
      <Stack.Screen name="AssignedRoom" component={AssignedRoom} options={{ title: "" }}/>
      <Stack.Screen name="StaffProfile" component={StaffProfile} options={{ title: "Staff Profile" }}/> 
      <Stack.Screen name="TimetableScreen" component={TimetableScreen} options={{ title: "Timetable" }}/>
    </Stack.Navigator>
  );
};

export default RoomStack;