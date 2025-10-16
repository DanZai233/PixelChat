package models

import (
	"time"
)

// User 用户模型
type User struct {
	ID           string    `json:"id"`
	SocketID     string    `json:"socket_id"`
	Nickname     string    `json:"nickname"`
	Avatar       string    `json:"avatar"`
	JoinTime     time.Time `json:"join_time"`
	LastActivity time.Time `json:"last_activity"`
	IsOnline     bool      `json:"is_online"`
}

// Message 消息模型
type Message struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	UserNickname string    `json:"user_nickname"`
	UserAvatar   string    `json:"user_avatar"`
	Content      string    `json:"content"`
	Timestamp    time.Time `json:"timestamp"`
	Type         string    `json:"type"` // text, system, emoji
}

// ChatStats 聊天室统计信息
type ChatStats struct {
	OnlineUsers   int `json:"online_users"`
	TotalMessages int `json:"total_messages"`
	Uptime        int `json:"uptime"`
}

// JoinRequest 加入聊天室请求
type JoinRequest struct {
	Nickname string `json:"nickname"`
}

// SendMessageRequest 发送消息请求
type SendMessageRequest struct {
	Content string `json:"content"`
}

// WebSocketMessage WebSocket消息
type WebSocketMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// JoinResponse 加入聊天室响应
type JoinResponse struct {
	User     *User      `json:"user"`
	Messages []*Message `json:"messages"`
}

// UserJoinedEvent 用户加入事件
type UserJoinedEvent struct {
	User *User `json:"user"`
}

// UserLeftEvent 用户离开事件
type UserLeftEvent struct {
	User *User `json:"user"`
}

// NewMessageEvent 新消息事件
type NewMessageEvent struct {
	Message *Message `json:"message"`
}

// UserListEvent 用户列表事件
type UserListEvent struct {
	Users []*User `json:"users"`
}

// ErrorEvent 错误事件
type ErrorEvent struct {
	Message string `json:"message"`
}
