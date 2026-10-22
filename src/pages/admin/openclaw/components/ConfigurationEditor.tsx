import { toast } from 'sonner';
import { JsonEditor } from 'json-edit-react';
import React, { useState, useEffect } from 'react';

import { Alert, Paper, Button, CircularProgress } from '@mui/material';

import { getConfig, updateConfig } from 'src/repositories/openclaw';

import type { OpenclawConfig } from '../openclaw.types';

export default function ConfigurationEditor() {
  const [value, setValue] = useState<OpenclawConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getConfig()
      .then((config) => setValue(config as OpenclawConfig))
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat configuration'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await updateConfig(value ?? {});
      setValue((saved as OpenclawConfig | null) ?? value);
      toast.success('Configuration berhasil disimpan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="tw-flex tw-justify-center tw-py-16"><CircularProgress /></div>;
  }

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      {error && <Alert severity="error">{error}</Alert>}
      <Paper variant="outlined" sx={{ p: 2, minHeight: 400, overflow: 'auto' }}>
        <JsonEditor
          data={value}
          setData={(data) => setValue(data as OpenclawConfig | null)}
          showErrorMessages
        />
      </Paper>
      <div className="tw-flex tw-justify-end">
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
