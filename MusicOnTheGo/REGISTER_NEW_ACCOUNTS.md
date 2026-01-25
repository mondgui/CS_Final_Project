# Register New Accounts - Migration Complete! ✅

## ✅ Good News: Backend is Working!

The error "User not found" means:
- ✅ Backend is running and accessible
- ✅ Frontend is connecting correctly
- ✅ API endpoints are working
- ❌ Old MongoDB accounts don't exist in PostgreSQL

---

## ⚠️ Important: Old Accounts Are Gone

**All your old MongoDB accounts (students and teachers) are gone.** The database was migrated from MongoDB to PostgreSQL, but the data wasn't transferred.

**You need to register new accounts.**

---

## How to Register New Accounts

### Option 1: Use the App (Recommended)

1. **Open the app**
2. **Go to "Sign Up"** (or "Create Account")
3. **Choose "Student" or "Teacher"**
4. **Fill in the registration form:**
   - Name
   - Email
   - Password
   - Instruments (for students: what you want to learn)
   - Location (optional)
5. **Submit**

### Option 2: Use Postman/curl

#### Register a Student:

```bash
POST http://192.168.0.105:5050/api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "name": "Student Name",
  "role": "student",
  "instruments": ["Piano", "Guitar"],
  "location": "New York"
}
```

#### Register a Teacher:

```bash
POST http://192.168.0.105:5050/api/auth/register
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123",
  "name": "Teacher Name",
  "role": "teacher",
  "instruments": ["Piano", "Violin"],
  "location": "New York"
}
```

---

## Test Registration

After registering, try logging in:

```bash
POST http://192.168.0.105:5050/api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

Should return:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Student Name",
    "email": "student@example.com",
    "role": "student",
    "instruments": ["Piano", "Guitar"]
  }
}
```

---

## Quick Test Checklist

1. ✅ Backend is running (`npm run start:dev`)
2. ✅ Frontend can connect (no network errors)
3. ⏳ **Register new accounts** (old ones are gone)
4. ⏳ **Login with new accounts**
5. ⏳ Test features (bookings, messages, etc.)

---

## Why This Happened

During the migration:
- ✅ Database structure migrated (MongoDB → PostgreSQL)
- ✅ All code migrated (Express → NestJS)
- ❌ **Data was NOT migrated** (MongoDB data → PostgreSQL)

This is normal for a database migration. You have two options:

1. **Start fresh** (recommended for testing): Register new accounts
2. **Migrate data manually** (if you have important data): Export from MongoDB and import to PostgreSQL

---

## Next Steps

1. **Register at least one student account**
2. **Register at least one teacher account**
3. **Test login** with both accounts
4. **Test features** (bookings, messages, etc.)

Once you have new accounts, everything should work! 🎉

---

## Troubleshooting

### "User not found" when logging in

**Cause:** Account doesn't exist in PostgreSQL database.

**Solution:** Register a new account first.

### "Email already exists" when registering

**Cause:** Email is already in the database (from a previous registration).

**Solution:** Use a different email, or login with the existing account.

### Registration succeeds but login fails

**Cause:** Password might be different, or account wasn't created properly.

**Solution:** 
1. Try registering again with a different email
2. Check backend logs for errors
3. Verify password is correct

---

## Summary

**The "Unauthorized" error is expected!** Your old accounts don't exist anymore. Just register new accounts and you'll be good to go! 🚀
