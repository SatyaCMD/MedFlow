import { Namespace, Server } from 'socket.io';
import { AuthenticatedSocket, socketAuthMiddleware } from '../socketAuth.middleware.js';
import { SOCKET_EVENTS, LiveChatMessagePayload } from '@medicore360/shared';
import { logger } from '../../lib/logger.js';

export class ChatNamespace {
  private nsp: Namespace;

  constructor(io: Server) {
    this.nsp = io.of('/chat');
    this.nsp.use(socketAuthMiddleware as any);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.nsp.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.user?.userId;
      logger.info({ socketId: socket.id, userId }, 'Client connected to /chat namespace');

      if (userId) socket.join(`user:${userId}`);

      socket.on('join_chat_room', (roomId: string) => {
        socket.join(`chat_room:${roomId}`);
        logger.debug({ socketId: socket.id, roomId }, 'Joined chat room.');
      });

      socket.on('send_chat_message', (payload: LiveChatMessagePayload) => {
        // Broadcast to chat room & recipient
        this.nsp.to(`chat_room:${payload.roomId}`).to(`user:${payload.recipientId}`).emit(SOCKET_EVENTS.CHAT_MESSAGE_SENT, payload);
      });

      socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
        socket.to(`chat_room:${data.roomId}`).emit(SOCKET_EVENTS.CHAT_TYPING_STATUS, {
          userId: socket.user?.userId,
          roomId: data.roomId,
          isTyping: data.isTyping,
        });
      });

      socket.on('disconnect', () => {
        logger.debug({ socketId: socket.id }, 'Disconnected from /chat namespace');
      });
    });
  }

  public broadcastChatMessage(payload: LiveChatMessagePayload): void {
    this.nsp.to(`chat_room:${payload.roomId}`).to(`user:${payload.recipientId}`).emit(SOCKET_EVENTS.CHAT_MESSAGE_SENT, payload);
  }
}
