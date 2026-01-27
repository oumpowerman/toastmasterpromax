
import React from 'react';
import { Clock, Receipt, X, ChevronRight, ChefHat, CheckCircle2, Utensils } from 'lucide-react';
import { Order } from '../../../../types';

interface WaitingBillsModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
    onSelectOrder: (order: Order) => void;
}

export const WaitingBillsModal: React.FC<WaitingBillsModalProps> = ({ isOpen, onClose, orders, onSelectOrder }) => {
    if (!isOpen) return null;

    // Sort: Served first, then oldest cooking
    const sortedOrders = [...orders].sort((a, b) => {
        if (a.status === 'served' && b.status !== 'served') return -1;
        if (b.status === 'served' && a.status !== 'served') return 1;
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2.5rem] relative z-10 animate-in zoom-in-95 flex flex-col shadow-2xl border-4 border-white font-cute overflow-hidden">
                
                {/* Header */}
                <div className="p-6 bg-orange-50 border-b border-orange-100 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">
                            <Receipt className="text-orange-500" /> บิลรอจ่าย ({orders.length})
                        </h3>
                        <p className="text-stone-500 text-sm font-bold">เลือกบิลเพื่อคิดเงิน (Checkbin)</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white hover:bg-orange-100 text-stone-400 flex items-center justify-center transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-stone-50/50 space-y-3">
                    {sortedOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-stone-300">
                            <ChefHat size={48} className="mb-2 opacity-30"/>
                            <p className="text-lg font-bold">ไม่มีรายการค้าง</p>
                            <p className="text-xs">รับออเดอร์ใหม่ได้เลย!</p>
                        </div>
                    ) : (
                        sortedOrders.map((order) => {
                            const isServed = order.status === 'served';
                            
                            return (
                                <button 
                                    key={order.id}
                                    onClick={() => onSelectOrder(order)}
                                    className={`w-full p-4 rounded-2xl border-2 shadow-sm flex items-center justify-between transition-all group relative overflow-hidden ${isServed ? 'bg-green-50 border-green-200 hover:border-green-400' : 'bg-white border-stone-100 hover:border-orange-400'}`}
                                >
                                    {isServed && <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-500"></div>}
                                    
                                    <div className="flex items-center gap-4 pl-2">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${isServed ? 'bg-green-500 text-white shadow-green-200' : 'bg-stone-800 text-white'}`}>
                                            #{order.queueNumber}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-stone-800 text-lg">฿{order.totalPrice.toLocaleString()}</p>
                                                {isServed ? (
                                                    <span className="text-[10px] bg-green-200 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                        <CheckCircle2 size={10} /> พร้อมเสิร์ฟ
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] bg-stone-200 text-stone-500 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                        <Utensils size={10} /> กำลังทำ
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-stone-400 flex items-center gap-1 font-medium">
                                                <Clock size={10} /> {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                                <span className="mx-1">•</span>
                                                {order.items.length} รายการ
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 font-bold text-sm ${isServed ? 'text-green-600' : 'text-stone-300 group-hover:text-orange-500'}`}>
                                        คิดเงิน <ChevronRight size={18} />
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
