import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, User, JoinResponse, NewMessageEvent, UserListEvent, ErrorEvent } from './types';
import { websocketService } from './services/websocket';
import MessageBubble from './components/MessageBubble';
import MessageInput from './components/MessageInput';
import UserList from './components/UserList';
import PixelAvatar from './components/PixelAvatar';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: #0D1117;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StatusBar = styled.div`
  height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #161B22;
  background: rgba(0, 0, 0, 0.5);
`;

const StatusItem = styled.div`
  color: #3FB950;
  font-size: 10px;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #161B22;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Sidebar = styled.div`
  width: 300px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  overflow-y: auto;
`;

const WelcomeModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: #161B22;
  border: 2px solid #58A6FF;
  padding: 32px;
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const ModalTitle = styled.h2`
  color: #58A6FF;
  font-size: 16px;
  margin-bottom: 24px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const UserDetails = styled.div`
  text-align: left;
`;

const UserId = styled.div`
  color: #C9D1D9;
  font-size: 12px;
  margin-bottom: 8px;
`;

const NicknameInput = styled.input`
  background: #000;
  color: #58A6FF;
  border: 1px solid #58A6FF;
  font-family: 'Press Start 2P', monospace;
  padding: 8px;
  font-size: 10px;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: #3FB950;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' ? '#58A6FF' : 'transparent'};
  color: ${props => props.variant === 'primary' ? '#0D1117' : '#58A6FF'};
  border: 2px solid #58A6FF;
  padding: 12px 24px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  cursor: pointer;
  
  &:hover {
    background: #3FB950;
    color: #0D1117;
    border-color: #3FB950;
  }
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(248, 81, 73, 0.2);
  border: 1px solid #F85149;
  color: #F85149;
  padding: 12px;
  margin: 16px;
  font-size: 10px;
  text-align: center;
`;

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 连接WebSocket
    websocketService.connect();

    // 设置事件监听器
    websocketService.on('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    websocketService.on('disconnected', () => {
      setIsConnected(false);
      setError('连接已断开，正在重连...');
    });

    websocketService.on('joined', (data: JoinResponse) => {
      setCurrentUser(data.user);
      setMessages(data.messages);
      setShowWelcome(false);
      setError(null);
    });

    websocketService.on('new_message', (data: NewMessageEvent) => {
      setMessages(prev => [...prev, data.message]);
    });

    websocketService.on('user_list', (data: UserListEvent) => {
      setUsers(data.users);
    });

    websocketService.on('error', (data: ErrorEvent) => {
      setError(data.message);
    });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    // 自动滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = () => {
    if (isConnected) {
      websocketService.join(nickname || undefined);
    }
  };

  const handleSendMessage = (content: string) => {
    if (isConnected && currentUser) {
      websocketService.sendMessage(content);
    }
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Container>
      <StatusBar>
        <StatusItem>PIXEL_CHAT_v1.0</StatusItem>
        <StatusItem>
          {isConnected ? `[在线: ${users.length}]` : '[离线]'}
        </StatusItem>
        <StatusItem>{formatTime()}</StatusItem>
      </StatusBar>

      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWelcome && (
          <WelcomeModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <ModalTitle>欢迎来到像素聊天室</ModalTitle>
              
              <UserInfo>
                <PixelAvatar avatar="1234567890123456" size={48} />
                <UserDetails>
                  <UserId>ID: User#XXXX</UserId>
                  <NicknameInput
                    type="text"
                    placeholder="输入昵称（可选）"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={8}
                  />
                </UserDetails>
              </UserInfo>

              <ButtonGroup>
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  disabled={!isConnected}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  进入聊天室
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowWelcome(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  取消
                </Button>
              </ButtonGroup>
            </ModalContent>
          </WelcomeModal>
        )}
      </AnimatePresence>

      {!showWelcome && (
        <MainContent>
          <ChatArea>
            <MessagesContainer>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={currentUser?.id === message.user_id}
                />
              ))}
              <div ref={messagesEndRef} />
            </MessagesContainer>
            
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!isConnected || !currentUser}
            />
          </ChatArea>

          <Sidebar>
            <UserList users={users} />
          </Sidebar>
        </MainContent>
      )}
    </Container>
  );
};

export default App;
