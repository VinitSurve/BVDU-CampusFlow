/**
 * Google Sheets Integration for BVDU CampusFlow
 * Handles attendance tracking and data synchronization
 */

// Google Sheets API Configuration
const GOOGLE_SHEETS_CONFIG = {
  apiKey: 'YOUR_GOOGLE_SHEETS_API_KEY', // Replace with your actual API key
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // Replace with your OAuth client ID
  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
};

// Attendance tracking state
let gapiInited = false;
let gisInited = false;
let tokenClient;
let accessToken = null;

/**
 * Initialize Google API client
 */
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Initialize Google API client for Sheets
 */
async function initializeGapiClient() {
  try {
    await gapi.client.init({
      apiKey: GOOGLE_SHEETS_CONFIG.apiKey,
      discoveryDocs: GOOGLE_SHEETS_CONFIG.discoveryDocs
    });
    gapiInited = true;
    console.log('Google Sheets API initialized');
  } catch (error) {
    console.error('Error initializing Google Sheets API:', error);
  }
}

/**
 * Initialize Google Identity Services
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_SHEETS_CONFIG.clientId,
    scope: GOOGLE_SHEETS_CONFIG.scopes,
    callback: '' // defined later
  });
  gisInited = true;
  console.log('Google Identity Services initialized');
}

/**
 * Authenticate user with Google
 * @returns {Promise<string>} Access token
 */
function authenticateUser() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        reject(resp);
      } else {
        accessToken = resp.access_token;
        resolve(accessToken);
      }
    };

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

/**
 * Create a new attendance spreadsheet for an event
 * @param {Object} eventData - Event information
 * @returns {Promise<Object>} Spreadsheet details
 */
async function createAttendanceSheet(eventData) {
  try {
    if (!gapiInited) {
      throw new Error('Google Sheets API not initialized');
    }

    // Create new spreadsheet
    const response = await gapi.client.sheets.spreadsheets.create({
      properties: {
        title: `${eventData.event_name} - Attendance - ${new Date().toLocaleDateString()}`
      },
      sheets: [
        {
          properties: {
            title: 'Attendance',
            gridProperties: {
              rowCount: 1000,
              columnCount: 10
            }
          }
        },
        {
          properties: {
            title: 'Summary',
            gridProperties: {
              rowCount: 100,
              columnCount: 5
            }
          }
        }
      ]
    });

    const spreadsheetId = response.result.spreadsheetId;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    // Set up headers
    await setupAttendanceHeaders(spreadsheetId, eventData);

    return {
      spreadsheetId,
      spreadsheetUrl,
      success: true
    };
  } catch (error) {
    console.error('Error creating attendance sheet:', error);
    throw error;
  }
}

/**
 * Set up headers for attendance sheet
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {Object} eventData - Event information
 */
async function setupAttendanceHeaders(spreadsheetId, eventData) {
  const headers = [
    ['Sr. No.', 'PRN', 'Student Name', 'Department', 'Year', 'Division', 'Check-in Time', 'Check-out Time', 'Status', 'Remarks']
  ];

  const summaryData = [
    ['Event Details'],
    ['Event Name', eventData.event_name],
    ['Event Type', eventData.event_type],
    ['Date', eventData.start_date],
    ['Venue', eventData.venue],
    [''],
    ['Statistics'],
    ['Total Registered', '0'],
    ['Present', '0'],
    ['Absent', '0'],
    ['Attendance Rate', '0%']
  ];

  try {
    // Update Attendance sheet headers
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Attendance!A1:J1',
      valueInputOption: 'RAW',
      resource: {
        values: headers
      }
    });

    // Format headers (bold, background color)
    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.26, green: 0.52, blue: 0.96 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 11,
                    bold: true
                  },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 10
              }
            }
          }
        ]
      }
    });

    // Update Summary sheet
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Summary!A1:B11',
      valueInputOption: 'RAW',
      resource: {
        values: summaryData
      }
    });

    // Format summary sheet
    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 1,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.66, blue: 0.33 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 12,
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          },
          {
            repeatCell: {
              range: {
                sheetId: 1,
                startRowIndex: 6,
                endRowIndex: 7
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.66, blue: 0.33 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 12,
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }
        ]
      }
    });

    console.log('Attendance sheet headers set up successfully');
  } catch (error) {
    console.error('Error setting up headers:', error);
    throw error;
  }
}

/**
 * Mark student attendance in Google Sheets
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {Object} studentData - Student attendance data
 * @returns {Promise<Object>} Update result
 */
