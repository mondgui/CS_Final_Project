# Fix _id to id Migration

## ⚠️ Critical Issue

The frontend uses `_id` (MongoDB style) but the backend now returns `id` (PostgreSQL/Prisma style).

**This will cause errors throughout the app!**

---

## 🔧 Solution Options

### Option 1: Update Frontend to Use `id` (Recommended)

Replace all `_id` references with `id` in the frontend.

**Files that need updating (18 files):**
1. `app/(student)/dashboard/_tabs/HomeTab.tsx`
2. `app/(student)/teacher/[id].tsx`
3. `app/messages.tsx`
4. `app/(teacher)/resources.tsx`
5. `app/(student)/resources.tsx`
6. `app/(student)/community.tsx`
7. `app/(teacher)/community.tsx`
8. `app/(student)/dashboard/index.tsx`
9. `app/(teacher)/dashboard/_tabs/InquiriesTab.tsx`
10. `app/(teacher)/student-portfolio.tsx`
11. `app/(student)/practice-log.tsx`
12. `app/(student)/dashboard/_tabs/LessonsTab.tsx`
13. `app/(teacher)/dashboard/_tabs/ScheduleBookingsTab.tsx`
14. `app/(teacher)/dashboard/index.tsx`
15. `app/chat/[id].tsx`
16. `app/(teacher)/students.tsx`
17. `app/booking/booking-confirmation.tsx`
18. `app/(teacher)/dashboard/_tabs/AnalyticsTab.tsx`

### Option 2: Transform Backend Responses (Not Recommended)

Add a transformation layer to convert `id` → `_id` in backend responses. This is more work and less clean.

---

## 📝 Quick Fix Script

Run this in your terminal to find all `_id` usages:

```bash
cd MusicOnTheGo/frontend
grep -r "_id" app/ --include="*.tsx" --include="*.ts" | wc -l
```

---

## 🎯 Priority Fixes

**Most Critical:**
1. Teacher/Student types - Change `_id: string` to `id: string`
2. Booking references - Change `booking.teacher._id` to `booking.teacher.id`
3. Resource references - Change `resource._id` to `resource.id`
4. Review references - Change `review._id` to `review.id`

---

## ⚡ Quick Test

After fixing, test:
1. View teachers list - Should show teachers
2. View teacher profile - Should load correctly
3. Create booking - Should work
4. View messages - Should show conversations

---

## 🔍 How to Fix

**Pattern to replace:**
- `_id: string` → `id: string`
- `. _id` → `.id`
- `._id` → `.id`
- `[_id]` → `[id]`
- `_id?` → `id?`

**Be careful with:**
- `student_id` (should stay as is - it's a field name)
- `teacher_id` (should stay as is)
- `userId` (should stay as is)

---

## 📋 Checklist

- [ ] Fix type definitions (`_id: string` → `id: string`)
- [ ] Fix property access (`. _id` → `.id`)
- [ ] Fix array access (`[_id]` → `[id]`)
- [ ] Test all features
- [ ] Verify no `_id` references remain

---

**I'll fix the most critical files now, then you can test and we'll fix the rest as needed.**
