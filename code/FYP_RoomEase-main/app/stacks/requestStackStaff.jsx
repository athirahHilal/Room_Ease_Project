// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, createStackNavigator), StaffRequest, HistoryRequestChange
// Description:
//              - This RequestStackStaff is a React Native component defining a navigation 
//                stack for staff request-related screens in the RoomEase Portal mobile application.
//              - Configures screens for submitting staff room change requests and viewing 
//                request history with custom titles.
//              - Sets the initial route to the StaffRequest screen.

// Imports necessary libraries for the component.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StaffRequest from '../screens/staffRequest';
import HistoryRequestChange from '../screens/historyRequestChange';

// Creates a stack navigator instance.
const Stack = createStackNavigator();

// Main component defining the staff request navigation stack.
const RequestStackStaff = () => {
  // Renders the navigation stack with staff request-related screens.
  return (
    <Stack.Navigator initialRouteName="StaffRequest">
      <Stack.Screen 
        name="StaffRequest" 
        component={StaffRequest} 
        options={{ title: "Staff Request Form" }} 
      />
      <Stack.Screen 
        name="RequestHistory" 
        component={HistoryRequestChange} 
        options={{ title: "Request History" }} 
      />
    </Stack.Navigator>
  );
};

export default RequestStackStaff;