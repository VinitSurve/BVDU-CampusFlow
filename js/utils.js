/**
 * Utility Functions
 * OD Forms Management System - BVDU CampusFlow
 * 
 * Common utility functions used across the application
 */

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format a date to a readable string
 */
export function formatDate(date, options = {}) {
  if (!date) return 'N/A';
  
  // Convert Firebase Timestamp if needed
  const d = date.toDate ? date.toDate() : new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };
  
  return d.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
}

/**
 * Format date and time
 */
export function formatDateTime(date) {
  if (!date) return 'N/A';
  
  const d = date.toDate ? date.toDate() : new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format time only
 */
export function formatTime(time) {
  if (!time) return 'N/A';
  
  // Handle HH:MM string format
  if (typeof time === 'string' && time.includes(':')) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  
  const d = time.toDate ? time.toDate() : new Date(time);
  
  if (isNaN(d.getTime())) return time;
  
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date) {
  if (!date) return '';
  
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return formatDate(d);
}

/**
 * Check if date is today
 */
export function isToday(date) {
  if (!date) return false;
  
  const d = date.toDate ? date.toDate() : new Date(date);
  const today = new Date();
  
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

/**
 * Check if date is in the past
 */
export function isPast(date) {
  if (!date) return false;
  
  const d = date.toDate ? date.toDate() : new Date(date);
  return d < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date) {
  if (!date) return false;
  
  const d = date.toDate ? date.toDate() : new Date(date);
  return d > new Date();
}

// ============================================
// STATUS FORMATTING
// ============================================

/**
 * Get status badge HTML
 */
export function getStatusBadge(status) {
  const badges = {
    'pending': '<span class="badge badge-pending">Pending</span>',
    'partially_approved': '<span class="badge badge-partial">With Faculty</span>',
    'faculty_approved': '<span class="badge badge-faculty">With HOD</span>',
    'hod_approved': '<span class="badge badge-approved">Approved</span>',
    'approved': '<span class="badge badge-approved">Approved</span>',
    'rejected': '<span class="badge badge-rejected">Rejected</span>',
    'registered': '<span class="badge badge-primary">Registered</span>',
    'present': '<span class="badge badge-success">Present</span>',
    'absent': '<span class="badge badge-danger">Absent</span>'
  };
  
  return badges[status] || `<span class="badge badge-secondary">${status}</span>`;
}

/**
 * Get status text
 */
export function getStatusText(status) {
  const texts = {
    'pending': 'Pending with Event Leader',
    'partially_approved': 'Pending with Faculty',
    'faculty_approved': 'Pending with HOD',
    'hod_approved': 'Fully Approved',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  
  return texts[status] || status;
}

/**
 * Get status color
 */
export function getStatusColor(status) {
  const colors = {
    'pending': '#F59E0B',
    'partially_approved': '#3B82F6',
    'faculty_approved': '#A855F7',
    'hod_approved': '#22C55E',
    'approved': '#22C55E',
    'rejected': '#EF4444'
  };
  
  return colors[status] || '#6B7280';
}

/**
 * Get form type badge
 */
export function getFormTypeBadge(type) {
  const badges = {
    'participant': '<span class="badge badge-participant">Participant</span>',
    'volunteer': '<span class="badge badge-volunteer">Volunteer</span>'
  };
  
  return badges[type] || `<span class="badge badge-secondary">${type}</span>`;
}

/**
 * Get event category badge
 */
export function getEventCategoryBadge(category) {
  const badges = {
    'Technical': '<span class="badge badge-primary">Technical</span>',
    'Cultural': '<span class="badge badge-purple">Cultural</span>',
    'Sports': '<span class="badge badge-success">Sports</span>',
    'Social': '<span class="badge badge-warning">Social</span>'
  };
  
  return badges[category] || `<span class="badge badge-secondary">${category}</span>`;
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Title case
 */
export function titleCase(str) {
  if (!str) return '';
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '??';
  
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format phone number
 */
export function formatPhone(phone) {
  if (!phone) return '';
  
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as XX XXXXX XXXXX for Indian numbers
  if (digits.length === 10) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  
  return phone;
}

// ============================================
// NUMBER UTILITIES
// ============================================

/**
 * Format number with commas
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-IN');
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ============================================
// FORM UTILITIES
// ============================================

/**
 * Generate unique form ID
 */
export function generateFormId(prefix = 'OD') {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `${prefix}-${year}${month}${day}${random}`;
}

/**
 * Generate unique event ID
 */
export function generateEventId() {
  return `EVT-${Date.now()}`;
}

/**
 * Serialize form data to object
 */
export function serializeForm(form) {
  const formData = new FormData(form);
  const data = {};
  
  formData.forEach((value, key) => {
    if (data[key]) {
      // Handle multiple values (e.g., checkboxes)
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]];
      }
      data[key].push(value);
    } else {
      data[key] = value;
    }
  });
  
  return data;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone.replace(/\D/g, ''));
}

// ============================================
// URL UTILITIES
// ============================================

/**
 * Get URL parameters
 */
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

/**
 * Get single URL parameter
 */
export function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Update URL parameter without reload
 */
export function updateUrlParam(key, value) {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, '', url);
}

