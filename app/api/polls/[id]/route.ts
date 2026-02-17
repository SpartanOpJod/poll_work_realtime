import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { serializePoll } from '@/lib/poll';
import Poll from '@/models/Poll';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid poll ID.' }, { status: 400 });
    }

    await connectToDatabase();

    const poll = await Poll.findById(id).lean();

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found.' }, { status: 404 });
    }

    return NextResponse.json({ poll: serializePoll(poll as any) }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch poll.' }, { status: 500 });
  }
}
