
import React from 'react';
import { History, X, List, Filter, FileText, Clock, ChevronRight } from 'lucide-react';
import { Order } from '../../../../types';

// --- SHIFT HISTORY ---
export const ShiftHistoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    shiftDate: string;
    shiftTotalSales: number;
    orders: Order[];
    onVoidOrder: (id: string) => void;
}> = ({ isOpen, onClose, shiftDate, shiftTotalSales, orders, onVoidOrder }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] p-8 relative z-10 animate-in zoom-in-95 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2"><History className="text-stone-400"/> ประวัติบิล</h3>
                        <p className="text-sm text-stone-400 font-bold">ของวันที่: <span className="text-stone-700">{shiftDate}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-stone-400 uppercase font-bold">ยอดขายรวม</p>
                        <p className="text-2xl font-black text-green-500">฿{shiftTotalSales.toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center absolute top-8 right-8"><X/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {orders.length === 0 ? (
                        <p className="text-center text-stone-300 py-10 font-bold">ยังไม่มีรายการขายในวันที่เลือก</p>
                    ) : (
                        [...orders].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(order => (
                            <div key={order.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${order.status === 'cancelled' ? 'bg-red-50 border-red-100 opacity-60' : 'bg-white border-stone-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${order.status === 'cancelled' ? 'bg-red-200 text-red-500' : 'bg-stone-800 text-white'}`}>
                                        #{order.queueNumber}
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-700">฿{order.totalPrice}</p>
                                        <p className="text-xs text-stone-400">{new Date(order.timestamp).toLocaleTimeString()} • {order.items.length} รายการ</p>
                                        {order.status === 'cancelled' && <span className="text-xs font-bold text-red-500">ยกเลิกแล้ว</span>}
                                    </div>
                                </div>
                                {order.status !== 'cancelled' && (
                                    <button 
                                        onClick={() => onVoidOrder(order.id)}
                                        className="px-4 py-2 bg-red-100 text-red-500 rounded-xl font-bold text-sm hover:bg-red-200"
                                    >
                                        Void
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// --- FULL HISTORY / LOG ---
export const FullHistoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    filterStart: string;
    setFilterStart: (d: string) => void;
    filterEnd: string;
    setFilterEnd: (d: string) => void;
    historyStats: { count: number; total: number };
    filteredOrders: Order[];
    onVoidOrder: (id: string) => void;
    showFullList?: boolean; // New prop to handle limited vs full view if needed, but logic is mainly in parent
    salesHistoryLog?: any[]; // For setup screen view
    mode?: 'log' | 'orders'; // 'log' for setup screen summary, 'orders' for full search
    onSelectDate?: (date: string) => void; // For log mode
}> = ({ 
    isOpen, onClose, filterStart, setFilterStart, filterEnd, setFilterEnd, historyStats, filteredOrders, onVoidOrder, 
    mode = 'orders', salesHistoryLog, onSelectDate 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className={`bg-white w-full rounded-[2.5rem] p-8 relative z-10 animate-in zoom-in-95 flex flex-col shadow-2xl ${mode === 'log' ? 'max-w-lg max-h-[80vh]' : 'max-w-3xl max-h-[85vh]'}`}>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-2 border-b border-stone-100">
                    <div>
                        <h3 className="text-2xl font-black text-stone-800 flex items-center gap-2">
                            {mode === 'log' ? <History className="text-orange-400"/> : <List className="text-orange-400"/>} 
                            {mode === 'log' ? 'ประวัติการขายทั้งหมด' : 'ประวัติการขาย (ค้นหา)'}
                        </h3>
                        {mode === 'orders' && <p className="text-sm text-stone-400 font-bold">ค้นหาย้อนหลังและดูยอดขายรวม</p>}
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500">
                        <X size={20} />
                    </button>
                </div>

                {mode === 'orders' && (
                    <>
                        {/* Filters */}
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 mb-6 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold text-stone-400 uppercase mb-1 flex items-center gap-1"><Filter size={12}/> ช่วงวันที่ (Date Range)</label>
                                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-200">
                                    <input 
                                        type="date" 
                                        value={filterStart}
                                        onChange={e => setFilterStart(e.target.value)}
                                        className="font-bold text-stone-600 outline-none text-sm bg-transparent"
                                    />
                                    <span className="text-stone-300">➜</span>
                                    <input 
                                        type="date" 
                                        value={filterEnd}
                                        onChange={e => setFilterEnd(e.target.value)}
                                        className="font-bold text-stone-600 outline-none text-sm bg-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 items-center bg-white px-4 py-3 rounded-xl border border-stone-200 shadow-sm min-w-[200px]">
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase">ยอดรวมช่วงนี้</p>
                                    <p className="text-xl font-black text-green-500">฿{historyStats.total.toLocaleString()}</p>
                                </div>
                                <div className="h-8 w-px bg-stone-100"></div>
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase">จำนวนบิล</p>
                                    <p className="text-xl font-black text-stone-700">{historyStats.count}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* List Orders */}
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-20 text-stone-300">
                                    <FileText size={48} className="mx-auto mb-2 opacity-20"/>
                                    <p className="font-bold">ไม่พบรายการในช่วงวันที่เลือก</p>
                                </div>
                            ) : (
                                filteredOrders.map(order => (
                                    <div key={order.id} className={`p-4 rounded-2xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${order.status === 'cancelled' ? 'bg-red-50 border-red-100 opacity-60' : 'bg-white border-stone-100 hover:border-orange-200'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${order.status === 'cancelled' ? 'bg-red-200 text-red-500' : 'bg-stone-800 text-white'}`}>
                                                    #{order.queueNumber}
                                                </div>
                                                <span className="text-[10px] font-bold text-stone-400 mt-1">{new Date(order.timestamp).toLocaleDateString('th-TH', {day:'numeric', month:'short'})}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-stone-700 text-lg">฿{order.totalPrice.toLocaleString()}</p>
                                                <div className="flex flex-wrap gap-2 text-xs text-stone-400 mt-1">
                                                    <span className="flex items-center gap-1"><Clock size={10}/> {new Date(order.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                    <span>• {order.paymentMethod}</span>
                                                    {order.channel && <span>• {order.channel}</span>}
                                                </div>
                                                {order.status === 'cancelled' && <span className="text-xs font-bold text-red-500 bg-white px-2 py-0.5 rounded border border-red-100 mt-1 inline-block">ยกเลิกแล้ว</span>}
                                            </div>
                                        </div>
                                        
                                        {/* Items Preview */}
                                        <div className="flex-1 bg-stone-50 p-2 rounded-xl text-xs text-stone-500 max-h-20 overflow-y-auto custom-scrollbar">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between">
                                                    <span>{item.quantity}x {item.name}</span>
                                                    <span className="font-bold">฿{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {order.status !== 'cancelled' && (
                                            <button 
                                                onClick={() => onVoidOrder(order.id)}
                                                className="px-4 py-2 bg-stone-100 text-stone-400 rounded-xl font-bold text-xs hover:bg-red-100 hover:text-red-500 transition-colors whitespace-nowrap self-end md:self-center"
                                            >
                                                Void
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Log Mode (For Setup Screen) */}
                {mode === 'log' && salesHistoryLog && (
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {salesHistoryLog.map(([date, data]) => (
                            <button 
                                key={date}
                                onClick={() => { if(onSelectDate) onSelectDate(date); onClose(); }}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-stone-100 shadow-sm hover:border-orange-300 hover:shadow-md transition-all group text-left"
                            >
                                <div>
                                    <p className="font-bold text-stone-700 text-base">
                                        {new Date(date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-stone-400">{data.count} ออเดอร์</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-green-600 text-xl">฿{data.total.toLocaleString()}</span>
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                                        <ChevronRight size={16}/>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
