// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: pocketbase (PocketBase)
// Description: 
//              - This module initializes and configures the PocketBase client for the 
//                RoomEase Portal mobile application.
//              - Sets up the API URL for the PocketBase backend server.
//              - Exports the configured PocketBase instance for use in other services.

// Imports the PocketBase library.
import PocketBase from 'pocketbase';

// Defines the API URL for the PocketBase backend server.
// const API_URL = 'XXXXXXXXXX'; 

// Initializes a new PocketBase instance with the specified API URL.
const pb = new PocketBase(API_URL);

// Exports the PocketBase instance as the default export.
export default pb;