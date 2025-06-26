// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, createStackNavigator), ReqScreen, RequestForm, ApproveForm, RejectForm
// Description:
//              - This RequestStack is a React Native component defining a navigation 
//                stack for request-related screens in the RoomEase Portal mobile application.
//              - Configures screens for viewing requests, request details, approved requests, 
//                and rejected requests with custom titles.
//              - Sets the initial route to the Request screen.

// Imports necessary libraries for the component.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ReqScreen from '../screens/request';
import RequestForm from '../screens/requestForm';
import ApproveForm from '../screens/approvedForm';
import RejectForm from '../screens/rejectedForm';

// Creates a stack navigator instance.
const Stack = createStackNavigator();

// Main component defining the request navigation stack.
const RequestStack = () => {
  // Renders the navigation stack with request-related screens.
  return (
    <Stack.Navigator initialRouteName="Request">
      <Stack.Screen name="Request" component={ReqScreen} options={{ title: "Request" }} />
      <Stack.Screen name="RequestForm" component={RequestForm} options={{ title: "Request Form" }} />
      <Stack.Screen name="ApproveForm" component={ApproveForm} options={{ title: "Approved Form" }} />
      <Stack.Screen name="RejectForm" component={RejectForm} options={{ title: "Rejected Form" }} />
    </Stack.Navigator>
  );
};

export default RequestStack;