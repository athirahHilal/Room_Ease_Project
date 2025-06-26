// app/screens/about.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, StyleSheet, Image), 
//              @expo/vector-icons (Ionicons), custom modules (Colors, AppLogo)
// Description: 
//              - This AboutScreen is a React Native component serving as the about page 
//                for the RoomEase Portal mobile application.
//              - Displays the application logo, developer information, course details, 
//                and build year.
//              - Includes a heart icon to convey appreciation and personalization.

// Imports necessary libraries and assets for the component.
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import AppLogo from '../assets/logoUptm.png';

const AboutScreen = () => {
  // Renders the about screen UI with logo, developer details, and build information.
  return (
    <View style={styles.container}>
      <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
      <View style={styles.content}>
        <Text style={styles.text}>
          Made with <Ionicons name="heart" size={16} color="red" /> by
        </Text>
        <Text style={styles.name}>Nur Athirah Binti Hilalluddin</Text>
        <Text style={styles.text}>Diploma in Computer Science (CC101)</Text>
        <Text style={styles.build}>Build 2025</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: Colors.primary,
    textAlign: 'center',
    marginVertical: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginVertical: 5,
  },
  build: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default AboutScreen;