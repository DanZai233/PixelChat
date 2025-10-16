#!/bin/bash

# 虚拟机环境配置脚本

echo "🔧 配置虚拟机环境..."

# 获取虚拟机IP地址
VM_IP=$(ip route get 1.1.1.1 | awk '{print $7; exit}')

echo "📡 检测到虚拟机IP: $VM_IP"

# 创建前端环境配置文件
cat > client/.env << EOF
# WebSocket服务器地址 - 虚拟机配置
REACT_APP_WS_URL=ws://$VM_IP:3001/ws
EOF

echo "✅ 已创建 client/.env 文件"
echo "🌐 WebSocket地址: ws://$VM_IP:3001/ws"

# 创建后端环境配置文件
cat > server/.env << EOF
# 服务器配置 - 虚拟机配置
PORT=3001
GIN_MODE=debug
CORS_ORIGIN=http://$VM_IP:3000
RATE_LIMIT_WINDOW_SECONDS=900
RATE_LIMIT_MAX_REQUESTS=100
MAX_MESSAGE_LENGTH=500
MAX_MESSAGES_HISTORY=1000
MAX_USERS_PER_ROOM=100
USER_TIMEOUT_SECONDS=300
EOF

echo "✅ 已创建 server/.env 文件"
echo "🔗 CORS配置: http://$VM_IP:3000"

echo ""
echo "🎮 现在可以启动服务："
echo "   npm run dev"
echo ""
echo "📱 访问地址："
echo "   前端: http://$VM_IP:3000"
echo "   后端: http://$VM_IP:3001"
echo ""
echo "💡 如果从宿主机访问，请确保虚拟机端口转发已配置："
echo "   3000 -> 3000 (前端)"
echo "   3001 -> 3001 (后端)"
