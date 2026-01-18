import { useState } from 'react';
import { GraduationCap, Lock, User } from 'lucide-react';
import { useSchoolSettings } from './SchoolSettingsContext';
import { API_BASE_URL } from '../lib/api';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings } = useSchoolSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const login = async () => {
      try {
        setIsSubmitting(true);
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: username,
            password,
            role: 'admin',
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message ?? 'Invalid username or password');
        }

        await response.json();
        onLogin();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to login');
      } finally {
        setIsSubmitting(false);
      }
    };

    void login();
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: settings.loginBackground 
          ? `url(${settings.loginBackground}) center/cover no-repeat` 
          : 'linear-gradient(to bottom right, rgb(239 246 255), rgb(224 231 255))'
      }}
    >
      {/* Overlay for better readability when background image is set */}
      {settings.loginBackground && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          {settings.schoolLogo ? (
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 overflow-hidden rounded-full">
              <img 
                src={settings.schoolLogo} 
                alt="School Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-gray-900 mb-2">Sushil School</h1>
          <p className="text-gray-600">Super Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="username"
                type="email"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Demo Credentials: admin@sushilschool.edu / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
