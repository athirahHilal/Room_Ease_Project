// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, createStackNavigator, createBottomTabNavigator, StyleSheet, ActivityIndicator, View, TouchableOpacity, Keyboard), Ionicons, AsyncStorage, authService, Colors, Login, HomeScreen, NotificationScreen, ProfileScreen, RoomStack, RequestStack, RequestStackStaff, StaffStack, LocationStack, SettingsStack
// Description:
//              - This AppLayout is a React Native component defining the main navigation 
//                structure for the RoomEase Portal mobile application.
//              - Manages authentication state and conditionally renders a tab navigator 
//                with home, notification, and profile stacks or a login screen.
//              - Integrates multiple stacks for rooms, requests, staff, location, and settings, 
//                with a custom bottom tab bar and loading state.

// Imports necessary libraries for the component.
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, ActivityIndicator, View, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from './lib/services/auth';
import { Colors } from './styles/theme';

// Screens
import Login from './screens/login';
import HomeScreen from './(tabs)/home';
import NotificationScreen from './(tabs)/notification';
import ProfileScreen from './(tabs)/profile';

// Stacks
import RoomStack from './stacks/roomStack';
import RequestStack from './stacks/requestStack';
import RequestStackStaff from './stacks/requestStackStaff';
import StaffStack from './stacks/staffStack';
import LocationStack from './stacks/locationStack';
import SettingsStack from './stacks/settingsStack'; 

// Creates a stack navigator instance.
const Stack = createStackNavigator();
// Creates a bottom tab navigator instance.
const Tab = createBottomTabNavigator();

// Component defining the home stack navigator.
const HomeStack = ({ route }) => {
  // Log route parameters for debugging.
  console.log('HomeStack route.params:', route.params);
  // Renders the home stack with nested screens.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        initialParams={route.params?.params}
      />
      <Stack.Screen name="StaffStack" component={StaffStack} />
      <Stack.Screen name="RequestStack" component={RequestStack} />
      <Stack.Screen name="RequestStackStaff" component={RequestStackStaff} />
      <Stack.Screen name="RoomStack" component={RoomStack} />
    </Stack.Navigator>
  );
};

// Component defining the profile stack navigator.
const ProfileStack = () => {
  // Renders the profile stack with nested screens.
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SettingsStack" 
        component={SettingsStack} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Component defining the bottom tab navigator.
const TabNavigator = ({ user, route }) => {
  // Log user and route parameters for debugging.
  console.log('TabNavigator rendered with user:', user);
  console.log('TabNavigator route.params:', route.params);
  // Renders the tab navigator with home, notification, and profile tabs.
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          // Set icon based on tab route.
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          // Render tab icon with dynamic color.
          return <Ionicons name={iconName} size={size} color={focused ? Colors.primary : 'gray'} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.tabBar,
        keyboardShouldPersistTaps: 'handled', // Prevents keyboard interference
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ headerShown: false }} 
        initialParams={route.params}
      />
      <Tab.Screen 
        name="Notification" 
        component={NotificationScreen}
        options={{ headerShown: true, title: 'Notifications' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ headerShown: false }} // Hide Tab.Screen header
      />
    </Tab.Navigator>
  );
};

// Main component defining the app’s navigation layout.
const AppLayout = ({ navigationRef }) => {
  // State to track authentication status.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to manage loading indicator.
  const [isLoading, setIsLoading] = useState(true);
  // State to store current user data.
  const [user, setUser] = useState(null);

  // Function to check authentication status.
  const checkAuth = async () => {
    try {
      // Fetch current user data.
      const currentUser = await authService.getCurrentUser();
      // Log user data for debugging.
      console.log('Checking auth:', currentUser);
      // Update user state.
      setUser(currentUser);
      // Update authentication status.
      setIsAuthenticated(!!currentUser);
      return currentUser;
    } catch (error) {
      // Log error for debugging.
      console.error('Auth check error:', error);
      // Clear authentication status.
      setIsAuthenticated(false);
      // Clear user data.
      setUser(null);
      return null;
    }
  };

  // Effect to perform initial authentication check.
  useEffect(() => {
    // Async function for initial check.
    const initialCheck = async () => {
      // Check authentication status.
      await checkAuth();
      // Hide loading indicator.
      setIsLoading(false);
    };
    // Execute initial check.
    initialCheck();
  }, []);

  // Effect to listen for navigation state changes.
  useEffect(() => {
    // Check if navigation ref is available.
    if (!navigationRef || !navigationRef.current) {
      // Log warning if ref is not ready.
      console.log('Navigation ref not ready yet');
      return;
    }

    // Add listener for navigation state changes.
    const unsubscribe = navigationRef.current.addListener('state', async (e) => {
      // Log navigation state for debugging.
      console.log('Navigation state changed:', e.data.state.routes);
      // Check authentication status.
      await checkAuth();
    });

    // Clean up listener on unmount.
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigationRef]);

  // Expose checkAuth function via navigation ref.
  React.useImperativeHandle(navigationRef, () => ({
    checkAuth,
  }));

  // Conditional rendering for loading state.
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Log authentication and user state for debugging.
  console.log('Is Authenticated:', isAuthenticated, 'User:', user);

  // Renders the main stack navigator based on authentication status.
  return (
    <Stack.Navigator initialRouteName={isAuthenticated ? 'Tabs' : 'Login'} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Tabs">
        {({ route, navigation }) => {
          // Extract user from route parameters or fallback to state.
          const routeUser = route.params?.user || route.params?.params?.user;
          const finalUser = routeUser || user;
          // Log rendering details for debugging.
          console.log('Rendering Tabs with:', { isAuthenticated, finalUser, routeParams: route.params });
          // Render tab navigator with user and route data.
          return <TabNavigator user={finalUser} route={route} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="LocationStack" component={LocationStack} />
    </Stack.Navigator>
  );
};

// Styles for the component.
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    paddingBottom: 10,
    paddingTop: 5,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerRight: {
    marginRight: 15,
  },
});

export default AppLayout;