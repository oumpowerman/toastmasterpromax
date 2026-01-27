
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronUp, Calculator, Trash2, X, ChevronLeft, ChevronRight, Pause, Play, HelpCircle, Scale, Box, Info, Star, Check } from 'lucide-react';

// --- NEW: CUTE BUTTON COMPONENT (REFACTOR) ---
interface CuteButtonProps {
    onClick?: () => void;
    label: string;
    icon?: React.ElementType;
    theme?: 'blue' | 'orange' | 'green' | 'red' | 'stone' | 'purple';
    subLabel?: string;
    className?: string;
    disabled?: boolean;
    active?: boolean;
}

export const CuteButton: React.FC<CuteButtonProps> = ({ 
    onClick, label, icon: Icon, theme = 'stone', subLabel, className = '', disabled, active 
}) => {
    const themes = {
        orange: 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-orange-200',
        blue: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-blue-200',
        green: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-emerald-200',
        red: 'bg-gradient-to-r from-rose-400 to-red-500 text-white shadow-rose-200',
        purple: 'bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-purple-200',
        stone: 'bg-white border-2 border-stone-100 text-stone-600 hover:border-orange-200 hover:text-orange-500'
    };

    const activeStyle = active ? 'ring-4 ring-offset-2 ring-orange-200 scale-95' : '';
    const baseStyle = theme === 'stone' ? themes.stone : `${themes[theme]} shadow-lg border-transparent`;

    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`
                relative px-6 py-3 rounded-[1.5rem] font-bold transition-all duration-200 
                flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${baseStyle} ${activeStyle} ${className}
            `}
        >
            {Icon && <Icon size={20} className={theme === 'stone' ? 'group-hover:scale-110 transition-transform' : 'text-white/90'} strokeWidth={2.5} />}
            <div className="text-left leading-none">
                <span className="block text-base">{label}</span>
                {subLabel && <span className="block text-[10px] opacity-80 font-medium mt-0.5">{subLabel}</span>}
            </div>
        </button>
    );
};

