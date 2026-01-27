
import React from 'react';
import { TrendingUp, PiggyBank, Calculator, Heart, ArrowUpRight } from 'lucide-react';

interface KPIGridProps {
    results: any;
    onCardClick: (metric: 'profit' | 'payback' | 'hourly' | 'safety') => void;
}

const KPIGrid: React.FC<KPIGridProps> = ({ results, onCardClick }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
            {/* Card 1: Profit */}
            <button 
                onClick={() => onCardClick('profit')}
                className="bg-[#ECFDF5] p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-emerald-50 hover:scale-[1.02] hover:-rotate-1 transition-all duration-300 group relative overflow-hidden text-left cursor-pointer"
            >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 p-1 rounded-full"><ArrowUpRight size={16} className="text-emerald-500"/></div>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm"><TrendingUp size={20} strokeWidth={3}/></div>
                        <span className="text-emerald-700 font-bold text-sm uppercase tracking-wider">กำไรต่อวัน</span>
                    </div>
                    <p className="text-4xl font-black text-emerald-600 tracking-tight">฿{results.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-emerald-500 font-bold mt-2 bg-white/60 px-3 py-1 rounded-full inline-block">แตะเพื่อดูที่มา</p>
                </div>
            </button>

            {/* Card 2: Payback */}
            <button 
                onClick={() => onCardClick('payback')}
                className="bg-[#EFF6FF] p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-blue-50 hover:scale-[1.02] hover:rotate-1 transition-all duration-300 group relative overflow-hidden text-left cursor-pointer"
            >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 p-1 rounded-full"><ArrowUpRight size={16} className="text-blue-500"/></div>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm"><PiggyBank size={20} strokeWidth={3}/></div>
                        <span className="text-blue-700 font-bold text-sm uppercase tracking-wider">ระยะคืนทุน</span>
                    </div>
                    <p className="text-4xl font-black text-blue-600 tracking-tight">{results.paybackDays === Infinity ? "∞" : Math.ceil(results.paybackDays)} <span className="text-xl">วัน</span></p>
                    <p className="text-xs text-blue-500 font-bold mt-2 bg-white/60 px-3 py-1 rounded-full inline-block">ลงทุนรวม ฿{results.totalInvestment.toLocaleString()}</p>
                </div>
            </button>

            {/* Card 3: Hourly */}
            <button 
                onClick={() => onCardClick('hourly')}
                className="bg-[#FFF7ED] p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-orange-50 hover:scale-[1.02] hover:-rotate-1 transition-all duration-300 group relative overflow-hidden text-left cursor-pointer"
            >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 p-1 rounded-full"><ArrowUpRight size={16} className="text-orange-500"/></div>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm"><Calculator size={20} strokeWidth={3}/></div>
                        <span className="text-orange-700 font-bold text-sm uppercase tracking-wider">กำไร / ชม.</span>
                    </div>
                    <p className="text-4xl font-black text-orange-500 tracking-tight">฿{results.profitPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-orange-500 font-bold mt-2 bg-white/60 px-3 py-1 rounded-full inline-block">Hourly Profit</p>
                </div>
            </button>

            {/* Card 4: Safety Price */}
            <button 
                onClick={() => onCardClick('safety')}
                className="bg-[#FFF1F2] p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-rose-50 hover:scale-[1.02] hover:rotate-1 transition-all duration-300 group relative overflow-hidden text-left cursor-pointer"
            >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 p-1 rounded-full"><ArrowUpRight size={16} className="text-rose-500"/></div>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm"><Heart size={20} strokeWidth={3}/></div>
                        <span className="text-rose-700 font-bold text-sm uppercase tracking-wider">ห้ามขายต่ำกว่า</span>
                    </div>
                    <p className="text-4xl font-black text-rose-500 tracking-tight">฿{results.minPrice.toFixed(0)}</p>
                    <p className="text-xs text-rose-500 font-bold mt-2 bg-white/60 px-3 py-1 rounded-full inline-block">Cost + Fixed</p>
                </div>
            </button>
        </div>
    );
};

export default KPIGrid;
