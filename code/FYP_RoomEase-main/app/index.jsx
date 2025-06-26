// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, NavigationContainer, useNavigationContainerRef), AppLayout
// Description:
//              - This App is the root React Native component serving as the entry point 
//                for the RoomEase Portal mobile application.
//              - Sets up the navigation container and passes a navigation reference 
//                to the AppLayout component for managing app-wide navigation.

// Imports necessary libraries for the component.
import React from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import AppLayout from './_layout';

// Main component defining the app’s entry point.
const App = () => {
  // Creates a navigation reference for app-wide navigation control.
  const navigationRef = useNavigationContainerRef();

  // Renders the navigation container with the app layout.
  return (
    <NavigationContainer ref={navigationRef}>
      <AppLayout navigationRef={navigationRef} />
    </NavigationContainer>
  );
};

export default App;