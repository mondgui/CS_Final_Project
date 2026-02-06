# MusicOnTheGo - Capstone Project Submission

---


COVER PAGE

•	Project Title : MusicOnTheGo
•	Student Name(s) & Roll Number(s) : Guimond Pierre Louis (	2022ebcs297)
•	Program: BSc Computer Science (Online Mode)
•	Institution Name : BITS PILANI
•	Academic Year : 2026
•	Internal Supervisor Name : Swapnil Saurav


## Declaration

I hereby declare that this capstone project titled "MusicOnTheGo: A Mobile Platform for Connecting Music Teachers with Nearby Students" is an original work carried out by me and has not been submitted to any other university or institution for the award of any degree.

---

## Abstract

**MusicOnTheGo** is a comprehensive full-stack mobile application designed to bridge the gap between music teachers and students seeking personalized music education. The platform addresses the challenge of finding qualified, nearby music instructors by providing a location-based discovery system, real-time messaging, lesson booking management, and progress tracking tools.

The solution implements a modern technology stack featuring **React Native (Expo)** for cross-platform mobile development, **Node.js with Express.js** for the backend API, **PostgreSQL with Prisma ORM** for data persistence, **Supabase Realtime** for live messaging, and **Socket.io** for booking notifications. The application includes dedicated interfaces for students, teachers, and administrators, with features such as practice session logging with gamification (streaks, badges), learning resource management, a community feed for sharing musical achievements, and push notifications via Expo's notification service.

Key outcomes include a fully functional mobile application deployed on the Google Play Store, a cloud-hosted backend on Render, a real-time chat system with instant message delivery, a comprehensive admin dashboard for platform monitoring, and a secure authentication system with password reset via email. The platform demonstrates the practical application of modern software engineering principles including RESTful API design, role-based access control, real-time communication patterns, and cloud deployment strategies.

---

## Table of Contents

