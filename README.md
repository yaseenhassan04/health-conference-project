# 🏥 Health Project - Professional Edition

A comprehensive health/academic conference management platform built with Next.js 14, React 18, and Prisma.

[🇸🇦 ابدأ من هنا!](./START_HERE.md) | [📖 دليل الإعداد بالعربية](./SETUP_GUIDE_AR.md)

## ✨ Features

### 👥 User Management
- User registration with email validation
- Profile management
- Profession and country tracking
- Email notifications

### 📄 Abstract/Paper Submission
- PDF file upload support
- Abstract categorization
- Status tracking (PENDING, APPROVED, REJECTED)
- Metadata storage (author, date, category)

### 🏛️ Admin Dashboard
- Secure authentication
- Statistics and analytics
- User management
- Abstract/paper review system
- CSV & PDF export capabilities
- Review decision management

### 📊 Reporting & Analytics
- Export user lists to CSV
- Generate PDF reports
- View submission statistics
- Track submission dates

### 📧 Email Integration
- Email notifications
- Gmail SMTP support
- Customizable email templates
- Automated confirmations

## 🚀 Quick Start (One Command!)

```bash
cd health_project-master
node scripts/quick-start.js
```

Then open: **http://localhost:3000**

## 📍 Important Links

| Link | Purpose |
|------|---------|
| [START_HERE.md](./START_HERE.md) | **👈 Read this first!** |
| [SETUP_GUIDE_AR.md](./SETUP_GUIDE_AR.md) | Arabic setup guide |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | API reference |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Pre-deployment steps |

## 🔐 Default Admin Credentials

```
Username: admin
Password: admin
```

⚠️ Change before deploying to production!

## 📦 Tech Stack

- **Next.js 14.2** - React framework
- **Prisma 5.14** - Database ORM
- **SQLite** - Development database
- **jsPDF** - PDF generation
- **QR Code** - QR code support
- **Lucide React** - Icon library

## 🛠️ Available Commands

```bash
npm run dev              # Start development
npm run build           # Build for production
npm start              # Start production
npm run lint           # Run linter
npm run db:init        # Initialize database
npm run db:studio      # Prisma Studio
npm run db:reset       # Reset database
```

## 📁 Project Structure

```
health_project-master/
├── app/
│   ├── dashboard/      # Admin panel
│   ├── api/            # API routes
│   ├── registration/   # Registration page
│   └── page.js         # Homepage
├── prisma/             # Database
├── scripts/            # Utilities
├── config.js           # Configuration
└── START_HERE.md       # 👈 Read first!
```

## 🚀 Deployment

**Vercel** (Recommended):
```bash
vercel
```

**Custom Server**:
```bash
npm run build && npm start
```

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for details.

## 📞 Need Help?

1. Read [START_HERE.md](./START_HERE.md)
2. Check [SETUP_GUIDE_AR.md](./SETUP_GUIDE_AR.md)
3. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

**Version**: 1.0.0 - Professional Edition  
**Status**: ✅ Production Ready
