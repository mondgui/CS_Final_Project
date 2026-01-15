# .env File Fixes Needed

## Issues Found:

1. ❌ **DATABASE_URL missing variable name**
   - Current: `postgresql://postgres:...`
   - Should be: `DATABASE_URL="postgresql://postgres:..."`

2. ❌ **Missing SSL mode**
   - Current: Connection string ends with `/postgres`
   - Should end with: `/postgres?sslmode=require`

3. ❌ **MONGO_URI still present**
   - This is no longer needed (we're using PostgreSQL now)
   - Can be removed or commented out

## ✅ Corrected .env File:

```env
# Database - PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres:LkD0kzLmeI4uB2Zm@db.fbodbftncfapeusvsicb.supabase.co:5432/postgres?sslmode=require"

# Server
PORT=5050
NODE_ENV=development

# JWT Secret
JWT_SECRET=supersecretkey123

# Email Service (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=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
EMAIL_FROM=musiconthego.app@gmail.com
FRONTEND_URL=http://localhost:8081

# Cloudinary
CLOUDINARY_CLOUD_NAME=dnwllldud
CLOUDINARY_API_KEY=922251416999867
CLOUDINARY_API_SECRET=0yid52VLh4IXN9WbgLZ_YwBld-0

# OLD - Can be removed (no longer needed)
# MONGO_URI=mongodb+srv://...
```

## What to Change:

1. **Add `DATABASE_URL=`** before your PostgreSQL connection string
2. **Add `?sslmode=require`** at the end of the connection string
3. **Remove or comment out** `MONGO_URI` (no longer needed)

## Quick Fix:

Update this line:
```
postgresql://postgres:LkD0kzLmeI4uB2Zm@db.fbodbftncfapeusvsicb.supabase.co:5432/postgres
```

To this:
```
DATABASE_URL="postgresql://postgres:LkD0kzLmeI4uB2Zm@db.fbodbftncfapeusvsicb.supabase.co:5432/postgres?sslmode=require"
```

Note the quotes around the connection string and the `?sslmode=require` at the end!
