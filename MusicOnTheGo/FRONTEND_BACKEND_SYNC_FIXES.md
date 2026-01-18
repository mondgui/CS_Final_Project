# Frontend-Backend Sync Fixes

## ✅ Fixed Issues

### 1. **FormData Upload Issue** - FIXED ✅
**Problem:** Frontend was setting `Content-Type: multipart/form-data` which prevented the browser from adding the boundary parameter.

**Fix:**
- Updated `api.ts` to automatically remove `Content-Type` header when FormData is detected
- Removed explicit `Content-Type` headers from profile image uploads
- FormData now sets its own Content-Type with boundary automatically

**Files Fixed:**
- `frontend/lib/api.ts` - Auto-removes Content-Type for FormData
- `frontend/app/(student)/student-profile-setup.tsx` - Removed Content-Type header
- `frontend/app/(teacher)/profile-setup.tsx` - Removed Content-Type header

---

## 🔍 Potential Issues to Check

### 2. **Field Name Mismatches: `_id` vs `id`**

**MongoDB used `_id`, PostgreSQL uses `id`**

The frontend might still be using `_id` in some places. Check these files:

**Files to check:**
- `frontend/app/(student)/dashboard/_tabs/HomeTab.tsx` - Uses `teacher._id`
- `frontend/app/messages.tsx` - May use `_id`
- Any other files that access `._id`

**Fix:** Replace `._id` with `.id` throughout the frontend.

---

### 3. **API Endpoint Mismatches**

**Verified Endpoints:**
- ✅ `/api/auth/register` - Matches
- ✅ `/api/auth/login` - Matches
- ✅ `/api/uploads/profile-image` - Matches (requires auth)
- ✅ `/api/uploads/resource-file` - Matches (requires auth)
- ✅ `/api/users/me` - Matches
- ✅ `/api/bookings/student/me` - Matches
- ✅ `/api/bookings/teacher/me` - Matches
- ✅ `/api/availability/me` - Matches
- ✅ `/api/messages/conversations` - Matches
- ✅ `/api/practice/sessions/me` - Matches
- ✅ `/api/practice/recordings/me` - Matches
- ✅ `/api/practice/stats/me` - Matches
- ✅ `/api/inquiries/teacher/me` - Matches
- ✅ `/api/resources/me` - Matches
- ✅ `/api/resources/assigned` - Matches
- ✅ `/api/resources/personal` - Matches
- ✅ `/api/resources/assignments` - Matches
- ✅ `/api/community` - Matches
- ✅ `/api/reviews` - Matches

---

## 🚨 Critical Fix Needed

### Profile Image Upload During Registration

**Issue:** The upload endpoint requires authentication (`@UseGuards(JwtAuthGuard)`), but during profile setup after registration, the user should have a token.

**Check:**
1. Is the token being saved after registration?
2. Is the token being sent with the upload request?

**Current Flow:**
1. User registers → Gets token
2. Token should be saved to storage
3. Profile setup screen should use token for upload

**Verify:**
- Check if `saveAuth()` is called after registration
- Check if token is in storage when uploading

---

## 📋 Testing Checklist

After fixes, test these:

- [ ] Registration (student)
- [ ] Registration (teacher)
- [ ] Profile image upload during profile setup
- [ ] Login
- [ ] View teachers list
- [ ] Create booking
- [ ] Send message
- [ ] Upload resource
- [ ] Create community post
- [ ] Practice session logging

---

## 🔧 Quick Fixes Applied

1. ✅ FormData Content-Type issue fixed
2. ✅ Password validation added to frontend
3. ✅ Better error handling for validation errors

---

## ⚠️ Remaining Issues

1. **Field names:** Check all `_id` references → change to `id`
2. **Response formats:** Verify backend responses match frontend expectations
3. **Error handling:** Some endpoints might return different error formats

---

## 🎯 Next Steps

1. **Test profile image upload** - Should work now with FormData fix
2. **Search and replace `_id` with `id`** - If any exist
3. **Test all features** - One by one to catch any remaining issues

---

## 📝 Notes

- All API endpoints are properly prefixed with `/api`
- Authentication is handled via JWT tokens
- FormData uploads should now work correctly
- Backend uses `id` (not `_id`) for all models
