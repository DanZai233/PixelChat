package services

import (
	"fmt"
	"pixel-chat-server/internal/models"
	"sync"
	"time"

	"github.com/google/uuid"
)

type MessageService struct {
	messages    []*models.Message
	messagesMux sync.RWMutex
	maxHistory  int
	maxLength   int
}

func NewMessageService() *MessageService {
	return &MessageService{
		messages:   make([]*models.Message, 0),
		maxHistory: 1000, // 默认最大历史消息数
		maxLength:  500,  // 默认最大消息长度
	}
}

// AddMessage 添加消息
func (s *MessageService) AddMessage(userID, userNickname, userAvatar, content, msgType string) (*models.Message, error) {
	if len(content) > s.maxLength {
		return nil, fmt.Errorf("消息过长")
	}

	if content == "" {
		return nil, fmt.Errorf("消息内容不能为空")
	}

	s.messagesMux.Lock()
	defer s.messagesMux.Unlock()

	message := &models.Message{
		ID:           uuid.New().String(),
		UserID:       userID,
		UserNickname: userNickname,
		UserAvatar:   userAvatar,
		Content:      content,
		Timestamp:    time.Now(),
		Type:         msgType,
	}

	s.messages = append(s.messages, message)

	// 保持消息历史在限制范围内
	if len(s.messages) > s.maxHistory {
		s.messages = s.messages[len(s.messages)-s.maxHistory:]
	}

	return message, nil
}

// GetRecentMessages 获取最近的消息
func (s *MessageService) GetRecentMessages(limit int) []*models.Message {
	s.messagesMux.RLock()
	defer s.messagesMux.RUnlock()

	if limit <= 0 || limit > len(s.messages) {
		limit = len(s.messages)
	}

	// 返回最近的消息
	start := len(s.messages) - limit
	if start < 0 {
		start = 0
	}

	messages := make([]*models.Message, limit)
	copy(messages, s.messages[start:])
	return messages
}

// GetAllMessages 获取所有消息
func (s *MessageService) GetAllMessages() []*models.Message {
	s.messagesMux.RLock()
	defer s.messagesMux.RUnlock()

	messages := make([]*models.Message, len(s.messages))
	copy(messages, s.messages)
	return messages
}

// GetMessagesCount 获取消息总数
func (s *MessageService) GetMessagesCount() int {
	s.messagesMux.RLock()
	defer s.messagesMux.RUnlock()

	return len(s.messages)
}

// AddSystemMessage 添加系统消息
func (s *MessageService) AddSystemMessage(content string) *models.Message {
	s.messagesMux.Lock()
	defer s.messagesMux.Unlock()

	message := &models.Message{
		ID:           uuid.New().String(),
		UserID:       "system",
		UserNickname: "SYSTEM",
		UserAvatar:   "",
		Content:      content,
		Timestamp:    time.Now(),
		Type:         "system",
	}

	s.messages = append(s.messages, message)

	// 保持消息历史在限制范围内
	if len(s.messages) > s.maxHistory {
		s.messages = s.messages[len(s.messages)-s.maxHistory:]
	}

	return message
}
