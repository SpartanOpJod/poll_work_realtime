import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { serializePoll } from '@/lib/poll';
import { getClientIp } from '@/lib/request';
import { getSocketServer } from '@/lib/socket-server';
import Poll from '@/models/Poll';

export const runtime = 'nodejs';

type VoteBody = {
  optionIndex?: number;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid poll ID.' }, { status: 400 });
    }

    let body: VoteBody;
    try {
      body = (await request.json()) as VoteBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }
    if (!Number.isInteger(body.optionIndex)) {
      return NextResponse.json({ error: 'optionIndex must be an integer.' }, { status: 400 });
    }

    await connectToDatabase();

    const poll = await Poll.findById(id);
    if (!poll) {
      return NextResponse.json({ error: 'Poll not found.' }, { status: 404 });
    }

    if (body.optionIndex < 0 || body.optionIndex >= poll.options.length) {
      return NextResponse.json({ error: 'Option index out of range.' }, { status: 400 });
    }

    const ip = getClientIp(request.headers);

    if (poll.voters.includes(ip)) {
      return NextResponse.json(
        { error: 'This IP has already voted for this poll.' },
        { status: 409 }
      );
    }

    poll.options[body.optionIndex].votes += 1;
    poll.voters.push(ip);
    await poll.save();

    const payload = serializePoll(poll.toObject());

    const io = getSocketServer();
    if (io) {
      io.to(id).emit('voteUpdated', payload);
    }

    return NextResponse.json({ poll: payload }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to register vote.' }, { status: 500 });
  }
}
