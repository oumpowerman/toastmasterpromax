
import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, TrendingUp, TrendingDown, DollarSign, ChevronRight, CalendarRange, Filter, Lightbulb, Heart, AlertTriangle, Smile } from 'lucide-react';
import { LedgerItem } from '../../types';

interface MonthlySummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    ledger: LedgerItem[];
}

// Advice Configuration
const getAdvice = (profit: number, margin: number, revenue: number) => {
    if (revenue === 0) return { title: "เริ่มขายหรือยังนะ? 🤔", msg: "ยังไม่มีรายรับเข้ามาเลยครับ อย่าลืมลงบันทึกบัญชีทุกวันนะ สู้ๆ!", color: "text-stone-500 bg-stone-100", icon: Smile };
    
    if (profit < 0) return { title: "อย่าเพิ่งท้อนะ! ✌️", msg: "ช่วงนี้รายจ่ายแซงรายรับ ลองเช็คดูว่าเราตุนของเยอะเกินไปไหม? หรือมีค่าใช้จ่ายแฝงตรงไหน ตัดได้ตัดเลยครับ!", color: "text-red-600 bg-red-50 border-red-100", icon: AlertTriangle };
    
    if (margin < 10) return { title: "กำไรบางไปนิด 🤏", msg: "ขายดีแต่เงินไม่ค่อยเหลือ? ลองลด Waste หรือขยับราคาขายขึ้นอีกนิดดีไหมครับ หรือลองจัด Set Menu ดันยอดขายดูนะ", color: "text-orange-600 bg-orange-50 border-orange-100", icon: Lightbulb };
    
    if (margin < 25) return { title: "มาถูกทางแล้ว! 👍", msg: "กำไรอยู่ในเกณฑ์มาตรฐานครับ พยายามรักษาคุณภาพและบริการไว้ ลูกค้าประจำจะช่วยให้เราโตขึ้นเรื่อยๆ", color: "text-blue-600 bg-blue-50 border-blue-100", icon: Heart };
    
    return { title: "สุดยอดมาก! 🚀", msg: "กำไรสวยหรู! ธุรกิจแข็งแกร่งมากครับ อย่าลืมเก็บเงินสำรองเผื่อขยายร้าน หรือให้รางวัลตัวเองบ้างนะครับ", color: "text-green-600 bg-green-50 border-green-100", icon: TrendingUp };
};

