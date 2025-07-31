# Deployment Guide - Moxo Dash Enhanced

## Quick Start (5 minutes)

### 1. Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings > API**
3. Copy your **Project URL** and **anon public key**

### 2. Deploy to Vercel

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add these environment variables in Vercel:
   ```
   SUPABASE_URL=your_project_url_here
   SUPABASE_ANON_KEY=your_anon_key_here
   COMPANY_PASSWORD=your_secure_company_password
   ```
4. Deploy!

### 3. Initialize Database

1. Visit your deployed site at `/api/init-db` (POST request)
2. Or the database will auto-initialize on first use

## Usage After Deployment

### Company Access
- Visit `your-domain.com/dashboard`
- Enter your company password
- Create and manage projects

### Client Access
- Each project gets a unique URL: `your-domain.com/projects/project-slug`
- Each project has an auto-generated password
- Share both URL and password with clients

## Features Implemented

### ✅ Authentication System
- **Company Dashboard**: Password-protected access for staff
- **Client Projects**: Individual URLs with unique passwords
- **Logout Functionality**: Secure session management

### ✅ Real-time Updates
- **Polling System**: 5-second update intervals
- **Immediate Sync**: Changes appear instantly across all views
- **Offline Resilience**: Graceful handling of connection issues

### ✅ Database Integration
- **Supabase PostgreSQL**: Production-ready database
- **API Endpoints**: RESTful API for all operations
- **Data Persistence**: No more localStorage limitations

### ✅ Project Management
- **Multi-project Support**: Unlimited projects
- **Progress Tracking**: 19-stage development roadmap
- **Metrics Dashboard**: Budget, quality, timeline tracking
- **Client Communication**: Secure project sharing

### ✅ Migration Ready
- **AWS Compatible**: Easy migration to EC2 + RDS
- **Portable Code**: Standard REST API design
- **Export Ready**: Data can be easily exported

## API Endpoints

```
GET  /api/projects           - Get all projects (company only)
GET  /api/projects?slug=X    - Get project by slug
POST /api/projects           - Create project (company only)
PUT  /api/projects?id=X      - Update project (company only)
POST /api/auth               - Authenticate user
POST /api/init-db            - Initialize database
```

## Security Features

- **Password Protection**: Both company and client access secured
- **Auto-generated Passwords**: 12-character random client passwords
- **CORS Enabled**: Secure cross-origin requests
- **Input Validation**: All API inputs validated
- **Error Handling**: Graceful error management

## Sample Credentials (Change These!)

```
Company Password: supplement2024
Sample Client Password: HealGreens2024
```

## Troubleshooting

### Database Issues
- Check Supabase credentials in environment variables
- Ensure database is initialized (visit `/api/init-db`)
- Check browser console for API errors

### Authentication Issues
- Verify passwords are correct
- Clear browser localStorage if needed
- Check network requests in browser dev tools

### Deployment Issues
- Ensure all environment variables are set in Vercel
- Check function logs in Vercel dashboard
- Verify Supabase project is active

## Next Steps

1. **Change Default Passwords**: Update company password in environment variables
2. **Custom Domain**: Set up your custom domain in Vercel
3. **SSL Certificate**: Vercel provides automatic SSL
4. **Monitoring**: Set up error tracking and analytics
5. **Backup**: Regular database backups via Supabase

## Migration to AWS (Future)

When ready to migrate to AWS:

1. **Database**: Export Supabase data to AWS RDS PostgreSQL
2. **Backend**: Convert Vercel Functions to AWS Lambda
3. **Frontend**: Deploy static files to S3 + CloudFront
4. **Environment**: Update environment variables for AWS services

The code is designed for easy migration with minimal changes required.

## Support

- Check browser console for errors
- Review API responses in Network tab
- Ensure Supabase project is active and accessible
- Verify environment variables are correctly set

Your enhanced supplement project management system is ready for production! 🚀

