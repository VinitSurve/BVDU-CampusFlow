/**
 * Authentication Module
 * OD Forms Management System - BVDU CampusFlow
 * 
 * Handles all authentication-related functionality:
 * - User login/logout
 * - Registration
 * - Password reset
 * - Session management
 * - Role-based redirects
 */

import { auth, db, isFirebaseConfigured } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showToast } from './notifications.js';

// ============================================
// SESSION STORAGE KEYS
// ============================================
const SESSION_KEY = 'currentUser';
const TOKEN_KEY = 'authToken';

// ============================================
// ROLE-BASED REDIRECTS
// ============================================
const ROLE_DASHBOARDS = {
  student: '/views/student/dashboard.html',
  event_leader: '/views/event-leader/dashboard.html',
  faculty: '/views/faculty/dashboard.html',
  hod: '/views/hod/dashboard.html'
};

const LOGIN_PAGE = '/index.html';

// ============================================
// LOGIN FUNCTION
// ============================================
export async function login(email, password) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please update firebase-config.js');
  }

  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error('User profile not found. Please contact administrator.');
    }

    const userData = userDoc.data();

    // Check if user is active
    if (!userData.is_active) {
      await signOut(auth);
      throw new Error('Your account has been deactivated. Please contact administrator.');
    }

    // Store user data in session
    const sessionData = {
      id: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      ...userData,
      lastLogin: new Date().toISOString()
    };
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

    // Update last login in Firestore
    await updateDoc(doc(db, 'users', user.uid), {
      last_login: Timestamp.now()
    });

    // Log activity
    await logActivity(user.uid, 'login', 'users', user.uid, 'User logged in');

    return {
      success: true,
      user: sessionData,
      redirectUrl: ROLE_DASHBOARDS[userData.role] || LOGIN_PAGE
    };

  } catch (error) {
    console.error('Login error:', error);
    
    // Map Firebase errors to user-friendly messages
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid email or password.'
    };

    throw new Error(errorMessages[error.code] || error.message);
  }
}

// ============================================
// REGISTER FUNCTION
// ============================================
export async function register(userData) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please update firebase-config.js');
  }

  const { email, password, full_name, phone, department, roll_number, prn, course, year, division } = userData;

  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: full_name
    });

    // Create user document in Firestore
    const userDocData = {
      id: user.uid,
      email: email,
      role: 'student', // Default role for self-registration
      full_name: full_name,
      phone: phone || '',
      department: department,
      is_active: true,
      created_at: Timestamp.now(),
      
      // Student-specific fields
      roll_number: roll_number,
      prn: prn || '',
      course: course,
      year: parseInt(year) || 1,
      division: division || 'A',
      admission_date: Timestamp.now()
    };

    await setDoc(doc(db, 'users', user.uid), userDocData);

    // Send email verification
    await sendEmailVerification(user);

    // Log activity
    await logActivity(user.uid, 'create', 'users', user.uid, 'New user registered');

    return {
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      userId: user.uid
    };

  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessages = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/operation-not-allowed': 'Registration is currently disabled.'
    };

    throw new Error(errorMessages[error.code] || error.message);
  }
}

// ============================================
// LOGOUT FUNCTION
// ============================================
export async function logout() {
  try {
    const user = getCurrentUser();
    
    if (user) {
      await logActivity(user.id, 'logout', 'users', user.id, 'User logged out');
    }

    await signOut(auth);
    
    // Clear session storage
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    
    // Redirect to login
    window.location.href = LOGIN_PAGE;
    
    return { success: true };

  } catch (error) {
    console.error('Logout error:', error);
    // Force clear and redirect even on error
    sessionStorage.clear();
    window.location.href = LOGIN_PAGE;
  }
}

// ============================================
// PASSWORD RESET
// ============================================
export async function resetPassword(email) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please update firebase-config.js');
  }

  try {
    await sendPasswordResetEmail(auth, email);
    
    return {
      success: true,
      message: 'Password reset email sent! Please check your inbox.'
    };

  } catch (error) {
    console.error('Password reset error:', error);
    
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many requests. Please try again later.'
    };

    throw new Error(errorMessages[error.code] || error.message);
  }
}

// ============================================
// CHANGE PASSWORD
// ============================================
export async function changePassword(currentPassword, newPassword) {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('You must be logged in to change your password.');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    await logActivity(user.uid, 'update', 'users', user.uid, 'Password changed');

    return {
      success: true,
      message: 'Password changed successfully!'
    };

  } catch (error) {
    console.error('Change password error:', error);
    
    const errorMessages = {
      'auth/wrong-password': 'Current password is incorrect.',
      'auth/weak-password': 'New password should be at least 6 characters.',
      'auth/requires-recent-login': 'Please log out and log in again before changing password.'
    };

    throw new Error(errorMessages[error.code] || error.message);
  }
}

// ============================================
// GET CURRENT USER
// ============================================
export function getCurrentUser() {
  const userJson = sessionStorage.getItem(SESSION_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

// ============================================
// UPDATE USER SESSION
// ============================================
export function updateUserSession(updates) {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const updatedUser = { ...currentUser, ...updates };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  
  return updatedUser;
}

// ============================================
// CHECK AUTH (Protected Routes)
// ============================================
export function checkAuth(allowedRoles = null) {
  const user = getCurrentUser();
  
  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = LOGIN_PAGE;
    return null;
  }

  // Check role if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    window.location.href = ROLE_DASHBOARDS[user.role] || LOGIN_PAGE;
    return null;
  }

  return user;
}

// ============================================
// CHECK IF LOGGED IN (for login page)
// ============================================
export function checkIfLoggedIn() {
  const user = getCurrentUser();
  
  if (user) {
    // Redirect to dashboard if already logged in
    window.location.href = ROLE_DASHBOARDS[user.role] || '/views/student/dashboard.html';
    return true;
  }
  
  return false;
}

// ============================================
// AUTH STATE OBSERVER
// ============================================
export function observeAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const sessionData = {
          id: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          ...userData
        };
        
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        callback(sessionData);
      } else {
        callback(null);
      }
    } else {
      // User is signed out
      sessionStorage.removeItem(SESSION_KEY);
      callback(null);
    }
  });
}

// ============================================
// HELPER: Log Activity
// ============================================
async function logActivity(userId, action, collection, recordId, description) {
  try {
    const { addDoc, collection: firestoreCollection } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    await addDoc(firestoreCollection(db, 'activity_logs'), {
      user_id: userId,
      action: action,
      collection_name: collection,
      record_id: recordId,
      description: description,
      created_at: Timestamp.now()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// ============================================
// GET USER INITIALS
// ============================================
export function getUserInitials(name) {
  if (!name) return '??';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============================================
// FORMAT ROLE NAME
// ============================================
export function formatRoleName(role) {
  const roleNames = {
    student: 'Student',
    event_leader: 'Event Leader',
    faculty: 'Faculty',
    hod: 'HOD'
  };
  
  return roleNames[role] || role;
}

export default {
  login,
  logout,
  register,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateUserSession,
  checkAuth,
  checkIfLoggedIn,
  observeAuthState,
  getUserInitials,
  formatRoleName
};