const MonthlySummaryModal: React.FC<MonthlySummaryModalProps> = ({ isOpen, onClose, ledger }) => {
    // --- STATE FOR FILTERING ---
    const [filterType, setFilterType] = useState<'7days' | 'thisMonth' | 'lastMonth' | 'custom'>('thisMonth');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- INITIALIZE DATES ---
    useEffect(() => {
        if (!isOpen) return;
        setPreset('thisMonth');
    }, [isOpen]);

    const setPreset = (type: '7days' | 'thisMonth' | 'lastMonth') => {
        setFilterType(type);
        const end = new Date();
        const start = new Date();

        if (type === '7days') {
            start.setDate(end.getDate() - 6); // Last 7 days including today
        } else if (type === 'thisMonth') {
            start.setDate(1);
        } else if (type === 'lastMonth') {
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            end.setDate(0); // Last day of prev month
        }
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    // --- CALCULATIONS ---
    const { filteredStats, aggregatedData, groupingMode } = useMemo(() => {
        if (!startDate || !endDate) return { filteredStats: { income: 0, expense: 0, profit: 0, count: 0 }, aggregatedData: [], groupingMode: 'day' };

        // 1. Filter Ledger
        const filtered = ledger.filter(item => item.date >= startDate && item.date <= endDate);

        // 2. Calculate Totals
        const stats = filtered.reduce((acc, item) => {
            acc.count++;
            if (item.type === 'income') acc.income += item.amount;
            else acc.expense += item.amount;
            return acc;
        }, { income: 0, expense: 0, profit: 0, count: 0 });
        stats.profit = stats.income - stats.expense;

        // 3. Determine Grouping (Day vs Month)
        // If range > 35 days -> Group by Month, Else -> Group by Day
        const startD = new Date(startDate);
        const endD = new Date(endDate);
        const diffTime = Math.abs(endD.getTime() - startD.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const mode = diffDays > 35 ? 'month' : 'day';

        // 4. Aggregate Data for List
        const groups: Record<string, { key: string, income: number, expense: number, profit: number, count: number }> = {};

        filtered.forEach(item => {
            let key = item.date; // Default YYYY-MM-DD
            if (mode === 'month') key = item.date.substring(0, 7); // YYYY-MM

            if (!groups[key]) groups[key] = { key, income: 0, expense: 0, profit: 0, count: 0 };
            
            if (item.type === 'income') groups[key].income += item.amount;
            else groups[key].expense += item.amount;
            groups[key].count++;
        });

        // Convert to array & Sort (Newest First)
        const result = Object.values(groups).map(g => ({
            ...g,
            profit: g.income - g.expense
        })).sort((a, b) => b.key.localeCompare(a.key));

        return { filteredStats: stats, aggregatedData: result, groupingMode: mode };
    }, [ledger, startDate, endDate]);

    if (!isOpen) return null;

    // AI Advice
    const margin = filteredStats.income > 0 ? (filteredStats.profit / filteredStats.income) * 100 : 0;
    const advice = getAdvice(filteredStats.profit, margin, filteredStats.income);
    const AdviceIcon = advice.icon;

    // Max value for chart scaling
    const maxVal = Math.max(...aggregatedData.map(s => Math.max(s.income, s.expense)), 1);

    const formatDateLabel = (key: string) => {
        if (groupingMode === 'month') {
            const [year, month] = key.split('-');
            return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('th-TH', { month: 'long', year: '2-digit' });
        } else {
            return new Date(key).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', weekday: 'short' });
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] relative z-10 animate-in zoom-in-95 flex flex-col shadow-2xl border-4 border-white font-cute overflow-hidden">
                
                {/* Header & Filter */}
                <div className="p-6 bg-[#FFF9F2] border-b border-orange-100 shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-200">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-stone-800 leading-none">รายงานสรุป</h3>
                                <p className="text-stone-400 text-sm font-bold mt-1">Financial Performance</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-2 rounded-2xl border border-stone-100 shadow-sm">
                        <div className="flex gap-1 p-1 bg-stone-100 rounded-xl shrink-0">
                            <button onClick={() => setPreset('7days')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === '7days' ? 'bg-white shadow text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>7 วันล่าสุด</button>
                            <button onClick={() => setPreset('thisMonth')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'thisMonth' ? 'bg-white shadow text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>เดือนนี้</button>
                            <button onClick={() => setPreset('lastMonth')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'lastMonth' ? 'bg-white shadow text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>เดือนที่แล้ว</button>
                        </div>
                        
                        <div className="h-6 w-px bg-stone-200 hidden md:block"></div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <CalendarRange size={16} className="text-stone-400"/>
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => { setStartDate(e.target.value); setFilterType('custom'); }} 
                                className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-600 outline-none focus:border-orange-300"
                            />
                            <span className="text-stone-300">➜</span>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => { setEndDate(e.target.value); setFilterType('custom'); }} 
                                className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-600 outline-none focus:border-orange-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                            <p className="text-xs font-bold text-green-600 uppercase mb-1">รายรับรวม</p>
                            <p className="text-xl font-black text-green-700">฿{filteredStats.income.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                            <p className="text-xs font-bold text-red-500 uppercase mb-1">รายจ่ายรวม</p>
                            <p className="text-xl font-black text-red-600">฿{filteredStats.expense.toLocaleString()}</p>
                        </div>
                        <div className={`p-4 rounded-2xl border text-center ${filteredStats.profit >= 0 ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-stone-100 border-stone-200 text-stone-600'}`}>
                            <p className="text-xs font-bold uppercase mb-1">กำไรสุทธิ</p>
                            <p className="text-xl font-black">{filteredStats.profit >= 0 ? '+' : ''}฿{filteredStats.profit.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* AI Coach */}
                    <div className={`p-5 rounded-2xl border-2 flex items-start gap-4 ${advice.color}`}>
                        <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                            <AdviceIcon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-1">{advice.title}</h4>
                            <p className="text-sm font-medium opacity-90 leading-relaxed">{advice.msg}</p>
                        </div>
                    </div>

                    {/* Timeline List */}
                    <div>
                        <h4 className="font-bold text-stone-600 mb-3 flex items-center gap-2">
                            <Filter size={16}/> รายละเอียด ({aggregatedData.length} {groupingMode === 'month' ? 'เดือน' : 'วัน'})
                        </h4>
                        
                        {aggregatedData.length === 0 ? (
                            <div className="text-center py-10 text-stone-300 border-2 border-dashed border-stone-100 rounded-2xl">
                                <Calendar size={48} className="mx-auto mb-2 opacity-20" />
                                <p className="font-bold">ไม่พบข้อมูลในช่วงที่เลือก</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {aggregatedData.map((stat) => (
                                    <div key={stat.key} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:border-blue-200 transition-all group">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${groupingMode === 'month' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-stone-50 border-stone-100 text-stone-600'}`}>
                                                    {groupingMode === 'month' ? stat.key.split('-')[1] : new Date(stat.key).getDate()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-stone-700 text-sm">{formatDateLabel(stat.key)}</p>
                                                    <p className="text-[10px] text-stone-400">{stat.count} รายการ</p>
                                                </div>
                                            </div>
                                            <div className={`text-right ${stat.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                <p className="text-[10px] font-bold uppercase opacity-60">Net Profit</p>
                                                <p className="text-lg font-black">{stat.profit > 0 ? '+' : ''}฿{stat.profit.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Mini Bar Chart */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-16 text-stone-400 font-bold text-right">รายรับ</div>
                                                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${(stat.income / maxVal) * 100}%` }}></div>
                                                </div>
                                                <div className="w-16 text-right font-bold text-green-600">฿{stat.income.toLocaleString()}</div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-16 text-stone-400 font-bold text-right">รายจ่าย</div>
                                                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${(stat.expense / maxVal) * 100}%` }}></div>
                                                </div>
                                                <div className="w-16 text-right font-bold text-red-600">฿{stat.expense.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlySummaryModal;
