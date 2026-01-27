
import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, CalendarRange, Trash2, ArrowRight, ScanLine, Clock, PiggyBank, TrendingUp, TrendingDown, Diamond, Percent, Calendar, PieChart } from 'lucide-react';
import { LedgerItem } from '../../../types';
import { ACCOUNTING_CATEGORIES, PAYMENT_CHANNELS } from '../../../constants';

// --- Helper ---
export const getCategoryLabel = (type: string, catId: string) => {
    const list = type === 'income' ? ACCOUNTING_CATEGORIES.income : ACCOUNTING_CATEGORIES.expense;
    const found = list.find(c => c.id === catId);
    return found ? found.label : catId;
};

// --- Sub Components ---

export const AccountingHeader: React.FC<{
    onOpenIncome: () => void;
    onOpenExpense: () => void;
    onOpenScanner: () => void;
    onOpenMonthly: () => void; // New Prop
}> = ({ onOpenIncome, onOpenExpense, onOpenScanner, onOpenMonthly }) => (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4">
        <div>
            <h2 className="text-3xl md:text-4xl font-black text-stone-800 flex items-center gap-3 font-cute tracking-tight drop-shadow-sm">
                <span className="text-4xl animate-bounce delay-700">📒</span>
                บัญชีร้าน (Accounting)
            </h2>
            <p className="text-stone-400 font-bold text-sm md:text-base mt-2 font-cute ml-1">จดครบ จบง่าย กำไรเห็นๆ ✨</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
            <button 
                onClick={onOpenMonthly}
                className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-3 md:py-3.5 rounded-[2rem] font-bold hover:bg-blue-100 transition-all border-2 border-blue-200 shadow-sm hover:-translate-y-0.5 whitespace-nowrap"
            >
                <PieChart size={20} /> <span className="font-cute">รายงานผล</span>
            </button>
            <div className="w-px h-10 bg-stone-200 mx-1 hidden lg:block"></div>
            <button 
                onClick={onOpenExpense}
                className="flex-1 md:flex-none justify-center group relative flex items-center gap-2 bg-gradient-to-b from-rose-400 to-rose-500 text-white px-6 py-3.5 rounded-[2rem] font-bold shadow-[0_6px_0_rgb(225,29,72)] hover:shadow-[0_3px_0_rgb(225,29,72)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all overflow-hidden border-2 border-rose-600"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-[2rem]"></div>
                <ArrowDownLeft size={22} className="group-hover:-rotate-12 transition-transform stroke-[3px]"/> 
                <span className="font-cute text-lg">จ่ายออก</span>
            </button>
            <button 
                onClick={onOpenIncome}
                className="flex-1 md:flex-none justify-center group relative flex items-center gap-2 bg-gradient-to-b from-emerald-400 to-emerald-500 text-white px-6 py-3.5 rounded-[2rem] font-bold shadow-[0_6px_0_rgb(16,185,129)] hover:shadow-[0_3px_0_rgb(16,185,129)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all overflow-hidden border-2 border-emerald-600"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-[2rem]"></div>
                <ArrowUpRight size={22} className="group-hover:rotate-12 transition-transform stroke-[3px]"/> 
                <span className="font-cute text-lg">รับเข้า</span>
            </button>
            <button 
                onClick={onOpenScanner}
                className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-stone-800 text-white px-5 py-3 rounded-[2rem] font-bold hover:bg-stone-900 transition-all shadow-lg hover:-translate-y-1 border-4 border-stone-200"
            >
                <ScanLine size={20} /> <span className="font-cute hidden md:inline">AI Scan</span>
            </button>
        </div>
    </div>
);

