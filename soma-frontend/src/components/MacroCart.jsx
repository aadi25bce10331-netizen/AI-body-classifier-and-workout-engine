import React, { useState } from 'react';
import { foodDatabase } from '../data/foodDatabase';
import { supabase } from '../supabaseClient';

const CATEGORIES = [
  { label: 'Veg',        filter: 'veg'        },
  { label: 'Non-Veg',    filter: 'non_veg'    },
  { label: 'Nuts & Seeds', filter: 'dry_fruits' },
  { label: 'Presets',    filter: 'presets'    },
];

const MacroCart = ({ dailyTargets = { calories: 2400, protein: 180, carbs: 240, fat: 80 }, user, profile }) => {
  const [cart, setCart]           = useState([]);
  const [activeCategory, setActiveCategory] = useState('veg');
  const [presets, setPresets]     = useState(profile?.meal_presets || []);
  const [savingPreset, setSavingPreset] = useState(false);

  const savePreset = async () => {
    if (cart.length === 0 || !user) return;
    setSavingPreset(true);
    try {
      const newPreset = {
        id: Date.now(),
        name: `Meal Preset ${presets.length + 1}`,
        items: [...cart],
        totals: {
          calories: totals.calories,
          protein_g: totals.protein,
          carbs_g: totals.carbs,
          fat_g: totals.fat,
        }
      };
      
      // Limit to 7 presets, keep newest
      const updatedPresets = [...presets, newPreset].slice(-7);
      
      const { error } = await supabase
        .from('profiles')
        .update({ meal_presets: updatedPresets })
        .eq('id', user.id);
        
      if (error) throw error;
      setPresets(updatedPresets);
    } catch (err) {
      alert("Failed to save preset: " + err.message);
    } finally {
      setSavingPreset(false);
    }
  };

  const loadPreset = (preset) => {
    setCart([...preset.items]);
  };

  const addToCart = (food) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === food.id);
      return existing
        ? prev.map(i => i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...food, quantity: 1 }];
    });
  };

  const removeFromCart = (foodId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === foodId);
      return existing?.quantity > 1
        ? prev.map(i => i.id === foodId ? { ...i, quantity: i.quantity - 1 } : i)
        : prev.filter(i => i.id !== foodId);
    });
  };

  const totals = cart.reduce((acc, item) => ({
    calories: acc.calories + item.nutritional_info.calories * item.quantity,
    protein:  acc.protein  + item.nutritional_info.protein_g * item.quantity,
    carbs:    acc.carbs    + item.nutritional_info.carbs_g   * item.quantity,
    fat:      acc.fat      + item.nutritional_info.fat_g     * item.quantity,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const bars = [
    { label: 'Calories', cur: totals.calories, target: dailyTargets.calories, color: 'bg-emerald-400' },
    { label: 'Protein',  cur: totals.protein,  target: dailyTargets.protein,  color: 'bg-blue-400'   },
    { label: 'Carbs',    cur: totals.carbs,    target: dailyTargets.carbs,    color: 'bg-yellow-400' },
    { label: 'Fat',      cur: totals.fat,      target: dailyTargets.fat,      color: 'bg-red-400'    },
  ];

  const visibleFoods = foodDatabase.filter(f => f.category === activeCategory);

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:h-full">

      {/* ── LEFT: Food Catalog ──────────────────────────────── */}
      <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col overflow-hidden h-[400px] md:h-auto md:flex-1 md:min-h-0 shadow-2xl">

        {/* Catalog header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/5 shrink-0 bg-[#12121a]/30">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Food Catalog</p>
          {/* Category filter buttons */}
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.filter}
                onClick={() => setActiveCategory(cat.filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeCategory === cat.filter
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 border border-violet-500'
                    : 'bg-white/5 text-white/40 border border-transparent hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list (Foods or Presets) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {activeCategory === 'presets' ? (
            presets.length === 0 ? (
              <p className="text-center text-white/30 text-sm mt-10">No saved presets yet. Build a meal and click 'Save as Preset'.</p>
            ) : presets.map(preset => (
              <div
                key={preset.id}
                className="group flex items-center justify-between px-4 py-3 rounded-2xl border border-white/5 bg-[#12121a]/60 hover:bg-[#1a1a24] hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm leading-tight truncate text-white/90">{preset.name}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{preset.items.length} items · {preset.totals.calories} kcal</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] font-mono text-blue-300">P {preset.totals.protein_g}g</span>
                    <span className="text-[10px] font-mono text-yellow-300">C {preset.totals.carbs_g}g</span>
                    <span className="text-[10px] font-mono text-red-300">F {preset.totals.fat_g}g</span>
                  </div>
                </div>
                <button
                  onClick={() => loadPreset(preset)}
                  className="ml-4 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white font-bold text-xs transition-all duration-300 shrink-0 shadow-sm hover:shadow-md hover:shadow-emerald-500/20"
                >
                  Load
                </button>
              </div>
            ))
          ) : (
            visibleFoods.length === 0 ? (
              <p className="text-center text-white/30 text-sm mt-10">No items in this category.</p>
            ) : visibleFoods.map(food => {
              const inCart = cart.find(i => i.id === food.id);
              return (
                <div
                  key={food.id}
                  className="group flex items-center justify-between px-4 py-3 rounded-2xl border border-white/5 bg-[#12121a]/60 hover:bg-[#1a1a24] hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm leading-tight truncate text-white/90">{food.name}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{food.serving_size} · {food.nutritional_info.calories} kcal</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] font-mono text-blue-300">P {food.nutritional_info.protein_g}g</span>
                      <span className="text-[10px] font-mono text-yellow-300">C {food.nutritional_info.carbs_g}g</span>
                      <span className="text-[10px] font-mono text-red-300">F {food.nutritional_info.fat_g}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(food)}
                    className="ml-4 w-10 h-10 rounded-full bg-violet-500/10 hover:bg-violet-500 border border-violet-500/30 hover:border-violet-500 text-violet-400 hover:text-white font-black text-xl flex items-center justify-center transition-all duration-300 shrink-0 group-hover:scale-110 active:scale-95 shadow-sm hover:shadow-md hover:shadow-violet-500/20"
                  >
                    {inCart ? <span className="text-sm font-black">×{inCart.quantity}</span> : '+'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart & Targets ───────────────────────────── */}
      <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col overflow-hidden h-[400px] md:h-auto md:flex-1 md:min-h-0 shadow-2xl">

        {/* Macro progress */}
        <div className="px-5 pt-5 pb-4 border-b border-white/5 shrink-0 space-y-3 bg-[#12121a]/30">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Daily Targets</p>
          {bars.map(({ label, cur, target, color }) => {
            const pct = Math.min(100, (cur / target) * 100);
            const over = cur > target;
            return (
              <div key={label}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="font-semibold text-white/50 uppercase">{label}</span>
                  <span className={over ? 'text-red-400 font-bold' : 'text-white/40'}>
                    {Math.round(cur)} / {target}
                    {over && ' ↑'}
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart list */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Selected Foods</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 text-white/20">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
              <p className="text-white/30 text-sm font-semibold">Add foods from the catalog</p>
            </div>
          ) : cart.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-[#12121a]/60 px-4 py-3 rounded-2xl border border-white/5 hover:bg-[#1a1a24] transition-colors group/item"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="bg-violet-500/10 text-violet-400 text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-violet-500/30">
                  ×{item.quantity}
                </span>
                <span className="text-sm font-bold truncate text-white/90">{item.name}</span>
              </div>
              <div className="flex gap-1.5 ml-3 shrink-0">
                <button
                  onClick={() => addToCart(item)}
                  className="w-8 h-8 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-500 font-black text-lg flex items-center justify-center transition-all bg-emerald-500/10 border border-emerald-500/20 shadow-sm"
                >+</button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 rounded-xl text-red-400 hover:text-white hover:bg-red-500 font-black text-lg flex items-center justify-center transition-all bg-red-500/10 border border-red-500/20 shadow-sm"
                >−</button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Save Preset Button */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-white/5 bg-[#12121a]/30 shrink-0">
            <button
              onClick={savePreset}
              disabled={savingPreset}
              className="w-full py-3 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-black transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20 active:scale-[0.98] uppercase tracking-widest"
            >
              {savingPreset ? 'Saving...' : (
                <><svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg> Save as Preset</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MacroCart;
