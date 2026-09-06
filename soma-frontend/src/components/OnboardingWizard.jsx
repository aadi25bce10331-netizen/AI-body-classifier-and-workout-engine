import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const ScrollPicker = ({ min, max, value, onChange, suffix }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-val="${value}"]`);
      if (el) {
        el.scrollIntoView({ block: 'center' });
      }
    }
  }, []); // Only on mount to set initial position

  return (
    <div className="relative h-[300px] w-full max-w-[200px] mx-auto">
      {/* Center highlight lines */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[72px] border-y-2 border-violet-500/50 bg-violet-500/5 pointer-events-none rounded-xl" />
      
      <div 
        ref={scrollRef}
        className="h-full overflow-y-auto custom-scrollbar snap-y snap-mandatory scroll-smooth flex flex-col items-center"
      >
        <div className="h-[114px] shrink-0" />
        {Array.from({length: max - min + 1}, (_, i) => min + i).map(num => (
          <div 
            key={num}
            data-val={num}
            onClick={() => {
               onChange(num);
               scrollRef.current.querySelector(`[data-val="${num}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }}
            className={`h-[72px] shrink-0 flex items-center justify-center snap-center cursor-pointer transition-all duration-300 w-full text-center
              ${value === num ? 'text-violet-400 scale-110 font-black text-5xl' : 'text-white/20 font-bold text-3xl hover:text-white/40'}`}
          >
            {num} {value === num && suffix && <span className="text-sm ml-1 text-violet-400/50">{suffix}</span>}
          </div>
        ))}
        <div className="h-[114px] shrink-0" />
      </div>
    </div>
  )
}

