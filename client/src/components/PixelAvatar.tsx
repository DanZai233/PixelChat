import React from 'react';
import styled from 'styled-components';

interface PixelAvatarProps {
  avatar: string;
  size?: number;
}

const AvatarContainer = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

const PixelDot = styled.div<{ color: string }>`
  width: 100%;
  height: 100%;
  background-color: ${props => props.color};
  border-radius: 0;
`;

const colorMap: { [key: string]: string } = {
  '0': '#000000', // 黑色
  '1': '#00ff41', // 绿色
  '2': '#00d9ff', // 蓝色
  '3': '#ff006e', // 粉色
  '4': '#8338ec', // 紫色
  '5': '#ffbe0b', // 黄色
};

const PixelAvatar: React.FC<PixelAvatarProps> = ({ avatar, size = 24 }) => {
  const renderPixels = () => {
    const pixels = [];
    for (let i = 0; i < 16; i++) {
      const colorIndex = avatar[i] || '0';
      const color = colorMap[colorIndex] || '#000000';
      pixels.push(
        <PixelDot key={i} color={color} />
      );
    }
    return pixels;
  };

  return (
    <AvatarContainer size={size}>
      {renderPixels()}
    </AvatarContainer>
  );
};

export default PixelAvatar;
