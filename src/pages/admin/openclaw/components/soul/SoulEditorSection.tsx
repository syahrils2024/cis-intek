import React, { useState, useEffect } from 'react';

import { Box, Tab, Tabs, Alert } from '@mui/material';

import SoulEditTab from './SoulEditTab';
import useSoul from '../../hooks/useSoul';
import SoulSaveButton from './SoulSaveButton';
import SoulPreviewTab from './SoulPreviewTab';

export default function SoulEditorSection() {
  const { content, loading, error, fetchSoul, updateSoul } = useSoul();
  const [editContent, setEditContent] = useState('');
  const [tab, setTab] = useState('edit');

  useEffect(() => {
    fetchSoul();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (content) {
      setEditContent(content);
    }
  }, [content]);

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Edit" value="edit" />
          <Tab label="Preview" value="preview" />
        </Tabs>
      </Box>
      {tab === 'edit' && (
        <SoulEditTab loading={loading} content={editContent} onChange={setEditContent} />
      )}
      {tab === 'preview' && (
        <SoulPreviewTab loading={loading} content={editContent} />
      )}
      <div className="tw-flex tw-justify-end">
        <SoulSaveButton
          content={content}
          editContent={editContent}
          onSave={updateSoul}
        />
      </div>
    </div>
  );
}
