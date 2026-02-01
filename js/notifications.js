/**
 * Notifications Module
 * OD Forms Management System - BVDU CampusFlow
 * 
 * Handles toast notifications and alert messages
 */

// ============================================
// TOAST CONFIGURATION
// ============================================
const TOAST_DURATION = 4000; // 4 seconds
const TOAST_CONTAINER_ID = 'toast-container';

// ============================================
// CREATE TOAST CONTAINER
// ============================================
function getToastContainer() {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  
  return container;
}

// ============================================
// SHOW TOAST
// ============================================
export function showToast(message, type = 'info', duration = TOAST_DURATION) {
  const container = getToastContainer();
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: auto;
    max-width: 100%;
    border-left: 4px solid;
  `;
  
  // Set color based on type
  const colors = {
    success: { border: '#22C55E', bg: '#F0FDF4', icon: '✓', iconBg: '#DCFCE7' },
    error: { border: '#EF4444', bg: '#FEF2F2', icon: '✕', iconBg: '#FEE2E2' },
    warning: { border: '#F59E0B', bg: '#FFFBEB', icon: '⚠', iconBg: '#FEF3C7' },
    info: { border: '#3B82F6', bg: '#EFF6FF', icon: 'ℹ', iconBg: '#DBEAFE' }
  };
  
  const color = colors[type] || colors.info;
  toast.style.borderLeftColor = color.border;
  toast.style.backgroundColor = color.bg;
  
  toast.innerHTML = `
    <div style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: ${color.iconBg};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
      color: ${color.border};
    ">${color.icon}</div>
    <div style="flex: 1; min-width: 0;">
      <p style="
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: #111827;
        word-wrap: break-word;
      ">${message}</p>
    </div>
    <button class="toast-close" style="
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 0;
      flex-shrink: 0;
    ">×</button>
  `;
  
  // Add to container
  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });
  
  // Close button handler
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));
  
  // Auto remove after duration
  const timeoutId = setTimeout(() => removeToast(toast), duration);
  
  // Pause on hover
  toast.addEventListener('mouseenter', () => clearTimeout(timeoutId));
  toast.addEventListener('mouseleave', () => {
    setTimeout(() => removeToast(toast), 1000);
  });
  
  return toast;
}

// ============================================
// REMOVE TOAST
// ============================================
function removeToast(toast) {
  if (!toast || !toast.parentNode) return;
  
  toast.style.transform = 'translateX(100%)';
  toast.style.opacity = '0';
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// ============================================
// CONVENIENCE METHODS
// ============================================

export function showSuccess(message, duration) {
  return showToast(message, 'success', duration);
}

export function showError(message, duration) {
  return showToast(message, 'error', duration);
}

export function showWarning(message, duration) {
  return showToast(message, 'warning', duration);
}

export function showInfo(message, duration) {
  return showToast(message, 'info', duration);
}

// ============================================
// CLEAR ALL TOASTS
// ============================================
export function clearAllToasts() {
  const container = document.getElementById(TOAST_CONTAINER_ID);
  if (container) {
    container.innerHTML = '';
  }
}

// ============================================
// CONFIRMATION DIALOG
// ============================================
export function showConfirm(options = {}) {
  return new Promise((resolve) => {
    const {
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmClass = 'btn-primary',
      dangerous = false
    } = options;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 16px;
    `;
    
    overlay.innerHTML = `
      <div class="modal" style="
        background: white;
        border-radius: 16px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        animation: modalIn 0.2s ease;
      ">
        <div class="modal-header" style="
          padding: 20px 24px;
          border-bottom: 1px solid #E5E7EB;
        ">
          <h3 style="
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #111827;
          ">${title}</h3>
        </div>
        <div class="modal-body" style="padding: 24px;">
          <p style="
            margin: 0;
            font-size: 14px;
            color: #6B7280;
            line-height: 1.5;
          ">${message}</p>
        </div>
        <div class="modal-footer" style="
          padding: 16px 24px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background-color: #F9FAFB;
          border-radius: 0 0 16px 16px;
        ">
          <button class="btn btn-secondary cancel-btn" style="
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 8px;
            border: 1px solid #D1D5DB;
            background: white;
            color: #374151;
            cursor: pointer;
          ">${cancelText}</button>
          <button class="btn ${dangerous ? 'btn-danger' : confirmClass} confirm-btn" style="
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 8px;
            border: none;
            background: ${dangerous ? '#DC2626' : '#2563EB'};
            color: white;
            cursor: pointer;
          ">${confirmText}</button>
        </div>
      </div>
    `;
    
    // Add style for animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
    
    // Handle clicks
    const cancelBtn = overlay.querySelector('.cancel-btn');
    const confirmBtn = overlay.querySelector('.confirm-btn');
    
    const close = (result) => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
        document.head.removeChild(style);
        resolve(result);
      }, 200);
    };
    
    cancelBtn.addEventListener('click', () => close(false));
    confirmBtn.addEventListener('click', () => close(true));
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
    
    // Close on Escape key
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeydown);
        close(false);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Focus confirm button
    confirmBtn.focus();
  });
}

