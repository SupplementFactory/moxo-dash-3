# Moxo Dash Enhanced - Supplement Project Management System

A comprehensive project management dashboard for supplement formulation projects with real-time updates, authentication, and backend data storage.

## Features

- **Company Dashboard**: Secure access for company staff to manage all projects
- **Client Project Views**: Individual project URLs with unique passwords for clients
- **Real-time Updates**: Immediate synchronization between company and client views
- **Authentication System**: Simple password protection for company dashboard + unique client passwords
- **Backend Storage**: Supabase PostgreSQL database with real-time capabilities
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

- **Frontend**: HTML/CSS/JavaScript (deployed on Vercel)
- **Backend**: Vercel Functions (API endpoints)
- **Database**: Supabase PostgreSQL
- **Authentication**: Simple password-based system
- **Real-time**: Polling-based updates (5-second intervals)

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
COMPANY_PASSWORD=your_company_password
```

### 2. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Database Initialization

The database will be automatically initialized on first API call. The system will create:
- `projects` table with all necessary fields
- Sample projects for demonstration

### 4. Deployment to Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `COMPANY_PASSWORD`
3. Deploy

## Usage

### Company Access

1. Visit `/dashboard.html` or `/dashboard`
2. Enter the company password when prompted
3. View all projects, create new projects, edit existing projects

### Client Access

1. Visit `/projects/{project-slug}` (URL provided by company)
2. Enter the project-specific password
3. View project details and real-time updates

### Creating New Projects

1. Access company dashboard
2. Click "New Project" button
3. Fill in project details
4. System generates unique client URL and password
5. Share URL and password with client

## API Endpoints

- `GET /api/projects` - Get all projects (company only)
- `GET /api/projects?id={id}` - Get specific project by ID
- `GET /api/projects?slug={slug}` - Get specific project by slug
- `POST /api/projects` - Create new project (company only)
- `PUT /api/projects?id={id}` - Update project (company only)
- `DELETE /api/projects?id={id}` - Delete project (company only)
- `POST /api/auth` - Authenticate company or client user
- `POST /api/init-db` - Initialize database (first-time setup)

## Project Structure

```
├── api/                    # Vercel Functions (API endpoints)
│   ├── auth.js            # Authentication endpoint
│   ├── projects.js        # Project CRUD operations
│   └── init-db.js         # Database initialization
├── js/                    # Frontend JavaScript
│   ├── api-client.js      # API communication layer
│   ├── auth-manager.js    # Authentication management
│   ├── data-storage-enhanced.js # Enhanced data storage
│   └── [original files]   # Existing project files
├── lib/                   # Shared utilities
│   └── supabase.js        # Supabase configuration
├── css/                   # Stylesheets
├── assets/               # Images and static files
├── index.html            # Client project view
├── dashboard.html        # Company dashboard
├── edit.html            # Project editing interface
├── package.json         # Dependencies
├── vercel.json          # Vercel configuration
└── README.md            # This file
```

## Migration to AWS

The system is designed for easy migration to AWS:

1. **Database**: Export Supabase data to AWS RDS (PostgreSQL)
2. **Backend**: Convert Vercel Functions to AWS Lambda
3. **Frontend**: Deploy static files to S3 + CloudFront
4. **Authentication**: Integrate with AWS Cognito if needed

## Security Notes

- Company password should be changed from default
- Client passwords are auto-generated (12 characters)
- All API endpoints include CORS headers
- No sensitive data is stored in localStorage
- Database access is controlled via Supabase RLS policies

## Support

For issues or questions, please check the console logs and ensure:
1. Supabase credentials are correct
2. Database has been initialized
3. Authentication is working properly

## License

MIT License - see LICENSE file for details

