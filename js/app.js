/**
 * Application Module
 * OD Forms Management System - BVDU CampusFlow
 * 
 * Main application initialization and shared functionality
 * This module handles sidebar, header, and common UI features
 */

import { getCurrentUser, logout, getUserInitials, formatRoleName } from './auth.js';
import { getUserNotifications, markAllNotificationsRead, subscribeToNotifications } from './db.js';
import { showConfirm, showToast } from './notifications.js';
import { getRelativeTime, $ } from './utils.js';

// ============================================
// SIDEBAR CONFIGURATION BY ROLE
// ============================================
const SIDEBAR_CONFIG = {
  student: [
    { title: 'Main', items: [
      { icon: '📊', label: 'Dashboard', href: '/views/student/dashboard.html' },
      { icon: '📝', label: 'My OD Forms', href: '/views/student/my-forms.html' },
      { icon: '➕', label: 'Submit OD Form', href: '/views/student/submit-form.html' }
    ]},
    { title: 'Events', items: [
      { icon: '📅', label: 'All Events', href: '/views/student/all-events.html' },
      { icon: '✅', label: 'My Attendance', href: '/views/student/attendance.html' }
    ]},
    { title: 'Account', items: [
      { icon: '👤', label: 'Profile', href: '/views/student/profile.html' }
    ]}
  ],
  
  event_leader: [
    { title: 'Main', items: [
      { icon: '📊', label: 'Dashboard', href: '/views/event-leader/dashboard.html' },
      { icon: '📋', label: 'OD Forms', href: '/views/event-leader/od-forms.html' }
    ]},
    { title: 'Events', items: [
      { icon: '📅', label: 'All Events', href: '/views/event-leader/all-events.html' },
      { icon: '🎯', label: 'My Events', href: '/views/event-leader/my-events.html' },
      { icon: '➕', label: 'Create Event', href: '/views/event-leader/create-event.html' },
      { icon: '👥', label: 'Participants', href: '/views/event-leader/participants.html' }
    ]},
    { title: 'Account', items: [
      { icon: '👤', label: 'Profile', href: '/views/event-leader/profile.html' }
    ]}
  ],
  
  faculty: [
    { title: 'Main', items: [
      { icon: '📊', label: 'Dashboard', href: '/views/faculty/dashboard.html' },
      { icon: '📋', label: 'OD Forms', href: '/views/faculty/od-forms.html' }
    ]},
    { title: 'Events', items: [
      { icon: '📅', label: 'All Events', href: '/views/faculty/all-events.html' }
    ]},
    { title: 'Account', items: [
      { icon: '👤', label: 'Profile', href: '/views/faculty/profile.html' }
    ]}
  ],
  
  hod: [
    { title: 'Main', items: [
      { icon: '📊', label: 'Dashboard', href: '/views/hod/dashboard.html' },
      { icon: '📋', label: 'OD Forms', href: '/views/hod/od-forms.html' }
    ]},
    { title: 'Management', items: [
      { icon: '📅', label: 'All Events', href: '/views/hod/all-events.html' },
      { icon: '👨‍🏫', label: 'Create Faculty', href: '/views/hod/create-faculty.html' }
    ]},
    { title: 'Account', items: [
      { icon: '👤', label: 'Profile', href: '/views/hod/profile.html' }
    ]}
  ]
};

// ============================================
// INITIALIZE APPLICATION
// ============================================
export function initApp(options = {}) {
  const user = getCurrentUser();
  
  if (!user) {
    window.location.href = '/index.html';
    return null;
  }
  
  // Check role access if specified
  if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
    window.location.href = `/views/${user.role.replace('_', '-')}/dashboard.html`;
    return null;
  }
  
  // Initialize UI components
  initSidebar(user);
  initHeader(user);
  initMobileMenu();
  
  // Subscribe to notifications
  if (options.enableNotifications !== false) {
    initNotifications(user.id);
  }
  
  return user;
}

