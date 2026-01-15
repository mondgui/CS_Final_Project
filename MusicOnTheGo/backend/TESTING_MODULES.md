# Testing Guide for NestJS Modules

This guide provides step-by-step instructions for testing all the migrated modules using **Postman**, **curl**, or **Insomnia**.

---

## 📋 Prerequisites

1. **Start the NestJS server:**
   ```bash
   cd MusicOnTheGo/backend
   npm run start:dev
   ```

2. **Server should be running at:** `http://localhost:5050`

3. **All endpoints are prefixed with:** `/api`

---

## 🔐 1. Auth Module Testing

### Step 1: Register a Student

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "student1@example.com",
  "password": "password123",
  "name": "John Student",
  "role": "student"
}
```

**Expected Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "student1@example.com",
    "name": "John Student",
    "role": "student"
  }
}
```

**Save the `access_token` for future requests!**

---

### Step 2: Register a Teacher

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "teacher1@example.com",
  "password": "password123",
  "name": "Jane Teacher",
  "role": "teacher"
}
```

**Save the teacher's `access_token`!**

---

### Step 3: Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "student1@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "student1@example.com",
    "name": "John Student",
    "role": "student"
  }
}
```

---

### Step 4: Test Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "student1@example.com"
}
```

**Expected Response (200):**
```json
{
  "message": "Password reset email sent if account exists."
}
```

---

### Step 5: Test Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Note:** You'll need to check your email or database for the actual reset token.

---

## 👤 2. Users Module Testing

### Step 1: Get Current User Profile

**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "id": "uuid-here",
  "email": "student1@example.com",
  "name": "John Student",
  "role": "student",
  "instruments": [],
  "location": "",
  "profileImage": "",
  ...
}
```

---

### Step 2: Update Profile