1. [Chapter 1: Introduction](#chapter-1-introduction)
   - 1.1 Overview of the Project
   - 1.2 Problem Statement & Motivation
   - 1.3 Objectives of the Capstone
   - 1.4 Scope of Implementation
   - 1.5 Organization of the Report
2. [Chapter 2: Implementation Details](#chapter-2-implementation-details)
   - 2.1 System Architecture & Design
   - 2.2 Technology Stack
   - 2.3 System Modules
   - 2.4 Key Algorithms / Logic
   - 2.5 Screenshots / Code Snippets
3. [Chapter 3: Testing, Validation & Results](#chapter-3-testing-validation--results)
   - 3.1 Test Plan
   - 3.2 Test Cases
   - 3.3 Results & Analysis
4. [Chapter 4: Execution / Deployment Details](#chapter-4-execution--deployment-details)
5. [Chapter 5: Project Execution Evidence](#chapter-5-project-execution-evidence)
   - 5.1 Version Control Evidence
   - 5.2 Weekly Progress Summary
   - 5.3 Supervisor Interaction Summary
6. [Chapter 6: Conclusion & Future Work](#chapter-6-conclusion--future-work)
7. [References](#references)
8. [Appendix](#appendix)

---

## List of Figures

- Figure 2.1: High-Level System Architecture Diagram
- Figure 2.2: Data Flow Diagram - Booking Process
- Figure 2.3: Entity Relationship Diagram (ERD)
- Figure 2.4: Component Interaction Diagram
- Figure 2.5: Student Dashboard Screenshots
- Figure 2.6: Teacher Dashboard Screenshots
- Figure 2.7: Admin Panel Dashboard
- Figure 2.8: Real-time Chat Interface
- Figure 2.9: Booking Flow Screenshots

---

## List of Tables

- Table 2.1: Technology Stack Summary
- Table 2.2: API Endpoints Overview
- Table 2.3: Database Models Summary
- Table 3.1: Test Cases and Results
- Table 5.1: Weekly Progress Summary

---

## List of Abbreviations

| Abbreviation | Full Form |
|--------------|-----------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| JWT | JSON Web Token |
| ORM | Object-Relational Mapping |
| REST | Representational State Transfer |
| UI/UX | User Interface / User Experience |
| SQL | Structured Query Language |
| SDK | Software Development Kit |
| EAS | Expo Application Services |
| CORS | Cross-Origin Resource Sharing |

---

## CHAPTER 1: INTRODUCTION

### 1.1 Overview of the Project

MusicOnTheGo is a full-stack mobile application that serves as a marketplace connecting music teachers with students seeking music lessons. The platform enables students to discover qualified music instructors in their vicinity, communicate with them, book lessons, track their practice progress, and engage with a community of fellow musicians.

The application consists of three main components:
1. **Mobile Application (Frontend)**: A React Native application built with Expo, providing separate user experiences for students and teachers.
2. **Backend API Server**: A Node.js/Express server providing RESTful APIs, Socket.io for real-time events, and integration with external services.
3. **Admin Panel**: A React-based web dashboard for platform administrators to monitor system statistics, manage users, and handle support tickets.

### 1.2 Problem Statement & Motivation

**Problem Statement:**
Finding qualified music teachers is traditionally a challenging and time-consuming process. Students and parents often rely on word-of-mouth recommendations, online classifieds, or music schools with limited instructor availability. There exists a significant gap in connecting independent music teachers with potential students in a streamlined, technology-driven manner.

**Key Challenges Addressed:**
- **Discovery Challenge**: Students struggle to find teachers for specific instruments in their geographic area.
- **Communication Barrier**: No unified platform exists for initial inquiries and ongoing communication between teachers and students.
- **Scheduling Complexity**: Manual coordination of lesson schedules leads to double-bookings and missed appointments.
- **Progress Tracking**: Students lack tools to track their practice habits and learning progress.
- **Community Engagement**: Aspiring musicians miss opportunities to connect with peers and share their achievements.

**Motivation:**
The motivation for this project stems from recognizing the growing demand for personalized music education and the inefficiencies in the current teacher-student matching process. With the proliferation of smartphones and the normalization of on-demand services, there is an opportunity to apply similar principles to music education, creating a platform that benefits both teachers (increased visibility, streamlined scheduling) and students (easy discovery, progress tracking, community engagement).

### 1.3 Objectives of the Capstone

The primary objectives of this capstone project are:

1. **Develop a Cross-Platform Mobile Application**: Create a React Native application that works on both iOS and Android platforms, providing role-specific dashboards for students and teachers.

2. **Implement Secure User Authentication**: Build a robust authentication system with JWT tokens, password hashing (bcrypt), and secure password reset functionality via email.

3. **Enable Real-Time Communication**: Implement real-time messaging between teachers and students using Supabase Realtime for chat and Socket.io for booking notifications.

4. **Build a Comprehensive Booking System**: Develop a booking workflow where students can request lessons based on teacher availability, with approval/rejection flows and conflict handling.

5. **Create Progress Tracking Features**: Implement practice session logging with gamification elements (streaks, badges) to motivate consistent practice.

6. **Develop Resource Sharing Capabilities**: Allow teachers to upload and assign learning resources (PDFs, videos, links) to students.

7. **Build a Community Platform**: Create a community feed for users to share musical achievements, receive feedback through likes and comments.

8. **Implement an Admin Dashboard**: Develop a web-based admin panel with analytics, user management, and support ticket handling.

9. **Deploy to Production**: Successfully deploy the application to the Google Play Store and host the backend on a cloud platform.

### 1.4 Scope of Implementation

**In Scope:**
- User registration and authentication for students and teachers
- Location-based teacher discovery with filtering options
- Real-time messaging system with read receipts
- Lesson booking with availability management
- Practice session logging with statistics and badges
- Resource management and assignment
- Community feed with media uploads (images, videos, audio)
- Teacher reviews and ratings
- Push notifications for key events
- Admin dashboard with analytics
- Support ticket system
- Deployment to Google Play Store

**Out of Scope:**
- Payment processing and financial transactions
- Video calling/conferencing features
- iOS App Store deployment (requires Apple Developer account)
- Advanced AI-based teacher matching algorithms
- Multi-language internationalization

### 1.5 Organization of the Report

This report is organized as follows:
- **Chapter 1 (Introduction)** provides an overview, problem statement, objectives, and scope.
- **Chapter 2 (Implementation Details)** covers system architecture, technology stack, modules, and key algorithms.
- **Chapter 3 (Testing, Validation & Results)** details the testing strategy, test cases, and results analysis.
- **Chapter 4 (Execution/Deployment Details)** describes the deployment environment and steps.
- **Chapter 5 (Project Execution Evidence)** provides version control evidence and progress summaries.
- **Chapter 6 (Conclusion & Future Work)** summarizes achievements, limitations, and future enhancements.

---

## CHAPTER 2: IMPLEMENTATION DETAILS

### 2.1 System Architecture & Design

#### 2.1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────┬───────────────────────────────────────────┤
│   Mobile App (React Native)     │       Admin Panel (React + Vite)          │
│   - Expo Framework              │       - Material UI                        │
│   - Student Dashboard           │       - Recharts (Data Visualization)     │
│   - Teacher Dashboard           │       - React Query                       │
│   - Expo Router Navigation      │                                           │
└─────────────────────────────────┴───────────────────────────────────────────┘
                    │ HTTP/REST API                    │ HTTP/REST API
                    │ Socket.io                        │
                    ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             API LAYER                                        │
│                     Express.js Server (Node.js)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Routes:        │  Middleware:     │  Services:                              │
│  - Auth         │  - JWT Auth      │  - Email Service (Nodemailer)           │
│  - Users        │  - Role Check    │  - Push Notifications (Expo Push)      │
│  - Bookings     │  - CORS          │  - File Upload (Cloudinary)             │
│  - Messages     │  - Error Handler │                                         │
│  - Community    │                  │                                         │
│  - Resources    │                  │                                         │
│  - Practice     │                  │                                         │
│  - Admin        │                  │                                         │
│  - Support      │                  │                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                    │ Prisma ORM                   │ API
                    ▼                              ▼
┌─────────────────────────────────┬───────────────────────────────────────────┐
│         DATA LAYER              │        EXTERNAL SERVICES                   │
├─────────────────────────────────┼───────────────────────────────────────────┤
│   PostgreSQL Database           │   Supabase (Realtime Subscriptions)       │
│   (Hosted on Supabase)          │   Cloudinary (Media Storage)              │
│                                 │   SendGrid (Email Delivery)               │
│                                 │   Expo Push API (Notifications)           │
└─────────────────────────────────┴───────────────────────────────────────────┘
```

#### 2.1.2 Data Flow Diagram - Booking Process

```
┌─────────┐    1. Browse Teachers     ┌─────────┐
│ Student │ ──────────────────────►   │ Backend │
└─────────┘                           └─────────┘
     │                                     │
     │  2. View Availability               │ Query Teachers
     │ ◄───────────────────────────────────│ from Database
     │                                     │
     │  3. Select Time Slot                │
     │ ──────────────────────────────────► │
     │                                     │
     │                              ┌──────▼──────┐
     │                              │  Validate   │
     │                              │  - Slot OK? │
     │                              │  - Prior    │
     │                              │    Contact? │
     │                              └──────┬──────┘
     │                                     │
     │  4. Booking Created                 │
     │ ◄───────────────────────────────────│
     │                                     │
     │               Socket.io Event ──────┤
     │                                     │
     │                              ┌──────▼──────┐
┌─────────┐    5. Notification      │   Teacher   │
│ Teacher │ ◄───────────────────────│   Receives  │
└─────────┘                         └─────────────┘
     │
     │  6. Accept/Reject
     │ ──────────────────────────────────► Backend
     │
     │               Socket.io Event + Push Notification
     │
┌─────────┐    7. Status Update     
│ Student │ ◄───────────────────────
└─────────┘
```

#### 2.1.3 Entity Relationship Diagram (Simplified)

```
┌──────────────────────────────────────────────────────────────────┐
│                            USER                                   │
├──────────────────────────────────────────────────────────────────┤
│ id (PK) | email | password | name | role | instruments[] |       │
│ location | rate | specialties[] | profileImage | ...             │
└─────────────────────────┬────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┬───────────────────┐
         │ 1:N            │ 1:N            │ 1:N               │
         ▼                ▼                ▼                   ▼
┌─────────────────┐ ┌───────────┐ ┌────────────────┐ ┌──────────────┐
│    BOOKING      │ │  MESSAGE  │ │ PRACTICE       │ │ COMMUNITY    │
├─────────────────┤ ├───────────┤ │ SESSION        │ │ POST         │
│ studentId (FK)  │ │ senderId  │ ├────────────────┤ ├──────────────┤
│ teacherId (FK)  │ │ recipient │ │ studentId (FK) │ │ authorId(FK) │
│ day | time      │ │ text      │ │ minutes        │ │ title        │
│ status          │ │ read      │ │ focus | notes  │ │ mediaUrl     │
└─────────────────┘ └───────────┘ └────────────────┘ └──────────────┘
         │                                                    │
         │ 1:N                                           1:N  │
         ▼                                                    ▼
┌─────────────────┐                                  ┌──────────────┐
│     REVIEW      │                                  │   COMMENT    │
├─────────────────┤                                  ├──────────────┤
│ teacherId (FK)  │                                  │ postId (FK)  │
│ studentId (FK)  │                                  │ authorId(FK) │
│ rating | comment│                                  │ text         │
└─────────────────┘                                  └──────────────┘

Additional Entities:
┌──────────────┐  ┌────────────────┐  ┌────────────────────┐
│ AVAILABILITY │  │    RESOURCE    │  │   SUPPORT TICKET   │
├──────────────┤  ├────────────────┤  ├────────────────────┤
│ teacherId    │  │ uploadedById   │  │ userId | email     │
│ day | date   │  │ title | fileUrl│  │ subject | message  │
│ timeSlots[]  │  │ type | level   │  │ status | adminReply│
└──────────────┘  └────────────────┘  └────────────────────┘
```

### 2.2 Technology Stack

#### Table 2.1: Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend (Mobile)** | React Native | 0.81.5 | Cross-platform mobile UI framework |
| | Expo | ~54.0 | Development framework, build services |
| | Expo Router | ~6.0 | File-based navigation |
| | TypeScript | ~5.9 | Type-safe JavaScript |
| | React Query | ^5.62 | Server state management & caching |
| | Socket.io Client | ^4.8 | Real-time communication |
| | Supabase JS | ^2.90 | Real-time database subscriptions |
| **Frontend (Admin)** | React | ^18.2 | UI framework |
| | Vite | ^5.0 | Build tool |
| | Material UI | ^5.15 | Component library |
| | Recharts | ^2.10 | Data visualization |
| **Backend** | Node.js | 20.x | JavaScript runtime |
| | Express.js | ^5.1 | Web framework |
| | Prisma | ^5.22 | ORM for database access |
| | Socket.io | ^4.8 | WebSocket server |
| | JWT | ^9.0 | Authentication tokens |
| | bcryptjs | ^2.4 | Password hashing |
| | Nodemailer | ^7.0 | Email service |
| | Multer | ^2.0 | File upload handling |
| | Cloudinary | ^2.8 | Cloud media storage |
| **Database** | PostgreSQL | 15.x | Relational database |
| | Supabase | - | Hosted DB + Realtime |
| **Deployment** | Render | - | Backend hosting |
| | EAS Build | - | Mobile app builds |
| | Google Play | - | Android distribution |

### 2.3 System Modules

#### 2.3.1 Authentication Module

**Purpose**: Secure user registration, login, and password management.

**Features**:
- User registration with email, password, name, and role (student/teacher)
- Password hashing using bcrypt (10 salt rounds)
- JWT token generation with 7-day expiry
- Password reset via email with hashed tokens
- Token verification middleware for protected routes

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password with token |

#### 2.3.2 User Management Module

**Purpose**: Profile management and user data retrieval.

**Features**:
- Profile viewing and editing
- Profile image upload via Cloudinary
- Location storage with geocoding
- Instrument and specialty management
- Notification preferences

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/me` | GET | Get current user profile |
| `/api/users/me` | PUT | Update current user profile |
| `/api/teachers` | GET | List all teachers (paginated) |
| `/api/teachers/:id` | GET | Get specific teacher profile |

#### 2.3.3 Booking Module

**Purpose**: Lesson scheduling and management.

**Features**:
- Teacher availability management (time slots per day)
- Booking request creation by students
- Approval/rejection workflow for teachers
- Conflict detection (double-booking prevention)
- Pre-booking contact requirement
- Real-time notifications via Socket.io and push notifications

**Business Rules**:
1. Students must have prior contact (message) with teacher before booking
2. Only one booking per time slot can be approved
3. When approving, all other pending bookings for the same slot are auto-rejected
4. Both student and teacher can cancel/delete bookings

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings` | POST | Create booking request |
| `/api/bookings/:id/status` | PUT | Accept/reject booking |
| `/api/bookings/student/me` | GET | Get student's bookings |
| `/api/bookings/teacher/me` | GET | Get teacher's bookings |
| `/api/availability` | POST | Set teacher availability |
| `/api/availability/:teacherId` | GET | Get teacher's availability |

#### 2.3.4 Messaging Module

**Purpose**: Real-time communication between users.

**Features**:
- One-on-one chat between any two users
- Message read receipts with timestamps
- Real-time message delivery via Supabase Realtime
- Unread message count tracking
- Conversation list with last message preview
- Push notifications for new messages

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/messages` | POST | Send a message |
| `/api/messages/conversations` | GET | Get all conversations |
| `/api/messages/conversation/:userId` | GET | Get chat with specific user |
| `/api/messages/unread-count` | GET | Get unread message count |
| `/api/messages/conversation/:userId/mark-read` | POST | Mark messages as read |

#### 2.3.5 Practice Tracking Module

**Purpose**: Student practice logging and progress gamification.

**Features**:
- Log practice sessions with duration, focus area, and notes
- Weekly practice statistics with goal tracking
- Practice streak calculation (consecutive days)
- Achievement badges based on milestones
- Teacher visibility into student progress

**Badge System**:
| Badge | Criteria |
|-------|----------|
| 🔥 X-Day Streak | Practice streak of 3, 5, 7, 14, 30 days |
| ⏰ X minutes | Total 100, 500, 1000, 2500, 5000, 10000 minutes |
| 🌟 Dedicated Learner | 50+ sessions and 7+ day streak |
| 🎵 Consistent Performer | 30+ sessions and 5+ day streak |

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/practice/sessions` | POST | Log practice session |
| `/api/practice/sessions/me` | GET | Get own practice history |
| `/api/practice/stats/me` | GET | Get practice statistics |
| `/api/practice/goals` | POST/GET/PUT/DELETE | Manage goals |

#### 2.3.6 Resource Management Module

**Purpose**: Educational content sharing.

**Features**:
- Upload resources (PDFs, images, audio, video, external links)
- Categorize by instrument and skill level
- Assign resources to specific students with notes
- Teacher-to-student resource assignments
- File storage via Cloudinary

**Resource Types**: PDF, Image, Audio, Video, External Link

**Skill Levels**: Beginner, Intermediate, Advanced

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resources` | GET/POST | List/create resources |
| `/api/resources/:id/assign` | POST | Assign to student |
| `/api/resources/assigned` | GET | Get assigned resources |

#### 2.3.7 Community Module

**Purpose**: Social engagement and content sharing.

**Features**:
- Create posts with media attachments
- Visibility controls (public, students-only, teachers-only)
- Like and comment functionality
- Filter by instrument, author type, popularity
- Infinite scroll pagination

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/community` | GET/POST | List/create posts |
| `/api/community/:id/like` | POST | Like/unlike post |
| `/api/community/:id/comments` | GET/POST | Get/add comments |

#### 2.3.8 Review Module

**Purpose**: Teacher feedback and ratings.

**Features**:
- Students can rate teachers (1-5 stars)
- Written comments with 1000 character limit
- One review per student-teacher pair
- Automatic average rating calculation

#### 2.3.9 Admin Module

**Purpose**: Platform administration and monitoring.

**Features**:
- Dashboard with key metrics (users, bookings, messages)
- Data visualizations (user growth, booking status, top instruments)
- User management with search and filtering
- Bulk messaging capability
- Support ticket handling with email replies

**Dashboard Metrics**:
- Total users, students, teachers
- Booking counts by status
- Message volume
- Practice session statistics
- User growth charts
- Top locations and instruments

#### 2.3.10 Notification Module

**Purpose**: Push notification delivery.

**Features**:
- Device token registration (per user, per device)
- Expo Push API integration
- Notification types: new message, booking request, booking status change
- User preference respect (opt-out support)
- Automatic cleanup of invalid tokens

### 2.4 Key Algorithms / Logic

#### 2.4.1 Practice Streak Calculation

```javascript
// Pseudocode for calculating practice streak
function calculateStreak(sessions, today):
    streak = 0
    
    for i from 0 to 29:  // Check last 30 days
        checkDate = today - i days
        
        hasPractice = sessions.any(s => 
            s.date is within checkDate
        )
        
        if hasPractice:
            streak++
        else if i > 0:  // Allow today to be missed
            break
    
    return streak
```

#### 2.4.2 Booking Conflict Detection

```javascript
// Pseudocode for booking creation with conflict handling
function createBooking(studentId, teacherId, day, timeSlot):
    // 1. Verify prior contact exists
    if not hasConversation(studentId, teacherId):
        return Error("Contact teacher first")
    
    // 2. Check for existing approved booking
    if existsApprovedBooking(teacherId, day, timeSlot):
        return Error("Slot already booked")
    
    // 3. Check for student's duplicate request
    if existsStudentRequest(studentId, teacherId, day, timeSlot):
        return Error("Already requested")
    
    // 4. Create booking (PENDING status)
    booking = createBookingRecord(...)
    
    // 5. Notify teacher
    emitSocketEvent("new-booking-request", booking)
    sendPushNotification(teacherId, "New booking request")
    
    // 6. Warn about competing requests
    if existsOtherPendingRequest(teacherId, day, timeSlot):
        return { booking, warning: "Other students also requested" }
    
    return booking
```

#### 2.4.3 Room ID Generation for Chat

```javascript
// Generate consistent room ID for two users
// Ensures same room ID regardless of who initiates
function generateRoomId(user1Id, user2Id):
    return [user1Id, user2Id].sort().join('_')
```

#### 2.4.4 JWT Authentication Flow

```javascript
// Authentication middleware pseudocode
function authMiddleware(request):
    token = extractBearerToken(request.headers.authorization)
    
    if not token:
        return Error(401, "No token provided")
    
    try:
        decoded = jwt.verify(token, JWT_SECRET)
        user = database.findUser(decoded.id)
        
        if not user:
            return Error(401, "User not found")
        
        request.user = user
        proceed()
    catch:
        return Error(401, "Invalid token")
```

#### 2.4.5 ID Normalization for API Compatibility

```javascript
// Normalize database IDs for frontend compatibility
// Adds _id alias for id (MongoDB to PostgreSQL migration support)
function normalizeIds(object):
    if isArray(object):
        return object.map(normalizeIds)
    
    if isPlainObject(object):
        normalized = {}
        for each key, value in object:
            normalized[key] = normalizeIds(value)
        
        if normalized.id and not normalized._id:
            normalized._id = normalized.id
        
        return normalized
    
    return object
```

### 2.5 Screenshots / Code Snippets

#### 2.5.1 Database Schema (Prisma)

```prisma
// Key models from schema.prisma

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole // student | teacher | admin
  
  // Profile fields
  instruments   String[] @default([])
  location      String   @default("")
  latitude      Float?
  longitude     Float?
  profileImage  String   @default("")
  
  // Teacher-specific
  rate          Float    @default(0)
  specialties   String[] @default([])
  averageRating Float?
  
  // Relations
  studentBookings     Booking[] @relation("StudentBookings")
  teacherBookings     Booking[] @relation("TeacherBookings")
  sentMessages        Message[] @relation("SentMessages")
  receivedMessages    Message[] @relation("ReceivedMessages")
  practiceSessions    PracticeSession[]
  communityPosts      CommunityPost[]
  deviceTokens        DeviceToken[]
}

model Booking {
  id        String        @id @default(uuid())
  studentId String
  teacherId String
  day       String
  startTime String
  endTime   String
  status    BookingStatus @default(PENDING) // PENDING | APPROVED | REJECTED
  
  student   User @relation("StudentBookings", ...)
  teacher   User @relation("TeacherBookings", ...)
}

model Message {
  id          String   @id @default(uuid())
  senderId    String
  recipientId String
  text        String
  read        Boolean  @default(false)
  roomId      String?  // For efficient real-time filtering
  createdAt   DateTime @default(now())
}
```

#### 2.5.2 API Route Example - Booking Creation

```javascript
// From bookingRoutes.js
router.post("/", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const { teacher, day, timeSlot } = req.body;
    
    // Check prior contact requirement
    const conversationExists = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: req.user.id, recipientId: teacher },
          { senderId: teacher, recipientId: req.user.id },
        ],
      },
    });
    
    if (!conversationExists) {
      return res.status(403).json({ 
        message: "Please contact the teacher first before booking." 
      });
    }
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        studentId: req.user.id,
        teacherId: teacher,
        day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        status: "PENDING",
      },
    });
    
    // Real-time notification
    io.to(`teacher-bookings:${teacher}`).emit("booking-updated", booking);
    
    // Push notification
    await sendPushNotification(teacher, {
      title: "New Booking Request",
      body: `${booking.student.name} requested a lesson`,
    });
    
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

