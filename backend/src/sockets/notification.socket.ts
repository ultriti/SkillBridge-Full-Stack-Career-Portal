import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { NotificationRecord } from '../types/notification.types';

let ioInstance: SocketIOServer | null = null;

export function initNotificationSocket(io: SocketIOServer): void {
  ioInstance = io;

  // Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error('Authentication error: Token required'));
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      const decoded = verifyAccessToken(token);
      (socket as any).userId = decoded.id;
      (socket as any).userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const userRoom = `user:${userId}`;

    socket.join(userRoom);
    console.log(`🔌 Socket connected: User ${userId} joined room ${userRoom}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: User ${userId}`);
    });
  });
}

/**
 * Emit real-time notification payload to specific user's private room
 */
export function emitNotificationToUser(userId: string, notification: NotificationRecord): void {
  if (ioInstance) {
    const userRoom = `user:${userId}`;
    ioInstance.to(userRoom).emit('notification:new', notification);
  }
}
