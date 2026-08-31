import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'conference_secret_key_change_in_production'
);

export async function login({ username, password }) {
  if (!username || !password) {
    throw new ApiError(400, { error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  const normalizedUsername = username.trim().toLowerCase();

  const user = await prisma.admin.findUnique({
    where: { username: normalizedUsername },
  });

  if (!user) {
    throw new ApiError(401, { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  let userRole = 'admin';

  if (user.username.toLowerCase() === 'media_admin') {
    userRole = 'media';
  } else if (user.username.toLowerCase() === 'doctor_admin') {
    userRole = 'doctor';
  }

  const displayName = user.username;

  const token = await new SignJWT({
    id: user.id.toString(),
    name: displayName,
    role: userRole,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return {
    success: true,
    token,
    user: {
      id: user.id,
      name: displayName,
      role: userRole,
    },
  };
}

export async function setupInitialAdmin({ setupKey }) {
  if (setupKey !== 'setup_samoud_2026_once') {
    throw new ApiError(403, { error: 'Forbidden' });
  }

  const hashed = await bcrypt.hash('Admin@2026', 10);

  const existing = await prisma.admin.findUnique({
    where: { username: 'admin' },
  });

  if (existing) {
    return { success: true, status: 'already_exists' };
  }

  await prisma.admin.create({
    data: { username: 'admin', password: hashed },
  });

  return { success: true, status: 'created' };
}
