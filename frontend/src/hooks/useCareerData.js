import { useState, useEffect } from 'react';
import apiClient from '../services/api/client';

export const useCareerData = () => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCareerData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/career/state');
      setState(res.data.data);
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

  return { 
    state,
    score: state?.careerScore, 
    gaps: state?.gaps, 
    recommendations: state?.recommendations,
    loading, 
    error, 
    refetch: fetchCareerData 
  };
};
