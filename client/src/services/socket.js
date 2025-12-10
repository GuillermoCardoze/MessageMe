import { io } from 'socket.io-client';

const SOCKET_URL = 'http://127.0.0.1:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      // Join user's personal room
      this.socket.emit('join', { user_id: userId });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    this.socket.on('connection_response', (data) => {
      console.log('📨 Server response:', data);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  sendMessage(senderId, recipientId, content) {
    if (this.socket) {
      this.socket.emit('send_message', {
        sender_id: senderId,
        recipient_id: recipientId,
        content: content,
      });
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message');
    }
  }
}

export default new SocketService();