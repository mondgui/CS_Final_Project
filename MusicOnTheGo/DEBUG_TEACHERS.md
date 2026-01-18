# Debug Teachers Visibility Issue

## Steps to Debug

1. **Check Browser/Expo Console Logs**
   - Look for `[Teachers API]` logs
   - Check what the API response contains
   - Verify if teachers array is empty or if there's an error

2. **Verify Teacher Account in Database**
   - Check if teacher account has `role: 'teacher'` (not 'TEACHER' or 'Teacher')
   - The backend filters by `role: 'teacher'` (lowercase)

3. **Test API Endpoint Directly**
   - Use Postman/Insomnia to call: `GET /api/users/teachers?page=1&limit=20`
   - Check if it returns teachers

4. **Check Network Tab**
   - In Expo/React Native debugger, check Network tab
   - Verify the request to `/api/users/teachers` is successful
   - Check response status and body

## Common Issues

1. **Role Mismatch**: Teacher account might have `role: 'TEACHER'` instead of `role: 'teacher'`
2. **API Error**: Network error or 401/403 error
3. **Response Format**: API might be returning data in unexpected format
4. **Filtering**: All teachers might be filtered out due to search/filter criteria

## Quick Fixes

1. **Verify Teacher Role**:
   ```sql
   SELECT id, email, role FROM "User" WHERE role = 'teacher';
   ```

2. **Check API Response**:
   - Added console.log statements to see what's being returned
   - Check Expo console for `[Teachers API]` logs

3. **Clear Filters**:
   - Make sure search query is empty
   - Make sure instrument filter is set to "all"
   - Make sure price range is set to "all"

---

**Next Steps**: Check the console logs to see what the API is actually returning.
