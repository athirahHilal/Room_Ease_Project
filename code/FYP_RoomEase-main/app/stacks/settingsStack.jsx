// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, createStackNavigator), SettingsScreen, FAQScreen, UserManualScreen, AboutScreen
// Description:
//              - This SettingsStack is a React Native component defining a navigation 
//                stack for settings-related screens in the RoomEase Portal mobile application.
//              - Configures screens for settings, FAQ, user manual, and about pages with 
//                custom titles.
//              - Sets the initial route to the Settings screen.

// Imports necessary libraries for the component.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/setting';
import FAQScreen from '../screens/faq';
import UserManualScreen from '../screens/userManual';
import AboutScreen from '../screens/about'; 

// Creates a stack navigator instance.
const Stack = createStackNavigator();

// Main component defining the settings navigation stack.
const SettingsStack = () => {
  // Renders the navigation stack with settings-related screens.
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="FAQ" 
        component={FAQScreen} 
        options={{ title: 'FAQ' }}
      />
      <Stack.Screen 
        name="UserManual" 
        component={UserManualScreen} 
        options={{ title: 'User Manual' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'About' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStack;