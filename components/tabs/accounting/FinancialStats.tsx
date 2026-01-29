import React from 'react';
import { Percent, CheckCircle2 } from 'lucide-react';
import { getCategoryLabel } from '@/components/tabs/accounting/AccountingViews';

interface FinancialStatsProps {
    stats: {
        income: number;
        expense: number;
        profit: number;
        avgDailyIncome: number;
        topExpense?: [string, number];
        netMargin: number;
    };
}

const FinancialStats: React.FC<FinancialStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 font-cute">
            {/* Income Card */}
            <div className="relative overflow-hidden bg-[#E8F5E9] p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-emerald-50 hover:scale-[1.02] transition-transform duration-300 group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50 blur-xl group-hover:scale-125 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-emerald-100">💰</div>
                        <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">รายรับจริง (Actual)</p>
                    </div>
                    <p className="text-3xl font-black text-emerald-600 drop-shadow-sm truncate">฿{stats.income.toLocaleString()}</p>
                    <p className="text-xs text-emerald-500 mt-1 font-bold bg-white/60 px-2 py-1 rounded-lg inline-block">เฉลี่ย ฿{stats.avgDailyIncome.toLocaleString(undefined, {maximumFractionDigits: 0})}/วัน</p>
                </div>
            </div>

            {/* Expense Card */}
            <div className="relative overflow-hidden bg-[#FFEBEE] p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-rose-50 hover:scale-[1.02] transition-transform duration-300 group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-100 rounded-full opacity-50 blur-xl group-hover:scale-125 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-rose-100">💸</div>
                        <p className="text-sm font-bold text-rose-700 uppercase tracking-wider">จ่ายจริง (Actual)</p>
                    </div>
                    <p className="text-3xl font-black text-rose-600 drop-shadow-sm truncate">฿{stats.expense.toLocaleString()}</p>
                    <p className="text-xs text-rose-400 mt-1 font-bold truncate">เน้นไปที่: {stats.topExpense ? getCategoryLabel('expense', stats.topExpense[0]) : '-'}</p>
                </div>
            </div>

            {/* Profit Card */}
            <div className="relative overflow-hidden bg-[#E3F2FD] p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-blue-50 hover:scale-[1.02] transition-transform duration-300 group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-xl group-hover:scale-125 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-100">💎</div>
                        <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">กำไรสะสม</p>
                    </div>
                    <p className={`text-3xl font-black drop-shadow-sm truncate ${stats.profit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        {stats.profit > 0 ? '+' : ''}฿{stats.profit.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-blue-400 font-bold bg-white/60 px-2 py-1 rounded-lg">Real Performance</span>
                        <CheckCircle2 size={12} className="text-blue-400"/>
                    </div>
                </div>
            </div>

            {/* Margin Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100 p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-purple-50 hover:scale-[1.02] transition-transform duration-300 group">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-200 rounded-full opacity-40 blur-2xl group-hover:scale-125 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm text-purple-500 border border-purple-100"><Percent size={20} strokeWidth={3}/></div>
                        <p className="text-sm font-bold text-purple-700 uppercase tracking-wider">Actual Margin</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black tracking-tight text-purple-600 truncate">{stats.netMargin.toFixed(1)}%</p>
                    </div>
                    <p className="text-xs text-purple-500 mt-1 font-bold bg-white/60 px-2 py-1 rounded-lg inline-block">{stats.netMargin > 20 ? 'เก่งมากครับบอส! 🚀' : 'มาถูกทางแล้วครับ ✌️'}</p>
                </div>
            </div>
        </div>
    );
};

export default FinancialStats;