import { useBoolean } from '@hooks/use-boolean';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import { CircularProgress } from '@mui/material';

import { customerRepository } from 'src/repositories';

export const PrtgTrafficView = forwardRef(({ customer_id, trafficMode }, ref) => {
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const loading = useBoolean(false);

  async function loadImage() {
    if (!customer_id) return;
    loading.onTrue();
    setError(null);
    setImageUrl(null);
    try {
      const response = await customerRepository.getPrtgChartData(customer_id, trafficMode);
      const blobUrl = URL.createObjectURL(response);
      setImageUrl(blobUrl);
    } catch (err) {
      setError(`Failed to load traffic image.${err.message || ''}`);
    } finally {
      loading.onFalse();
    }
  }

  useImperativeHandle(ref, () => ({ loadImage }));

  useEffect(() => {
    loadImage();
  }, [customer_id, trafficMode]);

  if (loading.value) {
    return <CircularProgress size={24} className='tw-mx-auto' />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (imageUrl) {
    return <img src={imageUrl} alt="Traffic Chart" />;
  }

  return null;
});
