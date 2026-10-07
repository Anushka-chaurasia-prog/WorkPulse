import React from 'react';
import { Avatar } from '@mui/material';

const pastelColors = [
  { bg: '#F3E8FF', text: '#7E22CE' }, // Lavender
  { bg: '#E6FBF2', text: '#0D9488' }, // Mint
  { bg: '#FEF9C3', text: '#B45309' }, // Amber
  { bg: '#E0F2FE', text: '#0284C7' }, // Sky
  { bg: '#FFE4E6', text: '#E11D48' }, // Rose
  { bg: '#EDE9FE', text: '#6D28D9' }, // Violet
];

export const UserAvatar = ({ name = 'User', src, size = 42, sx = {} }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % pastelColors.length;
  const { bg, text } = pastelColors[colorIndex];

  return (
    <Avatar
      src={src}
      sx={{
        width: size,
        height: size,
        bgcolor: bg,
        color: text,
        fontWeight: 700,
        fontSize: size * 0.38,
        border: '2px solid #FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        ...sx,
      }}
    >
      {initials}
    </Avatar>
  );
};

export default UserAvatar;