async function markAttendance(spreadsheetId, studentData) {
  try {
    // Get current data to find next row
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Attendance!A:A'
    });

    const nextRow = response.result.values ? response.result.values.length + 1 : 2;

    const attendanceRow = [
      [
        nextRow - 1, // Sr. No.
        studentData.prn,
        studentData.full_name,
        studentData.department,
        studentData.year,
        studentData.division,
        new Date().toLocaleString(), // Check-in time
        '', // Check-out time (empty initially)
        'Present',
        studentData.remarks || ''
      ]
    ];

    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: `Attendance!A${nextRow}:J${nextRow}`,
      valueInputOption: 'RAW',
      resource: {
        values: attendanceRow
      }
    });

    // Update statistics
    await updateAttendanceStatistics(spreadsheetId);

    return {
      success: true,
      row: nextRow,
      message: 'Attendance marked successfully'
    };
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
}

/**
 * Mark check-out time for a student
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {string} prn - Student PRN
 * @returns {Promise<Object>} Update result
 */
async function markCheckOut(spreadsheetId, prn) {
  try {
    // Find the student's row
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Attendance!B:H'
    });

    const rows = response.result.values;
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === prn) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Student not found in attendance sheet');
    }

    // Update check-out time
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `Attendance!H${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[new Date().toLocaleString()]]
      }
    });

    return {
      success: true,
      message: 'Check-out time recorded successfully'
    };
  } catch (error) {
    console.error('Error marking check-out:', error);
    throw error;
  }
}

/**
 * Update attendance statistics in Summary sheet
 * @param {string} spreadsheetId - Spreadsheet ID
 */
async function updateAttendanceStatistics(spreadsheetId) {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Attendance!I:I'
    });

    const statuses = response.result.values || [];
    const total = statuses.length - 1; // Exclude header
    const present = statuses.filter(row => row[0] === 'Present').length;
    const absent = statuses.filter(row => row[0] === 'Absent').length;
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Summary!B8:B11',
      valueInputOption: 'RAW',
      resource: {
        values: [
          [total],
          [present],
          [absent],
          [`${attendanceRate}%`]
        ]
      }
    });
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}

/**
 * Get attendance data from sheet
 * @param {string} spreadsheetId - Spreadsheet ID
 * @returns {Promise<Array>} Attendance records
 */
async function getAttendanceData(spreadsheetId) {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Attendance!A2:J'
    });

    return response.result.values || [];
  } catch (error) {
    console.error('Error getting attendance data:', error);
    throw error;
  }
}

/**
 * Export OD forms data to Google Sheets
 * @param {Array} forms - Array of OD form data
 * @returns {Promise<Object>} Export result
 */
async function exportODFormsToSheet(forms) {
  try {
    // Create new spreadsheet
    const response = await gapi.client.sheets.spreadsheets.create({
      properties: {
        title: `OD Forms Export - ${new Date().toLocaleDateString()}`
      }
    });

    const spreadsheetId = response.result.spreadsheetId;

    // Prepare data
    const headers = [
      ['Form Reference', 'Student Name', 'PRN', 'Event Name', 'Event Type', 'Start Date', 'End Date', 'Venue', 'Status', 'Submission Date']
    ];

    const data = forms.map(form => [
      form.form_reference,
      form.student_name,
      form.prn,
      form.event_name,
      form.event_type,
      form.start_date,
      form.end_date,
      form.venue,
      form.status,
      new Date(form.submitted_at).toLocaleDateString()
    ]);

    const allData = [...headers, ...data];

    // Write data
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: {
        values: allData
      }
    });

    // Format sheet
    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.26, green: 0.52, blue: 0.96 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 11,
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 10
              }
            }
          }
        ]
      }
    });

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl
    };
  } catch (error) {
    console.error('Error exporting to sheets:', error);
    throw error;
  }
}

/**
 * Share spreadsheet with specific users
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {Array<string>} emails - Array of email addresses
 * @param {string} role - Permission role (reader, writer, owner)
 */
async function shareSpreadsheet(spreadsheetId, emails, role = 'writer') {
  try {
    for (const email of emails) {
      await gapi.client.request({
        path: `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`,
        method: 'POST',
        body: {
          type: 'user',
          role: role,
          emailAddress: email
        }
      });
    }
    console.log('Spreadsheet shared successfully');
  } catch (error) {
    console.error('Error sharing spreadsheet:', error);
    throw error;
  }
}

// Export functions
window.SheetsIntegration = {
  gapiLoaded,
  gisLoaded,
  authenticateUser,
  createAttendanceSheet,
  markAttendance,
  markCheckOut,
  getAttendanceData,
  exportODFormsToSheet,
  shareSpreadsheet,
  updateAttendanceStatistics
};
