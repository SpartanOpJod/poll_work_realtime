import PollCreator from '@/components/PollCreator';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold tracking-tight">Real-Time Poll Rooms</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create a poll, share the link, and watch results update instantly.
        </p>
        <div className="mt-8">
          <PollCreator />
        </div>
      </div>
    </main>
  );
}
