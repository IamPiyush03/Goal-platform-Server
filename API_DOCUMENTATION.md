# Goal Achievement Platform API Documentation

## Overview
This API provides endpoints for a comprehensive goal achievement platform with AI-powered tutoring, progress tracking, and user management.

## Base URL
```
http://localhost:4000
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email to verify your account."
}
```

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/verify-email
Verify user email address.

**Query Parameters:**
- `token`: Verification token from email

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### POST /auth/resend-verification
Resend email verification.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/request-password-reset
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Reset password using token.

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "newpassword123"
}
```

---

## Goal Management Endpoints

### GET /goals
Get all user's goals.

**Response:**
```json
[
  {
    "id": "goal-id",
    "title": "Learn React",
    "progress": 75
  }
]
```

### POST /goals
Create a new goal.

**Request Body:**
```json
{
  "title": "Learn React",
  "description": "Master React development",
  "timeline": "3 months"
}
```

**Response:**
```json
{
  "goalId": "new-goal-id",
  "milestones": [...]
}
```

### GET /goals/:id
Get detailed goal information.

**Response:**
```json
{
  "id": "goal-id",
  "title": "Learn React",
  "description": "Master React development",
  "timeline": "3 months",
  "progress": 75,
  "milestones": [...]
}
```

### PATCH /goals/:id/milestones
Update milestone completion status.

**Request Body:**
```json
{
  "week": 1,
  "completed": true
}
```

---

## Chat & AI Endpoints

### POST /chat
Send message to AI tutor.

**Request Body:**
```json
{
  "goalId": "goal-id",
  "message": "Help me understand React hooks",
  "type": "chat"
}
```

**Response:**
```json
{
  "reply": "React hooks are functions that let you use state and lifecycle features in functional components..."
}
```

---

## Progress Tracking Endpoints

### GET /progress/:goalId
Get progress analytics for specific goal.

**Response:**
```json
{
  "completion": 75,
  "velocity": "+2.3% per day",
  "summary": "This week: 5 check-ins (71% consistency)...",
  "aiInsights": "Latest learnings: React hooks are...",
  "progress": 75,
  "milestonesCompleted": 15,
  "totalMilestones": 20,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### GET /progress
Get overall progress across all goals.

**Response:**
```json
{
  "totalGoals": 3,
  "completedGoals": 1,
  "averageProgress": 65,
  "overallVelocity": "+1.8% per day",
  "weeklySummary": "Active 4 days this week...",
  "totalMilestones": 45,
  "completedMilestones": 29,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

---

## Check-in System Endpoints

### GET /checkin/config
Get user's check-in configuration.

**Response:**
```json
{
  "userId": "user-id",
  "interval": "daily",
  "time": "09:00",
  "remindersEnabled": true,
  "lastCheckin": "2024-01-14T09:00:00Z",
  "nextCheckin": "2024-01-15T09:00:00Z"
}
```

### PUT /checkin/config
Update check-in configuration.

**Request Body:**
```json
{
  "interval": "weekly",
  "time": "10:00",
  "remindersEnabled": true
}
```

### POST /checkin/record
Record a new check-in.

**Request Body:**
```json
{
  "goalId": "goal-id",
  "mood": "great",
  "notes": "Made good progress today",
  "progressUpdate": 80
}
```

### GET /checkin/history/:goalId
Get check-in history for specific goal.

**Response:**
```json
[
  {
    "_id": "checkin-id",
    "goalId": "goal-id",
    "checkinDate": "2024-01-15T09:00:00Z",
    "mood": "great",
    "notes": "Great progress today",
    "progressUpdate": 80
  }
]
```

### GET /checkin/records
Get all check-in records for user.

**Response:** Array of check-in records with populated goal information.

---

## Notification Endpoints

### POST /notifications/checkin-reminders
Send check-in reminders to users (admin endpoint).

**Response:**
```json
{
  "message": "Sent 5 check-in reminders",
  "sentCount": 5
}
```

### POST /notifications/weekly-summaries
Send weekly progress summaries to all users (admin endpoint).

**Response:**
```json
{
  "message": "Sent 12 weekly summaries",
  "sentCount": 12
}
```

---

## Health Check

### GET /health
Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "message": "Please verify your email before logging in"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "message": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Environment Variables

Required environment variables for the application:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/goal-platform

# JWT
JWT_SECRET=your-jwt-secret-key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173

# Server
PORT=4000
NODE_ENV=development
```

---

## Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- General API endpoints: 100 requests per 15 minutes
- Email endpoints: 3 requests per hour

## Data Models

### User
```javascript
{
  email: String (required, unique),
  passwordHash: String (required),
  isEmailVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}
```

### Goal
```javascript
{
  userId: ObjectId (ref: User),
  title: String (required),
  description: String,
  timeline: String,
  milestones: [{
    week: Number,
    objective: String,
    completed: Boolean
  }],
  progressPercent: Number,
  completedMilestones: Number
}
```

### CheckinRecord
```javascript
{
  userId: ObjectId (ref: User),
  goalId: ObjectId (ref: Goal),
  checkinDate: Date,
  mood: String,
  notes: String,
  progressUpdate: Number
}
```

### CheckinConfig
```javascript
{
  userId: ObjectId (ref: User, unique),
  interval: String (enum: daily, weekly, monthly),
  time: String (HH:MM format),
  remindersEnabled: Boolean,
  lastCheckin: Date,
  nextCheckin: Date
}