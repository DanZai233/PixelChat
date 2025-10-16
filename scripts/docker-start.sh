#!/bin/bash

# Docker启动脚本

echo "🐳 使用Docker启动像素聊天室..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查docker-compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose未安装，请先安装docker-compose"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up --build -d

echo "🎉 服务启动完成！"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:3001"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
