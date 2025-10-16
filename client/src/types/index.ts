export interface User {
  id: string;
  socket_id: string;
  nickname: string;
  avatar: string;
  join_time: string;
  last_activity: string;
  is_online: boolean;
}

export interface Message {
  id: string;
  user_id: string;
  user_nickname: string;
  user_avatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'emoji';
}

export interface ChatStats {
  online_users: number;
  total_messages: number;
  uptime: number;
}

export interface JoinRequest {
  nickname?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface JoinResponse {
  user: User;
  messages: Message[];
}

export interface UserJoinedEvent {
  user: User;
}

export interface UserLeftEvent {
  user: User;
}

export interface NewMessageEvent {
  message: Message;
}

export interface UserListEvent {
  users: User[];
}

export interface ErrorEvent {
  message: string;
}
