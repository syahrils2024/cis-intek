import { useState, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { customerRepository } from 'src/repositories';

export default function PrtgTrafficView({ customer_id, trafficMode }) {
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const loading = useBoolean(false);

  async function loadImage() {
    if(!customer_id) return;
    loading.onTrue();
    setError(null);
    setImageUrl(null);
    try {
      const response = await customerRepository.getPrtgChartData(customer_id, trafficMode);
      const blobUrl = URL.createObjectURL(response);
      setImageUrl(blobUrl);
    } catch (err) {
      setError(`Failed to load traffic image.${  err.message || ''}`);
    } finally {
      loading.onFalse();
    }
  }

  useEffect(() => {
    loadImage();
  }, [customer_id, trafficMode]);

  if (loading.value) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (imageUrl) {
    return <img src={imageUrl} alt="Traffic Chart" />;
  }

  return null;
}
