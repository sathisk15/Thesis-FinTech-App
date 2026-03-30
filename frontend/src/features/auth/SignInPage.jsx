import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
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

      login({ user, token });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="login-page"
      className="min-h-screen flex items-center justify-center
                 bg-background px-4"
    >
      <div
        className="w-full max-w-md
                   bg-card border border-border
                   rounded-xl shadow-lg
                   p-8 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Welcome back
          </h1>
          <p className="text-sm text-text/60">
            Sign in to continue to your wallet
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Email address
            </label>
            <input
              data-testid="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-sm text-text
                         outline-none
                         focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">Password</label>
            <input
              data-testid="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-sm text-text
                         outline-none
                         focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            data-testid="login-submit"
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg
                       bg-primary text-white
                       text-sm font-medium
                       hover:bg-primary/90
                       disabled:opacity-50
                       transition"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-text/60">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-primary font-medium cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
