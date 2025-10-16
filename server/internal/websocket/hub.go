package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"pixel-chat-server/internal/models"
	"pixel-chat-server/internal/services"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// 写入等待时间
	writeWait = 10 * time.Second

	// 读取下一个pong消息的等待时间
	pongWait = 60 * time.Second

	// 发送ping消息的间隔时间，必须小于pongWait
	pingPeriod = (pongWait * 9) / 10

	// 最大消息大小
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // 在生产环境中应该检查origin
	},
}

// Client 表示WebSocket客户端
type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	socketID string
}

// Hub 维护活跃的客户端和广播消息
type Hub struct {
	clients     map[*Client]bool
	broadcast   chan []byte
	register    chan *Client
	unregister  chan *Client
	chatService *services.ChatService
}

// NewHub 创建新的Hub
func NewHub(chatService *services.ChatService) *Hub {
	return &Hub{
		clients:     make(map[*Client]bool),
		broadcast:   make(chan []byte),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		chatService: chatService,
	}
}

// Run 启动Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("客户端连接: %s", client.socketID)

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("客户端断开: %s", client.socketID)

				// 从用户服务中移除用户
				user := h.chatService.RemoveUser(client.socketID)
				if user != nil {
					// 广播用户离开事件
					userLeftEvent := models.UserLeftEvent{User: user}
					h.broadcastMessage("user_left", userLeftEvent)

					// 广播用户列表更新
					userListEvent := models.UserListEvent{Users: h.chatService.GetOnlineUsers()}
					h.broadcastMessage("user_list", userListEvent)
				}
			}

		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// HandleWebSocket 处理WebSocket连接
func (h *Hub) HandleWebSocket(conn *websocket.Conn, socketID string) {
	client := &Client{
		hub:      h,
		conn:     conn,
		send:     make(chan []byte, 256),
		socketID: socketID,
	}

	client.hub.register <- client

	// 启动goroutine处理客户端
	go client.writePump()
	go client.readPump()
}

// readPump 处理从WebSocket连接读取消息
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket错误: %v", err)
			}
			break
		}

		// 处理接收到的消息
		c.handleMessage(messageBytes)
	}
}

// writePump 处理向WebSocket连接写入消息
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			// 直接发送单个消息，避免批量发送导致的JSON解析问题
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// handleMessage 处理接收到的消息
func (c *Client) handleMessage(messageBytes []byte) {
	var wsMessage models.WebSocketMessage
	if err := json.Unmarshal(messageBytes, &wsMessage); err != nil {
		log.Printf("解析消息失败: %v", err)
		return
	}

	switch wsMessage.Type {
	case "join":
		c.handleJoin(wsMessage.Data)
	case "send_message":
		c.handleSendMessage(wsMessage.Data)
	case "ping":
		c.handlePing()
	}
}

// handleJoin 处理用户加入
func (c *Client) handleJoin(data interface{}) {
	dataBytes, _ := json.Marshal(data)
	var joinReq models.JoinRequest
	if err := json.Unmarshal(dataBytes, &joinReq); err != nil {
		c.sendError("无效的加入请求")
		return
	}

	user, err := c.hub.chatService.AddUser(c.socketID, joinReq.Nickname)
	if err != nil {
		c.sendError(err.Error())
		return
	}

	// 发送加入成功响应
	response := models.JoinResponse{
		User:     user,
		Messages: c.hub.chatService.GetRecentMessages(50),
	}

	c.sendMessage("joined", response)

	// 广播用户加入事件
	userJoinedEvent := models.UserJoinedEvent{User: user}
	c.hub.broadcastMessage("user_joined", userJoinedEvent)

	// 广播用户列表更新
	userListEvent := models.UserListEvent{Users: c.hub.chatService.GetOnlineUsers()}
	c.hub.broadcastMessage("user_list", userListEvent)
}

// handleSendMessage 处理发送消息
func (c *Client) handleSendMessage(data interface{}) {
	dataBytes, _ := json.Marshal(data)
	var sendReq models.SendMessageRequest
	if err := json.Unmarshal(dataBytes, &sendReq); err != nil {
		c.sendError("无效的消息请求")
		return
	}

	message, err := c.hub.chatService.SendMessage(c.socketID, sendReq.Content)
	if err != nil {
		c.sendError(err.Error())
		return
	}

	// 广播新消息
	newMessageEvent := models.NewMessageEvent{Message: message}
	c.hub.broadcastMessage("new_message", newMessageEvent)
}

// handlePing 处理ping消息
func (c *Client) handlePing() {
	c.sendMessage("pong", nil)
}

// sendMessage 发送消息给客户端
func (c *Client) sendMessage(messageType string, data interface{}) {
	wsMessage := models.WebSocketMessage{
		Type: messageType,
		Data: data,
	}

	messageBytes, err := json.Marshal(wsMessage)
	if err != nil {
		log.Printf("序列化消息失败: %v", err)
		return
	}

	select {
	case c.send <- messageBytes:
	default:
		close(c.send)
		delete(c.hub.clients, c)
	}
}

// sendError 发送错误消息
func (c *Client) sendError(message string) {
	c.sendMessage("error", models.ErrorEvent{Message: message})
}

// broadcastMessage 广播消息给所有客户端
func (h *Hub) broadcastMessage(messageType string, data interface{}) {
	wsMessage := models.WebSocketMessage{
		Type: messageType,
		Data: data,
	}

	messageBytes, err := json.Marshal(wsMessage)
	if err != nil {
		log.Printf("序列化广播消息失败: %v", err)
		return
	}

	h.broadcast <- messageBytes
}
