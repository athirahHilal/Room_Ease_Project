// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, StyleSheet, FlatList), Colors
// Description:
//              - This FAQScreen is a React Native component serving as a screen 
//                to display a list of frequently asked questions in the RoomEase 
//                Portal mobile application.
//              - Filters FAQ items based on user role (staff or non-staff) from 
//                navigation parameters and renders them in a FlatList.
//              - Includes questions and answers about staff profiles, room changes, 
//                navigation, and contacting administrators.

// Imports necessary libraries for the component.
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../styles/theme';

// Main component handling the FAQ screen logic and rendering.
const FAQScreen = ({ route }) => {
  // Extracts staff status from navigation parameters, defaults to false.
  const isStaff = route?.params?.isStaff || false;

  // Array of FAQ data with questions and answers.
  const faqData = [
    { 
      id: '1', 
      question: 'How do I search for a staff profile?', 
      answer: 'From the home screen, tap the "Staff" button. You can filter by department or use the search bar to find a staff member by name.' 
    },
    { 
      id: '2', 
      question: 'How long does a room change request typically take to process?', 
      answer: 'The process usually takes up to one week.' 
    },
    { 
      id: '3', 
      question: 'How do I request a room change?', 
      answer: 'From the home screen, tap the "Rooms" button. Use the search bar to find your desired room, then tap "Request" if it’s available.', 
      staffOnly: true 
    },
    { 
      id: '4', 
      question: 'How do I use the navigation feature?', 
      answer: 'On the home screen, tap the "Directions" button. This will open the UPTM 3D map, where you can search for a room and get directions from your current location to your destination.' 
    },
    { 
      id: '5', 
      question: 'How can I contact an administrator?', 
      answer: 'Visit the ground floor administrator room and ask for Mr. Ridzuan at the counter. Alternatively, locate the admin room using the system map. 😊' 
    },
  ];

  // Filters FAQs to show staff-only questions only to staff users.
  const filteredFAQ = faqData.filter(item => !item.staffOnly || isStaff);

  // Renders individual FAQ item with question and answer.
  const renderFAQ = ({ item }) => (
    <View style={styles.faqItem}>
      <Text style={styles.question}>{item.question}</Text>
      <Text style={styles.answer}>{item.answer}</Text>
    </View>
  );

  // Renders the screen UI with a FlatList of FAQ items.
  return (
    <FlatList
      data={filteredFAQ}
      renderItem={renderFAQ}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  faqItem: {
    backgroundColor: '#fff', 
    borderRadius: 10,      
    padding: 15,            
    marginBottom: 15,  
    shadowColor: '#000',   
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,       
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  answer: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
});

export default FAQScreen;