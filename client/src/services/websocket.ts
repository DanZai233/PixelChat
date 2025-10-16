import { io, Socket } from 'socket.io-client';
import { 
  JoinResponse,
  UserJoinedEvent,
  UserLeftEvent,
  NewMessageEvent,
  UserListEvent,
  ErrorEvent
} from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private callbacks: Map<string, Function[]> = new Map();

  connect(): void {
    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket连接成功');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket连接断开');
      this.emit('disconnected');
    });

    this.socket.on('joined', (data: JoinResponse) => {
      this.emit('joined', data);
    });

    this.socket.on('user_joined', (data: UserJoinedEvent) => {
      this.emit('user_joined', data);
    });

    this.socket.on('user_left', (data: UserLeftEvent) => {
      this.emit('user_left', data);
    });

    this.socket.on('new_message', (data: NewMessageEvent) => {
      this.emit('new_message', data);
    });

    this.socket.on('user_list', (data: UserListEvent) => {
      this.emit('user_list', data);
    });

    this.socket.on('error', (data: ErrorEvent) => {
      this.emit('error', data);
    });

    this.socket.on('pong', () => {
      this.emit('pong');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  join(nickname?: string): void {
    if (this.socket) {
      this.socket.emit('join', { nickname });
    }
  }

  sendMessage(content: string): void {
    if (this.socket) {
      this.socket.emit('send_message', { content });
    }
  }

  ping(): void {
    if (this.socket) {
      this.socket.emit('ping');
    }
  }

  // 事件监听器管理
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
