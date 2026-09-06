import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OnboardingWizard from '../components/OnboardingWizard';

const Dashboard = () => {
  const { user, profile, signOut, loading } = useAuth();

  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-700/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin z-10" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const navItems = [
    { 
      name: 'Details', 
      path: '/dashboard/personal', 
      icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg> 
    },
    { 
      name: 'Nutrition', 
      path: '/dashboard/nutrition', 
      icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg> 
    },
    { 
      name: 'Workout', 
      path: '/dashboard/workout', 
      icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> 
    },
    { 
      name: 'History', 
      path: '/dashboard/history', 
      icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> 
    },
  ];

  const location = useLocation();
  let bgImage = '';
  if (location.pathname.includes('/personal')) {
    bgImage = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop'; // Dark weights
  } else if (location.pathname.includes('/workout')) {
    bgImage = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop'; // Dark gym
  } else if (location.pathname.includes('/nutrition')) {
    bgImage = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop'; // Dark food
  } else if (location.pathname.includes('/history')) {
    bgImage = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop'; // Dark tracker/running
  }

  return (
    <div className="min-h-screen md:h-screen w-full bg-[#1c1c1c] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden relative font-sans">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#0e0e12]">
        
        {/* Context-Specific Image */}
        {bgImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-1000 ease-in-out"
            style={{ backgroundImage: `url('${bgImage}')` }} 
          />
        )}
        
        {/* Performance-Optimized Lighting Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,transparent_60%)]" />
        <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_60%)]" />
        <div className="absolute bottom-[-20%] left-[10%] w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(circle,rgba(217,70,239,0.08)_0%,transparent_60%)]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(14,14,18,0.9)_100%)]" />
      </div>

      {/* Onboarding Overlay for New Users */}
      <div className="relative z-50">
        {(!profile || !profile.age) && <OnboardingWizard />}
      </div>
      
      {/* ── DESKTOP SIDEBAR (md and up) ────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1a1a24]/90 backdrop-blur-xl border-r border-white/5 z-30 shrink-0 shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
        {/* Branding */}
        <div className="h-20 flex items-center gap-3 px-8 border-b border-white/5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="text-xl font-black tracking-tight">SOMA</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-3 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold
                ${isActive 
                  ? 'bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-violet-300 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white/80 border border-transparent hover:translate-x-1'
                }
              `}
            >
              <span className="transition-transform duration-300">{item.icon}</span>
              <span className="text-xs tracking-widest uppercase">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Desktop Sidebar Bottom (Sign Out) */}
        <div className="p-6 border-t border-white/5 shrink-0">
          <button
            onClick={signOut}
            className="w-full group flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 hover:border-red-500/30 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <span className="group-hover:scale-110 transition-transform">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA (Mobile Header + Outlet + Mobile Footer) ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* Top Navbar */}
        <header className="h-16 md:h-20 bg-[#1a1a24]/80 backdrop-blur-xl border-b border-white/5 shrink-0 flex items-center justify-between px-5 lg:px-8 z-30">
          
          <div className="flex items-center gap-8">
            {/* Mobile App Branding (Hidden on Desktop) */}
            <div className="flex items-center gap-3 md:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <span className="text-xl font-black tracking-tight">SOMA</span>
            </div>

            {/* Additional Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => setShowAbout(true)} className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">About</button>
              <button onClick={() => setShowPrivacy(true)} className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">Privacy Policy</button>
              <button onClick={() => setShowContact(true)} className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">Contact</button>
            </nav>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-6 ml-auto">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right group cursor-pointer">
                <p className="text-xs font-bold text-white/80">
                  {user.user_metadata?.full_name || 'Athlete'}
                </p>
                <p className="text-[10px] text-white/30 opacity-0 h-0 group-hover:opacity-100 group-hover:h-4 transition-all duration-300 overflow-hidden">{user.email}</p>
              </div>
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 ring-violet-500/40 object-cover"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 text-sm md:text-base font-bold border border-violet-500/30">
                  {user.email[0].toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Mobile Logout (Hidden on Desktop) */}
            <div className="w-px h-8 bg-white/10 hidden sm:block md:hidden mx-2" />
            <button
              onClick={signOut}
              className="md:hidden group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-500/30 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold"
            >
              <span className="group-hover:scale-110 transition-transform">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
              </span>
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 md:min-h-0 md:overflow-y-auto bg-transparent custom-scrollbar relative z-10">
          <div className="md:h-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0">
            <Outlet />
          </div>
        </main>

        {/* Mobile Footer Navigation (Hidden on Desktop) */}
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a24]/95 backdrop-blur-xl border-t border-white/5 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <nav className="max-w-5xl mx-auto flex items-center justify-around sm:justify-center sm:gap-4 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  group flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl transition-all duration-300 font-bold flex-1 sm:flex-none
                  ${isActive 
                    ? 'bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-violet-300 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-105' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white/80 border border-transparent hover:scale-105'
                  }
                `}
              >
                <span className={`transition-transform duration-300 group-hover:-translate-y-1`}>{item.icon}</span>
                <span className="text-[10px] sm:text-xs tracking-widest uppercase">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </footer>
      </div>

      {/* ── Modals ── */}
      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-4">About SOMA</h2>
            <div className="text-white/60 space-y-4 text-sm leading-relaxed">
              <p>
                SOMA is an intelligent, AI-driven fitness engine designed to bring elite-level programming to your training.
              </p>
              <p>
                Built on the Delta Engine algorithm, SOMA automatically adapts to your performance, logs your real-time progressions, and dynamically handles your recovery, nutrition, and injury constraints.
              </p>
              <p>
                We believe you shouldn't leave your biology to chance. SOMA provides absolute clarity in the gym.
              </p>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowAbout(false)} className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-black mb-4">Privacy Policy</h2>
            <div className="text-white/60 space-y-4 text-sm leading-relaxed">
              <p>
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p>
                Welcome to SOMA. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you use our application.
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-2">1. The Data We Collect About You</h3>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                <br/>- <strong>Identity Data:</strong> includes first name, last name, username or similar identifier.
                <br/>- <strong>Biometric Data:</strong> includes photos uploaded for somatotype analysis. All photos are processed ephemerally and are never stored on our servers permanently without explicit consent.
                <br/>- <strong>Health Data:</strong> includes your logged injuries, macro targets, and workout progress to provide personalized adaptive features.
              </p>
              <h3 className="text-lg font-bold text-white mt-6 mb-2">2. How We Use Your Data</h3>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                <br/>- Where we need to perform the contract we are about to enter into or have entered into with you (e.g., generating your workout plan).
                <br/>- Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.
              </p>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowPrivacy(false)} className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-4">Contact Support</h2>
            <div className="text-white/60 space-y-4 text-sm leading-relaxed">
              <p>
                Our support center is available 24/7 for technical assistance, billing inquiries, or feedback.
              </p>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">Email</p>
                    <p className="font-bold text-white">support@soma.app</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">Phone</p>
                    <p className="font-bold text-white">+1 555 707-1234</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowContact(false)} className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