// ============================================
// INITIALIZE SIDEBAR
// ============================================
function initSidebar(user) {
  const sidebarEl = document.getElementById('sidebar');
  if (!sidebarEl) return;
  
  const config = SIDEBAR_CONFIG[user.role] || SIDEBAR_CONFIG.student;
  const currentPath = window.location.pathname;
  
  let navHTML = '';
  
  config.forEach(section => {
    navHTML += `
      <div class="sidebar-nav-section">
        <div class="sidebar-nav-title">${section.title}</div>
        ${section.items.map(item => {
          const isActive = currentPath.includes(item.href.split('/').pop().replace('.html', ''));
          return `
            <a href="${item.href}" class="sidebar-link ${isActive ? 'active' : ''}">
              <span class="sidebar-link-icon">${item.icon}</span>
              <span class="sidebar-link-text">${item.label}</span>
              ${item.badge ? `<span class="sidebar-link-badge">${item.badge}</span>` : ''}
            </a>
          `;
        }).join('')}
      </div>
    `;
  });
  
  // Add logout link
  navHTML += `
    <div class="sidebar-nav-section" style="margin-top: auto; border-top: 1px solid var(--gray-700); padding-top: var(--space-4);">
      <a href="#" class="sidebar-link" id="logout-link">
        <span class="sidebar-link-icon">🚪</span>
        <span class="sidebar-link-text">Logout</span>
      </a>
    </div>
  `;
  
  sidebarEl.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">📋</div>
      <div class="sidebar-logo-text">
        <span class="sidebar-logo-title">CampusFlow</span>
        <span class="sidebar-logo-subtitle">BVDU</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${navHTML}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">${getUserInitials(user.full_name)}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${user.full_name}</div>
          <div class="sidebar-user-role">${formatRoleName(user.role)}</div>
        </div>
      </div>
    </div>
  `;
  
  // Add logout handler
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', handleLogout);
  }
}

// ============================================
// INITIALIZE HEADER
// ============================================
function initHeader(user) {
  const headerEl = document.getElementById('header');
  if (!headerEl) return;
  
  headerEl.innerHTML = `
    <div class="header-left">
      <button class="header-toggle" id="sidebar-toggle">☰</button>
      <div class="header-breadcrumb">
        <a href="/views/${user.role.replace('_', '-')}/dashboard.html">Home</a>
        <span class="header-breadcrumb-separator">/</span>
        <span class="header-breadcrumb-current" id="page-title">Dashboard</span>
      </div>
    </div>
    <div class="header-right">
      <div class="header-notifications" id="notifications-dropdown">
        <button class="header-notifications-btn" id="notifications-btn">
          🔔
          <span class="header-notifications-badge hidden" id="notifications-badge">0</span>
        </button>
        <div class="notifications-dropdown" id="notifications-panel">
          <div class="notifications-header">
            <span class="notifications-title">Notifications</span>
            <button class="btn btn-link btn-sm" id="mark-all-read">Mark all read</button>
          </div>
          <div class="notifications-list" id="notifications-list">
            <div class="notification-item">
              <div class="notification-content">
                <p class="notification-text text-muted text-center p-4">No notifications</p>
              </div>
            </div>
          </div>
          <div class="notifications-footer">
            <a href="#">View all notifications</a>
          </div>
        </div>
      </div>
      <div class="header-profile" id="profile-dropdown">
        <button class="header-profile-btn" id="profile-btn">
          <div class="header-profile-avatar">${getUserInitials(user.full_name)}</div>
          <div class="header-profile-info">
            <span class="header-profile-name">${user.full_name}</span>
            <span class="header-profile-role">${formatRoleName(user.role)}</span>
          </div>
        </button>
        <div class="profile-dropdown">
          <div class="profile-dropdown-header">
            <div class="profile-dropdown-name">${user.full_name}</div>
            <div class="profile-dropdown-email">${user.email}</div>
          </div>
          <div class="profile-dropdown-menu">
            <a href="/views/${user.role.replace('_', '-')}/profile.html" class="profile-dropdown-item">
              <span>👤</span> My Profile
            </a>
            <a href="#" class="profile-dropdown-item logout" id="profile-logout">
              <span>🚪</span> Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Setup dropdowns
  setupDropdown('notifications-dropdown', 'notifications-btn');
  setupDropdown('profile-dropdown', 'profile-btn');
  
  // Logout handlers
  const profileLogout = document.getElementById('profile-logout');
  if (profileLogout) {
    profileLogout.addEventListener('click', handleLogout);
  }
  
  // Mark all read handler
  const markAllReadBtn = document.getElementById('mark-all-read');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', async () => {
      await markAllNotificationsRead(user.id);
      updateNotificationsList([]);
      showToast('All notifications marked as read', 'success');
    });
  }
}

