import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import PlanCard from '../../components/PlanCard';

const History = () => {
  const { user } = useAuth();
  const [planCards, setPlanCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyTab, setHistoryTab] = useState('gym'); // 'gym' or 'calisthenics'

  const fetchPlanCards = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setPlanCards(data || []);
    } catch (err) {
      console.error('Error fetching plan cards:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPlanCards();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCard = planCards.find((c) => c.is_active);
  const archivedCards = planCards.filter((c) => !c.is_active);
  const displayedArchived = archivedCards.filter((c) =>
    historyTab === 'gym'
      ? (c.equipment_preference === 'gym' || !c.equipment_preference)
      : c.equipment_preference === 'calisthenics'
  );

  // Summary stats across all cards
  const totalAttended = planCards.reduce((s, c) => s + (c.attended_days || 0), 0);
  const totalPlans = planCards.length;
  const bestStreak = Math.max(0, ...planCards.map((c) => c.streak || 0));
  const avgCompletion = totalPlans > 0
    ? Math.round(planCards.reduce((s, c) => s + (c.completion_pct || 0), 0) / totalPlans)
    : 0;

  return (
    <div className="md:h-full flex flex-col -mt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h2 className="text-xl font-black">History</h2>
      </div>

      {planCards.length === 0 ? (
        /* Empty state */
        <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-2xl">
          <div className="text-white/20 mb-6">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-20 h-20"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
          </div>
          <h3 className="font-black text-3xl mb-4 text-white">No Plan Cards Yet</h3>
          <p className="text-white/50 text-sm max-w-sm mb-10 leading-relaxed font-medium">
            Go to the <span className="text-violet-400 font-bold">Workout</span> tab and click "Generate Adaptive Plan" to create your first card. Every plan you generate is tracked here.
          </p>
          <div className="flex flex-col gap-3 text-left text-sm text-white/60 bg-white/5 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3"><svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-amber-400"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg> <span className="font-semibold">≥ 70% completion</span> → +2.5 kg bump</div>
            <div className="flex items-center gap-3"><svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> <span className="font-semibold">≥ 85% completion</span> → level up + bump</div>
            <div className="flex items-center gap-3"><svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-violet-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg> <span className="font-semibold">Build streaks</span> by completing consecutive days</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 gap-4">

          {/* ── Top Horizontal Summary ────────────────────────────── */}
          <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shrink-0 shadow-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryTile icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>} value={totalPlans} label="Plans Generated" color="text-violet-400" />
              <SummaryTile icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>} value={totalAttended} label="Days Completed" color="text-emerald-400" />
              <SummaryTile icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>} value={bestStreak} label="Best Streak" color="text-orange-400" suffix="d" />
              <SummaryTile icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>} value={`${avgCompletion}%`} label="Avg Completion" color={avgCompletion >= 85 ? 'text-emerald-400' : avgCompletion >= 70 ? 'text-amber-400' : 'text-violet-400'} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 flex-1 md:min-h-0">
            {/* ── LHS: Current ──────────────────────────────── */}
            <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
              <div className="px-6 pt-5 pb-4 border-b border-white/5 shrink-0 bg-[#12121a]/30">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Current</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {/* Active Plan Card */}
                {activeCard ? (
                  <div>
                    <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="text-emerald-400 animate-pulse">●</span> Active Plan
                    </h3>
                    <PlanCard card={activeCard} isActive />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-6 opacity-50">
                    <p className="text-xs text-white/50">No active plan currently.</p>
                  </div>
                )}

                {/* Progression Rules */}
                <div className="flex flex-col gap-2">
                  <RulePill color="border-amber-500/20 bg-amber-500/10 text-amber-400" icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>} text="≥ 70% → +2.5 kg weight bump" />
                  <RulePill color="border-emerald-500/20 bg-emerald-500/10 text-emerald-400" icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>} text="≥ 85% → level up + weight bump" />
                </div>
              </div>
            </div>

            {/* ── RHS: Archived ─────────────────────────────────────── */}
            <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col overflow-hidden h-[400px] md:h-auto md:flex-1 md:min-h-0 shadow-2xl">
              <div className="px-6 pt-5 pb-4 border-b border-white/5 shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-[#12121a]/30">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Previous Plans</p>

                {/* Tabs */}
                <div className="flex bg-[#12121a]/60 border border-white/5 rounded-xl p-1.5 shrink-0 backdrop-blur-sm">
                  <button
                    onClick={() => setHistoryTab('gym')}
                    className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all duration-300 ${historyTab === 'gym' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    Gym
                  </button>
                  <button
                    onClick={() => setHistoryTab('calisthenics')}
                    className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all duration-300 ${historyTab === 'calisthenics' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    No Equip
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
                {displayedArchived.length > 0 ? (
                  displayedArchived.map((card) => (
                    <PlanCard key={card.id} card={card} isActive={false} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10 text-white/20">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H2.625c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                    <p className="text-xs text-white/40 max-w-[200px] font-medium">No archived plans yet. Generate another plan to archive the current one.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// ── Helper sub-components ────────────────────────────────────────

const SummaryTile = ({ icon, value, label, color, suffix }) => (
  <div className="bg-[#12121a]/60 border border-white/5 rounded-2xl p-2.5 hover:bg-[#1a1a24] hover:border-white/10 transition-all duration-300 flex flex-col items-center justify-center text-center group">
    <div className="flex items-center gap-2 mb-1">
      <span className="group-hover:scale-110 transition-transform duration-300 flex items-center justify-center {color} opacity-90">{icon}</span>
      <p className={`text-xl font-black leading-none ${color} drop-shadow-md`}>
        {value}{suffix && <span className="text-[10px] font-bold text-white/40 ml-1">{suffix}</span>}
      </p>
    </div>
    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">{label}</p>
  </div>
);

const RulePill = ({ color, icon, text }) => (
  <div className={`flex items-center gap-2 text-[10px] font-bold border px-3 py-2 rounded-lg ${color}`}>
    <span className="text-sm">{icon}</span>{text}
  </div>
);

export default History;
