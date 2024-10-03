// utils/googleDrive.js
const { google } = require('googleapis');


const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Upload a file to Google Drive.
 * @param {Object} file - The file to upload.
 * @returns {string} - The file ID of the uploaded file.
 */
const uploadFile = async (file) : Promise<string> => {
  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      mimeType: 'application/pdf',
      parents: ['EMP_Course_project'], // Specify the folder ID if needed
    },
    media: {
      mimeType: file.mimetype,
      body: file.buffer, // The buffer from the uploaded file
    },
  });

  return `https://drive.google.com/uc?id=${response.data.id}`; // Return the ID of the uploaded file
}

module.exports = {
  uploadFile
};