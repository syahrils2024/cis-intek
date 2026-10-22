import { useState } from 'react';

import * as openclawRepository from 'src/repositories/openclaw';

import type { UseSoulReturn } from '../openclaw.types';

export default function useSoul(): UseSoulReturn {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSoul = async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await openclawRepository.getSoul());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch soul');
    } finally {
      setLoading(false);
    }
  };

  const updateSoul = async (newContent: string) => {
    setLoading(true);
    setError(null);
    try {
      await openclawRepository.updateSoul(newContent);
      setContent(newContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update soul');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { content, loading, error, fetchSoul, updateSoul };
}
