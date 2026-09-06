import React from 'react';

/**
 * PlanCard
 * Displays a single workout plan card with progress ring, streak, attended/skipped days.
 */
const PlanCard = ({ card, isActive = false }) => {
  const {
    generated_at,
    plan_duration_weeks,
    total_workout_days,
    attended_days = 0,
    skipped_days = 0,
    streak = 0,
    completion_pct = 0,
    experience_level_at_generation = 'beginner',
    weight_bump_applied = 0,
  } = card;

  const date = generated_at ? new Date(generated_at) : null;
  const pct = Math.min(Math.round(completion_pct), 100);

  // Circular SVG progress ring
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const getPctColor = (p) => {
    if (p >= 85) return '#10b981'; // emerald
    if (p >= 70) return '#f59e0b'; // amber
    return '#6366f1';              // violet
  };
  const ringColor = getPctColor(pct);

  const levelBadgeColors = {
    beginner:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-blue-500/20   text-blue-400   border-blue-500/30',
    pro:          'bg-purple-500/20  text-purple-400  border-purple-500/30',
  };
  const levelBadge = levelBadgeColors[experience_level_at_generation] || levelBadgeColors.beginner;

  return (
    <div
      className={`relative rounded-3xl border transition-all duration-300 overflow-hidden group
        ${isActive
          ? 'bg-gradient-to-br from-violet-900/40 to-fuchsia-900/20 border-violet-500/50 shadow-lg shadow-violet-500/20'
          : 'bg-[#12121a]/60 border-white/5 hover:border-violet-500/30 hover:bg-[#1a1a24] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50'
        }`}
    >
      {/* Active pill */}
      {isActive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Active
        </div>
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Progress ring */}
          <div className="relative shrink-0">
            <svg width="76" height="76" className="-rotate-90">
              {/* Track */}
              <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              {/* Progress */}
              <circle
                cx="38" cy="38" r="32"
                fill="none"
                stroke={ringColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={(2 * Math.PI * 32) - (pct / 100) * (2 * Math.PI * 32)}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black leading-none" style={{ color: ringColor }}>
                {pct}%
              </span>
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">done</span>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-md ${levelBadge}`}>
                {experience_level_at_generation}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-md ${
                weight_bump_applied > 0 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : weight_bump_applied < 0 
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
                    : 'bg-white/5 text-white/40 border-white/10'
              }`}>
                {weight_bump_applied > 0 ? '+' : ''}{weight_bump_applied}kg
              </span>
            </div>
            <p className="text-xl font-black text-white leading-tight">
              {plan_duration_weeks}-Week Plan
            </p>
            {date && (
              <p className="text-xs text-white/30 mt-0.5">
                Generated {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox
            icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
            value={attended_days}
            label="Attended"
            color="text-emerald-400"
            sub={`/ ${total_workout_days}`}
          />
          <StatBox
            icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>}
            value={streak}
            label="Streak"
            color={streak >= 7 ? 'text-orange-400' : 'text-white/80'}
            sub="days"
          />
          <StatBox
            icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>}
            value={skipped_days}
            label="Skipped"
            color={skipped_days > 0 ? 'text-rose-400' : 'text-white/30'}
            sub="days"
          />
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: ringColor }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/25 mt-1 font-semibold">
            <span>{attended_days} completed</span>
            <span>{total_workout_days - attended_days} remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, value, label, color, sub }) => (
  <div className="bg-black/30 rounded-2xl p-3 border border-white/5 text-center flex flex-col justify-center items-center group-hover:border-white/10 transition-colors duration-300">
    <div className={`mb-1.5 ${color}`}>{icon}</div>
    <div className={`text-xl font-black leading-none ${color}`}>
      {value}
      {sub && <span className="text-[10px] font-bold text-white/30 ml-1">{sub}</span>}
    </div>
    <div className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">{label}</div>
  </div>
);

export default PlanCard;
