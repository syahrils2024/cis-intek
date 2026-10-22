import React from 'react';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ReactMarkdown from 'react-markdown';

import { Paper, CircularProgress } from '@mui/material';

import type { SoulPreviewTabProps } from '../../openclaw.types';

export default function SoulPreviewTab({ loading, content }: SoulPreviewTabProps) {
  return (
    <Paper className="tw-p-4">
      {loading ? (
        <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
          <CircularProgress />
        </div>
      ) : (
        <div className="tw-prose tw-max-w-none tw-h-96 tw-overflow-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content || '*Empty*'}</ReactMarkdown>
        </div>
      )}
    </Paper>
  );
}
