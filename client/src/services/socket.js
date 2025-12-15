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
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.socket.emit('join', { user_id: userId });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server. Reason:', reason);
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.socket.emit('join', { user_id: userId });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}...`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after maximum attempts');
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

  joinGroupRoom(userId, groupId) {
    if (this.socket) {
      this.socket.emit('join_group', {
        user_id: userId,
        group_id: groupId,
      });
      console.log(`Joining group room ${groupId}`);
    }
  }

  leaveGroupRoom(userId, groupId) {
    if (this.socket) {
      this.socket.emit('leave_group', {
        user_id: userId,
        group_id: groupId,
      });
      console.log(`Leaving group room ${groupId}`);
    }
  }

  sendGroupMessage(senderId, groupId, content) {
    if (this.socket) {
      this.socket.emit('send_group_message', {
        sender_id: senderId,
        group_id: groupId,
        content: content,
      });
    }
  }

  onNewGroupMessage(callback) {
    if (this.socket) {
      this.socket.on('new_group_message', callback);
    }
  }

  offNewGroupMessage() {
    if (this.socket) {
      this.socket.off('new_group_message');
    }
  }
}

export default new SocketService();