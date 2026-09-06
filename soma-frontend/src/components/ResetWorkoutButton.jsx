import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';
/**
 * ResetWorkoutButton
 *
 * Fetches the previous active plan card before showing the confirmation modal.
 * Sends completion % to the backend so it can apply progressive overload.
 * Creates a new plan_card row in Supabase and marks the old one inactive.
 */
const ResetWorkoutButton = ({ userId, experienceLevel, onReset, profile, hasExistingPlan }) => {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(false);
  const [prevCard, setPrevCard]         = useState(null);   // previous active plan card
  const [olderCard, setOlderCard]       = useState(null);   // the card before the active one
  const [highScoreCount, setHighScoreCount] = useState(0);
  const [fetchingCard, setFetchingCard] = useState(false);
  const equipmentPref = profile?.equipment_preference || 'gym';
  const [allPlanCards, setAllPlanCards] = useState([]);

  // ── Load all plan cards whenever modal opens ──────
  useEffect(() => {
    if (!isModalOpen || !userId) return;

    const loadAllCards = async () => {
      setFetchingCard(true);
      try {
        const { data } = await supabase
          .from('plan_cards')
          .select('*')
          .eq('user_id', userId)
          .order('generated_at', { ascending: false });
        
        if (data) {
          setAllPlanCards(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingCard(false);
      }
    };
    loadAllCards();
  }, [isModalOpen, userId]);

  // ── Evaluate track-specific progression whenever equipmentPref changes ──
  useEffect(() => {
    if (allPlanCards.length === 0) {
      setPrevCard(null);
      setOlderCard(null);
      setHighScoreCount(0);
      return;
    }

    // Filter cards by the selected equipment track
    const trackCards = allPlanCards.filter(c => (c.equipment_preference || 'gym') === equipmentPref);
    
    if (trackCards.length > 0) {
      const activeCard = trackCards[0]; // The most recent card in this track
      setPrevCard(activeCard);
      
      const olderCards = trackCards.filter(c => c.id !== activeCard.id);
      setOlderCard(olderCards.length > 0 ? olderCards[0] : activeCard);

      const count = trackCards.filter(c => c.completion_pct >= 75.0).length;
      setHighScoreCount(count);
    } else {
      setPrevCard(null);
      setOlderCard(null);
      setHighScoreCount(0);
    }
  }, [equipmentPref, allPlanCards]);

  // ── Progression Preview Helpers ──────────────────────────────
  const getProgressionPreview = () => {
    if (!prevCard) return null;
    const pct = prevCard.completion_pct ?? 0;
    
    let weightDelta = 0;
    if (pct < 50) weightDelta = -2.5;
    else if (pct < 75) weightDelta = 1.5;
    else weightDelta = 2.5;

    // For calisthenics, it's reps instead of weight
    const isCalisthenics = equipmentPref === 'calisthenics';
    const bumpValue = weightDelta > 0 ? (isCalisthenics ? `+${Math.floor(weightDelta/2.5)} Reps` : `+${weightDelta} kg`) : (isCalisthenics ? `Hold Reps` : `${weightDelta} kg`);

    const levelOrder = ['beginner', 'intermediate', 'pro'];
    const curIdx     = levelOrder.indexOf(prevCard.experience_level_at_generation ?? experienceLevel);
    
    let nextLevel = null;
    if (highScoreCount >= 6 && curIdx < 2) nextLevel = 'pro';
    else if (highScoreCount >= 4 && curIdx < 1) nextLevel = 'intermediate';

    return { pct: Math.round(pct), weightDelta, nextLevel, curIdx };
  };

  const preview = getProgressionPreview();

  const getBadgeColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':     return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'intermediate': return 'bg-blue-500/20   text-blue-400   border-blue-500/30';
      case 'pro':          return 'bg-purple-500/20  text-purple-400  border-purple-500/30';
      default:             return 'bg-white/10 text-white/60 border-white/10';
    }
  };

  // ── Generate Plan ─────────────────────────────────────────────
  const handleReset = async (mode) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // ── Anti-Spam: Limit generation to 4 per day ──
      // const todayStr = new Date().toISOString().split('T')[0];
      // const generatedToday = allPlanCards.filter(c => {
      //   if (!c.generated_at) return false;
      //   return c.generated_at.startsWith(todayStr);
      // });
      //
      // if (generatedToday.length >= 4) {
      //   throw new Error("You have reached the daily limit of 4 plan generations. Please try again tomorrow.");
      // }

      let data = null;

      if (mode === 'keep_routine') {
        if (!prevCard || !prevCard.routine) throw new Error("No previous routine found to repeat.");
        data = {
          plan_duration_weeks: prevCard.plan_duration_weeks,
          total_workout_days: prevCard.total_workout_days,
          experience_level_at_generation: prevCard.experience_level_at_generation,
          weight_bump_applied: prevCard.weight_bump_applied,
          weekly_pattern: prevCard.routine.weekly_pattern,
          routine_data: prevCard.routine.routine_data
        };
      } else {
        let apiPayload = {
          user_id:              userId,
          experience_level:     profile?.experience_level || experienceLevel || 'intermediate',
          weight_kg:            profile?.weight_kg || 75.0,
          lifestyle_level:      profile?.lifestyle_level || 'Sedentary',
          injury_tag:           profile?.injury_tag || 'None',
          injury_state:         profile?.injury_state || 'None',
          target_goal:          profile?.target_goal || 'Muscle_Gain',
          schedule_choice:      profile?.schedule_choice || 'Pre-Built',
          custom_weekly_array:  profile?.custom_weekly_array,
          plan_duration_weeks:  profile?.plan_duration_weeks || 4,
          age:                  profile?.age || 25,
          equipment_preference: equipmentPref,
        };

        if (mode === 'progress') {
          apiPayload.prev_completion_pct = prevCard ? prevCard.completion_pct : null;
          apiPayload.prev_weight_bump = prevCard ? prevCard.weight_bump_applied || 0 : 0;
          apiPayload.high_score_count = highScoreCount;
        } else if (mode === 'keep_weight') {
          apiPayload.prev_completion_pct = null; // Skip weight modification
          apiPayload.prev_weight_bump = olderCard ? olderCard.weight_bump_applied || 0 : 0;
          apiPayload.high_score_count = 0;       // Skip level up
          apiPayload.experience_level = olderCard ? olderCard.experience_level_at_generation : apiPayload.experience_level;
        } else if (mode === 'reset_default') {
          apiPayload.prev_completion_pct = null;
          apiPayload.prev_weight_bump = 0;
          apiPayload.high_score_count = 0;
        }

        const res = await axios.post('/api/workout/reset', apiPayload);
        data = res.data;
      }

      // ── Create new plan card ─────────────────────────────────
      const { data: newCard, error: cardError } = await supabase
        .from('plan_cards')
        .insert([{
          user_id:                       userId,
          plan_duration_weeks:           data.plan_duration_weeks,
          total_workout_days:            data.total_workout_days,
          attended_days:                 0,
          skipped_days:                  0,
          streak:                        0,
          completion_pct:                0,
          is_active:                     true,
          experience_level_at_generation: data.experience_level_at_generation,
          weight_bump_applied:           data.weight_bump_applied,
          equipment_preference:          data.equipment_preference,
          routine:                       { weekly_pattern: data.weekly_pattern, routine_data: data.routine_data },
        }])
        .select()
        .single();

      if (cardError) {
        console.error('Failed to create plan card:', cardError);
        throw new Error("Failed to save the new plan to your profile.");
      }

      // ── Mark old card inactive ───────────────────────────────
      if (prevCard?.id) {
        await supabase
          .from('plan_cards')
          .update({ is_active: false })
          .eq('id', prevCard.id);
      }

      setSuccess(true);
      setIsModalOpen(false);

      if (onReset && data) {
        onReset({
          ...data,
          plan_card_id: newCard?.id ?? null,
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while generating the plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 p-5 border border-white/10 rounded-2xl shadow-md bg-white/5 max-w-sm transition-all hover:bg-white/10">
      <div className="flex justify-between items-center w-full">
        <h3 className="font-semibold text-white text-lg">Your Active Plan</h3>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getBadgeColor(experienceLevel)} uppercase tracking-wider`}>
          {experienceLevel || 'Unknown'}
        </span>
      </div>

      <p className="text-sm text-white/50 leading-relaxed">
        Generate a new adaptive plan. The Delta Engine checks your previous card's performance before building your next routine.
      </p>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95"
      >
        {hasExistingPlan ? '🔄 Regenerate Plan' : '⚡ Generate Adaptive Plan'}
      </button>

      {success && (
        <div className="w-full p-3 mt-2 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-xl border border-emerald-500/30 animate-fade-in flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          New plan generated!
        </div>
      )}

      {/* ── Confirmation Modal ─────────────────────────────── */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#15151a] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <h2 className="text-2xl font-bold text-white mb-1">Generate New Plan?</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              This will archive your current routine and generate a fresh one.{' '}
              <span className="font-semibold text-white">Your history and plan cards are never deleted.</span>
              <br/><br/>
              Generating for environment: <span className="text-violet-400 font-bold uppercase tracking-wider">{equipmentPref === 'gym' ? 'Full Gym Access' : 'Home / No Equip'}</span>
            </p>

            {/* Progression Preview */}
            {fetchingCard ? (
              <div className="mb-6 flex items-center gap-3 text-white/40 text-sm">
                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                Analyzing previous performance…
              </div>
            ) : prevCard && preview ? (
              <div className="mb-6 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40">Previous Card Performance</span>
                  <span className={`text-sm font-black ${preview.pct >= 85 ? 'text-emerald-400' : preview.pct >= 70 ? 'text-amber-400' : 'text-white/60'}`}>
                    {preview.pct}%
                  </span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className={`flex items-center gap-2 text-sm font-semibold ${preview.weightDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className="text-base">{preview.weightDelta > 0 ? '⚡' : '📉'}</span>
                    Progression: {preview.bumpValue} applied to {equipmentPref === 'calisthenics' ? 'baseline reps' : 'all exercises'}
                  </div>
                  {preview.nextLevel ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                      <span className="text-base">🎯</span>
                      Level UP: {prevCard.experience_level_at_generation} → {preview.nextLevel}
                    </div>
                  ) : preview.curIdx === 2 ? (
                    <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
                      <span className="text-base">🏆</span>
                      Already at max level (Pro)
                    </div>
                  ) : null}
                </div>
              </div>
            ) : hasExistingPlan ? (
              <div className="mb-6 p-4 rounded-xl border border-white/5 bg-black/20 text-white/40 text-sm">
                No completion data found for previous plan — generating at current level.
              </div>
            ) : null}

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 text-red-300 text-sm font-medium rounded-xl border border-red-500/30 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 mt-4">
              <button
                onClick={() => handleReset('progress')}
                disabled={isLoading || fetchingCard}
                className="w-full p-4 flex flex-col items-start gap-1 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/50 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="text-base text-violet-300">Generate with Progression</span>
                <span className="text-xs text-white/50 font-normal">Calculates progression based on past performance.</span>
              </button>
              
              <button
                onClick={() => handleReset('keep_routine')}
                disabled={isLoading || fetchingCard || !prevCard}
                className="w-full p-4 flex flex-col items-start gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="text-base">Keep Same Routine</span>
                <span className="text-xs text-white/50 font-normal">Re-generates your last routine exactly as it was.</span>
              </button>

              <button
                onClick={() => handleReset('keep_weight')}
                disabled={isLoading || fetchingCard || !prevCard}
                className="w-full p-4 flex flex-col items-start gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="text-base">Revert to Prev Weight</span>
                <span className="text-xs text-white/50 font-normal">Generates a routine using the weight modifier of your LAST plan.</span>
              </button>

              <button
                onClick={() => handleReset('reset_default')}
                disabled={isLoading || fetchingCard}
                className="w-full p-4 flex flex-col items-start gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-left"
              >
                <span className="text-base text-rose-400">Reset to Default</span>
                <span className="text-xs text-white/50 font-normal">Generates a fresh baseline plan without any modifiers.</span>
              </button>
              
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-black text-white/60 text-sm font-medium hover:text-white rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ResetWorkoutButton;
