#!/bin/bash

# 像素聊天室启动脚本

echo "🚀 启动像素聊天室..."

# 检查Go是否安装
if ! command -v go &> /dev/null; then
    echo "❌ Go未安装，请先安装Go 1.21+"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js 18+"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装依赖
echo "📦 安装依赖..."
npm run install:all

# 启动服务
echo "🎮 启动服务..."
npm run dev
