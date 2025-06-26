// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, StyleSheet, WebView)
// Description:
//              - This LocationScreen is a React Native component serving as a screen 
//                to display an embedded interactive map in the RoomEase Portal 
//                mobile application.
//              - Uses WebView to load a MappedIn map from a specific URL, enabling 
//                navigation features for users.

// Imports necessary libraries for the component.
import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

// Main component handling the location screen logic and rendering.
const LocationScreen = () => {
  // Renders the screen UI with an embedded WebView for the map.
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: "https://app.mappedin.com/map/67c27d4cf724c8000b05f0f7?embedded=true" }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default LocationScreen;