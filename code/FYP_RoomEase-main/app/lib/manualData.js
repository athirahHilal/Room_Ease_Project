// app/lib/manualData.js
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: None (imports local image assets)
// Description: 
//              - This module defines the first-login tutorial content for the RoomEase Portal 
//                mobile application.
//              - Provides a base manual with common steps and role-specific manuals for students 
//                and staff/admin roles.
//              - Includes descriptions and images for each tutorial step to guide users through 
//                key app features.
//              - Exports a function to generate role-specific tutorial data.

// Imports image assets for tutorial steps.
import staffImage from '../assets/manual/staff.png';
import requestImage from '../assets/manual/request.png';
import navigationImage from '../assets/manual/direction.png';
import roomImage from '../assets/manual/room.png';
import homeImage from '../assets/manual/home.png';
import notificationImage from '../assets/manual/notification.png';
import profileImage from '../assets/manual/profile.png';

// Defines the base manual content with common tutorial steps.
const baseManual = {
  title: "Welcome to RoomEase Portal!",
  intro: "Let’s dive into a quick tour of the app’s key features to help you get started with confidence!",
  steps: {
    home: {
      title: "Home Screen",
      description: "This is your central hub where you can access all the main actions and features of the app effortlessly.",
      image: homeImage,
    },
    staff: {
      title: "Staff Directory",
      description: "Easily search for staff members by name or filter to find their contact details and connect quickly.",
      image: staffImage,
    },
    request: {
      title: "Request Change",
      description: "Submit a request to change your room assignment—available only for staff and admins to manage updates smoothly.",
      image: requestImage,
    },
    direction: {
      title: "Directions",
      description: "Navigate the facility using interactive 3D maps to find your way around with ease and precision.",
      image: navigationImage,
    },
    room: {
      title: "Room Info",
      description: "Quickly find available rooms, check their status, and book them directly from this handy feature.",
      image: roomImage,
    },
    notification: {
      title: "Notifications",
      description: "Stay updated with real-time alerts and important announcements to never miss a critical update.",
      image: notificationImage,
    },
    profile: {
      title: "Profile",
      description: "Manage your account and enhance security by updating your password regularly in this personal settings area.",
      image: profileImage,
    },
  },
};

// Generates role-specific tutorial manuals based on user role.
export const firstLoginManual = (role) => {
  // Returns a student-specific manual with limited steps.
  if (role === 'student') {
    return {
      ...baseManual,
      steps: [
        {
          ...baseManual.steps.staff,
          description: "Search for staff by name to view their room or email address for quick contact.",
        },
        baseManual.steps.direction,
        {
          ...baseManual.steps.room,
          description: "View a list of staff assigned to a selected room.",
        },
      ],
    };
  }
  // Returns the full manual for staff/admin roles.
  return {
    ...baseManual,
    steps: [
      baseManual.steps.home,
      baseManual.steps.staff,
      baseManual.steps.request,
      baseManual.steps.direction,
      baseManual.steps.room,
      baseManual.steps.notification,
      baseManual.steps.profile,
    ],
  };
};