/**
 * Database Module (Firestore)
 * OD Forms Management System - BVDU CampusFlow
 * 
 * Handles all Firestore database operations:
 * - CRUD operations for all collections
 * - Query builders
 * - Real-time subscriptions
 */

import { db } from './firebase-config.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  onSnapshot,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================
// USERS COLLECTION
// ============================================

export async function getUser(userId) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function updateUser(userId, data) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...data,
    updated_at: Timestamp.now()
  });
}

export async function getUsersByRole(role) {
  const q = query(
    collection(db, 'users'),
    where('role', '==', role),
    where('is_active', '==', true),
    orderBy('full_name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createUser(userId, userData) {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, {
    ...userData,
    id: userId,
    is_active: true,
    created_at: Timestamp.now()
  });
}

// ============================================
// EVENTS COLLECTION
// ============================================

export async function getEvent(eventId) {
  const docRef = doc(db, 'events', eventId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getAllEvents(filters = {}) {
  let q = collection(db, 'events');
  const constraints = [];
  
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  
  if (filters.event_type) {
    constraints.push(where('event_type', '==', filters.event_type));
  }
  
  if (filters.event_category) {
    constraints.push(where('event_category', '==', filters.event_category));
  }
  
  if (filters.event_leader_id) {
    constraints.push(where('event_leader_id', '==', filters.event_leader_id));
  }
  
  constraints.push(orderBy('event_date', 'desc'));
  
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  q = query(q, ...constraints);
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getApprovedEvents(includesPast = false) {
  const constraints = [
    where('status', '==', 'approved'),
    where('od_eligible', '==', true)
  ];
  
  if (!includesPast) {
    constraints.push(where('event_date', '>=', Timestamp.now()));
  }
  
  constraints.push(orderBy('event_date', 'asc'));
  
  const q = query(collection(db, 'events'), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getEventsByLeader(leaderId) {
  const q = query(
    collection(db, 'events'),
    where('event_leader_id', '==', leaderId),
    orderBy('event_date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createEvent(eventData) {
  const eventId = `EVT-${Date.now()}`;
  const docRef = doc(db, 'events', eventId);
  
  await setDoc(docRef, {
    ...eventData,
    event_id: eventId,
    status: 'pending',
    od_eligible: eventData.od_eligible ?? true,
    approved_by_faculty: null,
    approved_by_hod: null,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  });
  
  return eventId;
}

export async function updateEvent(eventId, data) {
  const docRef = doc(db, 'events', eventId);
  await updateDoc(docRef, {
    ...data,
    updated_at: Timestamp.now()
  });
}

export async function approveEvent(eventId, approverId, approverRole) {
  const docRef = doc(db, 'events', eventId);
  const updates = {
    updated_at: Timestamp.now()
  };
  
  if (approverRole === 'faculty') {
    updates.approved_by_faculty = approverId;
    updates.status = 'approved';
  } else if (approverRole === 'hod') {
    updates.approved_by_hod = approverId;
    updates.status = 'approved';
  }
  
  await updateDoc(docRef, updates);
}

export async function rejectEvent(eventId, reason) {
  const docRef = doc(db, 'events', eventId);
  await updateDoc(docRef, {
    status: 'rejected',
    rejection_reason: reason,
    updated_at: Timestamp.now()
  });
}

// ============================================
// OD FORMS COLLECTION
// ============================================

export async function getODForm(formId) {
  const docRef = doc(db, 'od_forms', formId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getStudentForms(studentId, filters = {}) {
  const constraints = [
    where('student_id', '==', studentId)
  ];
  
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  
  if (filters.form_type) {
    constraints.push(where('form_type', '==', filters.form_type));
  }
  
  constraints.push(orderBy('created_at', 'desc'));
  
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  const q = query(collection(db, 'od_forms'), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getFormsByEvent(eventId) {
  const q = query(
    collection(db, 'od_forms'),
    where('event_id', '==', eventId),
    orderBy('created_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getFormsForEventLeader(eventIds, status = 'pending') {
  if (!eventIds || eventIds.length === 0) return [];
  
  // Firestore 'in' query supports max 30 items
  const chunks = [];
  for (let i = 0; i < eventIds.length; i += 30) {
    chunks.push(eventIds.slice(i, i + 30));
  }
  
  const results = [];
  
  for (const chunk of chunks) {
    const q = query(
      collection(db, 'od_forms'),
      where('event_id', 'in', chunk),
      where('status', '==', status),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    results.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }
  
  return results;
}

export async function getFormsForFaculty(status = 'partially_approved') {
  const q = query(
    collection(db, 'od_forms'),
    where('status', '==', status),
    orderBy('created_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getFormsForHOD(status = 'faculty_approved') {
  const q = query(
    collection(db, 'od_forms'),
    where('status', '==', status),
    orderBy('created_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllForms(filters = {}) {
  let constraints = [];
  
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  
  if (filters.department) {
    constraints.push(where('department', '==', filters.department));
  }
  
  if (filters.form_type) {
    constraints.push(where('form_type', '==', filters.form_type));
  }
  
  constraints.push(orderBy('created_at', 'desc'));
  
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  const q = query(collection(db, 'od_forms'), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function submitODForm(formData) {
  const date = new Date();
  const formId = `OD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
  
  const docRef = doc(db, 'od_forms', formId);
  
  await setDoc(docRef, {
    ...formData,
    form_id: formId,
    status: 'pending',
    approved_by_event_leader: false,
    approved_by_faculty: false,
    approved_by_hod: false,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  });
  
  // Create subject approvals if subjects exist
  if (formData.subjects && formData.subjects.length > 0) {
    const batch = writeBatch(db);
    
    formData.subjects.forEach((subject, index) => {
      const approvalId = `${formId}_${index}`;
      const approvalRef = doc(db, 'od_subject_approvals', approvalId);
      
      batch.set(approvalRef, {
        form_id: formId,
        student_id: formData.student_id,
        event_id: formData.event_id,
        subject_code: subject.subject_code,
        subject_name: subject.subject_name,
        faculty_name: subject.faculty_name,
        lecture_date: subject.lecture_date,
        lecture_time: subject.lecture_time,
        event_leader_status: 'pending',
        faculty_status: 'pending',
        hod_status: 'pending',
        created_at: Timestamp.now()
      });
    });
    
    await batch.commit();
  }
  
  return formId;
}

export async function approveODForm(formId, approverRole, remarks = '') {
  const docRef = doc(db, 'od_forms', formId);
  const updates = {
    updated_at: Timestamp.now()
  };
  
  switch(approverRole) {
    case 'event_leader':
      updates.approved_by_event_leader = true;
      updates.status = 'partially_approved';
      updates.event_leader_remarks = remarks;
      updates.event_leader_approved_at = Timestamp.now();
      break;
    case 'faculty':
      updates.approved_by_faculty = true;
      updates.status = 'faculty_approved';
      updates.faculty_remarks = remarks;
      updates.faculty_approved_at = Timestamp.now();
      break;
    case 'hod':
      updates.approved_by_hod = true;
      updates.status = 'hod_approved';
      updates.hod_remarks = remarks;
      updates.hod_approved_at = Timestamp.now();
      break;
  }
  
  await updateDoc(docRef, updates);
}

export async function rejectODForm(formId, remarks, rejecterRole) {
  const docRef = doc(db, 'od_forms', formId);
  
  await updateDoc(docRef, {
    status: 'rejected',
    rejection_remarks: remarks,
    rejected_by: rejecterRole,
    rejected_at: Timestamp.now(),
    updated_at: Timestamp.now()
  });
}

// ============================================
// PARTICIPANTS COLLECTION
// ============================================

export async function registerForEvent(eventId, studentData) {
  const participantId = `${eventId}_${studentData.student_id}`;
  const docRef = doc(db, 'participants', participantId);
  
  // Check if already registered
  const existing = await getDoc(docRef);
  if (existing.exists()) {
    throw new Error('You are already registered for this event');
  }
  
  await setDoc(docRef, {
    event_id: eventId,
    student_id: studentData.student_id,
    roll_number: studentData.roll_number,
    name: studentData.name,
    department: studentData.department,
    email: studentData.email,
    attendance_status: 'registered',
    registered_at: Timestamp.now()
  });
  
  return participantId;
}

export async function getEventParticipants(eventId) {
  const q = query(
    collection(db, 'participants'),
    where('event_id', '==', eventId),
    orderBy('registered_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getStudentParticipations(studentId) {
  const q = query(
    collection(db, 'participants'),
    where('student_id', '==', studentId),
    orderBy('registered_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateAttendance(participantId, status) {
  const docRef = doc(db, 'participants', participantId);
  await updateDoc(docRef, {
    attendance_status: status,
    marked_at: Timestamp.now()
  });
}

// ============================================
// CLUBS COLLECTION
// ============================================

export async function getAllClubs() {
  const q = query(
    collection(db, 'clubs'),
    where('is_active', '==', true),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getClub(clubName) {
  const docRef = doc(db, 'clubs', clubName);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function createClub(clubData) {
  const docRef = doc(db, 'clubs', clubData.name);
  await setDoc(docRef, {
    ...clubData,
    is_active: true,
    created_at: Timestamp.now()
  });
}

// ============================================
// NOTIFICATIONS COLLECTION
// ============================================

export async function getUserNotifications(userId, unreadOnly = false) {
  const constraints = [
    where('user_id', '==', userId)
  ];
  
  if (unreadOnly) {
    constraints.push(where('is_read', '==', false));
  }
  
  constraints.push(orderBy('created_at', 'desc'));
  constraints.push(limit(50));
  
  const q = query(collection(db, 'notifications'), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createNotification(notificationData) {
  await addDoc(collection(db, 'notifications'), {
    ...notificationData,
    is_read: false,
    created_at: Timestamp.now()
  });
}

export async function markNotificationRead(notificationId) {
  const docRef = doc(db, 'notifications', notificationId);
  await updateDoc(docRef, {
    is_read: true,
    read_at: Timestamp.now()
  });
}

export async function markAllNotificationsRead(userId) {
  const q = query(
    collection(db, 'notifications'),
    where('user_id', '==', userId),
    where('is_read', '==', false)
  );
  
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { 
      is_read: true,
      read_at: Timestamp.now()
    });
  });
  
  await batch.commit();
}

// ============================================
// ACTIVITY LOGS COLLECTION
// ============================================

export async function logActivity(userId, action, collectionName, recordId, description) {
  await addDoc(collection(db, 'activity_logs'), {
    user_id: userId,
    action: action,
    collection_name: collectionName,
    record_id: recordId,
    description: description,
    created_at: Timestamp.now()
  });
}

export async function getActivityLogs(filters = {}) {
  const constraints = [];
  
  if (filters.user_id) {
    constraints.push(where('user_id', '==', filters.user_id));
  }
  
  if (filters.collection_name) {
    constraints.push(where('collection_name', '==', filters.collection_name));
  }
  
  if (filters.action) {
    constraints.push(where('action', '==', filters.action));
  }
  
  constraints.push(orderBy('created_at', 'desc'));
  constraints.push(limit(filters.limit || 100));
  
  const q = query(collection(db, 'activity_logs'), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToNotifications(userId, callback) {
  const q = query(
    collection(db, 'notifications'),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    callback(notifications);
  });
}

export function subscribeToODForm(formId, callback) {
  const docRef = doc(db, 'od_forms', formId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
}

// ============================================
// STATISTICS & COUNTS
// ============================================

export async function getFormStats(studentId) {
  const forms = await getStudentForms(studentId);
  
  return {
    total: forms.length,
    pending: forms.filter(f => f.status === 'pending').length,
    partially_approved: forms.filter(f => f.status === 'partially_approved').length,
    faculty_approved: forms.filter(f => f.status === 'faculty_approved').length,
    approved: forms.filter(f => f.status === 'hod_approved').length,
    rejected: forms.filter(f => f.status === 'rejected').length
  };
}

export async function getEventLeaderStats(leaderId) {
  const events = await getEventsByLeader(leaderId);
  const eventIds = events.map(e => e.event_id || e.id);
  
  let pendingForms = 0;
  if (eventIds.length > 0) {
    const forms = await getFormsForEventLeader(eventIds, 'pending');
    pendingForms = forms.length;
  }
  
  return {
    totalEvents: events.length,
    pendingEvents: events.filter(e => e.status === 'pending').length,
    approvedEvents: events.filter(e => e.status === 'approved').length,
    pendingForms: pendingForms
  };
}

// ============================================
// HELPER: Convert Timestamp
// ============================================

export function timestampToDate(timestamp) {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
}

export { Timestamp };

export default {
  // Users
  getUser,
  updateUser,
  getUsersByRole,
  createUser,
  
  // Events
  getEvent,
  getAllEvents,
  getApprovedEvents,
  getEventsByLeader,
  createEvent,
  updateEvent,
  approveEvent,
  rejectEvent,
  
  // OD Forms
  getODForm,
  getStudentForms,
  getFormsByEvent,
  getFormsForEventLeader,
  getFormsForFaculty,
  getFormsForHOD,
  getAllForms,
  submitODForm,
  approveODForm,
  rejectODForm,
  
  // Participants
  registerForEvent,
  getEventParticipants,
  getStudentParticipations,
  updateAttendance,
  
  // Clubs
  getAllClubs,
  getClub,
  createClub,
  
  // Notifications
  getUserNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  
  // Activity
  logActivity,
  getActivityLogs,
  
  // Subscriptions
  subscribeToNotifications,
  subscribeToODForm,
  
  // Stats
  getFormStats,
  getEventLeaderStats,
  
  // Helpers
  timestampToDate,
  Timestamp
};