const OnboardingWizard = () => {
  const { user, reloadProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    gender: 'male',
    age: 25,
    weight_kg: 75,
    height_cm: 175,
    target_goal: 'Muscle_Gain',
    experience_level: 'beginner',
    lifestyle_level: 'Sedentary',
    injury_tag: 'None',
    injury_state: 'None',
    schedule_choice: 'Pre-Built',
    plan_duration_weeks: 4,
    equipment_preference: 'gym',
  });

  const [photo, setPhoto] = useState(null);
  
  const handleValChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const submitData = async (skipPhoto = false) => {
    setLoading(true);

    const dataPayload = new FormData();
    Object.keys(formData).forEach(key => {
      dataPayload.append(key, formData[key]);
    });
    
    if (!skipPhoto && photo) {
      dataPayload.append('photo', photo);
    }

    try {
      let analysis = null;
      if (!skipPhoto && photo) {
        const res = await axios.post('/api/analyze', dataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        analysis = res.data;
      }

      // Save to Supabase Profiles
      const payload = {
        id: user.id,
        updated_at: new Date().toISOString(),
        age: parseInt(formData.age),
        gender: formData.gender,
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        target_goal: formData.target_goal,
        experience_level: formData.experience_level,
        plan_duration_weeks: parseInt(formData.plan_duration_weeks),
        lifestyle_level: formData.lifestyle_level,
        injury_tag: formData.injury_tag,
        injury_state: formData.injury_state,
        schedule_choice: formData.schedule_choice,
        equipment_preference: formData.equipment_preference
      };

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
      alert(err.response?.data?.detail || err.message || "An error occurred during analysis.");
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please upload a smaller photo.");
        e.target.value = '';
        setPhoto(null);
        return;
      }
      setPhoto(file);
    }
  };

  const totalSteps = 8;

  return (
    <div className="fixed inset-0 z-[100] bg-[#1c1c1c]/95 backdrop-blur-3xl flex flex-col overflow-hidden text-white font-sans">
      
      {/* Header */}
      <div className="pt-12 px-6 shrink-0 max-w-md mx-auto w-full">
        {step > 1 && (
          <button onClick={prevStep} disabled={loading} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors mb-6">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-10">
          <div 
            className="h-full bg-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-32">
        <div className="max-w-md mx-auto h-full flex flex-col justify-center">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Tell Us About Yourself!</h2>
              <p className="text-white/40 mb-12 text-sm">To give you a better experience and results we need to know your gender.</p>
              
              <div className="flex flex-col gap-6 items-center">
                <button 
                  onClick={() => handleValChange('gender', 'male')}
                  className={`group w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 ${formData.gender === 'male' ? 'bg-gradient-to-br from-violet-600 to-cyan-500 shadow-[0_0_40px_rgba(124,58,237,0.5)] scale-110 border-transparent' : 'bg-[#1a1a24] border border-white/5 hover:-translate-y-2 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'}`}
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">♂</span>
                  <span className="font-bold">Male</span>
                </button>
                <button 
                  onClick={() => handleValChange('gender', 'female')}
                  className={`group w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 ${formData.gender === 'female' ? 'bg-gradient-to-br from-violet-600 to-cyan-500 shadow-[0_0_40px_rgba(124,58,237,0.5)] scale-110 border-transparent' : 'bg-[#1a1a24] border border-white/5 hover:-translate-y-2 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'}`}
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">♀</span>
                  <span className="font-bold">Female</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <h2 className="text-3xl font-black mb-2 text-white tracking-tight">How Old Are You?</h2>
              <p className="text-white/40 mb-12 text-sm">Age in years. This will help us to personalize an exercise program plan that suits you.</p>
              <ScrollPicker min={14} max={80} value={formData.age} onChange={(v) => handleValChange('age', v)} />
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <h2 className="text-3xl font-black mb-2 text-white tracking-tight">What is Your Weight?</h2>
              <p className="text-white/40 mb-12 text-sm">Weight in kg. Don't worry, you can always change it later.</p>
              <ScrollPicker min={40} max={150} value={formData.weight_kg} onChange={(v) => handleValChange('weight_kg', v)} suffix="kg" />
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <h2 className="text-3xl font-black mb-2 text-white tracking-tight">What is Your Height?</h2>
              <p className="text-white/40 mb-12 text-sm">Height in cm. Don't worry, you can always change it later.</p>
              <ScrollPicker min={120} max={220} value={formData.height_cm} onChange={(v) => handleValChange('height_cm', v)} suffix="cm" />
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-black mb-2 text-white tracking-tight text-center">What is Your Goal?</h2>
              <p className="text-white/40 mb-8 text-sm text-center">You can change this later.</p>
              
              <div className="flex flex-col gap-4">
                {[
                  { id: 'Muscle_Gain', label: 'Build Muscle', icon: '💪' },
                  { id: 'Fat_Loss', label: 'Lose Fat', icon: '🔥' },
                  { id: 'Maintenance', label: 'Maintenance / Fitness', icon: '🏃' }
                ].map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => handleValChange('target_goal', goal.id)}
                    className={`group flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${formData.target_goal === goal.id ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/10 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.3)] scale-[1.02]' : 'bg-[#1a1a24] border-white/5 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl group-hover:scale-110 transition-transform">{goal.icon}</span>
                      <span className="font-black text-lg">{goal.label}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.target_goal === goal.id ? 'border-cyan-400 bg-cyan-500' : 'border-white/20 group-hover:border-violet-500/50'}`}>
                      {formData.target_goal === goal.id && <div className="w-2.5 h-2.5 bg-[#1c1c1c] rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-black mb-2 text-white tracking-tight text-center">Physical Activity Level?</h2>
              <p className="text-white/40 mb-8 text-sm text-center">Choose your regular activity level.</p>
              
              <div className="flex flex-col gap-4">
                {[
                  { id: 'Sedentary', label: 'Sedentary (Desk Job)', sub: 'Little to no exercise' },
                  { id: 'Lightly Active', label: 'Lightly Active', sub: '5-8k steps / Light exercise' },
                  { id: 'Highly Active', label: 'Highly Active', sub: 'Manual labor / 10k+ steps' }
                ].map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => handleValChange('lifestyle_level', lvl.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${formData.lifestyle_level === lvl.id ? 'bg-gradient-to-br from-violet-600 to-cyan-600 border-transparent shadow-[0_0_30px_rgba(139,92,246,0.4)] text-white scale-[1.02]' : 'bg-[#1a1a24] border-white/5 text-white/60 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]'}`}
                  >
                    <span className="font-black text-xl">{lvl.label}</span>
                    <span className="text-sm opacity-70 mt-1">{lvl.sub}</span>
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-black mt-10 mb-4 text-white tracking-tight text-center">Gym Experience</h2>
              <div className="flex gap-2 bg-[#1a1a24] p-2 rounded-2xl border border-white/5 shadow-inner">
                {[
                  { id: 'beginner', label: 'Beginner' },
                  { id: 'intermediate', label: 'Inter' },
                  { id: 'pro', label: 'Pro' }
                ].map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => handleValChange('experience_level', exp.id)}
                    className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all duration-300 uppercase tracking-widest ${formData.experience_level === exp.id ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-black mb-2 text-white tracking-tight text-center">Training Preferences</h2>
              <p className="text-white/40 mb-8 text-sm text-center">Tailor your workouts to your environment and medical needs.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-3 px-1">Where will you train?</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleValChange('equipment_preference', 'gym')}
                      className={`group flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 ${formData.equipment_preference === 'gym' ? 'bg-gradient-to-br from-violet-600/20 to-cyan-500/10 border-violet-500 text-cyan-300 shadow-[0_0_30px_rgba(139,92,246,0.2)]' : 'bg-[#1a1a24] border-white/5 text-white/40 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]'}`}
                    >
                      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏋️</span>
                      <span className="font-black text-sm text-center">Full Gym Access</span>
                    </button>
                    <button
                      onClick={() => handleValChange('equipment_preference', 'calisthenics')}
                      className={`group flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 ${formData.equipment_preference === 'calisthenics' ? 'bg-gradient-to-br from-violet-600/20 to-cyan-500/10 border-violet-500 text-cyan-300 shadow-[0_0_30px_rgba(139,92,246,0.2)]' : 'bg-[#1a1a24] border-white/5 text-white/40 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]'}`}
                    >
                      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🤸</span>
                      <span className="font-black text-sm text-center">No Equipment</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-3 px-1">Any Injuries? (Optional)</label>
                  <select name="injury_tag" value={formData.injury_tag} onChange={(e) => handleValChange('injury_tag', e.target.value)} className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-5 py-4 text-white font-black focus:border-violet-500 focus:shadow-[0_0_20px_rgba(139,92,246,0.2)] outline-none appearance-none transition-all duration-300 mb-3">
                    <option value="None">None / Healthy</option>
                    <option value="lumbar_disc">Lumbar Disc (Lower Back)</option>
                    <option value="patellar_tendon">Patellar Tendon (Knee)</option>
                    <option value="rotator_cuff">Rotator Cuff (Shoulder)</option>
                    <option value="cervical_spine">Cervical Spine (Neck)</option>
                    <option value="ac_joint">AC Joint (Shoulder)</option>
                    <option value="tennis_elbow">Tennis Elbow</option>
                    <option value="plantar_fasciitis">Plantar Fasciitis (Foot)</option>
                    <option value="wrist_tfcc">Wrist / TFCC</option>
                  </select>
                  {formData.injury_tag !== 'None' && (
                    <select name="injury_state" value={formData.injury_state} onChange={(e) => handleValChange('injury_state', e.target.value)} className="w-full bg-rose-500/10 border border-rose-500/40 rounded-xl px-5 py-4 text-rose-300 font-black focus:border-rose-400 focus:shadow-[0_0_20px_rgba(244,63,94,0.3)] outline-none appearance-none transition-all duration-300">
                      <option value="None">Healthy</option>
                      <option value="Acute">Acute (Rehab Required)</option>
                      <option value="Chronic">Chronic (Limit Frequency)</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
               <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-violet-500/20">
                <span className="text-4xl">📸</span>
              </div>
              <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Scan Body</h2>
              <p className="text-white/40 mb-10 text-sm max-w-sm mx-auto">Upload a full-body photo for personalized Somatotype analysis and custom Macro targets.</p>
              
              <div className="max-w-xs mx-auto relative group mb-6">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className={`border-2 border-dashed ${photo ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'border-white/20 bg-[#1a1a24]'} rounded-3xl p-10 transition-all duration-300 group-hover:border-violet-500 group-hover:bg-violet-500/5 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]`}>
                  {photo ? (
                    <div>
                      <span className="text-cyan-400 text-4xl mb-3 block animate-bounce">✅</span>
                      <p className="font-black text-cyan-400 truncate px-2 text-lg">{photo.name}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-white/40 text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">📁</span>
                      <p className="font-black text-white/80 tracking-wide">Tap to upload photo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1c1c1c] via-[#1c1c1c]/90 to-transparent shrink-0 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          {step < totalSteps ? (
            <button 
              onClick={nextStep}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-black px-8 py-4 rounded-xl transition-all duration-300 active:scale-95 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:brightness-110 text-lg tracking-widest uppercase"
            >
              Continue
            </button>
          ) : (
            <>
              <button 
                onClick={() => submitData(false)}
                disabled={loading || !photo}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-black px-8 py-4 rounded-xl transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110 text-lg tracking-widest uppercase"
              >
                {loading && photo ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Run Delta Engine'}
              </button>
              <button 
                onClick={() => submitData(true)}
                disabled={loading}
                className="w-full py-3 text-white/40 font-bold hover:text-white transition-colors text-sm uppercase tracking-widest"
              >
                Skip photo for now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