// ============================================
// DOM UTILITIES
// ============================================

/**
 * Select element(s)
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return [...context.querySelectorAll(selector)];
}

/**
 * Create element with attributes and children
 */
export function createElement(tag, attributes = {}, children = []) {
  const el = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'innerHTML') {
      el.innerHTML = value;
    } else if (key === 'textContent') {
      el.textContent = value;
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else {
      el.setAttribute(key, value);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  
  return el;
}

/**
 * Show loading state
 */
export function showLoading(element, message = 'Loading...') {
  if (!element) return;
  
  element.dataset.originalContent = element.innerHTML;
  element.innerHTML = `
    <div class="flex items-center justify-center gap-2 p-8">
      <div class="spinner"></div>
      <span class="text-muted">${message}</span>
    </div>
  `;
}

/**
 * Hide loading state
 */
export function hideLoading(element) {
  if (!element || !element.dataset.originalContent) return;
  
  element.innerHTML = element.dataset.originalContent;
  delete element.dataset.originalContent;
}

/**
 * Show/hide element
 */
export function showElement(element) {
  if (element) element.classList.remove('hidden');
}

export function hideElement(element) {
  if (element) element.classList.add('hidden');
}

export function toggleElement(element) {
  if (element) element.classList.toggle('hidden');
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

/**
 * Debounce function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// LOCAL STORAGE
// ============================================

/**
 * Get from local storage
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Set to local storage
 */
export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove from local storage
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// CLIPBOARD
// ============================================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

// ============================================
// EXPORT UTILITIES
// ============================================

/**
 * Export data to CSV
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');
  
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Download file
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// PRINT UTILITY
// ============================================

/**
 * Print specific element
 */
export function printElement(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print</title>
      <link rel="stylesheet" href="/css/main.css">
      <link rel="stylesheet" href="/css/components.css">
      <style>
        body { padding: 20px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
}

export default {
  // Date
  formatDate,
  formatDateTime,
  formatTime,
  getRelativeTime,
  isToday,
  isPast,
  isFuture,
  
  // Status
  getStatusBadge,
  getStatusText,
  getStatusColor,
  getFormTypeBadge,
  getEventCategoryBadge,
  
  // String
  truncate,
  capitalize,
  titleCase,
  getInitials,
  formatPhone,
  
  // Number
  formatNumber,
  formatCurrency,
  getOrdinal,
  
  // Form
  generateFormId,
  generateEventId,
  serializeForm,
  isValidEmail,
  isValidPhone,
  
  // URL
  getUrlParams,
  getUrlParam,
  updateUrlParam,
  
  // DOM
  $,
  $$,
  createElement,
  showLoading,
  hideLoading,
  showElement,
  hideElement,
  toggleElement,
  
  // Timing
  debounce,
  throttle,
  
  // Storage
  getFromStorage,
  setToStorage,
  removeFromStorage,
  
  // Clipboard
  copyToClipboard,
  
  // Export
  exportToCSV,
  downloadFile,
  printElement
};
