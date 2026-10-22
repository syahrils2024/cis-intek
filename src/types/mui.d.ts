import type {} from '@mui/material/Chip';
import type {} from '@mui/material/Button';

// Theme defines custom `soft` variant for these components.
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    soft: true;
  }
}
