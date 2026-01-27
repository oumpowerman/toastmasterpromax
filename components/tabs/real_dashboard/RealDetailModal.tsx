
import React from 'react';
import { X, Receipt, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { Order } from '../../../types';

export type MetricType = 'sales' | 'cash' | 'transfer' | 'delivery' | 'topItems' | null;

interface RealDetailModalProps {
    type: MetricType;
    onClose: () => void;
    data: {
        title: string;
        orders?: Order[]; // For Sales/Payments
        items?: { name: string; qty: number; total: number }[]; // For Top Items
    };
}

export const RealDetailModal: React.FC<RealDetailModalProps> = ({ type, onClose, data }) => {
    if (!type) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-cute">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2.5rem] relative z-10 animate-in zoom-in-95 flex flex-col shadow-2xl border-4 border-white overflow-hidden">
                
                {/* Header */}
                <div className="p-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">
                        {type === 'topItems' ? <ShoppingBag className="text-orange-500"/> : <Receipt className="text-green-500"/>}
                        {data.title}
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white hover:bg-stone-200 text-stone-400 flex items-center justify-center transition-colors shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-stone-50/30">
                    
                    {/* CASE 1: ORDER LIST (Sales / Payment) */}
                    {data.orders && (
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-stone-400 px-2 uppercase mb-1">
                                <span>เวลา / คิว</span>
                                <span>ยอดเงิน</span>
                            </div>
                            {data.orders.length === 0 ? (
                                <div className="text-center py-10 text-stone-300">ไม่มีรายการ</div>
                            ) : (
                                data.orders.sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map((order) => (
                                    <div key={order.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex justify-between items-center shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center font-black text-stone-600 text-sm">
                                                #{order.queueNumber}
                                            </div>
                                            <div>
                                                <p className="font-bold text-stone-700 text-sm flex items-center gap-1">
                                                    <Clock size={10} className="text-stone-400"/>
                                                    {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                                <p className="text-[10px] text-stone-400">{order.items.length} รายการ</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-stone-800 text-lg">฿{order.totalPrice.toLocaleString()}</p>
                                            <p className="text-[10px] text-stone-400 font-bold bg-stone-50 px-1.5 rounded inline-block">{order.channel || order.paymentMethod}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* CASE 2: TOP ITEMS LIST */}
                    {data.items && (
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-stone-400 px-2 uppercase mb-1">
                                <span>เมนู</span>
                                <span>จำนวน / ยอดขาย</span>
                            </div>
                            {data.items.map((item, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-2xl border border-stone-100 flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx < 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-stone-100 text-stone-400'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-stone-700 text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-stone-800">{item.qty} <span className="text-[10px] font-normal text-stone-400">ชิ้น</span></p>
                                        <p className="text-[10px] text-green-500 font-bold">฿{item.total.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
