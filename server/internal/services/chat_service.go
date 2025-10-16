package services

import (
	"fmt"
	"pixel-chat-server/internal/models"
	"time"
)

type ChatService struct {
	userService    *UserService
	messageService *MessageService
	startTime      time.Time
}

func NewChatService(userService *UserService, messageService *MessageService) *ChatService {
	return &ChatService{
		userService:    userService,
		messageService: messageService,
		startTime:      time.Now(),
	}
}

// AddUser 添加用户到聊天室
func (s *ChatService) AddUser(socketID string, nickname string) (*models.User, error) {
	user, err := s.userService.CreateUser(socketID, nickname)
	if err != nil {
		return nil, err
	}

	// 添加系统消息
	s.messageService.AddSystemMessage(fmt.Sprintf("用户 %s 加入了聊天室", user.Nickname))

	return user, nil
}

// RemoveUser 从聊天室移除用户
func (s *ChatService) RemoveUser(socketID string) *models.User {
	user := s.userService.RemoveUser(socketID)
	if user != nil {
		// 添加系统消息
		s.messageService.AddSystemMessage(fmt.Sprintf("用户 %s 离开了聊天室", user.Nickname))
	}
	return user
}

// SendMessage 发送消息
func (s *ChatService) SendMessage(socketID string, content string) (*models.Message, error) {
	user, exists := s.userService.GetUser(socketID)
	if !exists {
		return nil, fmt.Errorf("用户不存在")
	}

	// 更新用户活动时间
	s.userService.UpdateUserActivity(socketID)

	// 添加消息
	message, err := s.messageService.AddMessage(
		user.ID,
		user.Nickname,
		user.Avatar,
		content,
		"text",
	)
	if err != nil {
		return nil, err
	}

	return message, nil
}

// GetOnlineUsers 获取在线用户列表
func (s *ChatService) GetOnlineUsers() []*models.User {
	return s.userService.GetOnlineUsers()
}

// GetRecentMessages 获取最近的消息
func (s *ChatService) GetRecentMessages(limit int) []*models.Message {
	return s.messageService.GetRecentMessages(limit)
}

// GetStats 获取聊天室统计信息
func (s *ChatService) GetStats() *models.ChatStats {
	return &models.ChatStats{
		OnlineUsers:   s.userService.GetUsersCount(),
		TotalMessages: s.messageService.GetMessagesCount(),
		Uptime:        int(time.Since(s.startTime).Seconds()),
	}
}

// GetUser 获取用户信息
func (s *ChatService) GetUser(socketID string) (*models.User, bool) {
	return s.userService.GetUser(socketID)
}

// UpdateUserActivity 更新用户活动时间
func (s *ChatService) UpdateUserActivity(socketID string) {
	s.userService.UpdateUserActivity(socketID)
}
