
import React, { useState, useMemo, useEffect } from 'react';
import { Sun, Sparkles, CloudRain, Users, PieChart, ArrowRight, TrendingUp, AlertCircle, Calendar, Calculator, Heart, Store, Clock, Footprints, MousePointerClick, ChevronRight, Coins, MapPin } from 'lucide-react';
import { AppState } from '../../types';
import { MentorTip } from '../UI';
import { calculateTotalFixedCostPerDay } from '../../utils/calculations';

interface TrafficProps {
  state: AppState;
  updateNestedState: (category: keyof AppState, field: string, value: any) => void;
  setTrafficScenario: (type: 'normal' | 'weekend' | 'rainy') => void;
  results: any;
}

// Custom Cute Slider Component
const CuteSlider: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max: number;
    step?: number;
    icon: React.ElementType;
    colorTheme: 'orange' | 'blue' | 'pink' | 'green';
    suffix?: string;
    description?: string;
}> = ({ label, value, onChange, min = 0, max, step = 1, icon: Icon, colorTheme, suffix = '', description }) => {
    
    const themes = {
        orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'accent-orange-500', range: 'bg-orange-200' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'accent-blue-500', range: 'bg-blue-200' },
        pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', accent: 'accent-pink-500', range: 'bg-pink-200' },
        green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', accent: 'accent-green-500', range: 'bg-green-200' },
    }[colorTheme];

    return (
        <div className={`p-5 rounded-3xl border-2 transition-all hover:shadow-md hover:-translate-y-1 duration-300 ${themes.bg} ${themes.border}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-white shadow-sm ${themes.text}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <p className={`text-base font-bold text-stone-700 font-cute leading-relaxed`}>{label}</p>
                        {description && <p className="text-xs text-stone-500 font-bold font-cute leading-relaxed mt-0.5">{description}</p>}
                    </div>
                </div>
                <div className="bg-white px-4 py-1.5 rounded-xl shadow-sm border border-stone-200">
                    <span className={`text-xl font-black ${themes.text} font-cute`}>{value}</span>
                    <span className="text-xs text-stone-500 ml-1 font-bold">{suffix}</span>
                </div>
            </div>
            
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className={`w-full h-4 rounded-full appearance-none cursor-pointer ${themes.range} ${themes.accent} hover:opacity-90 transition-opacity`}
            />
            <div className="flex justify-between mt-2 text-xs font-bold text-stone-500 px-1 font-cute">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};

const Traffic: React.FC<TrafficProps> = ({ state, updateNestedState, setTrafficScenario, results }) => {
  
  // --- Local Simulation States ---
  const [daysOpenPerMonth, setDaysOpenPerMonth] = useState(26);
  const [distributionMode, setDistributionMode] = useState<'equal' | 'custom'>('equal');
  const [popularityWeights, setPopularityWeights] = useState<Record<string, number>>({});

  // Initialize weights
  useEffect(() => {
      setPopularityWeights(prev => {
          const newWeights = { ...prev };
          state.menuItems.forEach(m => {
              if (newWeights[m.id] === undefined) {
                  newWeights[m.id] = 5; 
              }
          });
          return newWeights;
      });
  }, [state.menuItems.length]);

  // --- Calculations ---
  const monthlyRevenue = results.revenue * daysOpenPerMonth;
  const monthlyProfit = results.profit * daysOpenPerMonth;
  const totalDailyUnits = results.unitsSold;
  
  const totalWeight = useMemo(() => {
      return state.menuItems.reduce((sum, item) => sum + (popularityWeights[item.id] || 5), 0);
  }, [state.menuItems, popularityWeights]);

  const getUnitsForMenu = (menuId: string) => {
      if (state.menuItems.length === 0) return 0;
      if (distributionMode === 'equal') {
          return totalDailyUnits / state.menuItems.length;
      } else {
          const weight = popularityWeights[menuId] || 5;
          const share = totalWeight > 0 ? weight / totalWeight : 0;
          return totalDailyUnits * share;
      }
  };

  // --- LOCATION PRESETS ---
  const LOCATION_PRESETS = [
      { id: 'market', label: 'ตลาดนัด', traffic: 120, conv: 15, avg: 1.5, desc: 'คนเยอะ แต่รีบเดิน' },
      { id: 'school', label: 'หน้าโรงเรียน', traffic: 80, conv: 35, avg: 1.2, desc: 'ช่วงเช้า/เย็น คนซื้อเยอะ' },
      { id: 'office', label: 'ใต้ออฟฟิศ', traffic: 60, conv: 25, avg: 2.5, desc: 'กำลังซื้อสูง ซื้อทีละเยอะ' },
      { id: 'comm', label: 'ชุมชน/หมู่บ้าน', traffic: 30, conv: 40, avg: 1.8, desc: 'คนน้อย แต่ลูกค้าประจำ' },
  ];

  const applyPreset = (preset: any) => {
      updateNestedState('traffic', 'customersPerHour', preset.traffic);
      updateNestedState('traffic', 'conversionRate', preset.conv);
      updateNestedState('traffic', 'avgUnitPerBill', preset.avg);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20 font-cute">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="py-2">
            <h2 className="text-4xl font-bold text-stone-800 flex items-center gap-3 drop-shadow-sm leading-relaxed">
                <span className="text-4xl">🚦</span> จำลองการขาย (Simulation)
            </h2>
            <p className="text-stone-500 font-bold mt-2 text-base ml-1 leading-relaxed">ลองปรับค่าต่างๆ เพื่อดูความเป็นไปได้ของร้านเรา</p>
          </div>
          
          {/* Scenario Pills */}
          <div className="flex gap-2 p-1.5 bg-white rounded-2xl border-2 border-stone-100 shadow-sm">
             {[
                 { id: 'normal', label: 'วันธรรมดา', icon: Sun, color: 'hover:bg-orange-100 hover:text-orange-600', active: 'bg-orange-400 text-white shadow-md' },
                 { id: 'weekend', label: 'วันหยุดปังๆ', icon: Sparkles, color: 'hover:bg-purple-100 hover:text-purple-600', active: 'bg-purple-500 text-white shadow-md' },
                 { id: 'rainy', label: 'วันฝนตก', icon: CloudRain, color: 'hover:bg-blue-100 hover:text-blue-600', active: 'bg-blue-400 text-white shadow-md' }
             ].map((btn) => (
                 <button 
                    key={btn.id}
                    onClick={() => setTrafficScenario(btn.id as any)} 
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm leading-relaxed ${state.isWorstCase ? 'opacity-50' : ''} ${state.traffic.customersPerHour === (btn.id === 'rainy' ? 20 : btn.id === 'weekend' ? 120 : 60) ? btn.active : `text-stone-500 ${btn.color}`}`}
                 >
                     <btn.icon size={16} strokeWidth={2.5}/> {btn.label}
                 </button>
             ))}
          </div>
      </div>

      <MentorTip 
        tips={[
            {
                title: "ไม่รู้จะใส่ตัวเลขอะไร? 🤔",
                desc: "ลองกดเลือก 'ทำเลจำลอง' ด้านล่างได้เลยครับ ระบบจะใส่ค่าเฉลี่ยของทำเลนั้นๆ ให้ แล้วค่อยปรับเพิ่ม-ลด ตามความจริงของร้านเรา"
            },
            {
                title: "Traffic คือหัวใจ! ❤️",
                desc: "ถ้าทำเลดีมีคนเดินผ่านเยอะ โอกาสขายได้ก็เยอะตาม ลองปรับ 'คนเดินผ่าน' และ '% คนซื้อ' ดูนะครับ ว่าถ้าวันไหนคนน้อย เราจะรอดไหม"
            }
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls & Forecast (7 Cols) */}
          <div className="xl:col-span-7 space-y-8">
              
              {/* 1. Daily Result Ticket */}
              <div className="relative group cursor-default">
                  {/* Ticket Shape with Pastel Gradient */}
                  <div className="bg-gradient-to-br from-orange-100 via-pink-100 to-indigo-100 rounded-[2.5rem] p-8 relative shadow-xl shadow-stone-200 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500 border-4 border-white">
                      
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/40 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                          
                          {/* Left Side: Sales Volume */}
                          <div className="text-center md:text-left">
                              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                                  <div className="p-2 bg-white rounded-xl shadow-sm">
                                      <Sparkles size={20} className="text-orange-400 animate-pulse" />
                                  </div>
                                  <p className="text-stone-600 text-sm font-bold uppercase tracking-wider">ยอดขายรายวัน (Daily)</p>
                              </div>
                              <div className="flex items-baseline gap-2 justify-center md:justify-start mt-2">
                                  <span className="text-6xl font-black text-stone-800 drop-shadow-sm tracking-tight">
                                      {Math.floor(results.unitsSold)}
                                  </span>
                                  <span className="text-xl font-bold text-stone-500">ชิ้น</span>
                              </div>
                              <p className="text-sm text-stone-500 mt-2 font-bold bg-white/50 px-3 py-1 rounded-full inline-block">
                                  เฉลี่ย ~{state.traffic.openHours > 0 ? Math.ceil(results.unitsSold / state.traffic.openHours) : 0} ชิ้น/ชม.
                              </p>
                          </div>

                          {/* Divider for Mobile */}
                          <div className="w-full h-px bg-stone-300/30 md:hidden"></div>
                          <div className="hidden md:block w-px h-24 bg-stone-300/30"></div>

                          {/* Right Side: Profit */}
                          <div className="text-center md:text-right">
                               <div className="flex items-center gap-2 mb-2 justify-center md:justify-end">
                                   <p className="text-stone-600 text-sm font-bold uppercase tracking-wider">กำไรขั้นต้น (Est. Profit)</p>
                                   <div className="p-1 bg-white rounded-full shadow-sm">
                                      <Coins size={16} className="text-yellow-500"/>
                                   </div>
                               </div>
                               <p className={`text-5xl font-black drop-shadow-sm leading-relaxed py-1 ${results.profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                   ฿{results.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                               </p>
                               <p className="text-xs text-stone-500 font-bold mt-1">
                                   (ยังไม่หักค่าที่/ค่าแรงรายวัน)
                               </p>
                          </div>
                      </div>
                  </div>
                  
                  {/* Ticket Cutouts */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-[#FFF9F2] rounded-full z-20 shadow-inner"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-[#FFF9F2] rounded-full z-20 shadow-inner"></div>
              </div>

              {/* 2. The Controller Panel */}
              <div className="bg-white p-8 rounded-[3rem] border-2 border-stone-100 shadow-xl shadow-stone-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-orange-200 via-pink-200 to-indigo-200"></div>
                  
                  {/* NEW: Location Presets */}
                  <div className="mb-8">
                      <h3 className="font-bold text-sm text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <MapPin size={16}/> เลือกทำเลจำลอง (Quick Presets)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {LOCATION_PRESETS.map(preset => (
                              <button
                                  key={preset.id}
                                  onClick={() => applyPreset(preset)}
                                  className="p-3 rounded-2xl border-2 border-stone-100 hover:border-orange-300 hover:bg-orange-50 transition-all text-left group"
                              >
                                  <div className="font-bold text-stone-700 group-hover:text-orange-600">{preset.label}</div>
                                  <div className="text-[10px] text-stone-400 mt-1">{preset.desc}</div>
                              </button>
                          ))}
                      </div>
                  </div>

                  <h3 className="font-bold text-xl text-stone-700 flex items-center gap-2 mb-6 leading-relaxed mt-2 border-t border-stone-100 pt-6">
                      <Store className="text-orange-400" /> ปัจจัยยอดขายรายวัน (Daily Drivers)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CuteSlider 
                          label="เปิดกี่ชั่วโมง?" 
                          value={state.traffic.openHours} 
                          onChange={v => updateNestedState('traffic', 'openHours', v)} 
                          max={24} icon={Clock} colorTheme="orange" suffix="ชม."
                      />
                      <CuteSlider 
                          label="คนเดินผ่านหน้าร้าน" 
                          value={state.traffic.customersPerHour} 
                          onChange={v => updateNestedState('traffic', 'customersPerHour', v)} 
                          max={500} step={10} icon={Footprints} colorTheme="blue" suffix="คน/ชม."
                          description="ยิ่งทำเลดี ตัวเลขนี้ยิ่งสูง"
                      />
                      <CuteSlider 
                          label="โอกาสคนแวะซื้อ" 
                          value={state.traffic.conversionRate} 
                          onChange={v => updateNestedState('traffic', 'conversionRate', v)} 
                          max={50} icon={MousePointerClick} colorTheme="pink" suffix="%"
                          description={`~${Math.ceil(state.traffic.customersPerHour * (state.traffic.conversionRate/100))} ลูกค้า/ชม.`}
                      />
                      <CuteSlider 
                          label="ซื้อกี่ชิ้นต่อคน?" 
                          value={state.traffic.avgUnitPerBill} 
                          onChange={v => updateNestedState('traffic', 'avgUnitPerBill', v)} 
                          max={10} step={0.1} icon={ArrowRight} colorTheme="green" suffix="ชิ้น"
                          description="Avg. Basket Size"
                      />
                  </div>
              </div>

              {/* 3. Monthly Planner Card */}
              <div className="group bg-gradient-to-br from-[#FFF9F2] to-white p-8 rounded-[3rem] border-2 border-orange-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Calendar size={180} className="text-orange-900" />
                  </div>
                  
                  <div className="relative z-10">
                      <h3 className="font-bold text-xl text-stone-700 flex items-center gap-2 mb-6 leading-relaxed">
                          <Calendar className="text-orange-500" /> ภาพรวมรายเดือน (Monthly Forecast)
                      </h3>

                      <div className="flex items-center gap-6 mb-8 bg-white/80 p-6 rounded-3xl border border-orange-100 backdrop-blur-sm">
                           <div className="flex-1">
                               <label className="text-sm font-bold text-stone-500 uppercase mb-3 block ml-1 leading-relaxed">เปิดร้านกี่วัน / เดือน?</label>
                               <input 
                                  type="range" 
                                  min="1" 
                                  max="31" 
                                  value={daysOpenPerMonth} 
                                  onChange={e => setDaysOpenPerMonth(Number(e.target.value))}
                                  className="w-full h-4 bg-stone-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                               />
                           </div>
                           <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-orange-100 min-w-[100px] text-center">
                               <span className="text-4xl font-black text-stone-800">{daysOpenPerMonth}</span>
                               <span className="text-xs font-bold text-stone-500 block leading-relaxed mt-1">วัน</span>
                           </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-6 rounded-[2rem] border-2 border-stone-50 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-1 transition-transform">
                              <p className="text-sm font-bold text-stone-500 uppercase mb-1 leading-relaxed">รายรับรวม (Revenue)</p>
                              <p className="text-3xl font-black text-stone-800 mt-auto">฿{monthlyRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                          </div>
                          <div className={`bg-white p-6 rounded-[2rem] border-2 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-1 transition-transform ${monthlyProfit > 0 ? 'border-green-100' : 'border-red-100'}`}>
                              <p className="text-sm font-bold text-stone-500 uppercase mb-1 leading-relaxed">กำไรสุทธิ (Net Profit)</p>
                              <p className={`text-3xl font-black mt-auto ${monthlyProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {monthlyProfit > 0 ? '+' : ''}฿{monthlyProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT COLUMN: Menu Board (5 Cols) */}
          <div className="xl:col-span-5 flex flex-col h-full gap-6">
               <div className="bg-white p-8 rounded-[3rem] border-2 border-stone-100 shadow-xl shadow-pink-100/50 flex-1 flex flex-col relative overflow-hidden">
                   {/* Decorative Tape */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-pink-100/50 rotate-3 rounded-sm"></div>

                   <div className="mb-6 relative z-10">
                       <h3 className="font-bold text-xl text-stone-700 flex items-center gap-2 mb-2 leading-relaxed">
                          <PieChart className="text-pink-500" /> สัดส่วนยอดขาย (Sales Mix)
                       </h3>
                       <p className="text-sm text-stone-500 font-bold font-cute leading-relaxed">เมนูไหนขายดีกว่ากัน? ปรับได้เลย!</p>
                   </div>

                   {/* Mode Toggle Pills */}
                   <div className="flex p-1.5 bg-stone-100 rounded-2xl mb-6 relative z-10">
                       <button 
                          onClick={() => setDistributionMode('equal')}
                          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 leading-relaxed ${distributionMode === 'equal' ? 'bg-white text-stone-800 shadow-md transform scale-100' : 'text-stone-400 hover:text-stone-600 scale-95'}`}
                       >
                           ขายเท่าๆ กัน
                       </button>
                       <button 
                          onClick={() => setDistributionMode('custom')}
                          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 leading-relaxed ${distributionMode === 'custom' ? 'bg-white text-pink-500 shadow-md transform scale-100' : 'text-stone-400 hover:text-stone-600 scale-95'}`}
                       >
                           กำหนดเอง ✨
                       </button>
                   </div>

                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 relative z-10 pb-4">
                       {state.menuItems.map((menu, idx) => {
                           const dailyUnits = getUnitsForMenu(menu.id);
                           const weight = popularityWeights[menu.id] || 5;
                           const sharePercent = totalDailyUnits > 0 ? (dailyUnits / totalDailyUnits) * 100 : 0;
                           
                           // Calculate Menu Profit
                           const baseCost = menu.ingredients.reduce((s, i) => s + i.cost, 0);
                           const realCost = baseCost * (1 + (state.hiddenPercentages.waste + state.hiddenPercentages.promoLoss + state.hiddenPercentages.paymentFee)/100);
                           const profitPerUnit = menu.sellingPrice - realCost;
                           const totalMenuProfit = profitPerUnit * dailyUnits;

                           return (
                               <div key={menu.id} className="p-5 rounded-[2rem] border-2 border-stone-50 bg-stone-50/30 hover:bg-white hover:border-pink-200 hover:shadow-md transition-all group duration-300">
                                   <div className="flex justify-between items-start mb-3">
                                       <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-white border border-stone-100 flex items-center justify-center text-xs font-bold text-stone-400 shadow-sm shrink-0">
                                               {idx + 1}
                                           </div>
                                           <div className="min-w-0">
                                                <h4 className="font-bold text-stone-700 text-sm line-clamp-1 leading-relaxed py-0.5">{menu.name}</h4>
                                                <p className="text-[10px] text-stone-500 font-bold bg-white px-1.5 rounded inline-block border border-stone-100 mt-0.5 leading-relaxed">
                                                    กำไร ฿{profitPerUnit.toFixed(1)}/ชิ้น
                                                </p>
                                           </div>
                                       </div>
                                       <div className="text-right shrink-0">
                                           <p className="font-black text-stone-800 text-lg">{Math.round(dailyUnits)} <span className="text-[10px] font-bold text-stone-400">ชิ้น</span></p>
                                           <p className={`text-[10px] font-bold ${totalMenuProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                               รวม ฿{totalMenuProfit.toFixed(0)}
                                           </p>
                                       </div>
                                   </div>

                                   {/* Equal Bar Visual */}
                                   {distributionMode === 'equal' && (
                                       <div className="w-full bg-stone-200 h-2 rounded-full mt-2 overflow-hidden">
                                            <div className="bg-pink-300 h-full rounded-full" style={{ width: `${sharePercent}%` }}></div>
                                       </div>
                                   )}

                                   {/* Custom Slider */}
                                   {distributionMode === 'custom' && (
                                       <div className="mt-3 pt-3 border-t border-stone-100/50 animate-in fade-in slide-in-from-top-1">
                                           <div className="flex justify-between text-[10px] font-bold text-stone-400 mb-2 leading-relaxed">
                                               <span className="flex items-center gap-1"><Heart size={10} className="text-pink-400 fill-pink-400"/> ความนิยม: {weight}/10</span>
                                               <span className="text-pink-400">{sharePercent.toFixed(0)}% Share</span>
                                           </div>
                                           <input 
                                              type="range" 
                                              min="1" 
                                              max="10" 
                                              step="1"
                                              value={weight}
                                              onChange={(e) => setPopularityWeights(prev => ({ ...prev, [menu.id]: Number(e.target.value) }))}
                                              className="w-full h-3 bg-pink-100 rounded-full appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
                                           />
                                       </div>
                                   )}
                               </div>
                           );
                       })}
                   </div>

                   {/* Footer Info */}
                   <div className="mt-2 pt-4 border-t border-dashed border-stone-200 text-center relative z-10">
                       <p className="text-xs text-stone-400 font-bold flex items-center justify-center gap-1 leading-relaxed">
                           <Calculator size={12}/> ตัวเลขยอดขายรวมอิงจาก Traffic ฝั่งซ้าย
                       </p>
                   </div>
               </div>
          </div>

      </div>
    </div>
  );
};

export default Traffic;
