import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { serializePoll } from '@/lib/poll';
import Poll from '@/models/Poll';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid poll ID.' }, { status: 400 });
    }

    await connectToDatabase();

    const poll = await Poll.findById(id).lean();

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { poll: serializePoll(poll as unknown) },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch poll.' },
      { status: 500 }
    );
  }
}
