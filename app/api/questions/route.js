import { ApiError } from '@/server/lib/apiError';
import { listQuestions, createQuestion } from '@/server/services/questions.service';

export async function GET() {
  try {
    const result = await listQuestions();
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { status, body } = await createQuestion(data);
    return new Response(JSON.stringify(body), { status });
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(JSON.stringify(error.body), { status: error.status });
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