**Endpoint:** `PUT /api/users/me`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Updated",
  "location": "New York, NY",
  "instruments": ["Piano", "Guitar"]
}
```

**Expected Response (200):** Updated user object

---

### Step 3: Change Password

**Endpoint:** `PUT /api/users/me/change-password`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Expected Response (200):**
```json
{
  "message": "Password changed successfully."
}
```

---

### Step 4: Get User by ID

**Endpoint:** `GET /api/users/:id`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Replace `:id` with an actual user ID from your database.**

---

### Step 5: Get All Teachers (Public)

**Endpoint:** `GET /api/users/teachers`

**Query Parameters (optional):**
- `page=1` (default: 1)
- `limit=20` (default: 20)
- `instrument=Piano` (optional filter)
- `city=New York` (optional filter)

**Example:**
```
GET /api/users/teachers?page=1&limit=10&instrument=Piano
```

**Expected Response (200):**
```json
{
  "teachers": [
    {
      "id": "uuid-here",
      "name": "Jane Teacher",
      "instruments": ["Piano"],
      "rate": 50,
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

### Step 6: Get Teacher by ID (Public)

**Endpoint:** `GET /api/users/teachers/:id`

**Replace `:id` with a teacher's user ID.**

---

## 📅 3. Bookings Module Testing

### Step 1: Send a Message First (Required!)

**Before creating a booking, you MUST have sent at least one message between the student and teacher.**

See **Messages Module Testing** below to send a message first.

---

### Step 2: Create a Booking (Student Only)

**Endpoint:** `POST /api/bookings`

**Headers:**
```
Authorization: Bearer STUDENT_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "teacher": "teacher-user-id-here",
  "day": "Monday",
  "timeSlot": {
    "start": "14:00",
    "end": "16:00"
  }
}
```

**Expected Response (201):**
```json
{
  "id": "booking-uuid",
  "studentId": "student-uuid",
  "teacherId": "teacher-uuid",
  "day": "Monday",
  "startTime": "14:00",
  "endTime": "16:00",
  "status": "PENDING",
  "student": {
    "id": "student-uuid",
    "name": "John Student",
    "email": "student1@example.com",
    "profileImage": ""
  },
  "teacher": {
    "id": "teacher-uuid",
    "name": "Jane Teacher",
    "email": "teacher1@example.com",
    "profileImage": ""
  },
  "createdAt": "2024-01-13T20:00:00.000Z",
  "updatedAt": "2024-01-13T20:00:00.000Z"
}
```

**Save the booking `id` for the next steps!**

---

### Step 3: Get Student Bookings

**Endpoint:** `GET /api/bookings/student/me`

**Headers:**
```
Authorization: Bearer STUDENT_ACCESS_TOKEN
```

**Query Parameters (optional):**
- `page=1` (default: 1)
- `limit=20` (default: 20)

**Expected Response (200):**
```json
{
  "bookings": [
    {
      "id": "booking-uuid",
      "day": "Monday",
      "startTime": "14:00",
      "endTime": "16:00",
      "status": "PENDING",
      "teacher": {
        "id": "teacher-uuid",
        "name": "Jane Teacher",
        ...
      },
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

### Step 4: Get Teacher Bookings

**Endpoint:** `GET /api/bookings/teacher/me`

**Headers:**
```
Authorization: Bearer TEACHER_ACCESS_TOKEN
```

**Query Parameters (optional):**
- `page=1` (default: 1)
- `limit=20` (default: 20)

---

### Step 5: Approve/Reject Booking (Teacher Only)

**Endpoint:** `PUT /api/bookings/:id/status`

**Headers:**
```
Authorization: Bearer TEACHER_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Valid status values:** `PENDING`, `APPROVED`, `REJECTED`

**Expected Response (200):** Updated booking object

---

### Step 6: Delete Booking

**Endpoint:** `DELETE /api/bookings/:id`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Note:** Only the student, teacher, or admin can delete a booking.

**Expected Response (200):**
```json
{
  "message": "Booking deleted successfully."
}
```

---

## 💬 4. Messages Module Testing

### Step 1: Send a Message

**Endpoint:** `POST /api/messages`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipientId": "other-user-id-here",
  "text": "Hello! I'm interested in booking a lesson."
}
```

**Expected Response (201):**
```json
{
  "id": "message-uuid",
  "senderId": "your-user-id",
  "recipientId": "other-user-id",
  "text": "Hello! I'm interested in booking a lesson.",
  "read": false,
  "readAt": null,
  "sender": {
    "id": "your-user-id",
    "name": "John Student",
    "profileImage": ""
  },
  "recipient": {
    "id": "other-user-id",
    "name": "Jane Teacher",
    "profileImage": ""
  },
  "createdAt": "2024-01-13T20:00:00.000Z",
  "updatedAt": "2024-01-13T20:00:00.000Z"
}
```

---

### Step 2: Get Conversation with a User

**Endpoint:** `GET /api/messages/conversation/:userId`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Replace `:userId` with the other user's ID.**

**Expected Response (200):**
```json
[
  {
    "id": "message-uuid",
    "senderId": "user-id-1",
    "recipientId": "user-id-2",
    "text": "Hello!",
    "read": true,
    "readAt": "2024-01-13T20:05:00.000Z",
    "sender": {
      "id": "user-id-1",
      "name": "John Student",
      "profileImage": ""
    },
    "recipient": {
      "id": "user-id-2",
      "name": "Jane Teacher",
      "profileImage": ""
    },
    "createdAt": "2024-01-13T20:00:00.000Z",
    "updatedAt": "2024-01-13T20:00:00.000Z"
  },
  ...
]
```

**Note:** This endpoint automatically marks messages as read when you fetch them.

---

### Step 3: Get All Conversations

**Endpoint:** `GET /api/messages/conversations`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters (optional):**
- `page=1` (default: 1)
- `limit=20` (default: 20)

**Expected Response (200):**
```json
{
  "conversations": [
    {
      "userId": "other-user-id",
      "name": "Jane Teacher",
      "profileImage": "",
      "email": "teacher1@example.com",
      "lastMessage": "Hello! I'm interested in booking a lesson.",
      "lastMessageTime": "2024-01-13T20:00:00.000Z",
      "unreadCount": 0
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

### Step 4: Get Unread Count

**Endpoint:** `GET /api/messages/unread-count`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "count": 3
}
```

---

## 🧪 Complete Testing Flow

### Scenario: Student books a lesson with a teacher

1. **Register a student:**
   ```bash
   POST /api/auth/register
   {
     "email": "student@test.com",
     "password": "password123",
     "name": "Test Student",
     "role": "student"
   }
   ```
   **Save:** `student_token` and `student_id`

2. **Register a teacher:**
   ```bash
   POST /api/auth/register
   {
     "email": "teacher@test.com",
     "password": "password123",
     "name": "Test Teacher",
     "role": "teacher"
   }
   ```
   **Save:** `teacher_token` and `teacher_id`

3. **Student sends a message to teacher:**
   ```bash
   POST /api/messages
   Authorization: Bearer {student_token}
   {
     "recipientId": "{teacher_id}",
     "text": "Hi! I'd like to book a lesson."
   }
   ```

4. **Student creates a booking:**
   ```bash
   POST /api/bookings
   Authorization: Bearer {student_token}
   {
     "teacher": "{teacher_id}",
     "day": "Monday",
     "timeSlot": {
       "start": "14:00",
       "end": "16:00"
     }
   }
   ```
   **Save:** `booking_id`

5. **Teacher views their bookings:**
   ```bash
   GET /api/bookings/teacher/me
   Authorization: Bearer {teacher_token}
   ```

6. **Teacher approves the booking:**
   ```bash
   PUT /api/bookings/{booking_id}/status
   Authorization: Bearer {teacher_token}
   {
     "status": "APPROVED"
   }
   ```

7. **Student views their bookings:**
   ```bash
   GET /api/bookings/student/me
   Authorization: Bearer {student_token}
   ```

---

## 🐛 Common Errors

### 401 Unauthorized
- **Cause:** Missing or invalid `Authorization` header
- **Fix:** Make sure you include `Authorization: Bearer YOUR_TOKEN`

### 403 Forbidden
- **Cause:** Wrong role (e.g., student trying to approve a booking)
- **Fix:** Use the correct user role for the endpoint

### 404 Not Found
- **Cause:** Invalid user ID or resource ID
- **Fix:** Check that the IDs exist in your database

### 409 Conflict
- **Cause:** Booking conflict (time slot already taken)
- **Fix:** Try a different time slot

### 400 Bad Request
- **Cause:** Missing required fields or invalid data
- **Fix:** Check the request body matches the DTO requirements

---

## 📝 Postman Collection Setup

### Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:5050/api`
- `student_token`: (set after registering student)
- `teacher_token`: (set after registering teacher)
- `student_id`: (set after registering student)
- `teacher_id`: (set after registering teacher)
- `booking_id`: (set after creating booking)

### Authorization Setup

For protected endpoints, use:
- **Type:** Bearer Token
- **Token:** `{{student_token}}` or `{{teacher_token}}`

---

## ✅ Testing Checklist

- [ ] Auth: Register student
- [ ] Auth: Register teacher
- [ ] Auth: Login
- [ ] Users: Get current user
- [ ] Users: Update profile
- [ ] Users: Change password
- [ ] Users: Get all teachers
- [ ] Messages: Send message
- [ ] Messages: Get conversation
- [ ] Messages: Get conversations list
- [ ] Messages: Get unread count
- [ ] Bookings: Create booking (after sending message)
- [ ] Bookings: Get student bookings
- [ ] Bookings: Get teacher bookings
- [ ] Bookings: Approve booking
- [ ] Bookings: Delete booking

---

## 🚀 Next Steps

After testing these modules, you can:
1. Continue with remaining modules (Availability, Community, Resources, etc.)
2. Integrate Socket.io for real-time features
3. Add error handling improvements
4. Set up automated tests

---

**Happy Testing! 🎉**
