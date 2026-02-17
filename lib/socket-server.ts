import type { Server as SocketIOServer } from 'socket.io';

declare global {
  var ioInstance: SocketIOServer | undefined;
}

export function setSocketServer(io: SocketIOServer) {
  global.ioInstance = io;
}

export function getSocketServer() {
  return global.ioInstance;
}
