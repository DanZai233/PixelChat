// 类型定义在handleMessage方法中使用，但TypeScript需要导入
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { 
  JoinResponse,
  UserJoinedEvent,
  UserLeftEvent,
  NewMessageEvent,
  UserListEvent,
  ErrorEvent
} from '../types';

class WebSocketService {
  private socket: WebSocket | null = null;
  private callbacks: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  connect(): void {
    try {
      // 使用环境变量配置WebSocket地址，支持虚拟机部署
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws';
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket连接成功');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.socket.onclose = () => {
        console.log('WebSocket连接断开');
        this.emit('disconnected');
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.emit('error', { message: 'WebSocket连接错误' });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('解析消息失败:', error);
        }
      };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      this.emit('error', { message: 'WebSocket连接失败' });
    }
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'joined':
        this.emit('joined', message.data);
        break;
      case 'user_joined':
        this.emit('user_joined', message.data);
        break;
      case 'user_left':
        this.emit('user_left', message.data);
        break;
      case 'new_message':
        this.emit('new_message', message.data);
        break;
      case 'user_list':
        this.emit('user_list', message.data);
        break;
      case 'error':
        this.emit('error', message.data);
        break;
      case 'pong':
        this.emit('pong');
        break;
      default:
        console.log('未知消息类型:', message.type);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('重连失败，已达到最大重连次数');
      this.emit('error', { message: '连接失败，请刷新页面重试' });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  join(nickname?: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({
        type: 'join',
        data: { nickname }
      });
    }
  }

  sendMessage(content: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({
        type: 'send_message',
        data: { content }
      });
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  }

  ping(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({
        type: 'ping',
        data: null
      });
    }
  }

  private send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
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
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
