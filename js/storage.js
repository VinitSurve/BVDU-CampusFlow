/**
 * Storage Module (Google Drive API)
 * OD Forms Management System - BVDU CampusFlow
 * 
 * Handles all file storage operations using Google Drive:
 * - Upload files to Google Drive
 * - Delete files
 * - Get public file URLs
 * - FREE 15GB storage per account!
 */

import { driveConfig } from './firebase-config.js';

// ============================================
// GOOGLE DRIVE FOLDERS
// ============================================
const FOLDERS = {
  PROOF_DOCUMENTS: 'proof-documents',
  EVENT_IMAGES: 'event-images',
  PROFILE_PICTURES: 'profile-pictures',
  CLUB_LOGOS: 'club-logos'
};

// ============================================
// ALLOWED FILE TYPES
// ============================================
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Google Drive API base URLs
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

// Access token (will be set after authentication)
let accessToken = null;

// ============================================
// INITIALIZE GOOGLE DRIVE CLIENT
// ============================================
export async function initGoogleDrive() {
  return new Promise((resolve, reject) => {
    // Load Google API client if not already loaded
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: driveConfig.apiKey,
              clientId: driveConfig.clientId,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
              scope: 'https://www.googleapis.com/auth/drive.file'
            });
            
            // Check if already signed in
            const authInstance = window.gapi.auth2.getAuthInstance();
            if (authInstance.isSignedIn.get()) {
              accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
            }
            
            resolve(true);
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      resolve(true);
    }
  });
}

// ============================================
// AUTHENTICATE WITH GOOGLE
// ============================================
export async function authenticateGoogleDrive() {
  try {
    await initGoogleDrive();
    const authInstance = window.gapi.auth2.getAuthInstance();
    
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }
    
    accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
    return accessToken;
  } catch (error) {
    console.error('Google Drive authentication failed:', error);
    throw new Error('Failed to authenticate with Google Drive');
  }
}

// ============================================
// GET OR CREATE FOLDER
// ============================================
async function getOrCreateFolder(folderName, parentFolderId = driveConfig.folderId) {
  // Ensure we have access token
  if (!accessToken) {
    await authenticateGoogleDrive();
  }
  
  // Search for existing folder
  const searchUrl = `${DRIVE_API_BASE}/files?` + new URLSearchParams({
    q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    access_token: accessToken
  });
  
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }
  
  // Create new folder
  const createUrl = `${DRIVE_API_BASE}/files?access_token=${accessToken}`;
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId]
  };
  
  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata)
  });
  
  const createData = await createResponse.json();
  return createData.id;
}

// ============================================
// UPLOAD FILE
// ============================================
export async function uploadFile(file, path, options = {}) {
  // Validate file
  const validation = validateFile(file, options.allowedTypes);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Ensure we have access token
  if (!accessToken) {
    await authenticateGoogleDrive();
  }
  
  // Determine folder based on path
  const folderName = getFolderFromPath(path);
  const folderId = await getOrCreateFolder(folderName);
  
  // Generate file name
  const fileName = options.customName || generateFileName(file);
  
  // Create metadata
  const metadata = {
    name: fileName,
    parents: [folderId],
    description: `Uploaded from BVDU CampusFlow - ${new Date().toISOString()}`
  };
  
  // Upload file using multipart upload
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";
  
  const reader = new FileReader();
  const base64Data = await new Promise((resolve) => {
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      resolve(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  });
  
  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: ' + file.type + '\r\n' +
    'Content-Transfer-Encoding: base64\r\n' +
    '\r\n' +
    base64Data +
    close_delim;
  
  const uploadUrl = `${UPLOAD_API_BASE}/files?uploadType=multipart&access_token=${accessToken}`;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/related; boundary="' + boundary + '"'
    },
    body: multipartRequestBody
  });
  
  const result = await response.json();
  
  if (response.ok) {
    // Make file publicly accessible
    await setFilePermissions(result.id);
    
    // Get public URL
    const url = `https://drive.google.com/uc?export=view&id=${result.id}`;
    
    return {
      fileName,
      fileId: result.id,
      path: `${folderName}/${fileName}`,
      url,
      size: file.size,
      type: file.type
    };
  } else {
    throw new Error(result.error?.message || 'Upload failed');
  }
}

// ============================================
// SET FILE PERMISSIONS (PUBLIC)
// ============================================
async function setFilePermissions(fileId) {
  const url = `${DRIVE_API_BASE}/files/${fileId}/permissions?access_token=${accessToken}`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone'
    })
  });
}

