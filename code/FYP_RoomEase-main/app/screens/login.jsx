// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, KeyboardAvoidingView, Platform, Keyboard), Ionicons, authService, Colors, NewStaffInfoModal
// Description:
//              - This Login is a React Native component serving as a screen 
//                for user authentication in the RoomEase Portal mobile application.
//              - Handles email and password input, keyboard visibility, and login 
//                functionality with error handling.
//              - Includes a modal for new staff information and navigates to the 
//                home screen upon successful login.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import authService from '../lib/services/auth';
import { Colors } from '../styles/theme';
import NewStaffInfoModal from '../components/newStaffInfo';

// Get screen dimensions for responsive design.
const { width, height } = Dimensions.get('window');

// Main component handling the login screen logic and rendering.
const Login = ({ navigation }) => {
  // State for email input.
  const [email, setEmail] = useState('');
  // State for password input.
  const [password, setPassword] = useState('');
  // State for error messages.
  const [error, setError] = useState('');
  // State for new staff info modal visibility.
  const [modalVisible, setModalVisible] = useState(false);
  // State to track keyboard visibility.
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Effect to handle keyboard show/hide events.
  useEffect(() => {
    // Listener for keyboard show event.
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Update keyboard visibility state.
        setKeyboardVisible(true);
      }
    );
    // Listener for keyboard hide event.
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Update keyboard visibility state.
        setKeyboardVisible(false);
      }
    );

    // Clean up listeners on component unmount.
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Function to handle login submission.
  const handleLogin = async () => {
    // Clear previous errors.
    setError(''); // Clear previous errors
    
    // Attempt login with provided credentials.
    const result = await authService.login(email, password);
    // Check if login was successful.
    if (result.success) {
      // Log user data for debugging.
      console.log('Navigating with user:', result.user);
      // Check authentication status.
      const navRef = navigation.getParent()?.getParent()?.checkAuth;
      if (navRef) await navRef();
      
      // Navigate to Tabs screen with user data.
      navigation.navigate('Tabs', { 
        screen: 'Home', 
        params: { 
          user: result.user,
          isFirstLogin: result.user.isFirstLogin // Add this
        } 
      });
    } else {
      // Set error message if login fails.
      setError(result.error);
    }
  };

  // Renders the screen UI with login form and modal.
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      {/* Logo and Title */}
      <View style={[styles.header, error ? styles.headerWithError : null]}>
        <Image 
          source={require('../assets/logoUptm.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>RoomEase Portal</Text>
      </View>

      {/* Blue container fixed at the bottom */}
      <View style={styles.blueContainer} />

      {/* White form container - adjust position when keyboard is visible */}
      <View style={[
        styles.formContainer, 
        keyboardVisible && Platform.OS === 'ios' ? styles.formContainerKeyboardVisible : null
      ]}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.defaultPasswordText}>Password: 12345678 (Default Password)</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.infoButtonText}>New Staff</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <NewStaffInfoModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.5 }, { translateY: -height * 0.35 }],
    alignItems: 'center',
    width: width,
  },
  headerWithError: {
    transform: [{ translateX: -width * 0.5 }, { translateY: -height * 0.45 }], // Shift upward when error appears
  },
  logo: {
    width: width * 0.8,
    height: height * 0.3,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  blueContainer: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    position: 'absolute',
    bottom: 0,
  },
  formContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.03,
  },
  formContainerKeyboardVisible: {
    bottom: height * 0.25, // Move up when keyboard is visible on iOS
    transition: 'all 0.3s ease',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
  },
  infoButton: {
    marginTop: 15,
  },
  infoButtonText: {
    color: Colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  defaultPasswordText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Login;