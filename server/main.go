package main

import (
	"log"
	"net/http"
	"pixel-chat-server/internal/config"
	"pixel-chat-server/internal/handlers"
	"pixel-chat-server/internal/services"
	"pixel-chat-server/internal/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 加载环境变量
	if err := godotenv.Load(); err != nil {
		log.Println("未找到.env文件，使用默认配置")
	}

	// 初始化配置
	cfg := config.Load()

	// 设置Gin模式
	gin.SetMode(cfg.GinMode)

	// 创建Gin引擎
	r := gin.Default()

	// 配置CORS
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{cfg.CORSOrigin}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	// 初始化服务
	userService := services.NewUserService()
	messageService := services.NewMessageService()
	chatService := services.NewChatService(userService, messageService)

	// 初始化WebSocket Hub
	hub := websocket.NewHub(chatService)
	go hub.Run()

	// 初始化处理器
	handlers := handlers.NewHandlers(chatService, hub)

	// 设置路由
	setupRoutes(r, handlers)

	// 启动服务器
	log.Printf("🚀 像素聊天室服务器启动成功！")
	log.Printf("📡 端口: %s", cfg.Port)
	log.Printf("🌍 环境: %s", cfg.GinMode)
	log.Printf("🔗 CORS: %s", cfg.CORSOrigin)

	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}

func setupRoutes(r *gin.Engine, handlers *handlers.Handlers) {
	// 健康检查
	r.GET("/health", handlers.HealthCheck)

	// API路由
	api := r.Group("/api")
	{
		api.GET("/stats", handlers.GetStats)
		api.GET("/users", handlers.GetUsers)
		api.GET("/messages", handlers.GetMessages)
	}

	// WebSocket路由
	r.GET("/ws", handlers.HandleWebSocket)
}
