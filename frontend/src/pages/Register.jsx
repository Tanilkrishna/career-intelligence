import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api/client';
import { Target, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/register', { email, password });
      const { accessToken, user } = res.data.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-tr-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-3 rounded-2xl mb-6 shadow-lg shadow-indigo-900/20">
            <Target className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-8 text-center">Start tracking your true technical depth today.</p>

          <form onSubmit={handleRegister} className="w-full space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Min 6 characters"
                minLength="6"
              />
            </div>

            {error && <div className="text-red-400 text-sm font-medium p-3 bg-red-900/20 rounded-lg border border-red-900/50">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Register</span>}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-gray-500 text-sm mt-8">
            Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
