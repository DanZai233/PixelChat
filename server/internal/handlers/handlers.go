package handlers

import (
	"net/http"
	"pixel-chat-server/internal/services"
	ws "pixel-chat-server/internal/websocket"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Handlers struct {
	chatService *services.ChatService
	hub         *ws.Hub
}

func NewHandlers(chatService *services.ChatService, hub *ws.Hub) *Handlers {
	return &Handlers{
		chatService: chatService,
		hub:         hub,
	}
}

// HealthCheck 健康检查
func (h *Handlers) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"timestamp": time.Now().Format(time.RFC3339),
		"uptime":    time.Since(time.Now()).Seconds(),
	})
}

// GetStats 获取统计信息
func (h *Handlers) GetStats(c *gin.Context) {
	stats := h.chatService.GetStats()
	c.JSON(http.StatusOK, stats)
}

// GetUsers 获取用户列表
func (h *Handlers) GetUsers(c *gin.Context) {
	users := h.chatService.GetOnlineUsers()
	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"count": len(users),
	})
}

// GetMessages 获取消息列表
func (h *Handlers) GetMessages(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 50
	}

	messages := h.chatService.GetRecentMessages(limit)
	c.JSON(http.StatusOK, gin.H{
		"messages": messages,
		"count":    len(messages),
	})
}

// HandleWebSocket 处理WebSocket连接
func (h *Handlers) HandleWebSocket(c *gin.Context) {
	// 升级HTTP连接为WebSocket
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true // 在生产环境中应该检查origin
		},
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "WebSocket升级失败"})
		return
	}

	// 生成唯一的socket ID
	socketID := uuid.New().String()

	// 处理WebSocket连接
	h.hub.HandleWebSocket(conn, socketID)
}
