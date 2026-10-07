import React from 'react';
import { Chip } from '@mui/material';

const badgeStyles = {
  Engineering: { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
  Operations: { bg: '#E6FBF2', color: '#0D9488', border: '#A7F3D0' },
  Marketing: { bg: '#F3E8FF', color: '#7E22CE', border: '#E9D5FF' },
  Finance: { bg: '#FEF9C3', color: '#B45309', border: '#FDE68A' },
  HumanResources: { bg: '#FFE4E6', color: '#E11D48', border: '#FECDD3' },
  HR: { bg: '#FFE4E6', color: '#E11D48', border: '#FECDD3' },
  Design: { bg: '#FDF2F8', color: '#DB2777', border: '#FBCFE8' },
  Default: { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
};

export const DepartmentBadge = ({ name = 'Unassigned', size = 'small' }) => {
  const normalizedKey = name.replace(/\s+/g, '');
  const style = badgeStyles[normalizedKey] || badgeStyles.Default;

  return (
    <Chip
      label={`#${name}`}
      size={size}
      sx={{
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.825rem',
        borderRadius: '8px',
        px: 0.5,
      }}
    />
  );
};

export default DepartmentBadge;
