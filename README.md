# 🎓 BVDU Event Management System - OD Forms DMS

A comprehensive On-Duty (OD) Form Management System for Bharati Vidyapeeth Deemed University. This system streamlines the process of managing student attendance during events with multi-level approval workflows.

## 🌟 Features

- **Student Portal**: Submit OD forms, track approval status, view form history
- **Event Leader Dashboard**: Create events, review and approve/reject OD forms
- **Faculty Portal**: Review event leader-approved forms, manage timetables
- **HOD Dashboard**: Final approval authority, comprehensive oversight
- **Multi-level Approval Workflow**: Event Leader → Faculty → HOD
- **Partial Approvals**: Subject-wise approval/rejection capability
- **Real-time Tracking**: Live status updates and approval timeline
- **Timetable Integration**: Automated lecture detection
- **Document Management**: Upload and manage proof documents
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (Static Hosting)

## 📋 Prerequisites

Before you begin, ensure you have:

- A [Supabase](https://supabase.com) account
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (optional, for deployment)
- Basic knowledge of Git and command line

## 🔧 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/od-forms-bvdu-dms.git
cd od-forms-bvdu-dms
```

### 2. Configure Supabase Credentials

1. Copy the example config file:
   ```bash
   cp od-forms-bvdu-dms/js/config.example.js od-forms-bvdu-dms/js/config.js
   ```

2. Get your Supabase credentials:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Settings → API
   - Copy your **Project URL** and **anon/public key**

3. Update `od-forms-bvdu-dms/js/config.js`:
   ```javascript
   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
   ```

### 3. Set Up Database

Run the SQL scripts in your Supabase SQL Editor (in order):

1. `sql/SCHEMA.sql` - Creates all tables
2. `sql/RLS_POLICIES.sql` - Sets up Row Level Security
3. `sql/INSERT_SAMPLE_DATA.sql` - Adds sample data (optional)
4. `sql/INSERT_COMPLETE_TIMETABLES.sql` - Populates timetable data

### 4. Run Locally

Simply open `od-forms-bvdu-dms/index.html` in your browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Visit `http://localhost:8000/od-forms-bvdu-dms/`

## 🌐 Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty or set to `/`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Click "Deploy"

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd "Final Year Project"
vercel

# Follow the prompts
```

### Important: Add Credentials After Deployment

After deploying, you need to add your Supabase credentials:

**Option 1: Manual File Upload**
1. Go to Vercel Dashboard → Your Project → Settings → General
2. Use Vercel CLI to add the config.js file:
   ```bash
   # Copy your local config.js to deployment
   vercel env add SUPABASE_CONFIG production
   ```

**Option 2: Update config.js via deployment**
- Keep `config.js` in your repo (Vercel will copy it)
- Make sure it has your correct credentials locally
- Temporarily remove `js/config.js` from `.gitignore` ONLY for the first deployment
- After first deployment, add it back to `.gitignore`

## 📁 Project Structure

```
Final Year Project/
├── .gitignore                          # Git ignore rules (credentials excluded)
├── README.md                           # This file
├── vercel.json                         # Vercel configuration
└── od-forms-bvdu-dms/
    ├── index.html                      # Landing page
    ├── login.html                      # Login page
    ├── css/                            # Stylesheets
    ├── js/
    │   ├── config.js                   # ⚠️ NEVER COMMIT - Contains credentials
    │   ├── config.example.js           # Template for config.js
    │   └── *.js                        # Other JavaScript files
    ├── views/
    │   ├── student/                    # Student portal pages
    │   ├── faculty/                    # Faculty portal pages
    │   ├── event-leader/               # Event leader pages
    │   └── hod/                        # HOD dashboard
    └── sql/                            # Database scripts
        ├── SCHEMA.sql
        ├── RLS_POLICIES.sql
        └── ...
```

## 🔐 Security Notes

### ⚠️ CRITICAL - Never Commit These Files:

- `js/config.js` (contains Supabase credentials)
- `.env` files
- Any file with API keys or secrets

### Credentials Already Protected:

The `.gitignore` file is configured to exclude:
- All `config.js` files
- Environment variable files (`.env*`)
- API keys and secrets
- Database backups

### If You Accidentally Committed Credentials:

1. **Immediately regenerate** your Supabase keys:
   - Go to Supabase Dashboard → Settings → API
   - Click "Generate new anon key"
   - Update your local `config.js`

2. Remove from Git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch od-forms-bvdu-dms/js/config.js" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

## 👥 Default Users

After running `INSERT_SAMPLE_DATA.sql`:

| Role          | Email                | Password     |
|---------------|----------------------|--------------|
| Student       | student1@bvdu.in     | student123   |
| Faculty       | faculty1@bvdu.in     | faculty123   |
| Event Leader  | leader1@bvdu.in      | leader123    |
| HOD           | hod@bvdu.in          | hod123       |
| Admin         | admin@bvdu.in        | admin123     |

**⚠️ Change these passwords in production!**

## 📚 Database Schema

### Main Tables:
- `users` - User accounts and profiles
- `events` - Event information
- `od_forms` - OD form submissions
- `od_subject_approvals` - Subject-wise approval tracking
- `subjects` - Subject master data
- `timetables` - Class timetables

See `sql/SCHEMA.sql` for complete schema.

## 🛠️ Development

### Adding New Features

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test thoroughly

4. Commit and push:
   ```bash
   git add .
   git commit -m "Add: your feature description"
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub

### Code Style

- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Test on multiple browsers

## 🐛 Troubleshooting

### Config.js Not Found
- Make sure you copied `config.example.js` to `config.js`
- Check that `config.js` is in the correct directory

### Supabase Connection Failed
- Verify your Supabase URL and key in `config.js`
- Check Supabase project status
- Ensure RLS policies are set up correctly

### Forms Not Saving
- Check browser console for errors
- Verify database tables are created
- Check Supabase logs

### Deployment Issues
- Clear Vercel cache and redeploy
- Check build logs for errors
- Verify all file paths are correct

## 📄 License

This project is created for Bharati Vidyapeeth Deemed University.

## 👨‍💻 Author

Developed as a Final Year Project

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review SQL scripts for database setup

## 🔄 Version History

- **v1.0.0** - Initial release
  - Student portal
  - Multi-level approval workflow
  - Event management
  - Faculty and HOD dashboards
  - Timetable integration

---

**Remember**: Never commit sensitive credentials! Always use `.gitignore` and environment variables for production deployments.