// --- NEW: PROGRESS BAR WITH CHEER LOGIC ---
export const CheerProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const validProgress = Math.min(100, Math.max(0, progress));
    
    // Logic: Message changes every 5%
    const getCheerMessage = (p: number) => {
        if (p === 0) return "เริ่มจัดของกันเถอะ! 📦";
        if (p === 100) return "สุดยอด! พร้อมรวยแล้ว 🎉";
        
        const step = Math.floor(p / 5);
        const messages = [
            "ก้าวแรกสำคัญสุด! 🌱", // 0-4
            "เครื่องเริ่มติดแล้ว 🔥", // 5-9
            "ไปต่อเลยครับ! 🚀", // 10-14
            "อย่าลืมของสำคัญนะ 💡", // 15-19
            "เยี่ยมมากครับ! 👍", // 20-24
            "ค่อยๆ เช็คไปนะ 🧐", // 25-29
            "ใกล้ถึงครึ่งทางแล้ว 🏃", // 30-34
            "ความจำดีเยี่ยม! 🧠", // 35-39
            "เกือบครึ่งแล้ว ฮึบๆ 💪", // 40-44
            "ครึ่งทางแล้ว! สุดยอด 🚩", // 45-49
            "เดินหน้าต่อเลย! 🌈", // 50-54
            "ความสำเร็จรออยู่ 🏆", // 55-59
            "ใกล้ความจริงแล้ว ✨", // 60-64
            "เก็บรายละเอียดอีกนิด 🔍", // 65-69
            "อีกนิดเดียววว 🔥", // 70-74
            "3 ใน 4 แล้ว! 🤩", // 75-79
            "ยอดเยี่ยมกระเทียมดอง 🧄", // 80-84
            "ใกล้ครบแล้ว ตื่นเต้น! 💓", // 85-89
            "อีกนิดเดียวจริงๆ! ⚡️", // 90-94
            "โค้งสุดท้ายแล้ว! 🏁", // 95-99
        ];
        return messages[Math.min(step, messages.length - 1)];
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border-4 border-white shadow-xl shadow-stone-100 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-stone-50 -z-10"></div>
           
           <div className="flex justify-between items-end mb-4 relative z-10">
               <div>
                   <h3 className="text-xl font-black text-stone-700 flex items-center gap-2">
                       ความพร้อม (Status) 
                       {validProgress === 100 && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-lg text-xs animate-bounce">Ready!</span>}
                   </h3>
                   <p className={`text-sm font-bold transition-all duration-300 ${validProgress === 100 ? 'text-green-500 scale-105 origin-left' : 'text-stone-400'}`}>
                       {getCheerMessage(validProgress)}
                   </p>
               </div>
               <div className="text-right">
                   <span className={`text-6xl font-black tracking-tighter transition-colors duration-500 ${validProgress === 100 ? 'text-green-500' : 'text-stone-800'}`}>
                       {Math.round(validProgress)}%
                   </span>
               </div>
           </div>
           
           <div className="w-full h-8 bg-stone-100 rounded-full overflow-hidden shadow-inner border border-stone-200 p-1.5 relative z-10">
               <div 
                 className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 relative shadow-sm ${validProgress === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-orange-300 to-pink-500'}`} 
                 style={{ width: `${Math.max(5, validProgress)}%` }}
               >
                   {/* Glitter Effect */}
                   <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                   
                   {validProgress >= 100 ? (
                       <Star className="text-white animate-spin-slow drop-shadow-md" size={16} fill="currentColor"/>
                   ) : (
                       <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
                   )}
               </div>
           </div>
       </div>
    );
};

export const MentorTip: React.FC<{ tips: { title: string, desc: string }[] }> = ({ tips }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextTip = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  }, [tips.length]);

  const prevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextTip, 8000); // Change tip every 8 seconds
    return () => clearInterval(interval);
  }, [isPaused, nextTip]);

  if (!isVisible) return null;

  return (
    <div 
      className="bg-blue-50/50 rounded-[2rem] border-2 border-blue-100 mb-6 relative animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-6 flex gap-5 items-start min-h-[140px]">
        {/* Icon */}
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-blue-100 shrink-0 z-10">
          🐻
        </div>

        {/* Content */}
        <div className="flex-1 pr-8 z-10">
          <div className="transition-opacity duration-500 ease-in-out">
            <p className="text-blue-800 font-bold text-lg font-cute mb-1 flex items-center gap-2">
              {tips[currentIndex].title}
              <span className="text-[10px] bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-sans">
                {currentIndex + 1}/{tips.length}
              </span>
            </p>
            <p className="text-stone-600 text-sm leading-relaxed">
              {tips[currentIndex].desc}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-1.5 text-blue-300 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors z-20"
          aria-label="Close tip"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={prevTip} className="p-1 hover:bg-blue-200 rounded-full text-blue-400 transition-colors">
            <ChevronLeft size={16} />
        </button>
        <button onClick={() => setIsPaused(!isPaused)} className="p-1 hover:bg-blue-200 rounded-full text-blue-400 transition-colors">
            {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
        </button>
        <button onClick={nextTip} className="p-1 hover:bg-blue-200 rounded-full text-blue-400 transition-colors">
            <ChevronRight size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-100">
        <div 
            className="h-full bg-blue-300 transition-all duration-[8000ms] ease-linear"
            style={{ 
                width: isPaused ? `${((currentIndex + 1) / tips.length) * 100}%` : '100%',
                transitionDuration: isPaused ? '0ms' : '8000ms',
                opacity: isPaused ? 0.5 : 1
            }}
            key={currentIndex} // Reset animation on index change
        ></div>
      </div>
    </div>
  );
};

export const ChartCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-stone-100 h-80">
    <h3 className="text-lg font-bold mb-6 text-stone-700 flex items-center gap-2">
      <div className="w-2 h-6 bg-orange-300 rounded-full"></div>
      {title}
    </h3>
    <div className="h-60 w-full">
      {children}
    </div>
  </div>
);

export const StrategyCard: React.FC<{ label: string, text: React.ReactNode }> = ({ label, text }) => (
  <div className="bg-white/80 p-6 rounded-[2rem] border-2 border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
    <p className="text-xs uppercase font-bold text-orange-400 mb-3 tracking-wider">{label}</p>
    <p className="text-sm text-stone-600 leading-relaxed font-medium">{text}</p>
  </div>
);

