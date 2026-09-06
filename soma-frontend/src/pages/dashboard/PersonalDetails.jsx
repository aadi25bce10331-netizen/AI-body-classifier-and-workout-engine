import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-[#12121a]/80 border border-white/5 rounded-xl px-4 py-3 text-white font-bold text-sm hover:border-violet-500/30 focus:border-violet-500 focus:bg-[#12121a] focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300";
const selectCls = inputCls + " appearance-none cursor-pointer";

const PersonalDetails = () => {
  const { user, profile, reloadProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(profile?.somatotype ? profile : null);
  const [scheduleChoice, setScheduleChoice] = useState(profile?.schedule_choice || 'Pre-Built');
  const defaultCustom = ['Push', 'Pull', 'Legs', 'Rest', 'Upper', 'Lower', 'Rest'];
  const [customArray, setCustomArray] = useState(profile?.custom_weekly_array || defaultCustom);

  const handleCustomChange = (index, value) => {
    const a = [...customArray]; a[index] = value; setCustomArray(a);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const fv = Object.fromEntries(formData.entries());
    const hasPhoto = formData.get('photo')?.size > 0;

    try {
      let analysis = null;
      if (hasPhoto) {
        const res = await axios.post('/api/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        analysis = res.data;
        setResult(analysis);
      }

      const payload = {
        id: user.id,
        updated_at: new Date().toISOString(),
        age: parseInt(fv.age),
        gender: fv.gender,
        height_cm: parseFloat(fv.height_cm),
        weight_kg: parseFloat(fv.weight_kg),
        target_goal: fv.target_goal,
        experience_level: fv.experience_level,
        plan_duration_weeks: parseInt(fv.plan_duration_weeks),
        lifestyle_level: fv.lifestyle_level,
        injury_tag: fv.injury_tag,
        injury_state: fv.injury_state,
        schedule_choice: fv.schedule_choice,
        equipment_preference: fv.equipment_preference,
      };

      if (fv.schedule_choice === 'Custom') {
        payload.custom_weekly_array = customArray;
      }

      if (analysis) {
        payload.somatotype = analysis.somatotype;
        payload.daily_calories = analysis.workout_day_calories;
        payload.rest_day_calories = analysis.rest_day_calories;
        payload.protein_pct = analysis.macro_split.protein_pct;
        payload.carbs_pct = analysis.macro_split.carbs_pct;
        payload.fat_pct = analysis.macro_split.fat_pct;
      }

      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) throw error;
      await reloadProfile();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-auto md:h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-black">Biometrics</h2>
        {result && (
          <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> Analysed
          </span>
        )}
      </div>

      {/* Two-pane grid */}
      <div className="grid md:grid-cols-2 gap-4 flex-1 md:min-h-0">

        {/* LEFT: Form */}
        <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl md:overflow-y-auto custom-scrollbar shadow-2xl">
          <form onSubmit={handleSubmit} className="p-5 space-y-5">

            {/* Biometrics */}
            <section>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">Core Biometrics</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Age">
                  <input type="number" name="age" required defaultValue={profile?.age || ''} className={inputCls} placeholder="25" />
                </Field>
                <Field label="Gender">
                  <select name="gender" defaultValue={profile?.gender || 'male'} className={selectCls}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
                <Field label="Height (cm)">
                  <input type="number" name="height_cm" required defaultValue={profile?.height_cm || ''} className={inputCls} placeholder="175" />
                </Field>
                <Field label="Weight (kg)">
                  <input type="number" name="weight_kg" required defaultValue={profile?.weight_kg || ''} className={inputCls} placeholder="75" />
                </Field>
              </div>
            </section>

            <div className="h-px bg-white/[0.05]" />

            {/* Goals */}
            <section>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">Lifestyle & Goals</p>
              <div className="space-y-3">
                <Field label="Primary Goal">
                  <select name="target_goal" defaultValue={profile?.target_goal || 'Muscle_Gain'} className={selectCls}>
                    <option value="Muscle_Gain">Muscle Gain</option>
                    <option value="Fat_Loss">Fat Loss</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Experience">
                    <select name="experience_level" defaultValue={profile?.experience_level || 'beginner'} className={selectCls}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="pro">Pro</option>
                    </select>
                  </Field>
                  <Field label="Lifestyle (NEAT)">
                    <select name="lifestyle_level" defaultValue={profile?.lifestyle_level || 'Sedentary'} className={selectCls}>
                      <option value="Sedentary">Sedentary</option>
                      <option value="Lightly Active">Lightly Active</option>
                      <option value="Highly Active">Highly Active</option>
                    </select>
                  </Field>
                </div>
                <Field label="Training Environment">
                  <select name="equipment_preference" defaultValue={profile?.equipment_preference || 'gym'} className={selectCls}>
                    <option value="gym">Full Gym Access</option>
                    <option value="calisthenics">Home / No Equipment</option>
                  </select>
                </Field>
              </div>
            </section>

            <div className="h-px bg-white/[0.05]" />

            {/* Medical */}
            <section>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">Medical & Safety</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Injury Tag">
                  <select name="injury_tag" defaultValue={profile?.injury_tag || 'None'} className={selectCls}>
                    <option value="None">None / Healthy</option>
                    <option value="lumbar_disc">Lower Back</option>
                    <option value="patellar_tendon">Knee</option>
                    <option value="rotator_cuff">Shoulder</option>
                    <option value="cervical_spine">Neck</option>
                    <option value="ac_joint">AC Joint</option>
                    <option value="tennis_elbow">Tennis Elbow</option>
                    <option value="plantar_fasciitis">Foot</option>
                    <option value="wrist_tfcc">Wrist</option>
                  </select>
                </Field>
                <Field label="Injury State">
                  <select name="injury_state" defaultValue={profile?.injury_state || 'None'} className={selectCls}>
                    <option value="None">Healthy</option>
                    <option value="Acute">Acute</option>
                    <option value="Chronic">Chronic</option>
                  </select>
                </Field>
              </div>
            </section>

            <div className="h-px bg-white/[0.05]" />

            {/* Timeline */}
            <section>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">Program Timeline</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Schedule">
                  <select name="schedule_choice" value={scheduleChoice} onChange={(e) => setScheduleChoice(e.target.value)} className={selectCls}>
                    <option value="Pre-Built">Pre-Built</option>
                    <option value="Custom">Custom Array</option>
                  </select>
                </Field>
                <Field label="Duration">
                  <select name="plan_duration_weeks" defaultValue={profile?.plan_duration_weeks || 4} className={selectCls}>
                    <option value="4">4 Weeks</option>
                    <option value="8">8 Weeks</option>
                    <option value="12">12 Weeks</option>
                  </select>
                </Field>
              </div>

              {scheduleChoice === 'Custom' && (
                <div className="mt-3 p-3 bg-black/30 border border-white/[0.06] rounded-xl">
                  <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-2">Custom Week</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {customArray.map((day, idx) => (
                      <div key={idx}>
                        <p className="text-[8px] text-white/30 uppercase text-center mb-1">D{idx + 1}</p>
                        <select value={day} onChange={(e) => handleCustomChange(idx, e.target.value)}
                          className="w-full bg-black/50 border border-white/[0.08] rounded-md px-1 py-1.5 text-white text-[10px] outline-none appearance-none text-center">
                          {['Rest','Push','Pull','Legs','Upper','Lower','Full Body','Chest','Back','Arms','Shoulders','Core'].map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="h-px bg-white/[0.05]" />

            {/* Photo */}
            <section>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2">Somatotype Photo (Optional)</p>
              <input type="file" name="photo" accept="image/*"
                className="w-full text-white/50 text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-violet-500/20 file:text-violet-300 hover:file:bg-violet-500/30 transition cursor-pointer" />
            </section>

            <button type="submit" disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-4 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-violet-500/20 disabled:opacity-50 text-sm uppercase tracking-widest mt-6">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing…
                </span>
              ) : 'Run Delta Engine'}
            </button>
          </form>
        </div>

        {/* RIGHT: Output Panel */}
        <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl md:overflow-y-auto custom-scrollbar shadow-2xl">
          {result ? (
            <div className="p-5 space-y-4">
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Analysis Output</p>

              {/* Somatotype Banner */}
              <div className="group relative bg-black/40 border border-violet-500/30 rounded-2xl p-6 overflow-hidden hover:border-violet-500 transition-all duration-300 shadow-xl shadow-black/50">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1 relative z-10">Somatotype</p>
                <p className="text-4xl font-black text-white relative z-10 drop-shadow-md">{result.somatotype}</p>
              </div>

              {/* TDEE Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/50 transition-all duration-300 shadow-xl shadow-black/50">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Workout Day</p>
                  <p className="text-3xl font-black text-emerald-400 drop-shadow-md">{result.workout_day_calories || result.daily_calories}</p>
                  <p className="text-[10px] font-bold text-white/30 mt-1 uppercase tracking-widest">kcal / day</p>
                </div>
                <div className="group bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-violet-500/50 transition-all duration-300 shadow-xl shadow-black/50">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Rest Day</p>
                  <p className="text-3xl font-black text-violet-400 drop-shadow-md">{result.rest_day_calories || (result.daily_calories - 300)}</p>
                  <p className="text-[10px] font-bold text-white/30 mt-1 uppercase tracking-widest">kcal / day</p>
                </div>
              </div>

              {/* Macro Split */}
              {result.macro_split && (
                <div className="bg-[#12121a]/60 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Macro Split</p>
                  <div className="space-y-4">
                    {[
                      { label: 'Protein', pct: result.macro_split.protein_pct, color: 'bg-emerald-500' },
                      { label: 'Carbs',   pct: result.macro_split.carbs_pct,   color: 'bg-cyan-500' },
                      { label: 'Fat',     pct: result.macro_split.fat_pct,     color: 'bg-violet-500' },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{label}</span>
                          <span className="text-xs font-black text-white">{pct}%</span>
                        </div>
                        <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Summary */}
              <div className="bg-[#12121a]/60 border border-white/5 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Profile Summary</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: 'Age',        value: result.age || profile?.age },
                    { label: 'Gender',     value: result.gender || profile?.gender },
                    { label: 'Height',     value: `${result.height_cm || profile?.height_cm} cm` },
                    { label: 'Weight',     value: `${result.weight_kg || profile?.weight_kg} kg` },
                    { label: 'Goal',       value: (result.target_goal || profile?.target_goal || '').replace('_', ' ') },
                    { label: 'Level',      value: result.experience_level || profile?.experience_level },
                    { label: 'Environment',value: result.equipment_preference || profile?.equipment_preference },
                  ].map(({ label, value }) => value && (
                    <div key={label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                      <span className="text-white/40 font-bold uppercase tracking-wider">{label}</span>
                      <span className="font-black text-white/90 capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-black/40 border border-violet-500/20 flex items-center justify-center mb-4">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-violet-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
              </div>
              <p className="font-bold text-white/60 mb-1">No Analysis Yet</p>
              <p className="text-xs text-white/25 max-w-xs">Fill in the form and run the Delta Engine to see your somatotype and calorie targets here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
