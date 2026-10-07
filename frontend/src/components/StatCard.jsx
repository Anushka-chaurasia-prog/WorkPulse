import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = '#FF6B4A',
  bgColor = '#FFFFFF',
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        bgcolor: bgColor,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-3px)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.06)',
            }
          : {},
        p: 1,
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2 }}>
        {Icon && (
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '18px',
              bgcolor: `${accentColor}18`, // 10% opacity tint
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 28 }} />
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
