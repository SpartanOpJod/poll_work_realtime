'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type CreatePollResponse = {
  pollId: string;
  shareUrl: string;
};

export default function PollCreator() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasValidationError = useMemo(() => {
    if (!question.trim()) return true;
    if (options.length < 2) return true;
    return options.some((option) => !option.trim());
  }, [question, options]);

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const addOption = () => setOptions((prev) => [...prev, '']);

  const removeOption = (index: number) => {
    setOptions((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (hasValidationError) {
      setError('Question and at least 2 non-empty options are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options })
      });

      const data = (await response.json()) as CreatePollResponse & { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Failed to create poll.');
        return;
      }

      router.push(`/poll/${data.pollId}`);
    } catch {
      setError('Unexpected error while creating poll.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="question" className="mb-2 block text-sm font-medium text-slate-700">
          Question
        </label>
        <input
          id="question"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What should we vote on?"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 transition focus:ring-2"
          required
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Options</p>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={option}
              onChange={(event) => handleOptionChange(index, event.target.value)}
              placeholder={`Option ${index + 1}`}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 transition focus:ring-2"
              required
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
        >
          Add Option
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || hasValidationError}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
      </button>
    </form>
  );
}
