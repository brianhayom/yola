'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  HiHeart, HiGlobeAlt, HiSparkles, HiChatBubbleLeftRight, 
  HiArrowRight, HiShieldCheck, HiCalendar, HiChartBar, 
  HiCheckCircle, HiClock, HiStar, HiCog6Tooth 
} from 'react-icons/hi2';

const modules = [
  {
    href: '/wedding',
    icon: HiHeart,
    title: 'Wedding Planner',
    description: 'Rencanakan pernikahan impianmu',
    features: ['Budget', 'Vendor', 'Checklist', 'Timeline'],
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    gradient: 'from-pink-500 to-rose-500',
    progress: 65,
  },
  {
    href: '/trip',
    icon: HiGlobeAlt,
    title: 'Trip Planner',
    description: 'Atur liburan seru bareng keluarga',
    features: ['Itinerary', 'Budget', 'Packing', 'Destinasi'],
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    progress: 30,
  },
  {
    href: '/baby',
    icon: HiSparkles,
    title: 'Baby Planner',
    description: 'Persiapan si kecil dengan tenang',
    features: ['Timeline', 'Checklist', 'Budget', 'Tips'],
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    gradient: 'from-purple-500 to-violet-500',
    progress: 0,
  },
];

const quickActions = [
  { icon: HiCalendar, label: 'Buat Plan Baru', href: '/wedding', color: 'text-primary-600 bg-primary-50' },
  { icon: HiChatBubbleLeftRight, label: 'Chat AI', href: '/ai-chat', color: 'text-accent-600 bg-accent-50' },
  { icon: HiChartBar, label: 'Progress', href: '/dashboard', color: 'text-emerald-600 bg-emerald-50' },
  { icon: HiCog6Tooth, label: 'Pengaturan', href: '/profile', color: 'text-gray-600 bg-gray-50' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalProgress = Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* ─── HEADER ─── */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 pt-6 pb-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-sm text-primary-600 font-medium">{greeting} 👋</p>
              <h1 className="text-2xl font-bold text-gray-900 font-display mt-0.5">
                {user.name?.split(' ')[0]}
              </h1>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                {user.name?.charAt(0)?.toUpperCase() || 'Y'}
              </div>
              {user.plan === 'PREMIUM' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow">
                  <HiStar className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
            <HiSparkles className="w-3.5 h-3.5" />
            {user.plan === 'FREE' ? 'Free Plan' : user.plan === 'PREMIUM' ? 'Premium' : 'Family'}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* ─── OVERALL PROGRESS ─── */}
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-sm font-bold text-primary-600">{totalProgress}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>{modules.filter(m => m.progress > 0).length} aktif</span>
            <span>{modules.filter(m => m.progress === 0).length} belum mulai</span>
          </div>
        </div>

        {/* ─── QUICK ACTIONS ─── */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href} className="group">
                  <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 active:scale-95">
                    <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── MODULE CARDS ─── */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Life Modules</h3>
          <div className="space-y-3">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link key={mod.href} href={mod.href} className="block group">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${mod.bgLight} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`w-7 h-7 ${mod.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-900 font-display">{mod.title}</h3>
                          <HiArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{mod.description}</p>
                        
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${mod.gradient}`}
                              style={{ width: `${mod.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-400">{mod.progress}%</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {mod.features.map((f) => (
                            <span key={f} className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${mod.bgLight} ${mod.textColor}`}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── AI CHAT BANNER ─── */}
        <div className="mt-8 mb-6">
          <Link href="/ai-chat" className="block group">
            <div className="card-gradient rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HiChatBubbleLeftRight className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">AI Assistant</h3>
                  <p className="text-primary-100 text-sm">Tanya apa saja tentang perencanaanmu!</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <HiArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ─── PREMIUM UPSELL ─── */}
        {user?.plan === 'FREE' && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <HiShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Upgrade Premium</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Buka semua fitur tanpa batas</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  'Unlimited plans',
                  'AI chat unlimited',
                  'Export laporan',
                  'Prioritas support',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <HiCheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/profile/upgrade"
                className="block text-center py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/20 transition-all"
              >
                Upgrade Sekarang
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}