# 像素风格匿名聊天室

一个基于像素艺术风格的匿名聊天室，采用前后端分离架构，支持实时通信。

## 特性

- 🎨 像素艺术风格UI设计
- 🔒 完全匿名，无需注册
- ⚡ 实时消息通信（WebSocket）
- 📱 响应式设计，支持移动端
- 🎯 简单部署，配置便捷
- 🛡️ 基础安全防护
- 🐳 Docker支持

## 技术栈

### 前端
- React 18
- TypeScript
- Styled-components
- Socket.io-client
- Framer Motion

### 后端
- Go 1.21+
- Gin Web框架
- Gorilla WebSocket
- 原生WebSocket支持

## 快速开始

### 方式一：本地开发

#### 环境要求
- Go 1.21+
- Node.js 18+
- npm 或 yarn

#### 安装和运行
```bash
# 克隆项目
git clone <repository-url>
cd PixelChat

# 使用启动脚本（推荐）
./scripts/start.sh

# 或手动安装依赖
npm run install:all
npm run dev
```

#### 访问应用
- 前端：http://localhost:3000
- 后端：http://localhost:3001

### 方式二：Docker部署

#### 环境要求
- Docker
- Docker Compose

#### 快速启动
```bash
# 使用Docker启动脚本
./scripts/docker-start.sh

# 或手动启动
docker-compose up --build -d
```

#### 访问应用
- 前端：http://localhost:3000
- 后端：http://localhost:3001

## 配置说明

### 后端配置
复制 `server/env.example` 到 `server/.env` 并修改配置：

```env
# 服务器配置
PORT=3001
GIN_MODE=debug

# CORS配置
CORS_ORIGIN=http://localhost:3000

# 安全配置
RATE_LIMIT_WINDOW_SECONDS=900
RATE_LIMIT_MAX_REQUESTS=100

# 消息配置
MAX_MESSAGE_LENGTH=500
MAX_MESSAGES_HISTORY=1000

# 用户配置
MAX_USERS_PER_ROOM=100
USER_TIMEOUT_SECONDS=300
```

### 前端配置
前端配置在 `client/src/services/websocket.ts` 中修改WebSocket连接地址。

## 项目结构

```
pixel-chat/
├── client/              # React前端应用
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── services/    # 服务层
│   │   ├── styles/      # 样式文件
│   │   └── types/       # TypeScript类型
│   ├── public/          # 静态资源
│   └── Dockerfile       # 前端Docker配置
├── server/              # Go后端服务
│   ├── internal/        # 内部包
│   │   ├── config/      # 配置管理
│   │   ├── handlers/    # HTTP处理器
│   │   ├── models/      # 数据模型
│   │   ├── services/    # 业务服务
│   │   └── websocket/   # WebSocket处理
│   ├── main.go          # 主程序入口
│   ├── go.mod           # Go模块文件
│   └── Dockerfile       # 后端Docker配置
├── scripts/             # 启动脚本
├── docker-compose.yml   # Docker编排文件
└── README.md           # 项目文档
```

## API接口

### WebSocket事件

#### 客户端发送
- `join`: 加入聊天室
- `send_message`: 发送消息
- `ping`: 心跳检测

#### 服务端推送
- `joined`: 加入成功
- `user_joined`: 用户加入
- `user_left`: 用户离开
- `new_message`: 新消息
- `user_list`: 用户列表更新
- `error`: 错误信息
- `pong`: 心跳响应

### HTTP接口
- `GET /health`: 健康检查
- `GET /api/stats`: 获取统计信息
- `GET /api/users`: 获取用户列表
- `GET /api/messages`: 获取消息列表

## 开发指南

### 本地开发
1. 启动后端：`cd server && go run main.go`
2. 启动前端：`cd client && npm start`

### 构建生产版本
1. 构建前端：`cd client && npm run build`
2. 构建后端：`cd server && go build -o main main.go`

## 部署指南

### 传统部署
1. 构建前端静态文件
2. 编译Go后端程序
3. 配置Nginx反向代理
4. 启动服务

### Docker部署
1. 修改docker-compose.yml中的配置
2. 运行 `docker-compose up -d`
3. 配置域名和SSL证书（可选）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
