// app/lib/emailTemplate.js
// Programmer Name: Nur Athirah Binti Hilalluddin
// Course: Diploma in Computer Science
// Contact: kl2307013911@student.uptm.edu.my
// Dependencies: None
// Description: 
//              - This module provides HTML email templates for various notifications in the 
//                RoomEase Portal mobile application.
//              - Includes templates for staff transfer, registration, room assignment, staff 
//                room change requests, and transfer request outcomes.
//              - Each template is styled with inline CSS for consistent formatting and includes 
//                dynamic data insertion for personalized emails.

// Defines the staff transfer email template with dynamic content.
export const transferEmailTemplate = (staffName, currentRoomName, newRoomName, transferReason, facultyDescription) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Staff Transfer Notification</h2>
        </div>
        <div class="content">
          <p>Peace be upon you.</p>
          <p>Dear ${staffName},</p>
          <p>On behalf of the RoomEase Portal administration, we wish to inform you that you have been transferred to a new room as per the following details:</p>
          <ul>
            <li><strong>From:</strong> ${currentRoomName}</li>
            <li><strong>To:</strong> ${newRoomName}</li>
            <li><strong>Reason for Transfer:</strong> ${transferReason || 'Not specified'}</li>
          </ul>
          <p>If you have any further inquiries, please contact the administration office at Level G, administrator’s room.</p>
          <p>Thank you.</p>
          <p>"MALAYSIA MADANI"<br>
          "BERKHIDMAT UNTUK NEGARA"<br>
          "LUAR BANDAR SEJAHTERA"<br>
          Yours faithfully,</p>
          <p>${staffName}<br>
          Lecturer<br>
          ${facultyDescription || 'N/A'}<br>
          Universiti Poly-Tech Malaysia (UPTM)<br>
          Jalan 6/91 Taman Shamelin Perkasa<br>
          56100 Cheras, Kuala Lumpur</p>
          <p>"TRUSTWORTHY, SYNERGISTIC AND CARING"</p>
        </div>
        <div class="footer">
          <p>RoomEase Portal | Universiti Poly-Tech Malaysia | © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Defines the staff registration email template with dynamic content.
export const registrationEmailTemplate = (staffName, departmentName, facultyName, facultyDescription) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #2196F3; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Welcome to RoomEase Portal</h2>
        </div>
        <div class="content">
          <p>Peace be upon you.</p>
          <p>Dear ${staffName},</p>
          <p>We are pleased to inform you that you have been successfully registered in the RoomEase Portal with the following details:</p>
          <ul>
            <li><strong>Department:</strong> ${departmentName}</li>
            <li><strong>Faculty:</strong> ${facultyName || 'Not applicable'}</li>
          </ul>
          <p>Please contact the administration office at Level G, administrator’s room to obtain your login details. Should you have any questions, feel free to reach out to us.</p>
          <p>Thank you.</p>
          <p>"MALAYSIA MADANI"<br>
          "BERKHIDMAT UNTUK NEGARA"<br>
          "LUAR BANDAR SEJAHTERA"<br>
          Yours faithfully,</p>
          <p>${staffName}<br>
          Lecturer<br>
          ${facultyDescription || 'N/A'}<br>
          Universiti Poly-Tech Malaysia (UPTM)<br>
          Jalan 6/91 Taman Shamelin Perkasa<br>
          56100 Cheras, Kuala Lumpur</p>
          <p>"TRUSTWORTHY, SYNERGISTIC AND CARING"</p>
        </div>
        <div class="footer">
          <p>RoomEase Portal | Universiti Poly-Tech Malaysia | © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Defines the room assignment email template with dynamic content.
