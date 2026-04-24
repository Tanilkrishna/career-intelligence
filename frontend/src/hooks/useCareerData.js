import { useState, useEffect } from 'react';
import apiClient from '../services/api/client';

export const useCareerData = () => {
  const [score, setScore] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCareerData = async () => {
    setLoading(true);
    try {
      const [scoreRes, gapsRes] = await Promise.all([
        apiClient.get('/career/score'),
        apiClient.get('/career/gaps')
      ]);
      setScore(scoreRes.data.data);
      setGaps(gapsRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load career data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerData();
  }, []);

  return { score, gaps, loading, error, refetch: fetchCareerData };
};
