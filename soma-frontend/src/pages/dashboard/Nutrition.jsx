import React, { useState } from 'react';
import MacroCart from '../../components/MacroCart';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Nutrition = () => {
  const { user, profile } = useAuth();
  const [dayType, setDayType] = useState('workout');

  if (!profile || !profile.daily_calories) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center gap-5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-white/20">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="font-black text-2xl text-white">Scan Body First</h3>
        <p className="text-white/40 text-sm max-w-sm leading-relaxed">
          Upload your photo in the Details tab to unlock your personalized macro targets and the daily nutrition engine.
        </p>
        <Link to="/dashboard/personal"
          className="mt-4 bg-violet-600 hover:bg-violet-500 text-white font-black py-3 px-8 rounded-xl transition-all shadow-lg shadow-violet-500/20 active:scale-95 uppercase tracking-widest text-sm">
          Go to Details
        </Link>
      </div>
    );
  }

  const workoutCal = profile.daily_calories;
  const restCal = profile.rest_day_calories || (workoutCal - 300);
  const activeCal = dayType === 'workout' ? workoutCal : restCal;

  const targetProteinGrams = Math.round((workoutCal * (profile.protein_pct / 100)) / 4);
  const targetFatGrams     = Math.round((workoutCal * (profile.fat_pct    / 100)) / 9);
  const remainingCals      = activeCal - (targetProteinGrams * 4) - (targetFatGrams * 9);
  const targetCarbsGrams   = Math.max(0, Math.round(remainingCals / 4));

  const realTargets = {
    calories: activeCal,
    protein:  targetProteinGrams,
    carbs:    targetCarbsGrams,
    fat:      targetFatGrams,
  };

  return (
    <div className="h-auto md:h-full flex flex-col gap-3">
      {/* Header row with day toggle */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xl font-black">Nutrition</h2>
        <div className="flex gap-1.5 bg-[#12121a]/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
          <button
            onClick={() => setDayType('workout')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              dayType === 'workout'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500'
                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> Workout · {workoutCal} kcal
          </button>
          <button
            onClick={() => setDayType('rest')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              dayType === 'rest'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 border border-violet-500'
                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg> Rest · {restCal} kcal
          </button>
        </div>
      </div>

      {/* MacroCart fills remaining space */}
      <div className="flex-1 md:min-h-0">
        <MacroCart dailyTargets={realTargets} user={user} profile={profile} />
      </div>
    </div>
  );
};

export default Nutrition;
