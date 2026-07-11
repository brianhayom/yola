'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { HiHeart, HiGlobeAlt, HiSparkles, HiChatBubbleLeftRight, HiArrowRight, HiShieldCheck } from 'react-icons/hi2';

const modules = [
  {
    href: '/wedding',
    icon: HiHeart,
    title: 'Wedding Planner',
    description: 'Rencanakan pernikahan impianmu',
    features: ['Budget', 'Vendor', 'Checklist', 'Timeline'],
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
  },
  {
    href: '/trip',
    icon: HiGlobeAlt,
    title: 'Trip Planner',
    description: 'Atur liburan seru bareng keluarga',
    features: ['Itinerary', 'Budget', 'Packing', 'Destinasi'],
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    href: '/baby',
    icon: HiSparkles,
    title: 'Baby Planner',
    description: 'Persiapan si kecil dengan tenang',
    features: ['Timeline', 'Checklist', 'Budget', 'Tips'],
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              Hai, {user.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Mau planning apa hari ini?</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
            {user.name?.charAt(0)?.toUpperCase() || 'Y'}
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="px-4 space-y-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href} className="block">
              <div className="card flex items-center gap-4 hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
                <div className={`w-12 h-12 rounded-xl ${mod.bgLight} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${mod.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 font-display">{mod.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{mod.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mod.features.map((f) => (
                      <span key={f} className={`badge ${mod.bgLight} ${mod.textColor} text-[11px]`}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <HiArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI Assistant Banner */}
      <div className="px-4 mt-6 mb-4">
        <div className="card-gradient rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <HiChatBubbleLeftRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">AI Assistant</h3>
              <p className="text-pink-100 text-sm">Tanya apa saja tentang perencanaan wedding, trip, atau baby!</p>
            </div>
          </div>
          <Link
            href="/ai-chat"
            className="mt-4 inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-pink-50 transition-colors"
          >
            Chat dengan AI <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Premium Features Teaser */}
      {user?.plan === 'FREE' && (
        <div className="px-4 mb-6">
          <div className="card border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
            <div className="flex items-center gap-3 mb-3">
              <HiShieldCheck className="w-6 h-6 text-amber-500" />
              <h3 className="font-bold text-gray-900">Fitur Premium</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                Unlimited wedding/trip/baby plans
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                AI chat unlimited + smart recommendations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                Export laporan & share dengan keluarga
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                WhatsApp vendor analyzer
              </li>
            </ul>
            <Link
              href="/profile/upgrade"
              className="mt-4 btn-primary w-full text-center block"
            >
              Upgrade Sekarang
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}