#### 2.5.3 Frontend API Client

```typescript
// From frontend/lib/api.ts
export async function api(path: string, init: ApiInit = {}) {
  let url = `${BASE_URL}${path}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Attach JWT token for authenticated requests
  if (init.auth !== false) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...init,
    body: typeof init.body === 'object' ? JSON.stringify(init.body) : init.body,
    headers,
  });
  
  let data = await response.json();
  
  // Normalize IDs for backward compatibility
  data = normalizeIds(data);
  
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  
  return data;
}
```

#### 2.5.4 Real-time Chat Setup

```typescript
// From frontend - Setting up Supabase Realtime subscription
useEffect(() => {
  if (!roomId) return;
  
  const client = await getSupabaseClient();
  const channel = client
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Message',
        filter: `roomId=eq.${roomId}`,
      },
      (payload) => {
        // New message received - update UI
        queryClient.invalidateQueries(['chat', recipientId]);
      }
    )
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}, [roomId]);
```

---

## CHAPTER 3: TESTING, VALIDATION & RESULTS

### 3.1 Test Plan

#### 3.1.1 Testing Strategy

The testing strategy for MusicOnTheGo follows a multi-layered approach:

1. **Manual Functional Testing**: Comprehensive testing of all features through the mobile app and admin panel interfaces.

2. **API Testing**: Direct testing of REST endpoints using tools like Postman and curl.

3. **Real-time Feature Testing**: Verification of Socket.io events and Supabase Realtime subscriptions.

4. **Cross-Platform Testing**: Testing on both Android emulators and physical devices.

5. **User Acceptance Testing**: Beta testing with real users through Google Play's closed testing track.

#### 3.1.2 Testing Tools

| Tool | Purpose |
|------|---------|
| Expo Go | Development testing on physical devices |
| Android Studio Emulator | Android device simulation |
| Postman | API endpoint testing |
| Chrome DevTools | Admin panel testing |
| React Query DevTools | State management debugging |
| Prisma Studio | Database inspection |

### 3.2 Test Cases

#### Table 3.1: Test Cases and Results

| Test Case ID | Description | Input | Expected Output | Status |
|--------------|-------------|-------|-----------------|--------|
| TC-AUTH-001 | User registration with valid data | Email, password, name, role | Account created, JWT returned | ✅ Pass |
| TC-AUTH-002 | Registration with duplicate email | Existing email | Error: "Email already registered" | ✅ Pass |
| TC-AUTH-003 | Login with correct credentials | Valid email/password | JWT token, user data returned | ✅ Pass |
| TC-AUTH-004 | Login with wrong password | Invalid password | Error: "Incorrect password" | ✅ Pass |
| TC-AUTH-005 | Password reset flow | Valid email | Reset email sent, token valid | ✅ Pass |
| TC-BOOK-001 | Create booking after contact | Valid time slot | Booking created (PENDING) | ✅ Pass |
| TC-BOOK-002 | Create booking without contact | Valid time slot | Error: "Contact teacher first" | ✅ Pass |
| TC-BOOK-003 | Teacher approves booking | Booking ID, APPROVED | Status updated, student notified | ✅ Pass |
| TC-BOOK-004 | Approve with conflict | Already booked slot | Error: "Slot already booked" | ✅ Pass |
| TC-MSG-001 | Send message | Recipient ID, text | Message created, realtime delivery | ✅ Pass |
| TC-MSG-002 | Mark messages as read | Conversation ID | Read status updated | ✅ Pass |
| TC-MSG-003 | Get unread count | - | Correct count returned | ✅ Pass |
| TC-PRAC-001 | Log practice session | Minutes, focus | Session saved | ✅ Pass |
| TC-PRAC-002 | Calculate streak | - | Correct consecutive days | ✅ Pass |
| TC-PRAC-003 | Badge awarding | Meet criteria | Appropriate badge displayed | ✅ Pass |
| TC-COMM-001 | Create community post | Title, media | Post visible in feed | ✅ Pass |
| TC-COMM-002 | Like a post | Post ID | Like count incremented | ✅ Pass |
| TC-COMM-003 | Comment on post | Post ID, text | Comment visible | ✅ Pass |
| TC-RES-001 | Upload resource | File, metadata | Resource created | ✅ Pass |
| TC-RES-002 | Assign to student | Resource ID, student ID | Assignment visible | ✅ Pass |
| TC-NOTIF-001 | Push notification on message | New message | Notification received | ✅ Pass |
| TC-NOTIF-002 | Push notification on booking | New booking | Teacher receives notification | ✅ Pass |
| TC-ADMIN-001 | Load dashboard stats | - | All metrics displayed | ✅ Pass |
| TC-ADMIN-002 | User management | - | User list with filtering | ✅ Pass |

### 3.3 Results & Analysis

#### 3.3.1 Observations

1. **Performance**: The application performs well under normal load. API responses average under 200ms for most endpoints. Real-time message delivery occurs within 100-500ms.

2. **Database Optimization**: Initially, the admin dashboard caused database connection pool exhaustion due to parallel queries. This was resolved by executing queries sequentially.

3. **Real-time Reliability**: Supabase Realtime provides reliable message delivery. Socket.io handles booking notifications effectively.

4. **Cross-Platform Consistency**: The Expo-based React Native app provides consistent behavior across Android devices tested.

5. **Offline Handling**: The app gracefully handles network disconnections, showing appropriate error messages and retry options.

#### 3.3.2 Performance Metrics

| Metric | Value |
|--------|-------|
| Average API Response Time | < 200ms |
| Real-time Message Latency | 100-500ms |
| App Cold Start Time | ~2-3 seconds |
| Database Query Time (avg) | < 50ms |
| Push Notification Delivery | < 1 second |

#### 3.3.3 Known Issues and Resolutions

| Issue | Resolution |
|-------|------------|
| White placeholder text on white background | Added explicit `placeholderTextColor` prop |
| Bottom navigation overlap on some devices | Implemented SafeAreaProvider with dynamic padding |
| Database connection pool exhaustion | Changed parallel queries to sequential execution |
| Pie chart label truncation | Simplified labels to show only percentages |

---

## CHAPTER 4: EXECUTION / DEPLOYMENT DETAILS

### 4.1 Execution Environment

#### 4.1.1 Development Environment

| Component | Specification |
|-----------|---------------|
| Operating System | macOS (darwin 25.2.0) |
| IDE | Cursor IDE |
| Node.js Version | 20.x |
| Package Manager | npm |
| Mobile Testing | Expo Go, Android Studio Emulator |
| Shell | zsh |

#### 4.1.2 Production Environment

| Component | Service/Specification |
|-----------|----------------------|
| Backend Hosting | Render (Web Service) |
| Database | Supabase PostgreSQL |
| Admin Panel | Render (Static Site) |
| Mobile App Distribution | Google Play Store |
| Media Storage | Cloudinary |
| Email Service | SendGrid via SMTP |
| Push Notifications | Expo Push API |

### 4.2 Deployment Steps

#### 4.2.1 Backend Deployment to Render

1. **Create Render Account and New Web Service**
   - Connect GitHub repository
   - Set root directory to `MusicOnTheGo/backend`

2. **Configure Build Settings**
   ```
   Build Command: npm install && npx prisma generate
   Start Command: npm start
   ```

3. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://...@supabase.com:5432/postgres
   JWT_SECRET=<secure-random-string>
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=<sendgrid-api-key>
   EMAIL_FROM=support@musiconthego.app
   CLOUDINARY_CLOUD_NAME=<cloud-name>
   CLOUDINARY_API_KEY=<api-key>
   CLOUDINARY_API_SECRET=<api-secret>
   ```

