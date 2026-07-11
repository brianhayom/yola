'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { HiSparkles, HiHeart, HiGlobeAlt, HiChatBubbleLeftRight, HiArrowRight, HiShieldCheck, HiUserGroup } from 'react-icons/hi2';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // If already logged in, show quick CTA to dashboard
  const isLoggedIn = isAuthenticated && !isLoading;

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden px-4 pt-16 pb-12 text-center">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-primary-100/60 via-pink-50/30 to-transparent rounded-full blur-3xl -z-10" />

        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-2xl shadow-primary-500/30 mb-6 animate-fade-in">
          <HiSparkles className="w-12 h-12 text-white" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-6">
          <HiSparkles className="w-4 h-4" />
          AI-Powered Life Planner
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-display leading-tight">
          Your Life,{' '}
          <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            Planned Smart
          </span>
        </h1>

        <p className="mt-4 text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
          YOLA bantu kamu rencanakan momen terpenting dalam hidup — wedding, traveling, dan persiapan baby — semua dengan bantuan AI.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-primary px-8 py-3.5 text-lg inline-flex items-center gap-2">
              Dashboard <HiArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link href="/auth/register" className="btn-primary px-8 py-3.5 text-lg w-full sm:w-auto">
                Mulai Gratis
              </Link>
              <Link href="/auth/login" className="btn-secondary px-8 py-3.5 text-lg w-full sm:w-auto">
                Login
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-10 flex items-center justify-center gap-8 text-sm text-gray-400">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">3</div>
            <div>Life Modules</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">AI</div>
            <div>Powered</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">100%</div>
            <div>Gratis Mulai</div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 font-display">Tiga Pilar Kehidupan</h2>
          <p className="text-gray-500 mt-2">Semua yang kamu butuhkan untuk momen spesial</p>
        </div>

        <div className="grid gap-4 max-w-lg mx-auto">
          {/* Wedding */}
          <div className="card flex items-start gap-4 hover:shadow-lg transition-all duration-200">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center flex-shrink-0">
              <HiHeart className="w-7 h-7 text-pink-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-display">Wedding Planner</h3>
              <p className="text-sm text-gray-500 mt-1">Budget calculator, vendor manager, checklist interaktif, dan timeline otomatis untuk pernikahan impianmu.</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Budget', 'Vendor', 'Checklist', 'Timeline'].map((f) => (
                  <span key={f} className="badge bg-pink-50 text-pink-600 text-[11px]">{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Trip */}
          <div className="card flex items-start gap-4 hover:shadow-lg transition-all duration-200">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <HiGlobeAlt className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-display">Trip Planner</h3>
              <p className="text-sm text-gray-500 mt-1">Itinerary harian, budget tracker, packing list, dan rekomendasi destinasi dari AI untuk liburan sempurna.</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Itinerary', 'Budget', 'Packing', 'AI Tips'].map((f) => (
                  <span key={f} className="badge bg-blue-50 text-blue-600 text-[11px]">{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Baby */}
          <div className="card flex items-start gap-4 hover:shadow-lg transition-all duration-200">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <HiSparkles className="w-7 h-7 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-display">Baby Planner</h3>
              <p className="text-sm text-gray-500 mt-1">Persiapan trimester, checklist belanja, budget baby, dan tips parenting dari AI untuk calon orang tua.</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Trimester', 'Checklist', 'Budget', 'Tips'].map((f) => (
                  <span key={f} className="badge bg-purple-50 text-purple-600 text-[11px]">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI HIGHLIGHT ─── */}
      <section className="px-4 py-8">
        <div className="card-gradient rounded-3xl p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <HiChatBubbleLeftRight className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white font-display">AI Assistant 24/7</h3>
          <p className="text-pink-100 mt-3 leading-relaxed">
            Tanya apa saja ke AI YOLA — rekomendasi vendor wedding, ide itinerary trip, tips persiapan baby, atau sekadar curhat tentang planning hidupmu.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {['Rekomendasi Vendor', 'Itinerary AI', 'Tips Parenting', 'Budget Optimizer'].map((f) => (
              <span key={f} className="badge bg-white/20 text-white text-xs">{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PREMIUM TEASER ─── */}
      <section className="px-4 py-8 mb-8">
        <div className="card border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50/30 to-yellow-50/30 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <HiShieldCheck className="w-7 h-7 text-amber-500" />
            <h3 className="text-xl font-bold text-gray-900 font-display">Upgrade ke Premium</h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-600">
            {[
              { icon: HiSparkles, text: 'Unlimited wedding, trip & baby plans' },
              { icon: HiChatBubbleLeftRight, text: 'AI chat unlimited + smart recommendations' },
              { icon: HiUserGroup, text: 'Share & collaborate dengan keluarga' },
              { icon: HiShieldCheck, text: 'Export laporan & WhatsApp vendor analyzer' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          {!isLoggedIn && (
            <Link href="/auth/register" className="mt-5 btn-primary w-full text-center block">
              Mulai Gratis & Upgrade Nanti
            </Link>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="px-4 py-8 text-center border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
          <HiSparkles className="w-5 h-5 text-primary-400" />
          <span className="font-bold text-gray-500 font-display">YOLA</span>
        </div>
        <p className="text-xs text-gray-400">Your Life Assistant · Made with ❤️</p>
      </footer>
    </div>
  );
}