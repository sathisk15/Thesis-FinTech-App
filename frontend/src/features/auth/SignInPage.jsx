import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // your axios instance
import { useAuthStore } from '../../store/useAuthStore';

const SignInPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);

      const { user, token } = response.data;

      // Save to Zustand (persisted automatically)
      login({ user, token });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-text">Welcome Back</h1>
          <p className="text-text/60">Sign in to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm text-text/60">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-text/60">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-md bg-primary text-white font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-text/60">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-primary cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
