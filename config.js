/**
 * config.js
 * ملف الإعدادات الرئيسي للمشروع
 */

// 🎨 الألوان والثيم
export const theme = {
  primary: '#0066cc',
  secondary: '#00aa66',
  danger: '#ff3344',
  success: '#22cc44',
  warning: '#ffaa00',
  dark: '#333333',
  light: '#f5f5f5'
};

// 📧 إعدادات البريد الإلكتروني
export const emailConfig = {
  service: 'gmail',
  from: process.env.EMAIL_USER,
  // ملاحظة: كلمة المرور موجودة في .env
};

// 🗄️ إعدادات قاعدة البيانات
export const dbConfig = {
  // URL متغير من .env
  // DATABASE_URL=file:./dev.db
  maxConnectionPoolSize: 10,
  timeout: 30000
};

// 🚀 إعدادات التطبيق
export const appConfig = {
  name: 'مشروع الصحة',
  version: '1.0.0',
  description: 'منصة شاملة لإدارة المؤتمرات والأبحاث الطبية',
  
  // رفع الملفات
  uploadConfig: {
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    allowedFormats: ['pdf', 'doc', 'docx'],
    uploadDir: 'public/uploads'
  },

  // الجلسات والمصادقة
  auth: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 ساعة
    passwordMinLength: 6,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 دقيقة
  },

  // الصفحات الرئيسية
  pages: {
    home: '/',
    dashboard: '/dashboard',
    registration: '/registration',
    about: '/about',
    contact: '/contact'
  },

  // معلومات الاتصال
  contact: {
    email: 'info@health-project.com',
    phone: '+966123456789',
    address: 'المملكة العربية السعودية'
  }
};

// 🔧 إعدادات التطوير
export const devConfig = {
  debug: true,
  logLevel: 'debug', // debug, info, warn, error
  cors: true,
  corsOrigin: 'http://localhost:3000'
};

// 🏢 إعدادات الإنتاج
export const prodConfig = {
  debug: false,
  logLevel: 'error',
  cors: true,
  corsOrigin: process.env.NEXT_PUBLIC_API_URL
};

// ✉️ نماذج البريد الإلكتروني
export const emailTemplates = {
  // تأكيد التسجيل
  confirmRegistration: {
    subject: 'تأكيد التسجيل في المؤتمر',
    template: `
      مرحباً {{fullName}},
      
      تم تسجيلك بنجاح في المؤتمر العلمي.
      
      البيانات المسجلة:
      - الإيميل: {{email}}
      - المهنة: {{profession}}
      - الدولة: {{country}}
      
      يمكنك الآن تقديم أبحاثك من خلال لوحة التحكم.
      
      مع أطيب التحيات
      فريق المؤتمر
    `
  },

  // تقبل البحث
  abstractAccepted: {
    subject: 'تم قبول بحثك',
    template: `
      مرحباً {{authorName}},
      
      يسعدنا إخبارك بأن بحثك "{{title}}" قد تم قبوله.
      
      شكراً لمساهمتك القيمة في المؤتمر!
      
      مع أطيب التحيات
      فريق التحكيم
    `
  },

  // رفض البحث
  abstractRejected: {
    subject: 'بخصوص بحثك المقدم',
    template: `
      مرحباً {{authorName}},
      
      شكراً لك على تقديم بحثك "{{title}}".
      
      للأسف، لم نتمكن من قبول البحث في هذه النسخة من المؤتمر.
      
      نحن نشجعك على المحاولة مرة أخرى في المؤتمرات القادمة.
      
      مع أطيب التحيات
      فريق التحكيم
    `
  }
};

// 📊 معايير الإبلاغ
export const reportConfig = {
  dateFormat: 'yyyy-MM-dd',
  timeFormat: 'HH:mm:ss',
  timezone: 'Asia/Riyadh',
  defaultReportFormat: 'pdf' // pdf أو csv
};

// 🔐 إعدادات الأمان
export const securityConfig = {
  enableRateLimiting: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 100 // عدد الطلبات المسموحة
  },
  enableCSRF: true,
  enableXSSProtection: true,
  enableHSTS: true,
  hstsMaxAge: 31536000 // سنة واحدة
};

export default {
  theme,
  emailConfig,
  dbConfig,
  appConfig,
  devConfig,
  prodConfig,
  emailTemplates,
  reportConfig,
  securityConfig
};
