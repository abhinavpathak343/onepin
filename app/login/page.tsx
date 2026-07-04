'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#0B1220] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-[#FF6B35]" />
            </div>
            <h1 className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              StreakIn
            </h1>
            <p className="text-[#12151A]/60 mt-1">Academy Administration</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-3 mb-4 text-center"
            >
              <p className="text-[#ef4444] text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#12151A] mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#12151A]/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-[#F7F6F2] border border-[#E5E5E5] rounded-xl pl-11 pr-4 py-3 text-[#12151A] placeholder-[#12151A]/40 focus:outline-none focus:border-[#FF6B35] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#12151A] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#12151A]/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-[#F7F6F2] border border-[#E5E5E5] rounded-xl pl-11 pr-4 py-3 text-[#12151A] placeholder-[#12151A]/40 focus:outline-none focus:border-[#FF6B35] transition-colors"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-[#FF6B35] disabled:bg-[#FF6B35]/50 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-[#12151A]/40 text-xs mt-6">
            StreakIn Academy Check-in System
          </p>
        </div>
      </motion.div>
    </div>
  );
}
