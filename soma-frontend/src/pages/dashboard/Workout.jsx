import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ResetWorkoutButton from '../../components/ResetWorkoutButton';
import { supabase } from '../../supabaseClient';
import axios from 'axios';

const Workout = () => {
  const { user, profile } = useAuth();

  // The full routine object: { weekly_pattern: [], routine_data: {} }
  const [routine, setRoutine]           = useState(null);
  const [loadingPlan, setLoadingPlan]   = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Active plan card tracking
  const [activePlanCard, setActivePlanCard]     = useState(null);
  const [attendedDays, setAttendedDays]         = useState(new Set()); // set of day indices already logged in this card

  // ── Midnight Lock state ──────────────────────────────────────
  const [completedToday, setCompletedToday] = useState(false);  // true if a workout was already logged today
  const [maxDayIndex, setMaxDayIndex]       = useState(0);      // the furthest day the user can access based on real elapsed time

  // ── Profile Update Detection State ───────────────────────────
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingPlan, setUpdatingPlan]       = useState(false);

  // Complete Workout Modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [rpe, setRpe]                   = useState(7);
  const [completionPct, setCompletionPct] = useState(100);
  const [logNotes, setLogNotes]         = useState('');
  const [logging, setLogging]           = useState(false);
  const [logSuccess, setLogSuccess]     = useState(false);

  const scrollRef    = useRef(null);
  const durationWeeks = profile?.plan_duration_weeks || 4;
  const totalDays     = durationWeeks * 7;

  // ── Fetch persistent plan & active plan card on mount ───────
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) return;
      try {
        const [planRes, cardRes] = await Promise.all([
          supabase
            .from('workout_plans')
            .select('routine, plan_duration_weeks')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('plan_cards')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('generated_at', { ascending: false })
            .limit(1)
            .single(),
        ]);

        if (planRes.data?.routine) setRoutine(planRes.data.routine);
        if (cardRes.data)          setActivePlanCard(cardRes.data);

        // Also load which days have already been completed for this card
        if (cardRes.data?.id) {
          const { data: histRows } = await supabase
            .from('workout_history')
            .select('day_index, created_at')
            .eq('plan_card_id', cardRes.data.id);
          if (histRows) {
            setAttendedDays(new Set(histRows.map((r) => r.day_index)));

            // ── Midnight Lock: check if any log was made today ──
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const loggedToday = histRows.some(
              (r) => new Date(r.created_at) >= todayStart
            );
            setCompletedToday(loggedToday);
          }

          // ── Timeline Sync: compute max accessible day index ──
          const planStart = new Date(cardRes.data.generated_at);
          planStart.setHours(0, 0, 0, 0);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const elapsed = Math.floor((now - planStart) / 86400000);
          setMaxDayIndex(Math.max(0, elapsed));

          // ── Profile Update Detection ──
          if (profile?.updated_at) {
            const profileUpdated = new Date(profile.updated_at);
            const planGenerated = new Date(cardRes.data.generated_at);
            // Give a 1-minute buffer to avoid false positives during instant onboarding
            if (profileUpdated.getTime() > planGenerated.getTime() + 60000) {
              const dismissed = localStorage.getItem(`dismissed_update_${cardRes.data.id}`);
              if (!dismissed) {
                setShowUpdateModal(true);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching plan or card:', err);
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchPlan();
  }, [user]);

  // ── Routine generated callback ───────────────────────────────
  const handleRoutineGenerated = async (response) => {
    const newRoutine = {
      weekly_pattern: response.weekly_pattern,
      routine_data:   response.routine_data,
    };
    setRoutine(newRoutine);
    setLogSuccess(false);
    setAttendedDays(new Set());

    // Reload active plan card (just created by ResetWorkoutButton)
    try {
      const { data } = await supabase
        .from('plan_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();
      setActivePlanCard(data || null);
    } catch {}

    // Persist routine to workout_plans
    try {
      await supabase
        .from('workout_plans')
        .upsert({
          user_id:             user.id,
          plan_duration_weeks: profile?.plan_duration_weeks || 4,
          routine:             newRoutine,
          created_at:          new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } catch (err) {
      console.error('Failed to persist plan:', err);
    }
  };

  // ── Handle Mid-Plan Profile Update Regeneration ────────────────
  const handleMidPlanRegen = async () => {
    setUpdatingPlan(true);
    try {
      const apiPayload = {
        user_id:              user.id,
        experience_level:     profile?.experience_level || 'intermediate',
        weight_kg:            profile?.weight_kg || 75.0,
        lifestyle_level:      profile?.lifestyle_level || 'Sedentary',
        injury_tag:           profile?.injury_tag || 'None',
        injury_state:         profile?.injury_state || 'None',
        target_goal:          profile?.target_goal || 'Muscle_Gain',
        schedule_choice:      profile?.schedule_choice || 'Pre-Built',
        custom_weekly_array:  profile?.custom_weekly_array,
        plan_duration_weeks:  profile?.plan_duration_weeks || 4,
        age:                  profile?.age || 25,
        equipment_preference: profile?.equipment_preference || 'gym',
        prev_completion_pct:  null, // Do not change weight
        prev_weight_bump:     activePlanCard?.weight_bump_applied || 0, // Keep current progression
        high_score_count:     0     // Do not level up
      };

      const res = await axios.post('/api/workout/reset', apiPayload);
      const data = res.data;

      // Create new plan card
      const { data: newCard, error: cardError } = await supabase
        .from('plan_cards')
        .insert([{
          user_id:                       user.id,
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

      if (cardError) throw cardError;

      // Mark old card inactive
      if (activePlanCard?.id) {
        await supabase
          .from('plan_cards')
          .update({ is_active: false })
          .eq('id', activePlanCard.id);
      }

      setShowUpdateModal(false);
      handleRoutineGenerated(data);
    } catch (err) {
      alert("Failed to generate updated plan: " + (err.response?.data?.detail || err.message));
    } finally {
      setUpdatingPlan(false);
    }
  };

  const dismissUpdateModal = () => {
    if (activePlanCard?.id) {
      localStorage.setItem(`dismissed_update_${activePlanCard.id}`, 'true');
    }
    setShowUpdateModal(false);
  };

  // ── Swap to Calisthenics Day ─────────────────────────────────
  const [swapping, setSwapping] = useState(false);
  const handleSwapDay = async () => {
    if (!selectedWorkout || !routine) return;
    setSwapping(true);
    try {
      const dayName = calendarDays[selectedDayIndex].assignedGroup;
      
      const currentEqPref = selectedWorkout.equipment_preference || profile?.equipment_preference || 'gym';
      const newEqPref = currentEqPref === 'gym' ? 'calisthenics' : 'gym';

      const payload = {
        user_id: user.id,
        muscle_group: selectedWorkout.muscle_group,
        experience_level: profile?.experience_level || 'intermediate',
        injury_tag: profile?.injury_tag || 'None',
        injury_state: profile?.injury_state || 'None',
        lifestyle_level: profile?.lifestyle_level || 'Sedentary',
        weight_kg: profile?.weight_kg || 75.0,
        age: profile?.age || 25,
        target_goal: profile?.target_goal || 'Muscle_Gain',
        equipment_preference: newEqPref,
        weight_bump_applied: newEqPref === 'calisthenics' ? 0 : (activePlanCard?.weight_bump_applied || 0)
      };

      const res = await axios.post('/api/workout/swap_day', payload);
      const newDayWorkout = res.data.day_workout;

      const newRoutine = { ...routine };
      newRoutine.routine_data = { ...newRoutine.routine_data };
      newRoutine.routine_data[dayName] = newDayWorkout;
      
      setRoutine(newRoutine);

      // Persist to workout_plans
      await supabase
        .from('workout_plans')
        .update({ routine: newRoutine })
        .eq('user_id', user.id);
        
    } catch (err) {
      alert("Failed to swap to no equipment: " + err.message);
    } finally {
      setSwapping(false);
    }
  };

  // ── Day helpers ──────────────────────────────────────────────
  const getWorkoutForDay = (dayIndex) => {
    if (!routine?.weekly_pattern || !routine?.routine_data) return null;
    const dayName = routine.weekly_pattern[dayIndex % 7];
    if (!dayName || dayName.toLowerCase() === 'rest') return null;
    return routine.routine_data[dayName];
  };

  const calendarDays = Array.from({ length: totalDays }, (_, i) => {
    const dayNames      = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const assignedGroup = routine?.weekly_pattern ? routine.weekly_pattern[i % 7] : null;
    const isLocked      = activePlanCard ? i > maxDayIndex : false; // Midnight Lock: future days are locked
    return {
      index:       i,
      dayName:     dayNames[i % 7],
      dayNumber:   i + 1,
      hasWorkout:  assignedGroup && assignedGroup.toLowerCase() !== 'rest',
      assignedGroup,
      completed:   attendedDays.has(i),
      locked:      isLocked,
    };
  });

  const selectedWorkout = getWorkoutForDay(selectedDayIndex);

  // ── Log completed workout ────────────────────────────────────
  const handleLogWorkout = async () => {
    if (!selectedWorkout) return;
    setLogging(true);

    try {
      // ── Auto-create a plan card if none exists ──────────────
      // This handles users who had a workout plan before the plan_cards
      // table was created — we bootstrap one now on first completion.
      let currentCard = activePlanCard;

      if (!currentCard && routine) {
        const durationWeeks = profile?.plan_duration_weeks || 4;
        const weeklyPattern = routine.weekly_pattern || [];

        // Count total scheduled (non-rest) workout days for the full plan
        const totalWorkoutDays = weeklyPattern.filter(
          (d) => d.toLowerCase() !== 'rest'
        ).length * durationWeeks;

        const { data: newCard, error: cardErr } = await supabase
          .from('plan_cards')
          .insert([{
            user_id:                        user.id,
            plan_duration_weeks:            durationWeeks,
            total_workout_days:             totalWorkoutDays || 1,
            attended_days:                  0,
            skipped_days:                   0,
            streak:                         0,
            completion_pct:                 0,
            is_active:                      true,
            experience_level_at_generation: profile?.experience_level || 'beginner',
            weight_bump_applied:            0,
            routine:                        routine,
          }])
          .select()
          .single();

        if (cardErr) {
          console.error('Failed to auto-create plan card:', cardErr);
        } else {
          currentCard = newCard;
          setActivePlanCard(newCard);
        }
      }

      // 1. Insert into workout_history
      const { error: histErr } = await supabase
        .from('workout_history')
        .insert([{
          user_id:         user.id,
          created_at:      new Date().toISOString(),
          muscle_group:    selectedWorkout.muscle_group,
          completion_rate: completionPct / 100,
          avg_rpe:         rpe,
          notes:           logNotes || null,
          plan_card_id:    currentCard?.id || null,
          day_index:       selectedDayIndex,
        }]);

      if (histErr) throw histErr;

      // 2. Update attended set locally
      const newAttended = new Set([...attendedDays, selectedDayIndex]);
      setAttendedDays(newAttended);

      // 3. Recalculate plan card stats
      if (currentCard?.id) {
        const attended    = newAttended.size;
        const total       = currentCard.total_workout_days || 1;
        const newPct      = Math.min((attended / total) * 100, 100);

        // Streak: count consecutive attended days ending at selectedDayIndex
        let streak = 0;
        for (let d = selectedDayIndex; d >= 0; d--) {
          const day = calendarDays[d];
          if (!day?.hasWorkout) continue;       // skip rest days in the count
          if (newAttended.has(d)) {
            streak++;
          } else {
            break;
          }
        }

        // Skipped: scheduled workout days before today without completion
        const today       = new Date();
        const planStart   = new Date(currentCard.generated_at);
        const daysPassed  = Math.floor((today - planStart) / 86400000);
        const skipped     = calendarDays
          .filter((d) => d.hasWorkout && d.index < daysPassed && !newAttended.has(d.index))
          .length;

        await supabase
          .from('plan_cards')
          .update({
            attended_days:  attended,
            skipped_days:   skipped,
            streak,
            completion_pct: parseFloat(newPct.toFixed(2)),
          })
          .eq('id', currentCard.id);

        setActivePlanCard((prev) => ({
          ...prev,
          attended_days:  attended,
          skipped_days:   skipped,
          streak,
          completion_pct: parseFloat(newPct.toFixed(2)),
        }));
      }

      setShowLogModal(false);
      setLogSuccess(true);
      setCompletedToday(true);  // Lock further completions until tomorrow
      setLogNotes('');
    } catch (err) {
      alert('Failed to save log: ' + err.message);
    } finally {
      setLogging(false);
    }
  };

  const rpeLabels = {
    1: 'Very Easy', 2: 'Easy', 3: 'Moderate', 4: 'Somewhat Hard',
    5: 'Hard', 6: 'Hard+', 7: 'Very Hard', 8: 'Very Hard+',
    9: 'Extremely Hard', 10: 'Max Effort'
  };


  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <div className="w-6 h-6 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white/40 text-sm font-semibold">Loading plan…</span>
      </div>
    );
  }

  // ── Plan Card Stats ───────────────────────────────────────────
  const cardPct      = activePlanCard ? Math.round(activePlanCard.completion_pct) : 0;
  const cardAttended = activePlanCard?.attended_days ?? 0;
  const cardTotal    = activePlanCard?.total_workout_days ?? 0;
  const cardStreak   = activePlanCard?.streak ?? 0;

  const pctColor =
    cardPct >= 85 ? 'from-emerald-500 to-cyan-400' :
    cardPct >= 70 ? 'from-amber-500 to-yellow-400' :
    'from-violet-500 to-indigo-400';

  return (
    <div className="max-w-6xl">

      {/* ── Header Row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black">Adaptive Schedule</h2>
        <span className="text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full text-xs font-bold border border-violet-500/20">
          Week {Math.floor(selectedDayIndex / 7) + 1} / {durationWeeks}
        </span>
      </div>

      {/* ── Active Plan Card (compact) ─────────────────────────── */}
      {activePlanCard && (
        <div className="mb-4 group relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 overflow-hidden transition-all duration-300">
          {/* Subtle glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative flex items-center gap-6">
            {/* Progress Ring */}
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <circle cx="28" cy="28" r="24" fill="none" stroke="url(#progressGrad)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${cardPct * 1.508} 150.8`} className="transition-all duration-700" />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">{cardPct}%</span>
            </div>
            {/* Stats */}
            <div className="flex-1 flex items-center gap-6 overflow-x-auto">
              <MiniStat label="Attended" value={`${cardAttended}/${cardTotal}`} color="text-emerald-400" />
              <MiniStat label="Streak" value={cardStreak} icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 inline-block -mt-1 mr-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>} color="text-orange-400" />
              <MiniStat label="Skipped" value={activePlanCard?.skipped_days ?? 0} color="text-red-400" />
            </div>
            <div className="shrink-0 hidden sm:block">
              <span className="text-[10px] font-bold uppercase text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">Live</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Calendar Strip ─────────────────────────────────────── */}
      <div className="mb-4">
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
          {calendarDays.map((day) => (
            <button
              key={day.index}
              onClick={() => { setSelectedDayIndex(day.index); setLogSuccess(false); }}
              className={`
                shrink-0 w-[60px] h-[72px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 snap-start relative group/day
                ${selectedDayIndex === day.index
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 scale-[1.08] border border-violet-400'
                  : day.locked
                    ? 'bg-[#0e0e12] text-white/20 border border-white/[0.03] hover:bg-white/[0.04] hover:text-white/40 hover:scale-[1.03]'
                    : day.completed
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/15 hover:scale-[1.03]'
                      : 'bg-[#12121a] text-white/40 border border-white/[0.04] hover:bg-white/[0.04] hover:text-white/70 hover:scale-[1.03] hover:border-white/10'
                }
              `}
            >
              {day.locked && selectedDayIndex !== day.index && <span className="absolute top-1 right-1 opacity-40"><svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-2.5 h-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg></span>}
              {day.completed && !day.locked && selectedDayIndex !== day.index && <span className="absolute top-1 right-1 text-emerald-400"><svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-2.5 h-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg></span>}
              {!day.completed && !day.locked && day.hasWorkout && day.index < maxDayIndex && selectedDayIndex !== day.index && <span className="absolute top-1 right-1 opacity-60 text-rose-400"><svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-2.5 h-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg></span>}
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">{day.dayName}</span>
              <span className="text-lg font-black leading-none">{day.dayNumber}</span>
              <div className="h-1 w-1 rounded-full mt-0.5">
                {day.hasWorkout && !day.completed && (
                  <div className={`h-full w-full rounded-full ${selectedDayIndex === day.index ? 'bg-white' : day.locked ? 'bg-white/20' : day.index < maxDayIndex ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content Grid ──────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Generate / Reset Button */}
          <div className="group relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 overflow-hidden hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative">
              <ResetWorkoutButton
                userId={user?.id}
                experienceLevel={profile?.experience_level || 'Intermediate'}
                onReset={handleRoutineGenerated}
                profile={profile}
                hasExistingPlan={!!routine}
              />
            </div>
          </div>

          {/* Variables Card */}
          <div className="group relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 overflow-hidden hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h3 className="relative text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Variables</h3>
            <div className="relative space-y-2.5">
              <VarRow label="Schedule" value={profile?.schedule_choice || 'Pre-Built'} />
              <VarRow label="Goal" value={profile?.target_goal?.replace('_', ' ') || 'Muscle Gain'} />
              <VarRow label="Injury" value={profile?.injury_state === 'None' ? 'Healthy' : `${profile?.injury_state}`} accent={profile?.injury_state !== 'None'} />
            </div>
          </div>
        </div>

        {/* Right Column: Routine */}
        <div className="lg:col-span-2">
          {!routine ? (
            <div className="group relative bg-black/40 backdrop-blur-2xl border border-dashed border-white/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center h-[300px] overflow-hidden hover:bg-white/[0.02] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-white/50"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                </div>
                <h4 className="font-black text-xl mb-2 text-white/90">No Active Routine</h4>
                <p className="text-white/40 text-sm">Generate your plan to get started.</p>
              </div>
            </div>
          ) : !selectedWorkout ? (
            <div className="group relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center h-[300px] overflow-hidden hover:bg-white/[0.02] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-white/50"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
                </div>
                <h4 className="font-black text-xl mb-2 text-white/90">Rest Day</h4>
                <p className="text-white/40 text-sm">Recovery is part of the programme.</p>
              </div>
            </div>
          ) : (
            <div className="group relative bg-black/40 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 shadow-xl shadow-black/50">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600/20 to-transparent px-6 py-5 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="font-black text-xl text-white">{selectedWorkout.muscle_group}</h4>
                  <p className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest mt-0.5">
                    {selectedWorkout.rest_seconds}s rest · Day {selectedDayIndex + 1}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs font-bold text-white/40 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                    {selectedWorkout.exercises.length} exercises
                  </span>
                  {(profile?.equipment_preference === 'gym' || !profile?.equipment_preference) && !attendedDays.has(selectedDayIndex) && (
                    <button 
                      onClick={handleSwapDay}
                      disabled={swapping}
                      className="text-[9px] font-bold uppercase tracking-widest bg-violet-600/20 text-violet-400 hover:bg-violet-600/40 hover:text-white border border-violet-500/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {swapping ? 'Swapping...' : (selectedWorkout.equipment_preference || profile?.equipment_preference || 'gym') === 'gym' ? 'Swap to No Equipment' : 'Swap to Gym'}
                    </button>
                  )}
                </div>
              </div>

              {/* Exercise List */}
              <div className="p-2">
                {selectedWorkout.exercises.map((ex, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-white/[0.03] rounded-xl transition-all duration-200 group/ex">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs font-black text-white/30 group-hover/ex:text-emerald-400 group-hover/ex:border-emerald-500/20 transition-colors shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-tight flex items-center flex-wrap gap-1.5">
                          {ex.name}
                          {ex.name.includes('[Posture]') && (
                            <span className="text-[9px] font-bold bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded uppercase">Posture</span>
                          )}
                          {ex.name.includes('[Chronic Cap') && (
                            <span className="text-[9px] font-bold bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded uppercase">1x/Wk</span>
                          )}
                        </p>
                        <p className="text-[10px] font-semibold text-white/30 mt-0.5 uppercase tracking-wider">
                          {ex.sets}×{ex.target_reps}{ex.time_based ? 's' : ''} • {ex.rest_seconds || selectedWorkout.rest_seconds}s rest
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-base text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/15 group-hover/ex:shadow-md group-hover/ex:shadow-emerald-500/10 transition-shadow shrink-0">
                      {ex.target_weight_kg}<span className="text-xs font-medium opacity-60 ml-0.5">kg</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Complete Footer */}
              <div className="px-6 py-5 border-t border-white/5 bg-black/40 backdrop-blur-md">
                {attendedDays.has(selectedDayIndex) ? (
                  <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm bg-emerald-500/10 border border-emerald-500/15 rounded-xl px-4 py-3">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Day {selectedDayIndex + 1} logged.
                  </div>
                ) : calendarDays[selectedDayIndex]?.locked ? (
                  <div className="flex items-center gap-2.5 text-white/35 font-semibold text-sm bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg> Locked — come back on Day {selectedDayIndex + 1}.
                  </div>
                ) : selectedDayIndex < maxDayIndex ? (
                  <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-sm bg-rose-500/10 border border-rose-500/15 rounded-xl px-4 py-3">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Missed Workout.
                  </div>
                ) : completedToday ? (
                  <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm bg-amber-500/10 border border-amber-500/15 rounded-xl px-4 py-3">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Already trained today. Come back tomorrow.
                  </div>
                ) : logSuccess ? (
                  <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm bg-emerald-500/10 border border-emerald-500/15 rounded-xl px-4 py-3">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Session logged.
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLogModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Complete Workout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RPE Log Modal ─────────────────────────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-[#1a1a24] border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.15)]">
            <h2 className="text-2xl font-black mb-2">Log Session</h2>
            <p className="text-white/30 text-xs mb-6">
              Rate your <span className="text-emerald-400 font-bold">{selectedWorkout?.muscle_group}</span> session.
            </p>

            {/* Completion % */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Completion</label>
                <span className="text-xl font-black text-white">{completionPct}%</span>
              </div>
              <input
                type="range" min="10" max="100" step="5"
                value={completionPct}
                onChange={(e) => setCompletionPct(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 rounded-full cursor-pointer"
              />
            </div>

            {/* RPE */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">RPE</label>
                <span className="text-xl font-black text-emerald-400">{rpe}/10</span>
              </div>
              <input
                type="range" min="1" max="10" step="0.5"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 rounded-full cursor-pointer"
              />
              <p className="text-center mt-1.5 text-xs font-semibold text-white/40">
                {rpeLabels[Math.round(rpe)] || 'Hard'}
              </p>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <textarea
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none placeholder:text-white/20"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowLogModal(false)}
                className="flex-1 py-3 text-white/50 font-bold hover:bg-white/5 rounded-xl transition border border-white/[0.06]"
              >
                Cancel
              </button>
              <button
                onClick={handleLogWorkout}
                disabled={logging}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black rounded-xl transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {logging ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mid-Plan Profile Update Modal ─────────────────────── */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-[#1a1a24] border border-violet-500/40 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(139,92,246,0.2)]">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 text-violet-400 rounded-2xl flex items-center justify-center text-3xl mb-5 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              📝
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Profile Change Detected</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              We noticed you updated your profile settings (e.g. {profile?.injury_tag !== 'None' ? 'Injury' : 'Environment/Goals'}) since generating your current plan. 
              <br/><br/>
              Would you like to continue with your existing routine, or generate a new set of exercises based on your new settings while <strong className="text-white">keeping your current weight/progression level</strong>?
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleMidPlanRegen}
                disabled={updatingPlan}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black rounded-xl transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98] disabled:opacity-50"
              >
                {updatingPlan ? 'Generating…' : 'Generate New Exercises (Keep Load)'}
              </button>
              
              <button
                onClick={dismissUpdateModal}
                disabled={updatingPlan}
                className="w-full py-3 border border-white/20 text-white/70 text-sm font-semibold rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Continue Current Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Helper Components ─────────────────────────────────────────
const MiniStat = ({ label, value, icon, color }) => (
  <div className="text-center shrink-0">
    <p className={`text-base font-black leading-none ${color}`}>
      {icon} {value}
    </p>
    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mt-0.5">{label}</p>
  </div>
);

const VarRow = ({ label, value, accent }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs text-white/35">{label}</span>
    <span className={`font-bold text-[11px] px-2 py-0.5 rounded-md ${accent ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-black/30 text-white/60'}`}>
      {value}
    </span>
  </div>
);

export default Workout;

