import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await req.json();
    const { status } = data; // ACCEPTED, REJECTED

    if (!status) {
      return new Response(JSON.stringify({ error: 'Status is required' }), { status: 400 });
    }

    const updated = await prisma.abstract.update({
      where: { id },
      data: { status }
    });

    return new Response(JSON.stringify({ abstract: updated }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