export const AccountingDateControl: React.FC<{
    dateRange: { start: string, end: string };
    setDateRange: React.Dispatch<React.SetStateAction<{ start: string, end: string }>>;
    setPresetRange: (days: number | 'thisMonth' | 'lastMonth') => void;
    children?: React.ReactNode; // For extra buttons
}> = ({ dateRange, setDateRange, setPresetRange, children }) => (
    <div className="bg-white/80 p-3 md:p-2 md:pl-4 md:pr-2 rounded-[2.5rem] border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col xl:flex-row items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="w-full md:w-auto flex items-center justify-center gap-2 bg-stone-100/80 px-4 py-2.5 rounded-full border border-stone-200">
                <CalendarRange size={18} className="text-stone-400 shrink-0"/>
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="bg-transparent text-sm font-bold text-stone-600 outline-none font-cute cursor-pointer w-full md:w-auto text-center" />
                <span className="text-stone-300 font-black px-1">➜</span>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="bg-transparent text-sm font-bold text-stone-600 outline-none font-cute cursor-pointer w-full md:w-auto text-center" />
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start w-full md:w-auto">
                <button onClick={() => setPresetRange(7)} className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white border-2 border-stone-100 hover:border-orange-300 hover:bg-orange-50 text-stone-500 hover:text-orange-600 text-xs font-bold transition-all font-cute shadow-sm hover:-translate-y-0.5 whitespace-nowrap">7 วันล่าสุด</button>
                <button onClick={() => setPresetRange('thisMonth')} className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white border-2 border-stone-100 hover:border-orange-300 hover:bg-orange-50 text-stone-500 hover:text-orange-600 text-xs font-bold transition-all font-cute shadow-sm hover:-translate-y-0.5 whitespace-nowrap">เดือนนี้</button>
                <button onClick={() => setPresetRange('lastMonth')} className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white border-2 border-stone-100 hover:border-orange-300 hover:bg-orange-50 text-stone-500 hover:text-orange-600 text-xs font-bold transition-all font-cute shadow-sm hover:-translate-y-0.5 whitespace-nowrap">เดือนที่แล้ว</button>
            </div>
        </div>
        <div className="w-full xl:w-auto">
            {children}
        </div>
    </div>
);

