import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const LandingPage = () => {
  const { signInWithGoogle } = useAuth()
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
      <div id="top" className="min-h-screen bg-[#1c1c1c] text-white overflow-x-hidden font-sans">
      
      {/* ── Top Navigation ── */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-transparent">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="text-2xl font-black tracking-tight">SOMA</span>
        </div>

        {/* Center Links (Hidden on small screens) */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#top" className="text-sm font-bold text-white hover:text-violet-400 transition-colors uppercase tracking-widest">Homepage</a>
          <a href="#features" className="text-sm font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest">Features</a>
          <a href="#engine" className="text-sm font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest">Engine</a>
          <a href="#footer" className="text-sm font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest">Pages</a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={signInWithGoogle}
            className="hidden md:block text-sm font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest"
          >
            Login
          </button>
          <button
            onClick={signInWithGoogle}
            className="text-sm font-bold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-6 py-2.5 rounded transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-violet-500/20"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section id="engine" className="relative w-full h-[600px] flex items-center justify-center pt-20">
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-[#1c1c1c]/80" /> {/* Dark tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-3xl px-6">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-white drop-shadow-lg">
            Intelligent Fitness Engine
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed mb-8 max-w-2xl mx-auto drop-shadow-md">
            Your body composition analysis, highly adaptive workout routines, and personalized macronutrient tracking. Driven by the Delta Engine.
          </p>
          {/* Decorative Divider matching the reference style but in SOMA colors */}
          <div className="flex justify-center gap-1.5">
            <div className="w-4 h-1.5 bg-violet-500 -skew-x-12" />
            <div className="w-4 h-1.5 bg-violet-500 -skew-x-12" />
            <div className="w-4 h-1.5 bg-violet-500 -skew-x-12" />
            <div className="w-4 h-1.5 bg-cyan-500 -skew-x-12" />
            <div className="w-4 h-1.5 bg-cyan-500 -skew-x-12" />
          </div>
        </div>
      </section>

      {/* ── Features Cards Section ── */}
      <section id="features" className="bg-[#12121a] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="group bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden hover:-translate-y-2 hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300">
            <div className="h-56 bg-gray-800 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop" alt="Delta Engine" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-4 left-4 bg-white text-black font-black text-center leading-none px-3 py-2 rounded shadow-md">
                <span className="block text-xl">01</span>
                <span className="block text-[8px] uppercase tracking-widest mt-0.5">Engine</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black mb-3">The Delta Engine Algorithm</h3>
              <div className="flex gap-4 text-[10px] text-white/50 uppercase tracking-widest font-bold mb-4">
                <span>🤖 AI Core</span>
                <span>📈 Progression</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Dynamically scales your workout volume based on your completion rate and RPE. Ensures perfect progressive overload every session.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden hover:-translate-y-2 hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300">
            <div className="h-56 bg-gray-800 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" alt="Scanner" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-4 left-4 bg-white text-black font-black text-center leading-none px-3 py-2 rounded shadow-md">
                <span className="block text-xl">02</span>
                <span className="block text-[8px] uppercase tracking-widest mt-0.5">Scan</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black mb-3">Somatotype Computer Vision</h3>
              <div className="flex gap-4 text-[10px] text-white/50 uppercase tracking-widest font-bold mb-4">
                <span>📸 Analysis</span>
                <span>🧬 Biology</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Upload a photo to instantly detect your somatotype profile (Ectomorph, Mesomorph, Endomorph) and calculate strict macro goals.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden hover:-translate-y-2 hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300">
            <div className="h-56 bg-gray-800 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop" alt="Macros" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-4 left-4 bg-white text-black font-black text-center leading-none px-3 py-2 rounded shadow-md">
                <span className="block text-xl">03</span>
                <span className="block text-[8px] uppercase tracking-widest mt-0.5">Food</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black mb-3">Macro Shopping Cart</h3>
              <div className="flex gap-4 text-[10px] text-white/50 uppercase tracking-widest font-bold mb-4">
                <span>🥗 Nutrition</span>
                <span>📊 Targets</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Fill your daily cart with foods to hit your exact Protein, Carb, and Fat targets. Save your favorite meals as custom presets.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden hover:-translate-y-2 hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300">
            <div className="h-56 bg-gray-800 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=800&auto=format&fit=crop" alt="Injury" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-4 left-4 bg-white text-black font-black text-center leading-none px-3 py-2 rounded shadow-md">
                <span className="block text-xl">04</span>
                <span className="block text-[8px] uppercase tracking-widest mt-0.5">Safe</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black mb-3">Injury-Safe Filtering</h3>
              <div className="flex gap-4 text-[10px] text-white/50 uppercase tracking-widest font-bold mb-4">
                <span>🛡️ Safety</span>
                <span>🏥 Medical</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Log chronic or acute injuries (e.g. Lumbar Disc, Tennis Elbow) and the engine will seamlessly replace dangerous exercises with safe alternatives.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="group bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden hover:-translate-y-2 hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300">
            <div className="h-56 bg-gray-800 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop" alt="Environment" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-4 left-4 bg-white text-black font-black text-center leading-none px-3 py-2 rounded shadow-md">
                <span className="block text-xl">05</span>
                <span className="block text-[8px] uppercase tracking-widest mt-0.5">Adapt</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black mb-3">Adaptive Environment</h3>
              <div className="flex gap-4 text-[10px] text-white/50 uppercase tracking-widest font-bold mb-4">
                <span>🏋️ Gym</span>
                <span>🤸 Home</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Switch between Full Gym Access and No Equipment (Calisthenics) on the fly without breaking your progression timeline or streak.
              </p>
            </div>
          </div>

          {/* Card 6 */}
          <div className="group bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden hover:-translate-y-2 hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300">
            <div className="h-56 bg-gray-800 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=800&auto=format&fit=crop" alt="Tracking" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-4 left-4 bg-white text-black font-black text-center leading-none px-3 py-2 rounded shadow-md">
                <span className="block text-xl">06</span>
                <span className="block text-[8px] uppercase tracking-widest mt-0.5">Track</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black mb-3">Real-Time Progression</h3>
              <div className="flex gap-4 text-[10px] text-white/50 uppercase tracking-widest font-bold mb-4">
                <span>🔥 Streak</span>
                <span>📊 Stats</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Log RPE (Rate of Perceived Exertion) and completion percentage to see your personal weight bump and streak rise over your 4, 8, or 12 week plan.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer Section ── */}
      <footer id="footer" className="bg-[#161616] border-t border-white/5 pt-16 pb-8 px-6 md:px-12 text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-black text-[10px]">S</span>
              </div>
              <span className="text-lg font-black tracking-tight">SOMA</span>
            </div>
            <p className="text-white/40 leading-relaxed mb-6 pr-4">
              Pioneering the future of AI-driven physical conditioning. Built for those who refuse to leave their biology to chance.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                🎧
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Support Center 24/7</p>
                <p className="text-lg font-black">+1 555 707-1234</p>
              </div>
            </div>
          </div>

          {/* Col 2: Company */}
          <div>
            <h4 className="text-lg font-black mb-6">Company</h4>
            <ul className="space-y-4 text-white/50 font-medium">
              <li><a href="#" className="hover:text-violet-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">History</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">News Update</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Legal Notice</a></li>
            </ul>
          </div>

          {/* Col 3: Useful Links (Privacy Policy as requested) */}
          <div>
            <h4 className="text-lg font-black mb-6">Useful Links</h4>
            <ul className="space-y-4 text-white/50 font-medium">
              <li>
                <button onClick={() => setShowPrivacy(true)} className="hover:text-violet-400 transition-colors text-violet-300">
                  Privacy Policy
                </button>
              </li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Disclaimer</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Elements</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Support</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex items-center justify-center">
          <p className="text-white/30 text-xs text-center font-semibold tracking-wider uppercase">
            Copyright © {new Date().getFullYear()} SOMA by Antigravity. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* ── Privacy Policy Modal ── */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-4">Privacy Policy</h2>
            <div className="text-white/60 space-y-4 text-sm leading-relaxed">
              <p>
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p>
                Welcome to SOMA. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
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
              <button
                onClick={() => setShowPrivacy(false)}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2.5 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default LandingPage
