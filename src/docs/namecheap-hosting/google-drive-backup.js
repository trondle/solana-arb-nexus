
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class GoogleDriveBackup {
  constructor(credentials) {
    this.auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  async uploadTradeLogs(logData, filename) {
    try {
      const fileMetadata = {
        name: filename,
        parents: ['your-drive-folder-id'] // Replace with your folder ID
      };

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(logData, null, 2)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      console.log('Trade log uploaded to Google Drive:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }

  async backupConfiguration(config, timestamp) {
    const filename = `config-backup-${timestamp}.json`;
    return this.uploadTradeLogs(config, filename);
  }

  async backupApiLogs(logs, timestamp) {
    const filename = `api-logs-${timestamp}.json`;
    return this.uploadTradeLogs(logs, filename);
  }

  async listBackups() {
    try {
      const response = await this.drive.files.list({
        pageSize: 20,
        fields: 'nextPageToken, files(id, name, createdTime)',
        q: "parents in 'your-drive-folder-id'" // Replace with your folder ID
      });

      return response.data.files;
    } catch (error) {
      console.error('Error listing backups:', error);
      throw error;
    }
  }

  async restoreBackup(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return JSON.parse(response.data);
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }
}

// Usage example
async function setupGoogleDriveBackup() {
  // Load credentials from environment or file
  const credentials = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token"
  };

  const backup = new GoogleDriveBackup(credentials);

  // Schedule daily backups
  setInterval(async () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Backup API logs
      const logData = await fs.readFile('api-relay.log', 'utf8');
      await backup.backupApiLogs({ logs: logData }, timestamp);
      
      console.log('Daily backup completed');
    } catch (error) {
      console.error('Daily backup failed:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours

  return backup;
}

module.exports = { GoogleDriveBackup, setupGoogleDriveBackup };
