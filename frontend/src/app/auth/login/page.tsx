'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { HiEye, HiEyeSlash, HiSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Login berhasil!');
      router.push('/');
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Login gagal, coba lagi';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-500/30 mb-4">
          <HiSparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Welcome back!</h1>
        <p className="text-gray-500 mt-2">Login untuk lanjutin planning kamu</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            className="input-field"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 karakter"
              className="input-field pr-12"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Loading...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Register Link */}
      <p className="text-center mt-6 text-sm text-gray-500">
        Belum punya akun?{' '}
        <Link href="/auth/register" className="text-primary-600 font-semibold hover:text-primary-700">
          Daftar sekarang
        </Link>
      </p>

      {/* Demo Credentials */}
      <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200 max-w-sm mx-auto w-full">
        <p className="text-xs font-medium text-gray-500 mb-2">Demo credentials:</p>
        <p className="text-xs text-gray-400">Email: demo@yola.id</p>
        <p className="text-xs text-gray-400">Pass: password123</p>
      </div>
    </div>
  );
}