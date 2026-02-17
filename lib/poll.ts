type PollOption = {
  text: string;
  votes: number;
};

type PollLike = {
  _id: { toString(): string } | string;
  question: string;
  options: PollOption[];
  createdAt: Date | string;
};

export function serializePoll(poll: PollLike) {
  return {
    _id: typeof poll._id === 'string' ? poll._id : poll._id.toString(),
    question: poll.question,
    options: poll.options.map((option) => ({
      text: option.text,
      votes: option.votes
    })),
    createdAt:
      typeof poll.createdAt === 'string' ? poll.createdAt : new Date(poll.createdAt).toISOString()
  };
}
