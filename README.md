# Real-Time Poll Rooms

A complete full-stack polling app built with Next.js App Router, MongoDB Atlas, Tailwind CSS, and Socket.io.

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Next.js API Routes
- MongoDB Atlas + Mongoose
- Socket.io

## Features

- Create polls with validation
- Share poll links (`/poll/[id]`)
- Single-choice voting
- Real-time vote updates across devices/browsers
- IP-based vote restriction
- Browser `localStorage` vote restriction
- Persistent poll/vote storage in MongoDB
- Error handling for invalid IDs, bad requests, and DB failures

## Folder Structure

```text
.
|-- app
|   |-- api
|   |   |-- polls
|   |   |   |-- [id]
|   |   |   |   |-- route.ts
|   |   |   |   `-- vote
|   |   |   |       `-- route.ts
|   |   |   `-- route.ts
|   |-- poll
|   |   `-- [id]
|   |       `-- page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components
|   |-- PollCreator.tsx
|   `-- PollRoom.tsx
|-- lib
|   |-- mongodb.ts
|   |-- poll.ts
|   |-- request.ts
|   `-- socket-server.ts
|-- models
|   `-- Poll.ts
|-- pages
|   `-- api
|       `-- socket.ts
|-- .env.example
|-- .eslintrc.json
|-- .gitignore
|-- next.config.mjs
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
`-- tsconfig.json
```

## Data Model

`Poll` document shape:

```ts
{
  question: string;
  options: {
    text: string;
    votes: number;
  }[];
  voters: string[];
  createdAt: Date;
}
```

## API Endpoints

- `POST /api/polls`: Create poll
- `GET /api/polls/[id]`: Fetch poll
- `POST /api/polls/[id]/vote`: Vote with fairness checks + socket emit
- `GET /api/socket`: Initialize Socket.io server

## Environment Variables

Create `.env.local`:

```bash
MONGODB_URI=your_mongodb_atlas_connection_string
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Set environment variable in `.env.local`.

3. Start development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## How Real-Time Works

1. Client loads poll page and calls `/api/socket`.
2. Client connects with Socket.io client using path `/api/socket_io`.
3. Client joins room = poll ID (`joinPoll` event).
4. On vote, API updates MongoDB and emits `voteUpdated` to that room.
5. All connected clients update instantly.

## Fairness / Anti-Abuse

- IP Restriction:
  - API extracts IP from `x-forwarded-for` / `x-real-ip`.
  - IP is stored in `poll.voters`.
  - Duplicate IP vote returns `409`.

- Browser Restriction:
  - On successful vote, frontend saves `voted_poll_<pollId>` in `localStorage`.
  - Vote button becomes disabled with a clear message.


## Production Readiness Notes

- All API routes use async/await and status-coded JSON errors.
- Inputs are validated server-side.
- Invalid poll IDs and out-of-range options are explicitly handled.
- DB failures return safe `500` responses.
