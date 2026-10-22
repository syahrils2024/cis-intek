import React from 'react';

import { Paper, TextField, CircularProgress } from '@mui/material';

import type { SoulEditTabProps } from '../../openclaw.types';

export default function SoulEditTab({ loading, content, onChange }: SoulEditTabProps) {
  return (
    <Paper className="tw-p-4">
      {loading ? (
        <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
          <CircularProgress />
        </div>
      ) : (
        <TextField
          multiline
          minRows={20}
          fullWidth
          value={content}
          onChange={(e) => onChange(e.target.value)}
          variant="outlined"
        />
      )}
    </Paper>
  );
}
