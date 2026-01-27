
import React from 'react';
import { Calendar, Wallet, ArrowUpRight, ArrowDownLeft, Trash2, ScanLine, Clock } from 'lucide-react';
import { LedgerItem } from '../../../types';
import { getCategoryLabel } from './AccountingViews';

interface LedgerFeedProps {
    groupedLedger: [string, LedgerItem[]][];
    onDelete: (id: string) => void;
    onEdit: (item: LedgerItem) => void;
    onViewSlip: (url: string) => void;
}

const LedgerFeed: React.FC<LedgerFeedProps> = ({ groupedLedger, onDelete, onEdit, onViewSlip }) => {
    return (
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
};

export default LedgerFeed;
