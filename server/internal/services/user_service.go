package services

import (
	"fmt"
	"math/rand"
	"pixel-chat-server/internal/models"
	"sync"
	"time"
)

type UserService struct {
	users    map[string]*models.User
	usersMux sync.RWMutex
	maxUsers int
}

func NewUserService() *UserService {
	return &UserService{
		users:    make(map[string]*models.User),
		maxUsers: 100, // 默认最大用户数
	}
}

// GenerateUserID 生成用户ID
func (s *UserService) GenerateUserID() string {
	return fmt.Sprintf("User#%04X", rand.Intn(0xFFFF))
}

// GenerateAvatar 生成像素头像
func (s *UserService) GenerateAvatar() string {
	// 生成8x8像素头像的16进制表示
	colors := []string{"0", "1", "2", "3", "4", "5"} // 对应不同颜色
	avatar := ""
	
	for i := 0; i < 16; i++ {
		colorIndex := rand.Intn(len(colors))
		avatar += colors[colorIndex]
	}
	
	return avatar
}

// CreateUser 创建用户
func (s *UserService) CreateUser(socketID string, nickname string) (*models.User, error) {
	s.usersMux.Lock()
	defer s.usersMux.Unlock()

	if len(s.users) >= s.maxUsers {
		return nil, fmt.Errorf("聊天室已满")
	}

	user := &models.User{
		ID:           s.GenerateUserID(),
		SocketID:     socketID,
		Nickname:     nickname,
		Avatar:       s.GenerateAvatar(),
		JoinTime:     time.Now(),
		LastActivity: time.Now(),
		IsOnline:     true,
	}

	s.users[socketID] = user
	return user, nil
}

// GetUser 获取用户
func (s *UserService) GetUser(socketID string) (*models.User, bool) {
	s.usersMux.RLock()
	defer s.usersMux.RUnlock()
	
	user, exists := s.users[socketID]
	return user, exists
}

// UpdateUserActivity 更新用户活动时间
func (s *UserService) UpdateUserActivity(socketID string) {
	s.usersMux.Lock()
	defer s.usersMux.Unlock()
	
	if user, exists := s.users[socketID]; exists {
		user.LastActivity = time.Now()
	}
}

// RemoveUser 移除用户
func (s *UserService) RemoveUser(socketID string) *models.User {
	s.usersMux.Lock()
	defer s.usersMux.Unlock()
	
	user, exists := s.users[socketID]
	if exists {
		delete(s.users, socketID)
	}
	return user
}

// GetAllUsers 获取所有用户
func (s *UserService) GetAllUsers() []*models.User {
	s.usersMux.RLock()
	defer s.usersMux.RUnlock()
	
	users := make([]*models.User, 0, len(s.users))
	for _, user := range s.users {
		users = append(users, user)
	}
	return users
}

// GetOnlineUsers 获取在线用户
func (s *UserService) GetOnlineUsers() []*models.User {
	s.usersMux.RLock()
	defer s.usersMux.RUnlock()
	
	users := make([]*models.User, 0)
	for _, user := range s.users {
		if user.IsOnline {
			users = append(users, user)
		}
	}
	return users
}

// GetUsersCount 获取用户数量
func (s *UserService) GetUsersCount() int {
	s.usersMux.RLock()
	defer s.usersMux.RUnlock()
	
	return len(s.users)
}

// CleanupInactiveUsers 清理非活跃用户
func (s *UserService) CleanupInactiveUsers(timeout time.Duration) {
	s.usersMux.Lock()
	defer s.usersMux.Unlock()
	
	now := time.Now()
	for socketID, user := range s.users {
		if now.Sub(user.LastActivity) > timeout {
			delete(s.users, socketID)
		}
	}
}
