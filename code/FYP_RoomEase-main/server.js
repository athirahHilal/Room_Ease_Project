const express = require('express');
const sgMail = require('@sendgrid/mail');
const { transferEmailTemplate, registrationEmailTemplate, roomAssignmentEmailTemplate, staffRequestEmailTemplate, transferOutcomeEmailTemplate } = require('./app/lib/emailTemplate/emailTemplate');
const path = require('path');
const os = require('os');

const app = express();

sgMail.setApiKey('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');

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'app/assets')));

app.post('/send-email', async (req, res) => {
  const { 
    to, 
    subject, 
    text, 
    staffName, 
    currentRoomName, 
    newRoomName, 
    transferReason, 
    departmentName, 
    facultyName, 
    selectedRoomName, 
    roomName, 
    transferRoomName, 
    status, 
    facultyDescription, 
    staffPhoneNo, 
    staffEmail, 
    adminName 
  } = req.body;

  let html;
  if (currentRoomName && newRoomName) {
    html = transferEmailTemplate(staffName, currentRoomName, newRoomName, transferReason, facultyDescription);
  } else if (departmentName) {
    html = registrationEmailTemplate(staffName, departmentName, facultyName, facultyDescription);
  } else if (selectedRoomName) {
    html = roomAssignmentEmailTemplate(staffName, selectedRoomName, facultyDescription);
  } else if (roomName) {
    html = staffRequestEmailTemplate(staffName, currentRoomName, roomName, adminName, staffPhoneNo, staffEmail);
  } else if (transferRoomName && status) {
    html = transferOutcomeEmailTemplate(staffName, currentRoomName, transferRoomName, status, facultyDescription);
  } else {
    return res.status(400).send('Invalid email type');
  }

  const msg = {
    to,
    from: 'keyboardmahal02@gmail.com',
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent to:', to);
    res.status(200).send('Email sent');
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error);
    res.status(500).send('Email failed');
  }
});

// Get the local IP address
function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const devName in networkInterfaces) {
    const iface = networkInterfaces[devName];
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  return 'localhost';
}

const PORT = 3000;
const HOST = getLocalIP();

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});