export const YieldHelper: React.FC<{ 
  label: string; 
  value: number; 
  id: string; 
  isOpen: boolean; 
  onToggle: () => void;
  onChange: (v: number) => void;
  onLabelChange?: (v: string) => void;
  onDelete?: () => void;
  canDelete?: boolean;
  image?: string; 
  unit?: string; // Added unit prop for auto-detection
}> = ({ label, value, isOpen, onToggle, onChange, onLabelChange, onDelete, canDelete, image, unit }) => {
  
  // Smart default based on unit
  const [mode, setMode] = useState<'unit' | 'weight'>(() => {
      // Common unit keywords that imply counting pieces
      const unitKeywords = ['ชิ้น', 'แผ่น', 'อัน', 'ฟอง', 'ลูก', 'กล่อง', 'ซอง', 'ถุง', 'ใบ'];
      if (unit && unitKeywords.some(u => unit.includes(u))) return 'unit';
      return 'unit'; // Default to unit anyway, let user switch if needed
  });
  
  // Effect to update mode if unit prop changes later
  useEffect(() => {
      const unitKeywords = ['ชิ้น', 'แผ่น', 'อัน', 'ฟอง', 'ลูก', 'กล่อง', 'ซอง', 'ถุง', 'ใบ'];
      if (unit && unitKeywords.some(u => unit.includes(u))) {
          setMode('unit');
      }
  }, [unit]);
  
  const [bulkPrice, setBulkPrice] = useState(0);
  const [estYield, setEstYield] = useState(0);

  const [totalWeight, setTotalWeight] = useState(1000); 
  const [usagePerUnit, setUsagePerUnit] = useState(0); 

  const calculatedPerPiece = useMemo(() => {
    if (mode === 'unit') {
        return estYield > 0 ? bulkPrice / estYield : 0;
    } else {
        return totalWeight > 0 ? (bulkPrice / totalWeight) * usagePerUnit : 0;
    }
  }, [mode, bulkPrice, estYield, totalWeight, usagePerUnit]);

  return (
    <div className="border-2 border-stone-100 rounded-3xl overflow-hidden bg-white hover:border-orange-200 transition-colors group">
      <div className="flex items-center justify-between p-3 pl-4 bg-stone-50/50 group-hover:bg-white transition-colors gap-4">
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          {image ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-stone-100 bg-white">
                  <img src={image} alt={label} className="w-full h-full object-cover" />
              </div>
          ) : (
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                {label ? label[0] : '?'}
              </div>
          )}
          <div className="flex-1 min-w-0 py-1">
            {onLabelChange ? (
                <input 
                    type="text" 
                    value={label} 
                    onChange={(e) => onLabelChange(e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-transparent hover:border-stone-300 focus:border-orange-400 outline-none text-lg font-bold text-stone-700 placeholder-stone-300"
                    placeholder="ชื่อวัตถุดิบ..."
                />
            ) : (
                <p className="text-lg font-bold text-stone-700 truncate">{label}</p>
            )}
            <p className="text-sm text-stone-400 font-bold mt-1">฿{value.toFixed(2)} / {unit || 'ชิ้น'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
             <button 
                onClick={onToggle}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-stone-200 text-stone-500' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                title="ช่วยคำนวณ"
            >
                {isOpen ? <ChevronUp size={20} /> : <Calculator size={20} />}
            </button>
            {canDelete && onDelete && (
                <button 
                    onClick={onDelete}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-300 hover:bg-red-50 hover:text-red-500 transition-all"
                    title="ลบรายการ"
                >
                    <Trash2 size={20} />
                </button>
            )}
        </div>
      </div>

      {isOpen ? (
        <div className="p-6 bg-orange-50/50 animate-in slide-in-from-top-4">
          <div className="flex p-1 bg-white rounded-xl border border-stone-200 mb-5">
             <button 
                onClick={() => setMode('unit')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'unit' ? 'bg-orange-400 text-white shadow-sm' : 'text-stone-400 hover:bg-stone-50'}`}
             >
                <Box size={14} /> แบบนับชิ้น
             </button>
             <button 
                onClick={() => setMode('weight')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'weight' ? 'bg-orange-400 text-white shadow-sm' : 'text-stone-400 hover:bg-stone-50'}`}
             >
                <Scale size={14} /> แบบชั่งตวง
             </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-bold text-stone-400 mb-2">ราคาซื้อเหมา (฿)</label>
              <input 
                type="number" 
                value={bulkPrice || ''} 
                onChange={e => setBulkPrice(Number(e.target.value))}
                placeholder="เช่น 40"
                className="w-full px-4 py-3 text-sm bg-white border-2 border-stone-100 rounded-2xl outline-none focus:border-orange-300 font-bold text-stone-700" 
              />
            </div>

            {mode === 'unit' ? (
                <div className="flex-1">
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-2">ใช้ได้กี่{unit || 'ชิ้น'}?</label>
                    <input 
                        type="number" 
                        value={estYield || ''} 
                        onChange={e => setEstYield(Number(e.target.value))}
                        placeholder="เช่น 50"
                        className="w-full px-4 py-3 text-sm bg-white border-2 border-stone-100 rounded-2xl outline-none focus:border-orange-300 font-bold text-stone-700" 
                    />
                </div>
            ) : (
                <div className="flex-1 space-y-3">
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 mb-2">ปริมาณสุทธิ (g/ml)</label>
                        <input 
                            type="number" 
                            value={totalWeight || ''} 
                            onChange={e => setTotalWeight(Number(e.target.value))}
                            placeholder="เช่น 1000"
                            className="w-full px-4 py-3 text-sm bg-white border-2 border-stone-100 rounded-2xl outline-none focus:border-orange-300 font-bold text-stone-700" 
                        />
                    </div>
                </div>
            )}
          </div>
          
          {mode === 'weight' && (
              <div className="mb-6">
                 <label className="block text-[10px] uppercase font-bold text-stone-400 mb-2">ใช้ต่อ 1 {unit || 'หน่วย'} (g/ml)</label>
                 <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        value={usagePerUnit || ''} 
                        onChange={e => setUsagePerUnit(Number(e.target.value))}
                        placeholder="เช่น 5"
                        className="w-full px-4 py-3 text-sm bg-white border-2 border-stone-100 rounded-2xl outline-none focus:border-orange-300 font-bold text-stone-700" 
                    />
                    <span className="text-xs font-bold text-stone-400">หน่วย</span>
                 </div>
              </div>
          )}

          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
            <div>
                 <p className="text-sm text-stone-500 font-bold">ต้นทุนต่อหน่วย:</p>
                 {mode === 'weight' && usagePerUnit > 0 && totalWeight > 0 && (
                     <p className="text-[10px] text-stone-400">
                        ({bulkPrice} ÷ {totalWeight}) × {usagePerUnit}
                     </p>
                 )}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-orange-500 text-lg font-black">฿{calculatedPerPiece.toFixed(2)}</span>
                <button 
                onClick={() => {
                    onChange(Number(calculatedPerPiece.toFixed(2)));
                    onToggle();
                }}
                className="px-4 py-2 bg-orange-400 text-white text-xs font-bold rounded-xl hover:bg-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                ใช้ราคานี้เลย
                </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 px-16 -mt-3 pb-5">
             <input 
               type="number" 
               value={value} 
               onChange={e => onChange(Number(e.target.value))}
               className="w-full px-4 py-2 bg-stone-50 border-2 border-stone-100 rounded-xl font-bold outline-none focus:border-orange-300 focus:bg-white transition-all text-stone-600 text-center" 
             />
        </div>
      )}
    </div>
  );
};

export const KpiCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  icon: React.ElementType;
  emoji: string;
}> = ({ title, value, subtitle, color, icon: Icon, emoji }) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    rose: 'bg-rose-100 text-rose-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  const bgClass = colorMap[color] || 'bg-stone-100 text-stone-600';

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-stone-100 hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bgClass}`}>
          <Icon size={24} />
        </div>
        <span className="text-2xl filter grayscale opacity-80">{emoji}</span>
      </div>
      <div>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h4 className="text-2xl font-black text-stone-800">{value}</h4>
        <p className="text-xs text-stone-400 font-medium mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

export const InputField: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  onHelpClick?: () => void;
  large?: boolean;
}> = ({ label, value, onChange, prefix, onHelpClick, large }) => (
  <div className="relative group">
    <div className="flex justify-between items-center mb-2">
       <label className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
         {label}
         {onHelpClick && (
            <button onClick={onHelpClick} className="text-stone-300 hover:text-blue-500 transition-colors">
                <Info size={14} />
            </button>
         )}
       </label>
    </div>
    <div className="relative">
      {prefix && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold pointer-events-none">
          {prefix}
        </div>
      )}
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`w-full bg-stone-50 border-2 border-stone-100 rounded-2xl font-bold text-stone-700 outline-none focus:border-orange-300 focus:bg-white transition-all ${large ? 'py-4 text-2xl' : 'py-3 text-lg'} ${prefix ? 'pl-10' : 'px-4'}`}
        placeholder="0"
      />
    </div>
  </div>
);

export const RangeField: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max: number;
  step?: number;
  color: string;
  subtitle?: string;
}> = ({ label, value, onChange, min = 0, max, step = 1, color, subtitle }) => {
  
  const colorClasses: Record<string, string> = {
      orange: 'accent-orange-500 text-orange-600',
      blue: 'accent-blue-500 text-blue-600',
      green: 'accent-green-500 text-green-600',
      purple: 'accent-purple-500 text-purple-600',
  };
  
  const accentClass = colorClasses[color] || 'accent-stone-500 text-stone-600';
  const textClass = accentClass.split(' ')[1];

  return (
    <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
      <div className="flex justify-between items-end mb-4">
        <div>
           <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">{label}</label>
           {subtitle && <p className="text-[10px] text-stone-400 font-medium">{subtitle}</p>}
        </div>
        <span className={`text-2xl font-black ${textClass}`}>
          {value}{step < 1 ? '' : ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer ${accentClass.split(' ')[0]}`}
      />
      <div className="flex justify-between mt-2 text-[10px] text-stone-400 font-bold uppercase">
          <span>{min}</span>
          <span>{max}</span>
      </div>
    </div>
  );
};