export const AccountingStatsCards: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 font-cute">
        {/* Income Card */}
        <div className="relative overflow-hidden bg-[#E8F5E9] p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-emerald-50 hover:scale-[1.02] transition-transform duration-300 group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50 blur-xl group-hover:scale-125 transition-transform"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">💰</div>
                    <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">รายรับรวม</p>
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
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">💸</div>
                    <p className="text-sm font-bold text-rose-700 uppercase tracking-wider">รายจ่ายรวม</p>
                </div>
                <p className="text-3xl font-black text-rose-600 drop-shadow-sm truncate">฿{stats.expense.toLocaleString()}</p>
                <p className="text-xs text-rose-400 mt-1 font-bold truncate">หนักไปที่: {stats.topExpense ? getCategoryLabel('expense', stats.topExpense[0]) : '-'}</p>
            </div>
        </div>

        {/* Profit Card */}
        <div className="relative overflow-hidden bg-[#E3F2FD] p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-blue-50 hover:scale-[1.02] transition-transform duration-300 group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-xl group-hover:scale-125 transition-transform"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">💎</div>
                    <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">กำไรสุทธิ</p>
                </div>
                <p className={`text-3xl font-black drop-shadow-sm truncate ${stats.profit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    {stats.profit > 0 ? '+' : ''}฿{stats.profit.toLocaleString()}
                </p>
                <p className="text-xs text-blue-400 mt-1 font-bold bg-white/60 px-2 py-1 rounded-lg inline-block">Net Profit</p>
            </div>
        </div>

        {/* Margin Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100 p-6 rounded-[2.5rem] border-4 border-white shadow-lg shadow-purple-50 hover:scale-[1.02] transition-transform duration-300 group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-200 rounded-full opacity-40 blur-2xl group-hover:scale-125 transition-transform"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm text-purple-500"><Percent size={20} strokeWidth={3}/></div>
                    <p className="text-sm font-bold text-purple-700 uppercase tracking-wider">Net Margin</p>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black tracking-tight text-purple-600 truncate">{stats.netMargin.toFixed(1)}%</p>
                </div>
                <p className="text-xs text-purple-500 mt-1 font-bold bg-white/60 px-2 py-1 rounded-lg inline-block">{stats.netMargin > 20 ? 'กำไรดีเยี่ยม! 🚀' : 'พยายามเข้านะ ✌️'}</p>
            </div>
        </div>
    </div>
);

export const AccountingTimeline: React.FC<{
    groupedLedger: [string, LedgerItem[]][];
    onDelete: (id: string) => void;
    onEdit: (item: LedgerItem) => void;
    onViewSlip: (url: string) => void;
}> = ({ groupedLedger, onDelete, onEdit, onViewSlip }) => (
    <div className="bg-white rounded-[3rem] border-4 border-stone-100 p-6 md:p-8 min-h-[500px] shadow-sm relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-orange-100 via-pink-100 to-blue-100"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="font-bold text-xl text-stone-700 flex items-center gap-3 font-cute">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-500"><Clock size={24} /></div>
                ประวัติรายการ (Timeline)
            </h3>
        </div>

        <div className="space-y-10 relative z-10">
            {groupedLedger.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-stone-300 font-cute opacity-60">
                    <div className="w-32 h-32 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                        <Wallet size={64} className="opacity-20 text-stone-400" />
                    </div>
                    <p className="text-xl font-bold">ยังไม่มีรายการ</p>
                    <p className="text-sm">เริ่มจดบันทึกรายรับ-รายจ่าย ได้เลย!</p>
                </div>
            )}
            
            {groupedLedger.map(([dateStr, items]) => (
                <div key={dateStr} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Sticky Date Pill */}
                    <div className="sticky top-0 z-20 flex justify-center mb-6">
                        <div className="bg-stone-800 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 font-cute border-4 border-white">
                            <Calendar size={14} className="text-orange-300"/>
                            {new Date(dateStr).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {items.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => onEdit(item)}
                                className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[2rem] border-2 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-md gap-4 ${
                                    item.type === 'income' 
                                    ? 'bg-[#F0FDF4] border-[#DCFCE7] hover:border-emerald-300' 
                                    : 'bg-[#FEF2F2] border-[#FEE2E2] hover:border-rose-300'
                                }`}
                            >
                                <div className="flex items-center gap-5 overflow-hidden">
                                    <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-sm shrink-0 border-2 border-white ${
                                        item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                    }`}>
                                        {item.type === 'income' ? <ArrowUpRight size={28} strokeWidth={2.5} /> : <ArrowDownLeft size={28} strokeWidth={2.5} />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-stone-700 text-lg truncate font-cute mb-1">{item.title}</p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold font-cute">
                                            <span className={`px-2 py-1 rounded-lg border whitespace-nowrap ${item.type === 'income' ? 'bg-emerald-100/50 text-emerald-600 border-emerald-200' : 'bg-rose-100/50 text-rose-600 border-rose-200'}`}>
                                                {getCategoryLabel(item.type, item.category)}
                                            </span>
                                            {item.channel && (
                                                <span className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-500 flex items-center gap-1 whitespace-nowrap">
                                                    {item.channel}
                                                </span>
                                            )}
                                            {item.slipImage && (
                                                <span onClick={(e) => { e.stopPropagation(); onViewSlip(item.slipImage!); }} className="px-2 py-1 rounded-lg bg-blue-100 text-blue-600 border border-blue-200 flex items-center gap-1 hover:bg-blue-200 cursor-zoom-in whitespace-nowrap">
                                                    <ScanLine size={10}/> สลิป
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4 border-t sm:border-t-0 border-black/5 pt-3 sm:pt-0">
                                    <span className="text-xs font-bold text-stone-400 sm:hidden">ยอดสุทธิ</span>
                                    <span className={`font-black text-2xl font-cute tracking-tight whitespace-nowrap ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {item.type === 'income' ? '+' : '-'}฿{item.amount.toLocaleString()}
                                    </span>
                                    
                                    {/* Delete Button (Hover Reveal) */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);
