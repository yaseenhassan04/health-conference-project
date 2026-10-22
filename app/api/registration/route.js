import { ApiError } from '@/server/lib/apiError';
import { registerUser } from '@/server/services/register.service';

export async function POST(req) {
  try {
    const data = await req.json();
    const { status, body } = await registerUser(data);
    return new Response(JSON.stringify(body), { status });
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(JSON.stringify(error.body), { status: error.status });
    }
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
