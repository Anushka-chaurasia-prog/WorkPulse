import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

export const EmptyState = ({
  icon: Icon = InboxIcon,
  title = 'No records found',
  description = 'There are currently no items to display.',
  actionText,
  onAction,
}) => {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Icon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mb: actionText ? 3 : 0 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction} sx={{ textTransform: 'none' }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
