'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { HiSparkles, HiHeart, HiGlobeAlt, HiChatBubbleLeftRight, HiArrowRight, HiShieldCheck, HiStar, HiCheck, HiChevronRight } from 'react-icons/hi2';
import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: HiHeart,
    title: 'Wedding Planner',
    desc: 'Budget, vendor, checklist & timeline otomatis',
    color: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    gradient: 'from-pink-50 via-rose-50/30 to-transparent',
  },
  {
    icon: HiGlobeAlt,
    title: 'Trip Planner',
    desc: 'Itinerary, budget tracker & rekomendasi AI',
    color: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    gradient: 'from-blue-50 via-cyan-50/30 to-transparent',
  },
  {
    icon: HiSparkles,
    title: 'Baby Planner',
    desc: 'Persiapan trimester, checklist & tips parenting',
    color: 'from-purple-500 to-violet-500',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    gradient: 'from-purple-50 via-violet-50/30 to-transparent',
  },
];

const stats = [
  { value: '3', label: 'Life Modules', suffix: '' },
  { value: 'AI', label: 'Powered', suffix: '' },
  { value: '100', label: 'Gratis Mulai', suffix: '%' },
];

const testimonials = [
  { name: 'Sarah', role: 'Bride-to-be', text: 'YOLA bikin planning wedding jauh lebih teratur! Budget tracker-nya super helpful.', rating: 5 },
  { name: 'Dimas', role: 'New Dad', text: 'Baby planner-nya lengkap banget. Dari checklist sampai tips AI, semua ada.', rating: 5 },
  { name: 'Rina', role: 'Traveler', text: 'Trip planner dengan AI recommendation-nya bikin liburan makin seru!', rating: 5 },
];

