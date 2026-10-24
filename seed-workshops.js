const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const registrations = [
    {
      fullNameAr: 'بلال تيسير جودة',
      fullNameEn: 'Belal jouda',
      phone: '970592173397',
      whatsapp: '970592173397',
      email: 'belal.jouda@workshop.temp',
      specialty: 'Emergency Medicine',
      workplace: 'مجمع ناصر الطبي',
      workshops: JSON.stringify(['w1', 'w5']),
    },
    {
      fullNameAr: 'بلال حمدان مرشد القاضي',
      fullNameEn: 'Belal Hamdan Morshed Alqaddi',
      phone: '970597549565',
      whatsapp: '970597549565',
      email: 'belal.alqaddi@workshop.temp',
      specialty: 'Internal Medicine',
      workplace: 'مجمع ناصر الطبي',
      workshops: JSON.stringify(['w5', 'w2']),
    },
    {
      fullNameAr: 'أكرم عبد القادر محمد جربوع',
      fullNameEn: 'Akram Abdulqader Jarbou',
      phone: '00970568291096',
      whatsapp: '00970568291096',
      email: 'akram.jarbou@workshop.temp',
      specialty: 'Internal Medicine',
      workplace: 'مجمع ناصر الطبي',
      workshops: JSON.stringify(['w2', 'w5']),
    },
    {
      fullNameAr: 'عبد العزيز محمد الفرا',
      fullNameEn: 'AbedElaziz Mohammed Elfarra',
      phone: '+972598057780',
      whatsapp: '+972598057780',
      email: 'abedelaziz.elfarra@workshop.temp',
      specialty: 'General Practice',
      workplace: 'مجمع ناصر الطبي-غزة',
      workshops: JSON.stringify(['w1', 'w5']),
    },
    {
      fullNameAr: 'أحمد محمد حمودة الشاعر',
      fullNameEn: 'Ahmed Mohammed Hamouda Al-Shaer',
      phone: '00970567171488',
      whatsapp: '00970567171488',
      email: 'ahmed.alshaer@workshop.temp',
      specialty: 'Internal Medicine',
      workplace: 'مجمع ناصر الطبي',
      workshops: JSON.stringify(['w1', 'w5']),
    },
    {
      fullNameAr: 'أيم محمد سليمان ابو محسن',
      fullNameEn: 'Aya muhammed soliman abu mohsen',
      phone: '+972594334787',
      whatsapp: '+972594334787',
      email: 'aya.abumohsen@workshop.temp',
      specialty: 'Cardiology',
      workplace: 'مجمع ناصر الطبي',
      workshops: JSON.stringify(['w4', 'w3']),
    },
    {
      fullNameAr: 'رنا رائد محمد يونس',
      fullNameEn: 'Rana Raed mohammed younis',
      phone: '+9720593806506',
      whatsapp: '+9720593806506',
      email: 'rana.younis@workshop.temp',
      specialty: 'Internal Medicine',
      workplace: 'مجمع ناصر الطبي-خانيونس',
      workshops: JSON.stringify(['w4', 'w3']),
    },
    {
      fullNameAr: 'رجب خالد العطار',
      fullNameEn: 'Rajab.k.Alattar',
      phone: '00972567816013',
      whatsapp: '00972567816013',
      email: 'rajab.alattar@workshop.temp',
      specialty: 'Internal Medicine',
      workplace: 'مجمع ناصر الطبي',
      workshops: JSON.stringify(['w4', 'w3']),
    },
    {
      fullNameAr: 'بهاء فريد أحمد ماضي',
      fullNameEn: 'Bahaa farid ahmed madi',
      phone: '+972597830121',
      whatsapp: '+972597830121',
      email: 'bahaa.madi@workshop.temp',
      specialty: 'Internal Medicine',
      workplace: 'مستشفى غزة الروبي',
      workshops: JSON.stringify(['w3', 'w1']),
    },
    {
      fullNameAr: 'عبدالله خالد صيام',
      fullNameEn: 'Abdallah seyam',
      phone: '+0970595038385',
      whatsapp: '+0970595038385',
      email: 'abdallah.seyam@workshop.temp',
      specialty: 'Cardiology',
      workplace: 'مجمع ناصر الطبي-خان يونس',
      workshops: JSON.stringify(['w4', 'w1']),
    },
    {
      fullNameAr: 'أحمد جمعة الروبي',
      fullNameEn: 'Ahmed Al-Roubi',
      phone: '0599770376',
      whatsapp: '0599770376',
      email: 'ahmed.alroubi@workshop.temp',
      specialty: 'Rheumatology',
      workplace: 'مجمع قسم ناصر الباطنة',
      workshops: JSON.stringify(['w2']),
    },
    {
      fullNameAr: 'ياسمين رياض عبد الهادي حسان',
      fullNameEn: 'Yasmin Reyad Abd_El hadi Hassan',
      phone: '+972594420590',
      whatsapp: '+972594420590',
      email: 'yasmin.hassan@workshop.temp',
      specialty: 'Internal Medicine',
      workplace: 'مجمع ناصر الطبي',
      workshops: JSON.stringify(['w4', 'w1']),
    },
    {
      fullNameAr: 'محمد عبد الحميد حسن أبو ضاحي',
      fullNameEn: 'Mohammed abdelhameid hassan abu dahi',
      phone: '0592240542',
      whatsapp: '0592240542',
      email: 'mohammed.abudahi@workshop.temp',
      specialty: 'Emergency Medicine',
      workplace: 'مجمع ناصر الطبي',
      workshops: JSON.stringify(['w1', 'w3']),
    },
    {
      fullNameAr: 'براء عاطف محمد شكر',
      fullNameEn: 'Baraa A M Shukur',
      phone: '+972592672745',
      whatsapp: '+972592672745',
      email: 'baraa.shukur@workshop.temp',
      specialty: 'Internal Medicine',
      workplace: 'Nmc',
      workshops: JSON.stringify(['w4', 'w3']),
    },
    {
      fullNameAr: 'محمد عماد حمدان',
      fullNameEn: 'Mohammed imad hamdan',
      phone: '00972592234033',
      whatsapp: '00972592234033',
      email: 'mohammed.hamdan@workshop.temp',
      specialty: 'Internal Medicine',
      workplace: 'مجمع ناصر',
      workshops: JSON.stringify(['w3', 'w2']),
    },
  ];

  console.log('🌱 بدء إدخال البيانات...');
  
  for (const reg of registrations) {
    try {
      await prisma.workshopRegistration.create({ data: reg });
      console.log(`✅ تم إدخال: ${reg.fullNameAr}`);
    } catch (e) {
      console.log(`⚠️ موجود مسبقاً أو خطأ: ${reg.fullNameAr} - ${e.message}`);
    }
  }

  const count = await prisma.workshopRegistration.count();
  console.log(`\n✅ اكتمل! إجمالي المسجلين: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
