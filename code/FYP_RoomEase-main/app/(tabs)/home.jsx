// app/screens/HomeScreen.jsx
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, useState, useEffect, useRef, View, StyleSheet, 
//              StatusBar, Text, TouchableOpacity, Dimensions, Image, ScrollView, Animated), 
//              @react-navigation/native (useNavigation), PocketBase (pb), custom modules 
//              (userService, firstLoginManual, Colors)
// Description: 
//              - This HomeScreen is a React Native component serving as the main interface 
//                for a mobile application.
//              - Dynamically displays navigation buttons (Staff, Request Change, Direction, 
//                Room) based on the user's role (admin, staff, or other).
//              - Fetches user role and profile data from a user service using PocketBase.
//              - Features a first-login tutorial with animated overlays, providing role-specific 
//                guidance through the app's functionalities.

// Imports necessary libraries and assets for the component.
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, Dimensions, Image, ScrollView, Animated } from 'react-native';
import { Colors } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import userService from '../lib/services/userService';
import pb from '../lib/pocketbase';
import { firstLoginManual } from '../lib/manualData';
import staffIcon from '../assets/staff.png';
import requestIcon from '../assets/request.png';
import navigationIcon from '../assets/navigation.png';
import roomIcon from '../assets/room.png';
import AppLogo from '../assets/logoUptm.png';

// Defines constants for layout calculations.
const { width, height } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 60;

// Main component handling the home screen logic and rendering.
const HomeScreen = () => {
  // Initializes navigation and state variables for user data and UI control.
  const navigation = useNavigation();
  const [userRole, setUserRole] = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetches user data on component mount to determine role and login status.
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await userService.fetchUserProfile();
        if (result.success) {
          setUserRole(result.data.role);
          setIsFirstLogin(result.data.isFirstLogin);
          setUserId(result.data.id);
          setShowTutorial(result.data.isFirstLogin);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Manages animation for tutorial visibility based on state changes.
  useEffect(() => {
    if (showTutorial) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showTutorial, currentStep]);

  // Handles navigation to different screens with optional parameters.
  const handleNavigation = (route, params = {}) => {
    navigation.navigate('Home', { screen: route, params });
  };

  // Advances the tutorial to the next step if available.
  const nextStep = () => {
    const manual = firstLoginManual(userRole);
    if (currentStep < manual.steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Moves the tutorial back to the previous step if possible.
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Completes the tutorial and updates user login status in the database.
  const completeTutorial = async () => {
    setShowTutorial(false);
    if (isFirstLogin) {
      try {
        await pb.collection('users').update(userId, { isFirstLogin: false });
        setIsFirstLogin(false);
      } catch (error) {
        console.error('Error updating isFirstLogin:', error);
      }
    }
  };

  // Skips the tutorial and marks it as complete.
  const skipTutorial = () => {
    setShowTutorial(false);
    completeTutorial();
  };

  // Renders a loading screen while user data is being fetched.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Defines button elements for navigation based on user role.
  const staffButton = (
    <TouchableOpacity
      style={styles.button}
      onPress={() => handleNavigation('StaffStack', { screen: 'Staff' })}
    >
      <Image source={staffIcon} style={styles.icon} />
      <Text style={styles.buttonText}>Staff</Text>
    </TouchableOpacity>
  );

  const requestChangeButton = (
    <TouchableOpacity
      style={styles.button}
      onPress={() =>
        handleNavigation(
          userRole === 'admin' ? 'RequestStack' : 'RequestStackStaff',
          { screen: userRole === 'admin' ? 'Request' : 'StaffRequest' }
        )
      }
    >
      <Image source={requestIcon} style={styles.icon} />
      <Text style={styles.buttonText}>Request Change</Text>
    </TouchableOpacity>
  );

  const directionButton = (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('LocationStack', { screen: 'Location' })}
    >
      <Image source={navigationIcon} style={styles.icon} />
      <Text style={styles.buttonText}>Direction</Text>
    </TouchableOpacity>
  );

  const roomButton = (
    <TouchableOpacity
      style={styles.button}
      onPress={() => handleNavigation('RoomStack', { screen: 'Room' })}
    >
      <Image source={roomIcon} style={styles.icon} />
      <Text style={styles.buttonText}>Room</Text>
    </TouchableOpacity>
  );

  // Determines button visibility based on user role and organizes them into rows.
  const canSeeRequestChange = userRole === 'admin' || userRole === 'staff';
  let row1Buttons = canSeeRequestChange ? [staffButton, requestChangeButton] : [staffButton, directionButton];
  let row2Buttons = canSeeRequestChange ? [directionButton, roomButton] : [roomButton];

  // Retrieves tutorial data specific to the user's role.
  const manual = firstLoginManual(userRole);

  // Renders the main UI with navigation buttons and optional tutorial overlay.
  return (
    <View style={styles.containerWrapper}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="black" />
          <Image source={AppLogo} style={styles.appLogo} resizeMode="contain" />
          
          <View style={styles.buttonRow}>
            {row1Buttons.map((button, index) => (
              <React.Fragment key={index}>{button}</React.Fragment>
            ))}
          </View>

          {row2Buttons.length > 0 && (
            <View style={styles.buttonRow}>
              {row2Buttons.map((button, index) => (
                <React.Fragment key={index}>{button}</React.Fragment>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Displays the tutorial overlay if active, with navigation controls */}
      {showTutorial && (
        <View style={styles.overlay}>
          <View style={styles.darkOverlay} />
          <Animated.View style={[styles.tutorialContainer, { opacity: fadeAnim }]}>
            {currentStep === 0 ? (
              <>
                <Text style={styles.tutorialTitle}>{manual.title}</Text>
                <Text style={styles.tutorialText}>{manual.intro}</Text>
              </>
            ) : (
              <>
                <Image
                  source={manual.steps[currentStep - 1].image}
                  style={styles.tutorialImage}
                />
                <Text style={styles.tutorialTitle}>{manual.steps[currentStep - 1].title}</Text>
                <Text style={styles.tutorialText}>{manual.steps[currentStep - 1].description}</Text>
              </>
            )}
            <View style={styles.progressBar}>
              {Array(manual.steps.length + 1).fill(0).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    { backgroundColor: i <= currentStep ? Colors.primary : '#ccc' },
                  ]}
                />
              ))}
            </View>
            <View style={styles.tutorialButtonRow}>
              {currentStep > 0 && (
                <TouchableOpacity style={styles.tutorialButton} onPress={prevStep}>
                  <Text style={styles.tutorialButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.tutorialButton}
                onPress={currentStep === manual.steps.length ? completeTutorial : nextStep}
              >
                <Text style={styles.tutorialButtonText}>
                  {currentStep === manual.steps.length ? 'Finish' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.skipButton} onPress={skipTutorial}>
              <Text style={styles.skipButtonText}>Skip Tutorial</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  appLogo: {
    width: 250,
    height: 250,
    marginBottom: -30,
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'white',
    width: width * 0.45,
    height: width * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 10,
    tintColor: Colors.primary,
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  tutorialContainer: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 12,
    maxHeight: height - TAB_BAR_HEIGHT - 60,
  },
  tutorialImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  tutorialText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    marginBottom: 25,
    lineHeight: 24,
  },
  tutorialButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginHorizontal: 15,
  },
  tutorialButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tutorialButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  skipButton: {
    marginTop: 15,
  },
  skipButtonText: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default HomeScreen;