export const roomAssignmentEmailTemplate = (staffName, selectedRoomName, facultyDescription) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #FF9800; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Room Assignment Notification</h2>
        </div>
        <div class="content">
          <p>Peace be upon you.</p>
          <p>Dear ${staffName},</p>
          <p>We wish to inform you that you have been assigned to a new room as follows:</p>
          <ul>
            <li><strong>Room:</strong> ${selectedRoomName}</li>
          </ul>
          <p>If you have any further inquiries, please contact the administration office at Level G, administrator’s room.</p>
          <p>Thank you.</p>
          <p>"MALAYSIA MADANI"<br>
          "BERKHIDMAT UNTUK NEGARA"<br>
          "LUAR BANDAR SEJAHTERA"<br>
          Yours faithfully,</p>
          <p>${staffName}<br>
          Lecturer<br>
          ${facultyDescription || 'N/A'}<br>
          Universiti Poly-Tech Malaysia (UPTM)<br>
          Jalan 6/91 Taman Shamelin Perkasa<br>
          56100 Cheras, Kuala Lumpur</p>
          <p>"TRUSTWORTHY, SYNERGISTIC AND CARING"</p>
        </div>
        <div class="footer">
          <p>RoomEase Portal | Universiti Poly-Tech Malaysia | © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Defines the staff room change request email template with dynamic content.
export const staffRequestEmailTemplate = (staffName, currentRoomName, roomName, adminName, staffPhoneNo, staffEmail) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #F44336; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Staff Room Change Request</h2>
        </div>
        <div class="content">
          <p>Peace be upon you.</p>
          <p>To the Administrator,</p>
          <p>We wish to inform you that a staff member has submitted a request for a room change as follows:</p>
          <ul>
            <li><strong>Staff Name:</strong> ${staffName}</li>
            <li><strong>Current Room:</strong> ${currentRoomName}</li>
            <li><strong>Requested Room:</strong> ${roomName}</li>
          </ul>
          <p>Please review this request in the RoomEase Portal for further action.</p>
          <p>If you have any further inquiries, please contact the staff:</p>
          <ul>
            <li><strong>Phone Number:</strong> ${staffPhoneNo || 'Not available'}</li>
            <li><strong>Email:</strong> ${staffEmail || 'Not available'}</li>
          </ul>
          <p>Thank you.</p>
          <p>"MALAYSIA MADANI"<br>
          "BERKHIDMAT UNTUK NEGARA"<br>
          "LUAR BANDAR SEJAHTERA"<br>
          Yours faithfully,</p>
          <p>${adminName}<br>
          Assistant Manager<br>
          Asset & Logistic<br>
          Administrator & Asset Management<br>
          Universiti Poly-Tech Malaysia (UPTM)<br>
          Jalan 6/91 Taman Shamelin Perkasa<br>
          56100 Cheras, Kuala Lumpur</p>
          <p>"TRUSTWORTHY, SYNERGISTIC AND CARING"</p>
        </div>
        <div class="footer">
          <p>RoomEase Portal | Universiti Poly-Tech Malaysia | © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Defines the transfer request outcome email template with dynamic content.
export const transferOutcomeEmailTemplate = (staffName, currentRoomName, transferRoomName, status, facultyDescription) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: ${status === 'approved' ? '#4CAF50' : '#F44336'}; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Transfer Request Outcome</h2>
        </div>
        <div class="content">
          <p>Peace be upon you.</p>
          <p>Dear ${staffName},</p>
          <p>We wish to inform you of the outcome of your room transfer request as follows:</p>
          <ul>
            <li><strong>Current Room:</strong> ${currentRoomName}</li>
            <li><strong>Requested Room:</strong> ${transferRoomName}</li>
            <li><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</li>
          </ul>
          <p>${
            status === 'approved'
              ? 'Your transfer has been approved. You may now use your new room.'
              : 'Please contact the administration office at Level G, administrator’s room if you have any further inquiries.'
          }</p>
          <p>Thank you.</p>
          <p>"MALAYSIA MADANI"<br>
          "BERKHIDMAT UNTUK NEGARA"<br>
          "LUAR BANDAR SEJAHTERA"<br>
          Yours faithfully,</p>
          <p>${staffName}<br>
          Lecturer<br>
          ${facultyDescription || 'N/A'}<br>
          Universiti Poly-Tech Malaysia (UPTM)<br>
          Jalan 6/91 Taman Shamelin Perkasa<br>
          56100 Cheras, Kuala Lumpur</p>
          <p>"TRUSTWORTHY, SYNERGISTIC AND CARING"</p>
        </div>
        <div class="footer">
          <p>RoomEase Portal | Universiti Poly-Tech Malaysia | © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};