// ============================================
// INPUT DIALOG
// ============================================
export function showPrompt(options = {}) {
  return new Promise((resolve) => {
    const {
      title = 'Enter Value',
      message = '',
      placeholder = '',
      defaultValue = '',
      inputType = 'text',
      confirmText = 'Submit',
      cancelText = 'Cancel',
      required = false,
      multiline = false
    } = options;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 16px;
    `;
    
    const inputElement = multiline
      ? `<textarea class="prompt-input form-control" placeholder="${placeholder}" style="
          min-height: 100px;
          resize: vertical;
        ">${defaultValue}</textarea>`
      : `<input type="${inputType}" class="prompt-input form-control" placeholder="${placeholder}" value="${defaultValue}">`;
    
    overlay.innerHTML = `
      <div class="modal" style="
        background: white;
        border-radius: 16px;
        width: 100%;
        max-width: 450px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      ">
        <div class="modal-header" style="
          padding: 20px 24px;
          border-bottom: 1px solid #E5E7EB;
        ">
          <h3 style="
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #111827;
          ">${title}</h3>
        </div>
        <div class="modal-body" style="padding: 24px;">
          ${message ? `<p style="margin: 0 0 16px; font-size: 14px; color: #6B7280;">${message}</p>` : ''}
          ${inputElement}
        </div>
        <div class="modal-footer" style="
          padding: 16px 24px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background-color: #F9FAFB;
          border-radius: 0 0 16px 16px;
        ">
          <button class="btn btn-secondary cancel-btn">${cancelText}</button>
          <button class="btn btn-primary confirm-btn">${confirmText}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const input = overlay.querySelector('.prompt-input');
    const cancelBtn = overlay.querySelector('.cancel-btn');
    const confirmBtn = overlay.querySelector('.confirm-btn');
    
    const close = (value) => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(value);
      }, 200);
    };
    
    const submit = () => {
      const value = input.value.trim();
      if (required && !value) {
        input.style.borderColor = '#EF4444';
        input.focus();
        return;
      }
      close(value);
    };
    
    cancelBtn.addEventListener('click', () => close(null));
    confirmBtn.addEventListener('click', submit);
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault();
        submit();
      }
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(null);
    });
    
    // Focus input
    input.focus();
    if (defaultValue) {
      input.select();
    }
  });
}

// ============================================
// LOADING OVERLAY
// ============================================
let loadingOverlay = null;

export function showLoadingOverlay(message = 'Loading...') {
  if (loadingOverlay) return;
  
  loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10001;
  `;
  
  loadingOverlay.innerHTML = `
    <div class="spinner" style="
      width: 48px;
      height: 48px;
      border: 4px solid #E5E7EB;
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    "></div>
    <p style="
      margin-top: 16px;
      font-size: 14px;
      color: #6B7280;
    ">${message}</p>
  `;
  
  // Add spin animation if not exists
  if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(loadingOverlay);
}

export function hideLoadingOverlay() {
  if (loadingOverlay) {
    document.body.removeChild(loadingOverlay);
    loadingOverlay = null;
  }
}

export function updateLoadingMessage(message) {
  if (loadingOverlay) {
    const p = loadingOverlay.querySelector('p');
    if (p) p.textContent = message;
  }
}

export default {
  showToast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  clearAllToasts,
  showConfirm,
  showPrompt,
  showLoadingOverlay,
  hideLoadingOverlay,
  updateLoadingMessage
};
