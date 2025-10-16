import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Message } from '../types';
import PixelAvatar from './PixelAvatar';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageContainer = styled(motion.div)<{ isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  max-width: 80%;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
`;

const Username = styled.span<{ isOwn: boolean }>`
  font-size: 10px;
  color: ${props => props.isOwn ? '#8338ec' : '#ffbe0b'};
  font-weight: bold;
`;

const Timestamp = styled.span`
  font-size: 8px;
  color: #666;
`;

const Bubble = styled(motion.div)<{ isOwn: boolean; isSystem: boolean }>`
  background: ${props => {
    if (props.isSystem) return 'rgba(0, 0, 0, 0.8)';
    return props.isOwn ? 'rgba(131, 56, 236, 0.2)' : 'rgba(0, 0, 0, 0.8)';
  }};
  border: 2px solid ${props => {
    if (props.isSystem) return '#3FB950';
    return props.isOwn ? '#8338ec' : '#ffbe0b';
  }};
  padding: 12px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: ${props => props.isOwn ? 'auto' : '-2px'};
    right: ${props => props.isOwn ? '-2px' : 'auto'};
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 8px 8px 8px;
    border-color: transparent transparent ${props => {
      if (props.isSystem) return '#3FB950';
      return props.isOwn ? '#8338ec' : '#ffbe0b';
    }} transparent;
  }
`;

const MessageContent = styled.div<{ isSystem: boolean }>`
  color: ${props => props.isSystem ? '#3FB950' : '#C9D1D9'};
  font-size: 12px;
  line-height: 1.4;
  word-wrap: break-word;
`;

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const isSystem = message.type === 'system';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <MessageContainer
      isOwn={isOwn}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MessageHeader>
        {!isSystem && (
          <PixelAvatar avatar={message.user_avatar} size={16} />
        )}
        <Username isOwn={isOwn}>
          {isSystem ? 'SYSTEM' : message.user_nickname}
        </Username>
        <Timestamp>{timestamp}</Timestamp>
      </MessageHeader>
      
      <Bubble
        isOwn={isOwn}
        isSystem={isSystem}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <MessageContent isSystem={isSystem}>
          {message.content}
        </MessageContent>
      </Bubble>
    </MessageContainer>
  );
};

export default MessageBubble;
