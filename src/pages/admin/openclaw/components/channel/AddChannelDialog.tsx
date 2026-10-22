import React, { useState } from 'react';

import {
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import type { AddChannelDialogProps } from '../../openclaw.types';

export default function AddChannelDialog({ open, onClose, onAdd }: AddChannelDialogProps) {
  const [workspace, setWorkspace] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      await onAdd({ workspace, channelName: name });
      setWorkspace('');
      setName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add WhatsApp Channel</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Workspace"
          fullWidth
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
          required
        />
        {/* <TextField
          margin="dense"
          label="Channel Name (optional)"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        /> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={loading || !workspace}
        >
          {loading ? <CircularProgress size={24} /> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
