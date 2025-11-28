# Admin Login Quick Start

## ✅ Everything is Ready!

### Default Admin Credentials
```
Email:    admin@example.com
Password: Admin@123
```

## How to Use

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   - http://localhost:3000

3. **Login as Admin:**
   - Email: `admin@example.com`
   - Password: `Admin@123`

4. **You will see:**
   - Dashboard with `👨‍💼 Admin` badge
   - Create Task form (visible)
   - Delete Task buttons (visible)
   - Create Employee form (visible)
   - Delete Employee buttons (visible)

## Setup Admin in MongoDB

### Method 1: MongoDB Atlas (Easiest)

Copy this JSON and insert into `authtest.users` collection:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$10$7JvU.n0K.R4lFPXEKpbPb.bQEf7FdT1G7YqVLZPrPlXVKQJHK7xY2",
  "role": "Admin"
}
```

### Method 2: Update Existing User to Admin

Find any user in MongoDB, click Edit, and change:
```
"role": "Admin"
```

---

## Text Colors ✅ Fixed

- ✅ All form inputs: **Black text**
- ✅ All dropdowns: **Black text**
- ✅ All text areas: **Black text**
- ✅ Dashboard cards: **Proper colored text**
- ✅ Charts: **Readable text**

---

## Documentation

- `ADMIN_SETUP.md` - Detailed admin setup guide
- `AUTH_FEATURE.md` - Complete auth feature documentation
- `TEXT_COLOR_AND_ADMIN_SUMMARY.md` - Full summary of all changes

---

## Questions?

Check the documentation files or review the changes:
- Model updates: `models/User.js`
- Auth config: `app/api/auth/[...nextauth]/route.js`
- Components: `components/TaskList.jsx`, `components/EmployeeList.jsx`
