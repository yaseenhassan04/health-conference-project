import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return new Response(JSON.stringify({ questions }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { text, author } = data;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        text,
        author: author || 'ضيف',
      }
    });

    return new Response(JSON.stringify({ question }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