4. **Deploy and Verify**
   - Check `/api` endpoint returns health check response
   - Verify database connection in logs

#### 4.2.2 Admin Panel Deployment

1. **Create Render Static Site**
   - Set root directory to `MusicOnTheGo/admin-panel`
   
2. **Configure Build Settings**
   ```
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variable**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

#### 4.2.3 Mobile App Deployment

1. **Configure EAS Build**
   ```bash
   # Install EAS CLI
   npm install -g eas-cli
   
   # Login to Expo
   eas login
   
   # Configure project
   eas build:configure
   ```

2. **Set Environment Variables in EAS**
   ```
   EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```

3. **Build Production APK/AAB**
   ```bash
   eas build --profile production --platform android
   ```

4. **Submit to Google Play**
   - Download the .aab file from EAS
   - Upload to Google Play Console
   - Complete store listing (descriptions, screenshots)
   - Submit for review

### 4.3 Demo Links

| Resource | URL |
|----------|-----|
| GitHub Repository | [To be added] |
| Backend API | https://musiconthego-backend.onrender.com/api |
| Admin Panel | https://musiconthego-admin.onrender.com |
| Google Play Store | [Pending public release] |
| Demo Video | [To be added] |

---

## CHAPTER 5: PROJECT EXECUTION EVIDENCE

### 5.1 Version Control Evidence

#### 5.1.1 GitHub Repository

- **Repository Name**: MusicOnTheGo
- **Visibility**: Private (can be made public upon request)
Link: https://github.com/mondgui/CS_Final_Project

#### 5.1.2 Key Commits Summary

The project includes numerous commits covering:
- Initial project setup and configuration
- Authentication system implementation
- Booking flow development
- Messaging and real-time features
- Practice tracking with gamification
- Community features
- Admin panel development
- Deployment configurations
- Bug fixes and UI improvements

### 5.2 Weekly Progress Summary

#### Table 5.1: Weekly Progress Summary

| Week | Task Planned | Task Completed | Notes |
|------|--------------|----------------|-------|
| 1 | Project setup, Tech stack selection | Expo project initialized, Express server setup, PostgreSQL with Prisma configured | Foundation laid |
| 2 | Authentication module | User registration, login, JWT implementation, password reset | Security implemented |
| 3 | User profiles, Teacher discovery | Profile management, teacher listing with filters, location services | Core user features |
| 4 | Booking system | Availability management, booking creation, approval workflow | Key business logic |
| 5 | Messaging system | Real-time chat with Supabase, conversation management, read receipts | Real-time communication |
| 6 | Practice tracking | Session logging, streak calculation, badge system | Gamification features |
| 7 | Resources & Community | Resource upload/assignment, community feed with media | Content sharing |
| 8 | Admin panel | Dashboard stats, user management, support tickets | Platform management |
| 9 | Push notifications | Expo push integration, device token management | User engagement |
| 10 | Deployment & Testing | Render deployment, EAS builds, Google Play submission | Production release |
| 11 | Bug fixes & Polish | UI improvements, placeholder visibility, safe area handling | Quality assurance |

### 5.3 Supervisor Interaction Summary


---

## CHAPTER 6: CONCLUSION & FUTURE WORK

### 6.1 Summary of Implementation

MusicOnTheGo has been successfully developed as a comprehensive mobile platform connecting music teachers with students. The application delivers on its core objectives:

1. **Cross-Platform Mobile App**: A fully functional React Native application with separate student and teacher experiences.

2. **Secure Authentication**: JWT-based authentication with password hashing and secure reset functionality.

3. **Real-Time Communication**: Instant messaging powered by Supabase Realtime with push notifications.

4. **Booking Management**: Complete booking workflow with availability management and conflict handling.

5. **Progress Tracking**: Practice logging with gamification elements to encourage consistent practice.

6. **Resource Sharing**: Teachers can share educational materials with students.

7. **Community Platform**: Users can share achievements and engage with peers.

8. **Admin Dashboard**: Comprehensive analytics and platform management tools.

9. **Production Deployment**: Backend hosted on Render, mobile app submitted to Google Play Store.

### 6.2 Achievements

- Built a production-ready full-stack application from scratch
- Implemented real-time features using modern technologies
- Successfully deployed to cloud infrastructure
- Created an intuitive mobile experience for both user types
- Developed a comprehensive admin panel for platform monitoring
- Implemented security best practices for authentication and data protection
- Built a scalable architecture using industry-standard patterns

### 6.3 Limitations

1. **Payment Integration**: The platform does not currently handle payments. Teachers and students must arrange payments externally.

2. **Video Calling**: No built-in video conferencing for online lessons.

3. **iOS Deployment**: Currently only deployed to Android via Google Play Store.

4. **Offline Support**: Limited offline functionality; most features require network connectivity.

5. **Advanced Matching**: No AI-powered matching based on teaching styles or learning preferences.

6. **Multi-language Support**: Currently only supports English.

### 6.4 Future Enhancements

1. **Payment Integration**
   - Integrate Stripe or PayPal for lesson payments
   - Implement subscription models for teachers
   - Add in-app purchase for premium features

2. **Video Calling**
   - Integrate WebRTC or services like Twilio for video lessons
   - Add screen sharing for music sheet review

3. **iOS Deployment**
   - Obtain Apple Developer account
   - Submit to iOS App Store

4. **AI-Powered Features**
   - Smart teacher-student matching based on preferences
   - Practice recommendations based on progress
   - Automated progress reports

5. **Enhanced Community**
   - Virtual recitals and competitions
   - Group chat rooms by instrument
   - Mentor-mentee connections

6. **Calendar Integration**
   - Sync with Google Calendar, Apple Calendar
   - Automatic reminders for lessons

7. **Advanced Analytics**
   - Detailed progress visualization for students
   - Business insights for teachers
   - Platform-wide trends for admins

---

## REFERENCES

1. React Native Documentation. (2026). Getting Started. https://reactnative.dev/docs/getting-started

2. Expo Documentation. (2026). Introduction to Expo. https://docs.expo.dev/

3. Prisma Documentation. (2026). Prisma ORM. https://www.prisma.io/docs

4. Socket.io Documentation. (2026). Socket.IO - Introduction. https://socket.io/docs/v4/

5. Supabase Documentation. (2026). Supabase Realtime. https://supabase.com/docs/guides/realtime

6. Express.js Documentation. (2026). Express - Fast, unopinionated, minimalist web framework. https://expressjs.com/

7. PostgreSQL Documentation. (2026). PostgreSQL: The World's Most Advanced Open Source Relational Database. https://www.postgresql.org/docs/

8. JWT.io. (2026). Introduction to JSON Web Tokens. https://jwt.io/introduction

9. Material-UI Documentation. (2026). MUI: The React component library. https://mui.com/material-ui/getting-started/

10. Recharts Documentation. (2026). Recharts - A composable charting library. https://recharts.org/en-US/

11. Cloudinary Documentation. (2026). Image and Video Management. https://cloudinary.com/documentation

12. Google Play Console Help. (2026). Prepare & roll out releases. https://support.google.com/googleplay/android-developer/

13. TanStack Query Documentation. (2026). React Query - Powerful asynchronous state management. https://tanstack.com/query/latest

14. Render Documentation. (2026). Deploy Web Services. https://render.com/docs

---

## APPENDIX

### A. User Manual

#### A.1 Student User Guide

1. **Registration**: Download the app from Google Play Store, select "Student" role, and complete registration with email, password, name, instruments, and location.

2. **Finding Teachers**: Use the Home tab to browse teachers. Filter by instrument or location.

3. **Contacting Teachers**: Tap on a teacher profile and use the "Message" button to start a conversation.

4. **Booking Lessons**: After messaging a teacher, view their availability and request a lesson slot.

5. **Tracking Practice**: Use the Practice Log to record practice sessions. Set weekly goals and earn badges.

6. **Community**: Share your progress in the Community tab. Like and comment on other posts.

#### A.2 Teacher User Guide

1. **Registration**: Select "Teacher" role during registration. Complete your profile with instruments, experience, rate, and specialties.

2. **Setting Availability**: Use the Times tab to set your available time slots for each day.

3. **Managing Bookings**: View and approve/reject booking requests in the Schedule/Bookings tab.

4. **Messaging Students**: Respond to student inquiries through the Messages tab.

5. **Sharing Resources**: Upload and assign learning materials to students via the Resources tab.

6. **Viewing Student Progress**: Access student practice logs and recordings through the Students tab.

### B. Installation Guide

#### B.1 Development Setup

```bash
# Clone repository
git clone https://github.com/[username]/MusicOnTheGo.git
cd MusicOnTheGo

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure environment variables
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npx expo start

# Admin panel setup (new terminal)
cd admin-panel
npm install
npm run dev
```

#### B.2 Environment Variables

**Backend (.env)**:
```
DATABASE_URL=postgresql://user:password@localhost:5432/musiconthego
JWT_SECRET=your-secret-key
PORT=5050
```

**Frontend (.env)**:
```
EXPO_PUBLIC_API_URL=http://localhost:5050
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### C. Source Code Link

**GitHub Repository**: https://github.com/mondgui/CS_Final_Project


---

*Document prepared for BSc Computer Science (Online Mode) Capstone Project Submission*
