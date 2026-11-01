import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

export async function getLiveSettings() {
  const settings = await prisma.liveSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return { settings };
}

export async function updateLiveSettings({ meetLink, isLive }) {
  const data = {};
  if (meetLink !== undefined) data.meetLink = meetLink.trim();
  if (isLive !== undefined) data.isLive = Boolean(isLive);

  const settings = await prisma.liveSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  return { settings };
}

export async function registerAttendee({ fullName, phone, email, specialty }) {
  if (!fullName?.trim() || !phone?.trim() || !email?.trim() || !specialty?.trim()) {
    throw new ApiError(400, { error: 'جميع الحقول مطلوبة' });
  }

  const attendee = await prisma.liveAttendee.upsert({
    where: { email: email.trim().toLowerCase() },
    update: {
      fullName: fullName.trim(),
      phone: phone.trim(),
      specialty: specialty.trim(),
      joinedAt: new Date(),
    },
    create: {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      specialty: specialty.trim(),
    },
  });

  return { status: 201, body: { attendee } };
}

export async function listAttendees() {
  const attendees = await prisma.liveAttendee.findMany({
    orderBy: { joinedAt: 'desc' },
  });
  return { attendees };
}

export async function deleteAttendee({ id }) {
  if (!id) {
    throw new ApiError(400, { error: 'معرف المشاهد (id) مطلوب' });
  }
  await prisma.liveAttendee.delete({ where: { id: parseInt(id) } });
  return { success: true };
}
