import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Poll from '@/models/Poll';

export const runtime = 'nodejs';

type CreatePollBody = {
  question?: string;
  options?: string[];
};

export async function POST(request: Request) {
  try {
    let body: CreatePollBody;
    try {
      body = (await request.json()) as CreatePollBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const question = body.question?.trim();
    const options = Array.isArray(body.options)
      ? body.options.map((option) => (typeof option === 'string' ? option.trim() : ''))
      : [];

    if (!question) {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    if (options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options are required.' }, { status: 400 });
    }

    if (options.some((option) => !option)) {
      return NextResponse.json({ error: 'All options must be non-empty.' }, { status: 400 });
    }

    await connectToDatabase();

    const poll = await Poll.create({
      question,
      options: options.map((text) => ({ text, votes: 0 })),
      voters: []
    });

    const proto = request.headers.get('x-forwarded-proto') ?? 'https';
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    const pollId = poll._id.toString();

    return NextResponse.json(
      {
        pollId,
        shareUrl: host ? `${proto}://${host}/poll/${pollId}` : `/poll/${pollId}`
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to create poll.' }, { status: 500 });
  }
}