// ============================================
// UPLOAD FILE WITH PROGRESS
// ============================================
export async function uploadFileWithProgress(file, path, callbacks = {}) {
  // Validate file
  const validation = validateFile(file, callbacks.allowedTypes);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  try {
    // Simulate progress for UX
    if (callbacks.onProgress) {
      callbacks.onProgress(25);
    }
    
    const result = await uploadFile(file, path, callbacks);
    
    if (callbacks.onProgress) {
      callbacks.onProgress(100);
    }
    
    if (callbacks.onComplete) {
      callbacks.onComplete(result);
    }
    
    return result;
  } catch (error) {
    if (callbacks.onError) {
      callbacks.onError(error);
    }
    throw error;
  }
}

// ============================================
// UPLOAD MULTIPLE FILES
// ============================================
export async function uploadMultipleFiles(files, path, options = {}) {
  const results = [];
  const errors = [];

  for (const file of files) {
    try {
      const result = await uploadFile(file, path, options);
      results.push(result);
    } catch (error) {
      errors.push({
        fileName: file.name,
        error: error.message
      });
    }
  }

  return { results, errors };
}

// ============================================
// UPLOAD PROOF DOCUMENT
// ============================================
export async function uploadProofDocument(userId, eventId, file) {
  const path = `proof-documents/${userId}/${eventId}`;
  return uploadFile(file, path, {
    allowedTypes: ALLOWED_DOCUMENT_TYPES
  });
}

// ============================================
// UPLOAD EVENT PHOTO
// ============================================
export async function uploadEventPhoto(eventId, file) {
  const path = `event-images/${eventId}`;
  return uploadFile(file, path, {
    allowedTypes: ALLOWED_IMAGE_TYPES
  });
}

// ============================================
// UPLOAD PROFILE PHOTO
// ============================================
export async function uploadProfilePhoto(userId, file) {
  const path = `profile-pictures/${userId}`;
  return uploadFile(file, path, {
    allowedTypes: ALLOWED_IMAGE_TYPES,
    customName: `${userId}_profile.jpg`
  });
}

// ============================================
// GET FILE URL
// ============================================
export async function getFileUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// ============================================
// DELETE FILE
// ============================================
export async function deleteFile(fileId) {
  if (!accessToken) {
    await authenticateGoogleDrive();
  }
  
  const url = `${DRIVE_API_BASE}/files/${fileId}?access_token=${accessToken}`;
  
  const response = await fetch(url, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Delete failed');
  }
}

// ============================================
// DELETE MULTIPLE FILES
// ============================================
export async function deleteMultipleFiles(fileIds) {
  const results = [];
  const errors = [];

  for (const fileId of fileIds) {
    try {
      await deleteFile(fileId);
      results.push({ fileId, deleted: true });
    } catch (error) {
      errors.push({ fileId, error: error.message });
    }
  }

  return { results, errors };
}

// ============================================
// LIST FILES IN FOLDER
// ============================================
export async function listFiles(path) {
  if (!accessToken) {
    await authenticateGoogleDrive();
  }
  
  const folderName = getFolderFromPath(path);
  const folderId = await getOrCreateFolder(folderName);
  
  const url = `${DRIVE_API_BASE}/files?` + new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)',
    access_token: accessToken
  });
  
  const response = await fetch(url);
  const data = await response.json();
  
  const files = data.files?.map(file => ({
    name: file.name,
    fileId: file.id,
    url: `https://drive.google.com/uc?export=view&id=${file.id}`,
    size: parseInt(file.size || 0),
    type: file.mimeType,
    created: file.createdTime,
    updated: file.modifiedTime
  })) || [];

  return { files, folders: [] };
}

// ============================================
// VALIDATE FILE
// ============================================
export function validateFile(file, allowedTypes = ALLOWED_DOCUMENT_TYPES) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit` 
    };
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}` 
    };
  }

  return { valid: true };
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getFolderFromPath(path) {
  if (path.includes('proof')) return FOLDERS.PROOF_DOCUMENTS;
  if (path.includes('event')) return FOLDERS.EVENT_IMAGES;
  if (path.includes('profile')) return FOLDERS.PROFILE_PICTURES;
  if (path.includes('club')) return FOLDERS.CLUB_LOGOS;
  return FOLDERS.PROOF_DOCUMENTS;
}

function generateFileName(file) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  return `${baseName}_${timestamp}_${random}.${extension}`;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(fileType) {
  const icons = {
    'application/pdf': '📄',
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'image/webp': '🖼️'
  };
  return icons[fileType] || '📁';
}

export function isImage(fileType) {
  return fileType && fileType.startsWith('image/');
}

export function isPdf(fileType) {
  return fileType === 'application/pdf';
}

export default {
  FOLDERS,
  initGoogleDrive,
  authenticateGoogleDrive,
  uploadFile,
  uploadFileWithProgress,
  uploadMultipleFiles,
  uploadProofDocument,
  uploadEventPhoto,
  uploadProfilePhoto,
  getFileUrl,
  deleteFile,
  deleteMultipleFiles,
  listFiles,
  validateFile,
  formatFileSize,
  getFileIcon,
  isImage,
  isPdf,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE
};
