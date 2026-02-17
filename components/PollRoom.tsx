'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type PollOption = {
  text: string;
  votes: number;
};

type PollPayload = {
  _id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
};

type VoteResponse = {
  poll: PollPayload;
  error?: string;
};

const votedKey = (pollId: string) => `voted_poll_${pollId}`;

let socket: Socket | null = null;

export default function PollRoom({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<PollPayload | null>(null);
  const [selectedOption, setSelectedOption] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/poll/${pollId}`;
  }, [pollId]);

  const totalVotes = useMemo(() => {
    if (!poll) return 0;
    return poll.options.reduce((sum, option) => sum + option.votes, 0);
  }, [poll]);

  useEffect(() => {
    setHasVoted(localStorage.getItem(votedKey(pollId)) === '1');
  }, [pollId]);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/polls/${pollId}`, { cache: 'no-store' });
        const data = (await response.json()) as { poll?: PollPayload; error?: string };

        if (!response.ok || !data.poll) {
          setError(data.error ?? 'Poll not found.');
          return;
        }

        setPoll(data.poll);
        setSelectedOption(0);
      } catch {
        setError('Failed to load poll.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      await fetch('/api/socket');
      if (!mounted) return;

      if (!socket) {
        socket = io({ path: '/api/socket_io', transports: ['websocket', 'polling'] });
      }

      socket.emit('joinPoll', pollId);
      socket.on('voteUpdated', (updatedPoll: PollPayload) => {
        if (updatedPoll._id === pollId) {
          setPoll(updatedPoll);
        }
      });
    };

    setupSocket().catch(() => {
      setNotice('Live updates are temporarily unavailable.');
    });

    return () => {
      mounted = false;
      if (socket) {
        socket.emit('leavePoll', pollId);
        socket.off('voteUpdated');
      }
    };
  }, [pollId]);

  const handleVote = async () => {
    if (hasVoted) {
      setNotice('You have already voted in this poll.');
      return;
    }

    if (!poll) return;

    try {
      setIsVoting(true);
      setError('');
      setNotice('');

      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex: selectedOption })
      });

      const data = (await response.json()) as VoteResponse;

      if (!response.ok || !data.poll) {
        const message = data.error ?? 'Unable to register vote.';
        if (response.status === 409) {
          localStorage.setItem(votedKey(pollId), '1');
          setHasVoted(true);
          setNotice('You have already voted in this poll.');
        } else {
          setError(message);
        }
        return;
      }

      setPoll(data.poll);
      localStorage.setItem(votedKey(pollId), '1');
      setHasVoted(true);
      setNotice('Vote submitted successfully.');
    } catch {
      setError('Unexpected error while voting.');
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading poll...</p>;
  }

  if (error && !poll) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">Poll not found.</p>
      </div>
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-bold tracking-tight">{poll.question}</h1>
      <p className="mt-2 break-all text-sm text-slate-600">
        Share this poll: <span className="font-medium">{shareUrl}</span>
      </p>

      <div className="mt-6 space-y-3">
        {poll.options.map((option, index) => {
          const percent = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
          return (
            <label
              key={`${option.text}-${index}`}
              className="block rounded-lg border border-slate-200 p-3 transition hover:border-slate-300"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="poll-option"
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    disabled={hasVoted || isVoting}
                  />
                  <span className="text-sm font-medium text-slate-800">{option.text}</span>
                </div>
                <span className="text-sm text-slate-600">
                  {option.votes} votes ({percent}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </label>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-slate-600">Total votes: {totalVotes}</p>

      <button
        onClick={handleVote}
        disabled={hasVoted || isVoting}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {hasVoted ? 'You have already voted' : isVoting ? 'Submitting...' : 'Vote'}
      </button>

      {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
