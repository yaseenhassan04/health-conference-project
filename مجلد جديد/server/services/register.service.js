import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

export async function registerUser({ fullName, email, profession, country }) {
  if (!fullName || !email || !profession || !country) {
    throw new ApiError(400, { error: 'All fields are required' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, { error: 'Email already registered' });
  }

  const user = await prisma.user.create({
    data: { fullName, email, profession, country },
  });

  return { status: 201, body: { message: 'Registration successful', user } };
}