// ============================================
// SETUP DROPDOWN
// ============================================
function setupDropdown(containerId, toggleId) {
  const container = document.getElementById(containerId);
  const toggle = document.getElementById(toggleId);
  
  if (!container || !toggle) return;
  
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Close other dropdowns
    document.querySelectorAll('.header-notifications.active, .header-profile.active')
      .forEach(el => {
        if (el.id !== containerId) el.classList.remove('active');
      });
    
    container.classList.toggle('active');
  });
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('active');
    }
  });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  
  if (!sidebarToggle || !sidebar) return;
  
  // Create mobile overlay if not exists
  let overlay = document.querySelector('.mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
  }
  
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });
  
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });
}

// ============================================
// NOTIFICATIONS
// ============================================
function initNotifications(userId) {
  // Subscribe to real-time notifications
  subscribeToNotifications(userId, (notifications) => {
    updateNotificationsList(notifications);
  });
}

function updateNotificationsList(notifications) {
  const badge = document.getElementById('notifications-badge');
  const list = document.getElementById('notifications-list');
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Update badge
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
  
  // Update list
  if (list) {
    if (notifications.length === 0) {
      list.innerHTML = `
        <div class="notification-item">
          <div class="notification-content">
            <p class="notification-text text-muted text-center p-4">No notifications</p>
          </div>
        </div>
      `;
    } else {
      list.innerHTML = notifications.slice(0, 5).map(n => `
        <div class="notification-item ${n.is_read ? '' : 'unread'}">
          <div class="notification-icon ${getNotificationIconClass(n.notification_type)}">
            ${getNotificationIcon(n.notification_type)}
          </div>
          <div class="notification-content">
            <p class="notification-text">${n.message}</p>
            <span class="notification-time">${getRelativeTime(n.created_at)}</span>
          </div>
        </div>
      `).join('');
    }
  }
}

function getNotificationIcon(type) {
  const icons = {
    od_form: '📝',
    event: '📅',
    system: 'ℹ️'
  };
  return icons[type] || 'ℹ️';
}

function getNotificationIconClass(type) {
  const classes = {
    od_form: 'info',
    event: 'success',
    system: 'warning'
  };
  return classes[type] || 'info';
}

// ============================================
// LOGOUT HANDLER
// ============================================
async function handleLogout(e) {
  e.preventDefault();
  
  const confirmed = await showConfirm({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    confirmText: 'Logout',
    cancelText: 'Cancel'
  });
  
  if (confirmed) {
    await logout();
  }
}

// ============================================
// SET PAGE TITLE
// ============================================
export function setPageTitle(title) {
  // Update browser title
  document.title = `${title} | BVDU CampusFlow`;
  
  // Update breadcrumb
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

// ============================================
// UPDATE SIDEBAR BADGE
// ============================================
export function updateSidebarBadge(href, count) {
  const link = document.querySelector(`.sidebar-link[href*="${href}"]`);
  if (!link) return;
  
  let badge = link.querySelector('.sidebar-link-badge');
  
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'sidebar-link-badge';
      link.appendChild(badge);
    }
    badge.textContent = count > 99 ? '99+' : count;
  } else if (badge) {
    badge.remove();
  }
}

export default {
  initApp,
  setPageTitle,
  updateSidebarBadge
};
