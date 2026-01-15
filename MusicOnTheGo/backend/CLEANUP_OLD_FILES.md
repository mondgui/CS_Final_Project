# Cleanup Old Express Files

## Files to Delete (Already Migrated)

These files have been migrated to NestJS and can be safely deleted:

### ✅ Auth Module (Migrated)
- `routes/authRoutes.js` → Migrated to `src/auth/auth.controller.ts`
- `middleware/authMiddleware.js` → Migrated to `src/auth/jwt-auth.guard.ts`
- `middleware/roleMiddleware.js` → Migrated to `src/auth/roles.guard.ts`
- `utils/emailService.js` → Migrated to `src/utils/emailService.ts`

### 🗑️ Old Express Server
- `server.js` → Replaced by `src/main.ts` (NestJS)

## Files to Keep (For Reference During Migration)

Keep these until we migrate each module:

### Routes (To Migrate)
- `routes/userRoutes.js` → Will become `src/users/users.controller.ts`
- `routes/bookingRoutes.js` → Will become `src/bookings/bookings.controller.ts`
- `routes/messageRoutes.js` → Will become `src/messages/messages.controller.ts`
- `routes/availabilityRoutes.js` → Will become `src/availability/availability.controller.ts`
- `routes/practiceRoutes.js` → Will become `src/practice/practice.controller.ts`
- `routes/resourceRoutes.js` → Will become `src/resources/resources.controller.ts`
- `routes/communityRoutes.js` → Will become `src/community/community.controller.ts`
- `routes/reviewRoutes.js` → Will become `src/reviews/reviews.controller.ts`
- `routes/inquiryRoutes.js` → Will become `src/inquiries/inquiries.controller.ts`
- `routes/adminRoutes.js` → Will become `src/admin/admin.controller.ts`
- `routes/uploadRoutes.js` → Will become `src/upload/upload.controller.ts`
- `routes/teacherRoutes.js` → Will become part of `src/users/users.controller.ts`

### Models (To Migrate)
- All files in `models/` → Replaced by Prisma schema
- Keep as reference until all routes are migrated

## Cleanup Script

Run this to delete migrated files:

```bash
cd backend

# Delete migrated auth files
rm routes/authRoutes.js
rm middleware/authMiddleware.js
rm middleware/roleMiddleware.js
rm utils/emailService.js

# Delete old Express server
rm server.js

# Optional: Delete empty directories
rmdir middleware 2>/dev/null || true
rmdir utils 2>/dev/null || true
```

## After Full Migration

Once all modules are migrated, you can delete:
- `routes/` directory (all routes migrated)
- `models/` directory (replaced by Prisma)
- `package-old.json` (old Express dependencies)

## Current Status

- ✅ Auth Module - Migrated
- ⏳ Users Module - Pending
- ⏳ Bookings Module - Pending
- ⏳ Messages Module - Pending
- ⏳ All other modules - Pending
