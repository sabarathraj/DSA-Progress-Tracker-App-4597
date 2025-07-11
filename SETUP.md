# DSA Tracker - Supabase Setup Guide

## Prerequisites
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Setup Steps

### 1. Database Setup
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run** to execute the schema
5. Optionally, run `database/seed.sql` for sample data

### 2. Authentication Setup
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Disable **Email confirmations** for easier testing (optional)
4. Set **Site URL** to your app URL (e.g., `http://localhost:5173` for development)

### 3. API Keys
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. Update `src/lib/supabase.js` with your credentials:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key-here'
```

### 4. Enable Realtime (Optional)
1. Go to **Database** → **Replication**
2. Enable realtime for the following tables:
   - `user_profiles`
   - `problems`
   - `daily_progress`
   - `problem_notes`
   - `user_badges`

### 5. Test Connection
1. Start your development server: `npm run dev`
2. Try signing up with a new account
3. Add a problem and mark it as complete
4. Verify data appears in your Supabase dashboard

## Features Enabled

### ✅ Authentication
- Email/password signup and login
- Secure user sessions
- Profile management

### ✅ Real-time Data
- Live problem updates
- Real-time daily progress tracking
- Automatic streak calculations

### ✅ Database Features
- Row Level Security (RLS)
- Automatic timestamps
- Data validation
- Performance indexes

### ✅ Problem Management
- Add, edit, delete problems
- Status tracking (Not Started → In Progress → Done)
- Notes and tags support
- XP and difficulty levels

### ✅ Progress Tracking
- Daily goal setting and tracking
- Automatic progress calculation
- Streak counting
- Badge system
- Analytics and charts

## Environment Variables (Optional)
For production, set these environment variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### Common Issues:
1. **RLS Errors**: Ensure all tables have proper RLS policies
2. **Auth Issues**: Check if email confirmation is disabled for testing
3. **Realtime Not Working**: Verify tables are added to realtime publication
4. **Import Errors**: Make sure all dependencies are installed with `npm install`

### Database Reset:
If you need to reset the database:
1. Go to **Settings** → **General**
2. Scroll down to **Reset Database**
3. Re-run the schema setup

## Next Steps
1. Customize the sample problems in `seed.sql`
2. Add more badge types in the schema
3. Implement additional analytics features
4. Deploy to production with proper environment variables