import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #161B22;
  gap: 12px;
  background: rgba(0, 0, 0, 0.3);
`;

const InputContainer = styled.div`
  position: relative;
  flex: 1;
`;

const TerminalInput = styled.input<{ disabled: boolean }>`
  width: 100%;
  background: #000;
  color: #58A6FF;
  border: 2px solid #58A6FF;
  font-family: 'Press Start 2P', monospace;
  padding: 12px 16px;
  font-size: 12px;
  height: 48px;
  caret-color: transparent;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &::placeholder {
    color: #666;
  }
  
  &:focus {
    outline: none;
    border-color: #3FB950;
    box-shadow: 0 0 10px rgba(63, 185, 80, 0.3);
  }
`;

const Cursor = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #58A6FF;
  font-size: 12px;
  animation: blink 1s infinite;
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const SendButton = styled(motion.button)<{ disabled: boolean }>`
  background: #58A6FF;
  color: #0D1117;
  border: 0;
  padding: 12px 24px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover {
    background: ${props => props.disabled ? '#58A6FF' : '#3FB950'};
  }
`;

const Hint = styled.div`
  font-size: 8px;
  color: #666;
  text-align: center;
  margin-top: 4px;
`;

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flex: 1, gap: '12px' }}>
        <InputContainer>
          <TerminalInput
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            disabled={disabled}
            maxLength={500}
          />
          {!disabled && <Cursor>▋</Cursor>}
        </InputContainer>
        
        <SendButton
          type="submit"
          disabled={disabled || !message.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          [发送]
        </SendButton>
      </form>
      
      <Hint>
        按 Enter 发送，Shift+Enter 换行
      </Hint>
    </Container>
  );
};

export default MessageInput;
