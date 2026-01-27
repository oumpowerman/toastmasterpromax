
import React, { useState } from 'react';
import { Target, ArrowRight, Clock, Hourglass } from 'lucide-react';

interface TargetCalculatorProps {
    fixedCost: number;
    avgContribution: number;
    openHours: number;
    avgUnitsPerHour?: number; // Optional prop to feed traffic data
}

const TargetCalculator: React.FC<TargetCalculatorProps> = ({ fixedCost, avgContribution, openHours }) => {
    const [targetProfit, setTargetProfit] = useState<number>(0);

    const requiredUnitsForTarget = avgContribution > 0 
        ? Math.ceil((fixedCost + targetProfit) / avgContribution) 
        : Infinity;

    const unitsPerHour = 20; // Default fallback if not provided via props (Can be improved to receive from Traffic)
    const hoursNeeded = requiredUnitsForTarget / unitsPerHour;

    return (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-[2.5rem] p-6 border-2 border-orange-100 shadow-sm relative overflow-hidden group">
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                
                {/* Left: Input */}
                <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2 text-orange-800 mb-1">
                        <Target size={20} className="text-orange-500" />
                        <h3 className="text-lg font-black tracking-wide">ตั้งเป้ากำไรรายวัน (Target Goal)</h3>
                    </div>
                    
                    <div className="bg-white p-1.5 rounded-[2rem] border-2 border-orange-200 flex items-center shadow-sm">
                        <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-xl shadow-md shrink-0 ml-1 text-white">
                            💸
                        </div>
                        <input 
                            type="number" 
                            value={targetProfit || ''}
                            onChange={(e) => setTargetProfit(Number(e.target.value))}
                            placeholder="อยากได้กำไรกี่บาท?"
                            className="w-full bg-transparent border-none outline-none text-stone-700 font-black text-2xl px-4 placeholder-stone-300 font-cute"
                        />
                        <span className="text-orange-300 font-bold pr-4 text-sm">THB</span>
                    </div>
                    <p className="text-orange-600/70 text-xs pl-4 font-bold">พิมพ์ตัวเลขลงไปเลย ระบบจะคำนวณเป้าขายให้ทันที!</p>
                </div>

                {/* Arrow (Hidden on Mobile) */}
                <div className="hidden lg:block text-orange-300">
                    <ArrowRight size={32} strokeWidth={3} className="animate-pulse"/>
                </div>

                {/* Right: Result */}
                <div className="flex-1 w-full">
                    <div className="bg-white text-stone-800 p-4 px-6 rounded-[2rem] shadow-sm relative overflow-hidden text-center border-2 border-orange-100 transform transition-transform hover:scale-105">
                            
                            <div className="flex items-center justify-center gap-4">
                            <div>
                                <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mb-1">ภารกิจของคุณ</p>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl font-black text-stone-800 tracking-tighter">
                                        {requiredUnitsForTarget === Infinity ? '∞' : requiredUnitsForTarget}
                                    </span>
                                    <span className="text-lg font-black text-stone-400">ชิ้น</span>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-stone-100 mx-2"></div>
                            <div className="text-left">
                                <div className="inline-flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl text-stone-500 font-bold text-xs">
                                    <Clock size={14} /> 
                                    ต้องขายเฉลี่ย
                                </div>
                                <p className="font-bold text-stone-700 text-lg mt-1 ml-1">
                                    {openHours > 0 ? Math.ceil(requiredUnitsForTarget/openHours) : 0} ชิ้น/ชม.
                                </p>
                            </div>
                            </div>
                            
                            {/* Time Estimation (New) */}
                            {targetProfit > 0 && requiredUnitsForTarget > 0 && (
                                <div className="mt-3 pt-3 border-t border-dashed border-stone-100 text-xs text-orange-500 font-bold flex items-center justify-center gap-1">
                                    <Hourglass size={12}/> 
                                    ที่ความเร็วปกติ ต้องยืนปิ้งประมาณ {Math.ceil(requiredUnitsForTarget / 20)} - {Math.ceil(requiredUnitsForTarget / 10)} ชั่วโมง
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TargetCalculator;
