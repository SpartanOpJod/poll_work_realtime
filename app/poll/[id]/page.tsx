import PollRoom from '@/components/PollRoom';

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <PollRoom pollId={id} />
    </main>
  );
}
