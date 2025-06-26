// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, createStackNavigator), LocationScreen
// Description:
//              - This LocationStack is a React Native component defining a navigation 
//                stack for the location-related screens in the RoomEase Portal mobile application.
//              - Configures a single screen for the LocationScreen with a custom title 
//                and visible header.

// Imports necessary libraries for the component.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LocationScreen from '../screens/location';

// Creates a stack navigator instance.
const Stack = createStackNavigator();

// Main component defining the location navigation stack.
const LocationStack = () => {
  // Renders the navigation stack with the Location screen.
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Location"  // Changed from "LocationStack"
        component={LocationScreen}
        options={{ title: 'Direction', headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default LocationStack;