const pricingPlans = [
  {
    name: 'Free',
    price: 'Rp 0',
    period: 'selamanya',
    features: ['1 wedding plan', '1 trip plan', '1 baby plan', 'AI chat 10x/hari', 'Basic budget tracker'],
    cta: 'Mulai Gratis',
    href: '/auth/register',
    popular: false,
  },
  {
    name: 'Premium',
    price: 'Rp 49.000',
    period: '/bulan',
    features: ['Unlimited plans', 'AI chat unlimited', 'Smart recommendations', 'Export laporan', 'Prioritas support'],
    cta: 'Coba Gratis 7 Hari',
    href: '/auth/register?plan=premium',
    popular: true,
  },
  {
    name: 'Family',
    price: 'Rp 79.000',
    period: '/bulan',
    features: ['Semua fitur Premium', 'Share plans', 'Kolaborasi real-time', '5 anggota keluarga', 'WhatsApp analyzer'],
    cta: 'Coba Gratis 7 Hari',
    href: '/auth/register?plan=family',
    popular: false,
  },
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const isLoggedIn = isAuthenticated && !isLoading;
  const [activeFeature, setActiveFeature] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <HiSparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-display">
              YOLA
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary text-sm px-5 py-2">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm px-5 py-2">
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-primary-100/40 via-pink-50/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-accent-100/30 rounded-full blur-3xl" />
        <div className="absolute top-40 left-0 w-72 h-72 bg-primary-100/30 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-6 animate-fade-in">
              <HiSparkles className="w-4 h-4" />
              <span>AI-Powered Life Assistant</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 font-display leading-[1.1] tracking-tight">
              Rencanakan{' '}
              <span className="bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-clip-text text-transparent">
                Momen Terbaik
              </span>
              <br />
              Hidupmu dengan AI
            </h1>

            <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              YOLA bantu kamu rencanakan wedding, traveling, dan persiapan baby — 
              semua dengan bantuan AI cerdas yang siap 24/7.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2 shadow-xl shadow-primary-500/20">
                  Buka Dashboard <HiArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="btn-primary px-8 py-4 text-lg shadow-xl shadow-primary-500/20 w-full sm:w-auto text-center">
                    Mulai Gratis
                  </Link>
                  <Link href="#features" className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto text-center">
                    Lihat Fitur
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 flex items-center justify-center gap-8 md:gap-16">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    {s.value}{s.suffix}
                  </div>
                  <div className="text-sm text-gray-400 mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-display">
              Tiga Pilar Kehidupan
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Semua tools yang kamu butuhkan untuk merencanakan momen spesial dalam hidup
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`group relative rounded-3xl p-8 transition-all duration-500 cursor-pointer
                    ${i === activeFeature 
                      ? 'bg-gradient-to-br from-white to-gray-50 shadow-2xl shadow-gray-200/50 scale-[1.02]' 
                      : 'bg-white hover:shadow-xl hover:shadow-gray-100/50'
                    }`}
                  onMouseEnter={() => setActiveFeature(i)}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${f.gradient} opacity-50 transition-opacity duration-500
                    ${i === activeFeature ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                  
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl ${f.bgLight} flex items-center justify-center mb-6
                      ${i === activeFeature ? 'scale-110' : ''} transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${f.textColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 font-display mb-3">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      {['AI Powered', 'Real-time', 'Mobile Friendly'].map((tag) => (
                        <span key={tag} className={`px-3 py-1 rounded-full text-xs font-medium ${f.bgLight} ${f.textColor}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── AI ASSISTANT ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
                <HiChatBubbleLeftRight className="w-4 h-4" />
                <span>AI Assistant 24/7</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white font-display leading-tight">
                Chat dengan AI
                <br />
                <span className="text-primary-200">Kapan Saja</span>
              </h2>
              <p className="mt-6 text-lg text-primary-100/80 leading-relaxed max-w-md">
                Tanya apa saja ke AI YOLA — rekomendasi vendor, ide itinerary, tips parenting, 
                atau sekadar curhat tentang planning hidupmu.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {['Rekomendasi Vendor', 'Itinerary AI', 'Tips Parenting', 'Budget Optimizer'].map((f) => (
                  <span key={f} className="px-4 py-2 rounded-xl bg-white/10 text-white/80 text-sm font-medium backdrop-blur-sm">
                    {f}
                  </span>
                ))}
              </div>
              {!isLoggedIn && (
                <Link href="/auth/register" className="mt-8 inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-xl">
                  Coba Gratis <HiArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
            
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="space-y-4">
                  {[
                    { role: 'user', msg: 'Rekomendasi vendor catering di Jakarta?' },
                    { role: 'ai', msg: 'Tentu! Berdasarkan budget dan preferensi, saya rekomendasikan: 1) Catering A (4.9⭐) 2) Catering B (4.8⭐). Mau saya detailkan?' },
                    { role: 'user', msg: 'Buatkan itinerary 3 hari ke Bali' },
                    { role: 'ai', msg: 'Siap! Saya buatkan itinerary optimal dengan budget tracking...' },
                  ].map((chat, i) => (
                    <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        chat.role === 'user' 
                          ? 'bg-primary-500 text-white rounded-br-md' 
                          : 'bg-white/10 text-white/90 rounded-bl-md'
                      }`}>
                        {chat.msg}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                  <div className="flex-1 text-sm text-white/40">Tanya AI tentang planningmu...</div>
                  <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                    <HiArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-display">
              Dicintai Pengguna
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Ribuan pengguna sudah merasakan kemudahan planning dengan YOLA
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <HiStar key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-display">
              Pilih Paketmu
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Mulai gratis, upgrade kapan saja
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white shadow-2xl shadow-primary-500/10 border-2 border-primary-200 scale-105'
                    : 'bg-white border border-gray-100 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    POPULER
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                      <HiCheck className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-8 block text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'btn-primary shadow-xl shadow-primary-500/20'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BOTTOM ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-display">
            Siap Rencanakan Hidupmu?
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-lg mx-auto">
            Gabung ribuan pengguna lain yang sudah merasakan kemudahan planning dengan YOLA
          </p>
          {!isLoggedIn && (
            <Link href="/auth/register" className="mt-8 btn-primary px-10 py-4 text-lg inline-flex items-center gap-2 shadow-2xl shadow-primary-500/20">
              Mulai Gratis Sekarang <HiArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <HiSparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 font-display">YOLA</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="#features" className="hover:text-gray-600 transition-colors">Fitur</Link>
              <Link href="#pricing" className="hover:text-gray-600 transition-colors">Harga</Link>
              <span>Made with ❤️</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}