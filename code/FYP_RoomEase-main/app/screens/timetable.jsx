// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, StyleSheet, ActivityIndicator, Dimensions, Image), ImageZoom, fetchTimetable
// Description:
//              - This TimetableScreen is a React Native component serving as a screen 
//                to display a staff member’s timetable in the RoomEase Portal mobile application.
//              - Fetches timetable data for a specific user and displays it as a zoomable image.
//              - Handles loading, error states, and cases where no timetable is available.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Image } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { fetchTimetable } from '../lib/services/staffService';

// Main component handling the timetable screen logic and rendering.
const TimetableScreen = ({ route }) => {
  // Extracts user ID from navigation parameters.
  const { userId } = route.params;
  // State to store timetable data.
  const [timetableData, setTimetableData] = useState(null);
  // State to manage loading indicator.
  const [loading, setLoading] = useState(true);
  // State to handle error messages.
  const [error, setError] = useState(null);

  // Get screen dimensions for responsive design.
  const { width, height } = Dimensions.get('window');

  // Effect to fetch timetable data on component mount or user ID change.
  useEffect(() => {
    // Async function to load timetable data.
    const loadTimetable = async () => {
      // Show loading indicator.
      setLoading(true);
      try {
        // Fetch timetable data for the user.
        const data = await fetchTimetable(userId);
        // Update timetable data state.
        setTimetableData(data);
      } catch (err) {
        // Set error message for display.
        setError('Failed to load timetable. Please try again.');
        // Log error for debugging.
        console.error(err);
      } finally {
        // Hide loading indicator.
        setLoading(false);
      }
    };
    // Execute fetch function.
    loadTimetable();
  }, [userId]);

  // Conditional rendering for loading state.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Conditional rendering for error state.
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Conditional rendering if no timetable data is available.
  if (!timetableData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No timetable data available</Text>
      </View>
    );
  }

  // Renders the screen UI with timetable image or no-timetable message.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{timetableData.name}</Text>
      {timetableData.timetable !== 'No Timetable Available' ? (
        <View style={styles.imageContainer}>
          <ImageZoom
            cropWidth={width}
            cropHeight={height - 100} // Adjust for title and padding
            imageWidth={width * 0.9}
            imageHeight={height * 0.8}
            enableSwipeDown={false}
          >
            <Image
              source={{ uri: timetableData.timetable }}
              style={styles.timetableImage}
              resizeMode="contain"
            />
          </ImageZoom>
        </View>
      ) : (
        <Text style={styles.noTimetableText}>No Timetable Available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 18, 
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center', 
    width: '100%', 
  },
  timetableImage: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  noTimetableText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default TimetableScreen;