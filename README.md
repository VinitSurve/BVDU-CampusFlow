# BVDU CampusFlow - OD Forms Management System

A comprehensive digital platform for managing On-Duty (OD) forms for college students with a multi-level approval workflow.

## 🎯 Overview

CampusFlow streamlines the OD form approval process with:
- **Student Portal**: Submit OD forms, track status, view events
- **Event Leader Portal**: Create events, review/approve OD forms
- **Faculty Portal**: Subject-wise approval of student OD requests
- **HOD Portal**: Final approval authority, department management

## 🚀 Quick Start

**⚡ Fast Setup** (60 minutes total):
1. **[QUICK_START.md](docs/QUICK_START.md)** - Complete setup checklist

**📚 Detailed Guides**:
- **[ENV_SETUP.md](docs/ENV_SETUP.md)** - Secure API key management ⭐ START HERE
- **[FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)** - Authentication & Database  
- **[GOOGLE_DRIVE_SETUP.md](docs/GOOGLE_DRIVE_SETUP.md)** - File storage (15GB free)
- **[VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)** - Deploy to production

### 1. Clone/Download the Project
```bash
git clone <repository-url>
cd "BVDU CampusFlow"
```

### 2. Configure Firebase & Google Drive

**Set up API Keys using Environment Variables** (Secure):
1. Copy `.env.example` to `.env`
2. Add your Firebase credentials (from Firebase Console)
3. Add your Google Drive credentials (from Google Cloud Console)
4. See [ENV_SETUP.md](docs/ENV_SETUP.md) for detailed guide

**Setup Guides:**
- **[ENV_SETUP.md](docs/ENV_SETUP.md)** - Environment variables (START HERE)
- **[FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)** - Firebase Auth & Database
- **[GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md)** - File Storage (15GB FREE)

**Why Environment Variables?**
- ✅ Keep API keys secure (not in Git)
- ✅ Different keys for dev/production
- ✅ Team collaboration without exposing credentials
- ✅ Industry best practice

### 3. Start Local Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Or use VS Code Live Server extension
```

### 4. Open in Browser
Navigate to `http://localhost:8000`

## 📁 Project Structure

```
BVDU CampusFlow/
├── index.html                 # Login page
├── register.html              # Student registration
├── forgot-password.html       # Password reset
├── css/
│   ├── variables.css          # Design tokens
│   ├── main.css               # Base styles
│   ├── components.css         # UI components
│   ├── layout.css             # Layout system
│   └── responsive.css         # Media queries
├── js/
│   ├── firebase-config.js     # Firebase setup
│   ├── auth.js                # Authentication
│   ├── db.js                  # Database operations
│   ├── storage.js             # File uploads
│   ├── utils.js               # Utilities
│   ├── notifications.js       # Toast/alerts
│   └── app.js                 # App initialization
├── views/
│   ├── student/               # Student dashboards
│   ├── event-leader/          # Event leader views
│   ├── faculty/               # Faculty views
│   └── hod/                   # HOD views
└── firebase/
    ├── firestore.rules        # Database security
    └── storage.rules          # Storage security
```

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Submit OD forms, view events, track approval status |
| **Event Leader** | Create events, first-level OD approval, manage participants |
| **Faculty** | Subject-wise approval for students in their classes |
| **HOD** | Final approval, create faculty accounts, department oversight |

## 🔄 Approval Workflow

```
Student submits OD form
         ↓
Event Leader reviews → Approve/Reject
         ↓ (if approved)
Each Faculty reviews → Approve/Reject (per subject)
         ↓ (all faculty approved)
HOD reviews → Final Approve/Reject
         ↓
OD Form Complete ✓
```

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend Services**:
  - **Firebase** - Authentication & Firestore Database
  - **Google Drive** - File Storage (15GB FREE)
- **Design**: Custom CSS with design tokens

## 📱 Features

### Student Features
- Dashboard with OD form statistics
- Submit new OD forms with proof documents
- View all events and register
- Track form approval progress
- Profile management

### Event Leader Features
- Create and manage events
- Review pending OD forms
- Approve/reject with remarks
- Manage event participants

### Faculty Features
- View pending subject approvals
- Approve/reject student OD requests
- Subject-wise tracking

### HOD Features
- Final approval authority
- Create faculty accounts
- Department-wide visibility
- Event oversight

## 🔒 Security

- Role-based access control
- Firestore security rules
- Storage rules for file uploads
- Input validation
- Secure authentication flow

## 📧 Demo Accounts

After setting up Firebase and creating test users:

| Role | Email | Password |
|------|-------|----------|
| Student | student@test.com | test123 |
| Event Leader | leader@test.com | test123 |
| Faculty | faculty@test.com | test123 |
| HOD | hod@test.com | test123 |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## � Deployment

### Deploy to Vercel (Recommended - FREE)

1. Push code to GitHub
2. Import to Vercel
3. Auto-deploy on every push!

**Complete guide**: [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)

**Live in 5 minutes** with:
- ✅ Free HTTPS & Custom Domain
- ✅ Global CDN (fast worldwide)
- ✅ Automatic deployments
- ✅ Zero configuration needed

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

**Setup Guides:**
- [Firebase Setup](docs/FIREBASE_SETUP.md) - Auth & Database
- [Google Drive Setup](docs/GOOGLE_DRIVE_SETUP.md) - File Storage
- [Vercel Deployment](docs/VERCEL_DEPLOYMENT.md) - Production Hosting

---

Built with ❤️ for BVDU
# BVDU-CampusFlow
