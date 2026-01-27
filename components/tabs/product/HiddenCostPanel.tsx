
import React, { useState } from 'react';
import { AlertTriangle, Trash2, Zap, Info } from 'lucide-react';
import { HiddenCostPercentages } from '../../../types';

// Internal Sub-component for Hidden Cost Card
const HiddenCostCard: React.FC<{
    title: string;
    value: number;
    onChange: (val: number) => void;
    color: 'orange' | 'blue';
    icon: React.ElementType;
    desc: string;
    example: string;
}> = ({ title, value, onChange, color, icon: Icon, desc, example }) => {
    const [showInfo, setShowInfo] = useState(false);
    
    const colors = {
        orange: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', accent: 'accent-orange-500', iconBg: 'bg-orange-100' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', accent: 'accent-blue-500', iconBg: 'bg-blue-100' }
    }[color];

    return (
        <div className={`p-5 rounded-3xl border-2 transition-all ${colors.bg} ${colors.border} hover:shadow-md`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors.iconBg} ${colors.text} shadow-sm`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-stone-700 text-sm font-cute">{title}</p>
                        <p className="text-[10px] text-stone-400 font-medium font-cute">ส่วนเผื่อขาดทุน</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowInfo(!showInfo)}
                    className={`p-1.5 rounded-full hover:bg-white transition-colors ${showInfo ? 'bg-white text-stone-600' : 'text-stone-400'}`}
                >
                    <Info size={16} />
                </button>
            </div>

            <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-black ${colors.text} font-cute`}>{value}%</span>
                <span className="text-xs text-stone-400 font-bold mb-1.5 font-cute">ของต้นทุน</span>
            </div>

            <input
                type="range"
                min="0"
                max={color === 'orange' ? 30 : 50} // Waste max 30, GP max 50
                step="1"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`w-full h-3 bg-white/60 rounded-full appearance-none cursor-pointer ${colors.accent}`}
            />

            {/* Expanded Info Area */}
            {showInfo && (
                <div className="mt-4 pt-4 border-t border-stone-200/50 text-xs text-stone-600 animate-in slide-in-from-top-2 font-cute">
                    <p className="font-bold mb-1">{desc}</p>
                    <p className="opacity-80 bg-white/60 p-2 rounded-lg">{example}</p>
                </div>
            )}
        </div>
    );
};

interface HiddenCostPanelProps {
    values: HiddenCostPercentages;
    onChange: (field: string, value: number) => void;
}

const HiddenCostPanel: React.FC<HiddenCostPanelProps> = ({ values, onChange }) => {
    return (
        <div className="bg-white rounded-[2.5rem] border-2 border-stone-100 p-6 shadow-sm relative overflow-hidden">
            <h4 className="font-bold text-stone-700 text-sm mb-4 flex items-center gap-2 relative z-10 font-cute">
                <AlertTriangle size={16} className="text-orange-500" /> ค่าแฝง & GP (Hidden Costs)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <HiddenCostCard 
                    title="Waste (ของเสีย)"
                    value={values.waste}
                    onChange={(v) => onChange('waste', v)}
                    color="orange"
                    icon={Trash2}
                    desc="คือค่าวัตถุดิบที่ต้องทิ้ง หรือเสียหายระหว่างทำ"
                    example={`ถ้าตั้ง 10% หมายความว่า ซื้อของมา 100 บาท เราเผื่อใจไว้แล้วว่าใช้จริงได้แค่ 90 บาท`}
                />
                <HiddenCostCard 
                    title="GP/Fee (ค่าธรรมเนียม)"
                    value={values.paymentFee}
                    onChange={(v) => onChange('paymentFee', v)}
                    color="blue"
                    icon={Zap}
                    desc="คือส่วนแบ่งที่โดนหักจาก App Delivery หรือบัตรเครดิต"
                    example={`ถ้าขาย 100 บาท ตั้ง GP 30% แปลว่าเงินจะเข้ากระเป๋าเราจริงๆ แค่ 70 บาท`}
                />
            </div>
        </div>
    );
};

export default HiddenCostPanel;
