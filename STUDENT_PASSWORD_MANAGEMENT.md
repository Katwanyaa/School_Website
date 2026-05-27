# Student Portal Password Management System

## Overview
This system manages student portal password setup and provides admin tools to track which students have set their passwords and send reminders to those who haven't.

## Components

### 1. API Endpoint: `/api/admin/student-password-reminders`

#### GET Request
Fetches list of students with their password status.

**Query Parameters:**
- `filter` (optional): `'all'` | `'not-set'` | `'set'` - Default: `'all'`
- `form` (optional): Filter by student form (e.g., '4', '5', '6')
- `limit` (optional): Number of records to return - Default: 100
- `skip` (optional): Number of records to skip for pagination - Default: 0

**Response:**
```json
{
  "success": true,
  "total": 50,
  "count": 50,
  "skip": 0,
  "limit": 100,
  "filter": "not-set",
  "students": [
    {
      "id": "student_id",
      "admissionNumber": "ADM001",
      "firstName": "John",
      "fullName": "John Doe",
      "form": "4",
      "email": "student@school.com",
      "parentEmail": "parent@email.com",
      "parentPhone": "0712345678",
      "passwordSet": false,
      "passwordNotSet": true,
      "passwordSetAt": "2024-05-27T10:00:00Z",
      "lastLoginAt": null,
      "status": "active",
      "createdAt": "2024-05-27T10:00:00Z",
      "updatedAt": "2024-05-27T10:00:00Z"
    }
  ],
  "summary": {
    "totalStudents": 250,
    "passwordSet": 200,
    "passwordNotSet": 50
  }
}
```

#### POST Request
Sends password setup reminder emails to selected students.

**Request Body:**
```json
{
  "admissionNumbers": ["ADM001", "ADM002", "ADM003"],
  "message": "Optional custom message to include in the email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reminders sent: 3 succeeded, 0 failed",
  "successCount": 3,
  "failureCount": 0,
  "results": [
    {
      "admissionNumber": "ADM001",
      "name": "John Doe",
      "email": "parent@email.com",
      "success": true
    }
  ]
}
```

### 2. Admin Component: `StudentPasswordReminders.jsx`

Located at: `app/components/adminsandprofile/StudentPasswordReminders.jsx`

**Features:**
- View all students with password status (set/not set)
- Filter by password status or student form
- Search by admission number, name, or email
- Select individual students or all students
- Send bulk reminder emails with optional custom message
- View detailed student information (click row expander)
- Real-time summary statistics

**Usage in Admin Dashboard:**
```jsx
import StudentPasswordReminders from '@/app/components/adminsandprofile/StudentPasswordReminders';

// In your admin page:
<StudentPasswordReminders />
```

## Database Schema

### StudentPortalAccount
- `admissionNumber`: Unique identifier
- `passwordHash`: Hashed password
- `passwordSetAt`: Timestamp when password was set (used to detect if truly set)
- `lastLoginAt`: Last login timestamp
- `status`: Account status ('active', 'inactive', etc.)

### StudentPasswordResetRequest
- `admissionNumber`: Student admission number
- `requestType`: 'forgot', 'setup', or 'initial'
- `tokenHash`: SHA256 hash of reset token
- `expiresAt`: When the reset link expires
- `status`: 'pending', 'email_sent', 'used', 'expired'

## How It Works

### Detecting Password Setup Status

The system determines if a student has set their password by comparing:
- `passwordSetAt` timestamp
- `createdAt` timestamp

If the difference is less than 1 hour, the password is likely NOT set by the user (just the default).

```javascript
const passwordNotReallySet = (passwordSetAt - createdAt) < 3600000; // 1 hour
```

### Sending Reminders

1. Admin selects students who haven't set their password
2. Optionally adds custom message
3. System generates unique 7-day expiration token for each student
4. Creates `StudentPasswordResetRequest` record with type 'setup'
5. Sends HTML email with:
   - Student admission number and form
   - Password setup link with token
   - Optional custom message from admin
   - School contact information
6. Records success/failure for each student

### Student Flow

1. Student receives email with setup link
2. Clicks link to `/student-portal/setup-password?token=TOKEN`
3. Page verifies token via GET `/api/studentresetpassword?token=TOKEN`
4. If valid, student can set new password
5. Sends POST to `/api/studentresetpassword` with new password
6. System hashes password and updates `StudentPortalAccount`
7. Marks reset request as used with `usedAt` timestamp

## Email Sending Requirements

### Environment Variables
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Gmail Setup
1. Enable 2-Factor Authentication on Gmail account
2. Create App Password (not your regular password)
3. Use App Password in `EMAIL_PASS`

## API Endpoints for Student Password Reset

### Forgot Password: `POST /api/studentforgotpassword`
Request body:
```json
{
  "admissionNumber": "ADM001"
}
```

Response: Sends email with password reset link

### Verify Reset Token: `GET /api/studentresetpassword?token=TOKEN`
Response:
```json
{
  "valid": true,
  "admissionNumber": "ADM001",
  "studentName": "John Doe",
  "expires": "2024-05-28T10:00:00Z",
  "timeRemaining": 86400000
}
```

### Reset Password: `POST /api/studentresetpassword`
Request body:
```json
{
  "token": "TOKEN",
  "newPassword": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

Response: Confirms password update

## Best Practices

1. **Send Reminders Periodically**: Not all students check email immediately
   - 1st reminder: When account created
   - 2nd reminder: After 1 week if not set
   - 3rd reminder: After 2 weeks if not set

2. **Include School Context**: Help students understand why they need this
   - Use custom message to explain portal features
   - Mention important deadlines
   - Provide support contact info

3. **Monitor Failed Emails**: Check results after sending
   - Fix missing parent email addresses
   - Update contact information in database

4. **Security**: 
   - Tokens expire after 7 days
   - One-time use only
   - Hashed in database
   - Logged IP and user agent

## Troubleshooting

### Emails Not Sending
1. Check `EMAIL_USER` and `EMAIL_PASS` in environment variables
2. Verify Gmail App Password is correctly configured
3. Check email service logs
4. Try sending test email manually

### Incorrect Password Status
1. Check `passwordSetAt` vs `createdAt` timestamps
2. Verify bcrypt password hash in `passwordHash` field
3. Manual update if needed: Update `passwordSetAt` in database

### Lost Password Reset Links
1. Generate new token via admin panel
2. Old tokens automatically expire after 7 days
3. Student can use "Forgot Password" link anytime

## File Locations

- API Endpoint: `app/api/admin/student-password-reminders/route.js`
- Admin Component: `app/components/adminsandprofile/StudentPasswordReminders.jsx`
- Student Forgot Password: `app/api/studentforgotpassword/route.js`
- Student Reset Password: `app/api/studentresetpassword/route.js`
- Student Login: `app/api/studentlogin/route.js`
