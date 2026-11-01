import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

export async function listQuestions() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return { questions };
}

export async function createQuestion({ text, author }) {
  if (!text) {
    throw new ApiError(400, { error: 'Text is required' });
  }

  const question = await prisma.question.create({
    data: {
      text,
      author: author || 'ضيف',
    },
  });

  return { status: 201, body: { question } };
}
