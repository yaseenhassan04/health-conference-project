import prisma from '@/server/db/prisma';

export async function listPublicUsers() {
  const users = await prisma.user.findMany({
    // 🔥 حماية البيانات: جلب الحقول العامة فقط التي تهم الزوار
    select: {
      id: true,
      fullName: true,
      title: true,
      institution: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return { users };
}
