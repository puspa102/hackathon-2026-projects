import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Building2, Hash, Lock } from 'lucide-react';
import { loginHealthcare } from '../../api/healthcareAuth';
import { useAuth } from '../../hooks/useAuth';

const extractErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  // Network / connectivity errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again later.';
  }

  // Server responded with error status
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) return data?.detail || data?.error || 'Invalid Login ID or password.';
    if (status === 403) return data?.detail || 'Your account is not activated or has been suspended.';
    if (status === 404) return 'Login ID not found. Please check and try again.';
    if (status === 429) return 'Too many login attempts. Please wait a moment and try again.';
    if (status >= 500) return 'Server error. Please try again later.';

    return data?.detail || data?.error || data?.message || 'Login failed. Please check your credentials.';
  }

  // Request was made but no response received
  if (error.request) {
    return 'No response from server. Please check your connection and try again.';
  }

  return error.message || 'An unexpected error occurred. Please try again.';
};

export default function HCLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      loginId: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async ({ loginId, password }) => {
    setIsLoading(true);
    setServerError('');

    try {
      const response = await loginHealthcare({ login_id: loginId, password });
      const token =
        response?.data?.tokens?.access ||
        response?.data?.access_token ||
        response?.data?.token ||
        response?.data?.jwt;

      if (!token) {
        throw new Error('Token was not returned by the server.');
      }

      const backendUser = response?.data?.user || {};

      // Prevent normal citizens from logging in via healthcare portal
      // Citizen profiles have date_of_birth or age fields, medical personnel do not.
      if ('date_of_birth' in backendUser || 'age' in backendUser) {
        throw new Error('This portal is strictly for healthcare personnel. Please use the citizen login.');
      }

      const userData = {
        name:
          backendUser?.name ||
          response?.data?.name ||
          'Healthcare Staff',
        email: backendUser?.email || '',
        login_id: backendUser?.login_id || loginId,
      };

      login(token, 'healthcare', userData);
      navigate('/hc-dashboard');
    } catch (error) {
      setServerError(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10"
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-white">
        <Building2 size={20} className="text-emerald-400" /> Healthcare Staff Login
      </h1>
      <p className="mb-6 text-sm text-slate-400">Access the healthcare management portal</p>

      {serverError && (
        <div className="mb-4 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-300">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Login ID</label>
          <div className="relative">
            <Hash size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your Login ID"
              {...register('loginId', {
                required: 'Login ID is required',
                minLength: {
                  value: 4,
                  message: 'Login ID must be at least 4 characters',
                },
              })}
            />
          </div>
          {errors.loginId && <p className="mt-1 text-xs text-red-400">{errors.loginId.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 pr-16 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2 text-xs font-medium text-emerald-400"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5" {...register('rememberMe')} />
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-white transition duration-200 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Signing in...
            </span>
          ) : (
            'Login to Staff Portal'
          )}
        </button>
      </form>

      <p className="mt-2 text-center text-xs text-slate-400">
        Are you a citizen?{' '}
        <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
          Login here
        </Link>
      </p>
    </div>
  );
}
