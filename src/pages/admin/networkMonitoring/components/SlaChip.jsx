import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

const DOT_SIZE = 8;

const StyledDot = ({ variant }) => {
  const color = variant === 'UP' ? '#22c55e' : '#ef4444';

  return (
    <Box
      sx={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  );
};

StyledDot.propTypes = {
  variant: PropTypes.oneOf(['UP', 'DOWN']).isRequired,
};

// ----------------------------------------------------------------------

export default function SlaChip({ variant = 'UP', percentage, duration }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        display: 'inline-flex',
        bgcolor: variant === 'UP' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        borderRadius: 1,
        px: 1,
        py: 0.25,
      }}
    >
      <StyledDot variant={variant} />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          color: variant === 'UP' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        }}
      >
       {variant}  {typeof percentage === 'number' ? `${percentage.toFixed(2)}%` : percentage}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          '&::before': { content: '"·"', mx: 0.25 },
        }}
      >
        {duration}
      </Typography>
    </Stack>
  );
}

SlaChip.propTypes = {
  variant: PropTypes.oneOf(['UP', 'DOWN']),
  percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  duration: PropTypes.string.isRequired,
};
