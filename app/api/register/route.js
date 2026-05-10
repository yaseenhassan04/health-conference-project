import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const data = await req.json();
    const { fullName, email, profession, country } = data;

    if (!fullName || !email || !profession || !country) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 400 });
    }

    const user = await prisma.user.create({
      data: { fullName, email, profession, country }
    });

    return new Response(JSON.stringify({ message: 'Registration successful', user }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
