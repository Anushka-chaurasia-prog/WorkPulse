import React, { useState } from 'react';
import { Card, CardContent, Box, Typography, IconButton } from '@mui/material';
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';

export const MiniCalendar = () => {
  const [currentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = currentDate.getDate();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Previous month trailing spaces
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ day: '', isCurrent: false });
  }
  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push({ day: d, isCurrent: true, isToday: d === today });
  }

  return (
    <Card sx={{ height: '100%', p: 1 }}>
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="#1E293B">
            {monthNames[month]} {year}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" sx={{ color: '#64748B' }}>
              <ChevronLeftRounded fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: '#64748B' }}>
              <ChevronRightRounded fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Days Header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 1 }}>
          {dayLabels.map((lbl) => (
            <Typography key={lbl} variant="caption" fontWeight={700} color="#94A3B8" sx={{ fontSize: '0.65rem' }}>
              {lbl}
            </Typography>
          ))}
        </Box>

        {/* Calendar Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.6, textAlign: 'center' }}>
          {calendarDays.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                fontSize: '0.8rem',
                fontWeight: item.isToday ? 800 : item.isCurrent ? 600 : 400,
                color: item.isToday ? '#FFFFFF' : item.isCurrent ? '#1E293B' : 'transparent',
                bgcolor: item.isToday ? '#FF6B4A' : 'transparent',
                boxShadow: item.isToday ? '0 4px 10px rgba(255, 107, 74, 0.4)' : 'none',
                cursor: item.isCurrent ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
                '&:hover': item.isCurrent && !item.isToday ? { bgcolor: '#F1F5F9' } : {},
              }}
            >
              {item.day}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MiniCalendar;
