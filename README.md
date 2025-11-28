# Employee Task Tracker

A full-stack web application for managing employees and their tasks within a company.

## 📋 Features

- User Authentication (Login/Register)
- Employee CRUD Operations
- Task Management with Status & Priority
- Dashboard with Analytics Charts
- Task Filtering and Search
- Responsive UI Design
- MongoDB Persistence

## 🏗️ Tech Stack

**Frontend**: Next.js 15, React 19, Tailwind CSS, Recharts  
**Backend**: Next.js API Routes, NextAuth  
**Database**: MongoDB Atlas + Mongoose  
**Security**: bcryptjs, JWT sessions

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure .env.local
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/authtest
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NODE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📡 API Endpoints

**Employees**:
- GET /api/employees - List with filters
- POST /api/employees - Create
- PUT /api/employees/:id - Update
- DELETE /api/employees/:id - Delete

**Tasks**:
- GET /api/tasks - List with filters
- POST /api/tasks - Create
- PUT /api/tasks/:id - Update
- DELETE /api/tasks/:id - Delete

**Dashboard**:
- GET /api/dashboard - Summary stats

**Auth**:
- POST /api/register - Register user
- GET/POST /api/auth/[...nextauth] - Login

## 📊 Database Collections

**users**: _id, name, email, password, timestamps  
**employees**: _id, name, email, department, role, status, joinDate, timestamps  
**tasks**: _id, title, description, status, priority, assignedTo, dueDate, completedDate, createdBy, timestamps

## 📁 Project Structure

```
├── app/
│   ├── api/          (API routes)
│   ├── dashboard/    (Main dashboard)
│   └── page.js       (Login)
├── components/       (React components)
├── models/           (Mongoose schemas)
├── lib/              (Utilities)
└── public/           (Static files)
```

## ✅ Completed Features

✓ Complete authentication system  
✓ Employee management (CRUD)  
✓ Task management (CRUD)  
✓ Dashboard analytics  
✓ Task & employee filtering  
✓ Protected API endpoints  
✓ Responsive design  
✓ Data validation  

## 🔐 Security

- Password hashing (bcryptjs)
- JWT session management
- Protected middleware
- MongoDB Atlas secure connection
- Environment variable config

## 📈 Dashboard Metrics

- Total tasks & completion rate
- Task status breakdown (Pending, In Progress, Completed, On Hold)
- Task priority breakdown (Low, Medium, High, Critical)
- Employee workload analysis
- Overdue task tracking

---

**Version**: 1.0.0 | **Last Updated**: November 28, 2024
