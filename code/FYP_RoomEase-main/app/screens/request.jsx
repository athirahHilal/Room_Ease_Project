// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: React Native (React, View, Text, TouchableOpacity, FlatList, StyleSheet), fetchStatus, Entypo, useNavigation, useFocusEffect, useCallback
// Description:
//              - This ReqScreen is a React Native component serving as a screen 
//                to display room transfer requests filtered by status (pending, approved, rejected) 
//                in the RoomEase Portal mobile application.
//              - Fetches transfer data based on selected status and groups it by date 
//                for display in a FlatList.
//              - Allows navigation to request details based on the status of the transfer.

// Imports necessary libraries for the component.
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { fetchStatus } from '../lib/services/transferService';
import { Entypo } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

// Main component handling the request screen logic and rendering.
const ReqScreen = () => {
  // State to store the current status filter (pending, approved, rejected).
  const [status, setStatus] = useState('pending');
  // State to store the list of transfer requests.
  const [transferList, setTransferList] = useState([]);
  // Hook to access navigation functionality.
  const navigation = useNavigation();

  // Function to fetch transfer requests based on status.
  const getTransfers = async () => {
    // Fetch data for the current status.
    const data = await fetchStatus(status);
    // Update transfer list state.
    setTransferList(data);
  };

  // Effect to fetch transfers when status changes.
  useEffect(() => {
    // Execute fetch function.
    getTransfers();
  }, [status]);

  // Effect to refetch transfers when screen gains focus.
  useFocusEffect(
    useCallback(() => {
      // Execute fetch function.
      getTransfers();
    }, [status])
  );

  // Handler for selecting a user and navigating to the appropriate form.
  const handleSelectUser = (user) => {
    // Log selected user for debugging.
    console.log('Selected User:', user);
    // Navigate based on status.
    if (status === 'pending') {
      navigation.navigate('RequestForm', { user, recordId: user.id });
    } else if (status === 'approved') {
      navigation.navigate('ApproveForm', { user, recordId: user.id });
    } else if (status === 'rejected') {
      navigation.navigate('RejectForm', { user, recordId: user.id });
    }
  };

  // Function to determine button color based on status.
  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return status === 'pending' ? '#FFA500' : '#E0E0E0';
      case 'approved':
        return status === 'approved' ? '#228B22' : '#E0E0E0';
      case 'rejected':
        return status === 'rejected' ? '#e74c3c' : '#E0E0E0';
      default:
        return '#E0E0E0';
    }
  };

  // Function to group transfer data by date.
  const groupByDate = (data) => {
    // Group data by formatted date.
    const grouped = data.reduce((acc, item) => {
      const date = new Date(item.date).toLocaleDateString('en-GB');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Transform and sort grouped data.
    return Object.entries(grouped)
      .map(([date, items]) => ({
        date,
        data: items.sort((a, b) => new Date(b.date) - new Date(a.date)),
      }))
      .sort((a, b) => {
        // Sort dates in descending order.
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateB - dateA;
      });
  };

  // Function to format time for display.
  const formatTime = (dateString) => {
    // Format date string to time with AM/PM.
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Group transfer data by date for rendering.
  const groupedData = groupByDate(transferList);

  // Renders the screen UI with status buttons and grouped transfer list.
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {['pending', 'approved', 'rejected'].map((item) => (
          // Button for each status filter
          <TouchableOpacity
            key={item}
            onPress={() => setStatus(item)}
            style={[styles.statusButton, { backgroundColor: getStatusColor(item) }]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: status === item ? '#FFFFFF' : '#555555' },
              ]}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          // Section for each date
          <View style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            {item.data.map((transfer) => (
              // Touchable item for each transfer
              <TouchableOpacity
                key={transfer.id}
                style={styles.listItem}
                onPress={() => handleSelectUser(transfer)}
              >
                <View style={styles.itemContent}>
                  <Text style={styles.nameText}>{transfer.name}</Text>
                  <Text style={styles.timeText}>{formatTime(transfer.date)}</Text>
                </View>
                <Entypo name="dots-three-vertical" size={18} color="#555555" />
              </TouchableOpacity>
            ))}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No {status} transfer requests found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateSection: {
    marginBottom: 20,
  },
  dateHeader: {
    backgroundColor: '#EDEFF2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333333',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 4, // Space between name and time
  },
  timeText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '400',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#666666',
  },
});

export default ReqScreen;