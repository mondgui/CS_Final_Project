# Testing the Auth Module

## 1. Start the Server

```bash
cd backend
npm run start:dev
```

The server should start on `http://localhost:5050`

## 2. Test Endpoints

### Register a New User

```bash
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "STUDENT",
    "instruments": ["Guitar", "Piano"]
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "instruments": ["Guitar", "Piano"]
  }
}
```

### Login

```bash
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "instruments": ["Guitar", "Piano"]
  }
}
```

### Forgot Password

```bash
curl -X POST http://localhost:5050/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Expected Response:**
```json
{
  "message": "If an account with that email exists, we've sent password reset instructions."
}
```

### Reset Password

```bash
curl -X POST http://localhost:5050/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_EMAIL",
    "email": "john@example.com",
    "newPassword": "newpassword123"
  }'
```

## 3. Test with Postman/Insomnia

1. **Create a new request**
2. **Set method to POST**
3. **Set URL:** `http://localhost:5050/api/auth/register`
4. **Headers:** `Content-Type: application/json`
5. **Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT",
  "instruments": ["Guitar"]
}
```

## 4. Test Error Cases

### Invalid Email
```bash
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "invalid-email",
    "password": "password123",
    "role": "STUDENT"
  }'
```

**Expected:** 400 Bad Request with validation errors

### Missing Fields
```bash
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John"
  }'
```

**Expected:** 400 Bad Request

### Duplicate Email
```bash
# Try registering the same email twice
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'
```

**Expected:** 409 Conflict - "Email already exists."

## 5. Test Protected Routes (with JWT)

Once you have a token from login/register:

```bash
# Save token from login response
TOKEN="your-jwt-token-here"

# Test a protected route (we'll create these next)
curl -X GET http://localhost:5050/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## 6. Health Check

```bash
curl http://localhost:5050/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

## Troubleshooting

### Server won't start
- Check if port 5050 is already in use
- Check `.env` file has `DATABASE_URL` set correctly
- Check Prisma Client is generated: `npm run prisma:generate`

### Database connection errors
- Verify `DATABASE_URL` in `.env` is correct
- Check Supabase project is active
- Test connection: `npm run prisma:studio`

### Validation errors
- Make sure `Content-Type: application/json` header is set
- Check JSON format is valid
- Required fields: `name`, `email`, `password`, `role`
