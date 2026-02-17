import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setSocketServer } from '@/lib/socket-server';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NextApiResponse['socket'] & {
    server: NextApiResponse['socket']['server'] & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(_req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket_io',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      socket.on('joinPoll', (pollId: string) => {
        socket.join(pollId);
      });

      socket.on('leavePoll', (pollId: string) => {
        socket.leave(pollId);
      });
    });

    res.socket.server.io = io;
    setSocketServer(io);
  }

  res.status(200).json({ ok: true });
}
