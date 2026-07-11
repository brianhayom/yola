'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { HiHeart, HiGlobeAlt, HiSparkles, HiArrowRight, HiStar, HiShieldCheck, HiChatBubbleLeftRight } from 'react-icons/hi2';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const modules = [
    {
      title: 'Wedding Planner',
      description: 'Rencanakan pernikahan impianmu dengan AI assistant',
      icon: HiHeart,
      href: '/wedding',
      color: 'from-pink-500 to-rose-600',
      bgLight: 'bg-pink-50',
      textColor: 'text-pink-700',
      features: ['Budget tracker', 'Vendor management', 'Checklist timeline', 'Guest list'],
    },
    {
      title: 'Trip Planner',
      description: 'Liburan sempurna dengan itinerary AI-powered',
      icon: HiGlobeAlt,
      href: '/trip',
      color: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
      features: ['Itinerary builder', 'Packing list', 'Budget tracker', 'Vendor booking'],
    },
    {
      title: 'Baby Planner',
      description: 'Persiapan si kecil dari prenatal hingga newborn',
      icon: HiSparkles,
      href: '/baby',
      color: 'from-purple-500 to-violet-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700',
      features: ['Milestone tracker', 'Medical checklist', 'Budget planner', 'Vendor finder'],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              Halo, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-500 mt-1">Mau rencanain apa hari ini?</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>

        {/* Plan Badge */}
        {user?.plan === 'FREE' && (
          <Link href="/profile/upgrade" className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm">
            <HiStar className="w-5 h-5 text-amber-500" />
            <span className="text-amber-800 font-medium">Upgrade ke Premium — Mulai dari Rp49.900/bln</span>
            <HiArrowRight className="w-4 h-4 text-amber-500" />
          </Link>
        )}
      </div>

      {/* Module Cards */}
      <div className="px-4 space-y-4">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="block card hover:scale-[1.02] transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <mod.icon className="w-7 h-7 text-white" />
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
        ))}
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