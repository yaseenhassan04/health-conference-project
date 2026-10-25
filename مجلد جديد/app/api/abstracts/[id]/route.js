import { ApiError } from '@/server/lib/apiError';
import { updateAbstractStatusById } from '@/server/services/abstracts.service';

export async function PUT(req, { params }) {
  try {
    const data = await req.json();
    const result = await updateAbstractStatusById({ id: params.id, status: data.status });
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(JSON.stringify(error.body), { status: error.status });
    }
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
