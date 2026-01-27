
import React from 'react';
import { Wallet, Smartphone, Bike, Store, ArrowRight, ChevronRight } from 'lucide-react';

// --- MAIN HEADER CARD ---
export const DashboardHeaderCard: React.FC<{
    todaySales: number;
    dailyTarget: number;
    progressPercent: number;
    date: string;
    onClick: () => void;
}> = ({ todaySales, dailyTarget, progressPercent, date, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-[2.5rem] border-2 border-stone-100 shadow-sm relative overflow-hidden group cursor-pointer hover:border-green-200 transition-all"
    >
        <div className="flex justify-between items-center relative z-10 mb-4">
            <div>
                <h2 className="text-3xl font-black text-stone-800 flex items-center gap-2">
                    <StoreIcon /> หน้าร้านวันนี้ (Operation)
                </h2>
                <p className="text-stone-400 font-bold text-sm mt-1 ml-1">{date}</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-stone-400 uppercase flex items-center justify-end gap-1">
                    ยอดขายรวม <ChevronRight size={14} className="text-stone-300"/>
                </p>
                <p className="text-4xl font-black text-green-600 tracking-tighter">฿{todaySales.toLocaleString()}</p>
            </div>
        </div>
        
        {/* Target Progress */}
        <div className="relative pt-2">
            <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-green-600">{Math.round(progressPercent)}% ถึงเป้าหมาย</span>
                <span className="text-stone-400">เป้า: ฿{dailyTarget.toLocaleString()}</span>
            </div>
            <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progressPercent}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
        </div>
        
        {/* Hidden Overlay for Click Hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-0"></div>
    </div>
);

// --- PAYMENT METHOD CARDS ---
export const PaymentCard: React.FC<{
    title: string;
    amount: number;
    count: number;
    icon: any;
    colorTheme: 'green' | 'blue' | 'orange';
    onClick: () => void;
}> = ({ title, amount, count, icon: Icon, colorTheme, onClick }) => {
    const themes = {
        green: 'bg-green-50 border-green-100 text-green-600 hover:border-green-300',
        blue: 'bg-blue-50 border-blue-100 text-blue-600 hover:border-blue-300',
        orange: 'bg-orange-50 border-orange-100 text-orange-600 hover:border-orange-300',
    };
    const t = themes[colorTheme];

    return (
        <div 
            onClick={onClick}
            className={`${t} p-5 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-xs font-bold uppercase mb-1 opacity-80">{title}</p>
                    <p className="text-2xl font-black">฿{amount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm opacity-80 group-hover:scale-110 transition-transform">
                    <Icon size={24}/>
                </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold opacity-60">
                <span>{count} บิล</span>
                <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform"/>
            </div>
        </div>
    );
};

const StoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 bg-green-100 p-1.5 rounded-xl"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
);
