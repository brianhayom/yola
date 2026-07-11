'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { HiHeart, HiPlus, HiCalendarDays, HiCurrencyDollar, HiUserGroup, HiCheckCircle, HiClock } from 'react-icons/hi2';
import toast from 'react-hot-toast';

interface Wedding {
  id: string;
  title: string;
  date: string | null;
  venue: string | null;
  budgetTotal: number | null;
  guestCount: number | null;
  status: string;
  _count: { checklists: number; vendors: number; guests: number };
  budgets: { category: string; allocated: number; spent: number }[];
}

export default function WeddingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated) {
      fetchWeddings();
    }
  }, [isAuthenticated, authLoading]);

  const fetchWeddings = async () => {
    try {
      const { data } = await api.get('/wedding');
      setWeddings(data.weddings);
    } catch (error: any) {
      toast.error('Gagal memuat data wedding');
    } finally {
      setIsLoading(false);
    }
  };

  const createWedding = async () => {
    try {
      const { data } = await api.post('/wedding', { title: 'Wedding Baru' });
      toast.success('Wedding berhasil dibuat!');
      router.push(`/wedding/${data.wedding.id}`);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Gagal membuat wedding';
      toast.error(message);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const formatCurrency = (n: number) =>
    'Rp ' + n.toLocaleString('id-ID');

  const getDaysUntil = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Wedding Planner</h1>
          <p className="text-gray-500 text-sm mt-0.5">Rencanakan pernikahan impianmu</p>
        </div>
        <button
          onClick={createWedding}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
        >
          <HiPlus className="w-5 h-5" />
          Buat Baru
        </button>
      </div>

      {/* Wedding List */}
      {weddings.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-pink-50 mb-6">
            <HiHeart className="w-12 h-12 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Belum ada wedding plan</h2>
          <p className="text-gray-500 mb-6">Buat wedding plan pertamamu dan mulai rencanakan!</p>
          <button onClick={createWedding} className="btn-primary">
            <HiPlus className="w-5 h-5 inline mr-2" />
            Buat Wedding Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {weddings.map((wedding) => {
            const totalBudget = wedding.budgets.reduce((s: number, b: any) => s + Number(b.allocated), 0);
            const totalSpent = wedding.budgets.reduce((s: number, b: any) => s + Number(b.spent), 0);
            const budgetUsage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
            const daysUntil = wedding.date ? getDaysUntil(wedding.date) : null;

            return (
              <Link
                key={wedding.id}
                href={`/wedding/${wedding.id}`}
                className="block card hover:scale-[1.01] transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{wedding.title}</h3>
                    {wedding.venue && (
                      <p className="text-sm text-gray-500 mt-0.5">{wedding.venue}</p>
                    )}
                  </div>
                  <span className={`badge ${wedding.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {wedding.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {daysUntil !== null && (
                    <div className="bg-pink-50 rounded-xl p-3 text-center">
                      <HiCalendarDays className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-primary-700">
                        {daysUntil > 0 ? daysUntil : '0'}
                      </p>
                      <p className="text-[10px] text-primary-500">hari lagi</p>
                    </div>
                  )}

                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <HiCurrencyDollar className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-700">{budgetUsage}%</p>
                    <p className="text-[10px] text-green-500">budget terpakai</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <HiCheckCircle className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-700">{wedding._count.checklists}</p>
                    <p className="text-[10px] text-blue-500">checklist</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <HiUserGroup className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-700">{wedding._count.guests}</p>
                    <p className="text-[10px] text-purple-500">tamu</p>
                  </div>
                </div>

                {/* Budget Bar */}
                {totalBudget > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Budget: {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</span>
                      <span>{budgetUsage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Free Plan Limit */}
      {user?.plan === 'FREE' && weddings.length >= 1 && (
        <div className="mt-6 card border-2 border-dashed border-amber-200 bg-amber-50/30">
          <p className="text-sm text-amber-700 font-medium text-center">
            ⚠️ Free plan: maksimal 1 wedding.{' '}
            <Link href="/profile/upgrade" className="text-primary-600 font-semibold underline">
              Upgrade ke Premium
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}