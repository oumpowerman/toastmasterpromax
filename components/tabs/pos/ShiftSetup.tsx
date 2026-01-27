
import React from 'react';
import { Store, Calendar, CheckCircle2, History, ChevronRight, List, X } from 'lucide-react';

interface ShiftSetupProps {
    shiftDate: string;
    setShiftDate: (date: string) => void;
    onStartShift: () => void;
    salesHistoryLog: [string, { total: number; count: number }][];
    onOpenFullHistory: () => void;
}

const ShiftSetup: React.FC<ShiftSetupProps> = ({ 
    shiftDate, 
    setShiftDate, 
    onStartShift, 
    salesHistoryLog, 
    onOpenFullHistory 
}) => {
    return (
        <div className="h-full flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 font-cute overflow-y-auto">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl border-4 border-stone-100 text-center relative overflow-hidden my-auto">
                {/* Decor */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-100 to-white -z-10"></div>
                
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-orange-100">
                    <Store size={48} className="text-orange-500" />
                </div>

                <h2 className="text-3xl font-black text-stone-800 mb-2">เตรียมเปิดร้าน 🍞</h2>
                <p className="text-stone-500 mb-8 font-bold">วันนี้จะลงบัญชีขายของวันที่เท่าไหร่ครับ?</p>

                <div className="bg-stone-50 p-6 rounded-3xl border-2 border-stone-100 mb-6 text-left">
                    <label className="text-xs font-black text-stone-400 uppercase ml-1 mb-2 block flex items-center gap-1">
                        <Calendar size={14}/> เลือกวันที่ขาย (Shift Date)
                    </label>
                    <input 
                        type="date" 
                        value={shiftDate}
                        onChange={(e) => setShiftDate(e.target.value)}
                        className="w-full px-4 py-4 bg-white border-2 border-stone-200 rounded-2xl font-black text-2xl text-stone-700 outline-none focus:border-orange-400 text-center shadow-sm"
                    />
                    <div className="mt-4 flex gap-2 justify-center">
                        <button onClick={() => setShiftDate(new Date().toISOString().split('T')[0])} className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 hover:bg-orange-100">วันนี้</button>
                        <button onClick={() => { 
                            const d = new Date(); d.setDate(d.getDate() - 1); 
                            setShiftDate(d.toISOString().split('T')[0]); 
                        }} className="text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full border border-stone-200 hover:bg-stone-200">เมื่อวาน</button>
                    </div>
                </div>

                <button 
                    onClick={onStartShift}
                    className="w-full py-4 bg-stone-800 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-stone-900 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mb-8"
                >
                    <CheckCircle2 size={24} /> เปิดบิลขาย
                </button>

                {/* Sales History Log (Limited to 2 Items) */}
                <div className="border-t border-stone-100 pt-6">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h4 className="font-bold text-stone-700 flex items-center gap-2">
                            <History size={18} className="text-orange-400"/> ล่าสุด (Recent)
                        </h4>
                    </div>
                    
                    <div className="space-y-3">
                        {salesHistoryLog.length === 0 ? (
                            <p className="text-stone-300 text-sm py-4">ยังไม่มีประวัติการขาย</p>
                        ) : (
                            <>
                                {salesHistoryLog.slice(0, 2).map(([date, data]) => (
                                    <button 
                                        key={date}
                                        onClick={() => { setShiftDate(date); onStartShift(); }}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-100 shadow-sm hover:border-orange-300 hover:shadow-md transition-all group text-left"
                                    >
                                        <div>
                                            <p className="font-bold text-stone-700 text-sm">
                                                {new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-stone-400">{data.count} ออเดอร์</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-green-600 text-lg">฿{data.total.toLocaleString()}</span>
                                            <ChevronRight size={16} className="text-stone-300 group-hover:text-orange-500"/>
                                        </div>
                                    </button>
                                ))}
                                
                                {salesHistoryLog.length > 2 && (
                                    <button 
                                        onClick={onOpenFullHistory}
                                        className="w-full py-3 text-sm font-bold text-stone-400 bg-stone-50 rounded-2xl hover:bg-stone-100 hover:text-stone-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <List size={16} /> ดูทั้งหมด ({salesHistoryLog.length})
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftSetup;
