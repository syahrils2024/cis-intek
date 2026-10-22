import { toast } from 'sonner';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';

import type { SoulSaveButtonProps } from '../../openclaw.types';

export default function SoulSaveButton({ content, editContent, onSave }: SoulSaveButtonProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editContent);
      toast.success('Soul berhasil diperbarui');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui soul');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LoadingButton
      variant="contained"
      color="primary"
      onClick={handleSave}
      loading={saving}
      disabled={editContent === content}
    >
      Save Changes
    </LoadingButton>
  );
}
