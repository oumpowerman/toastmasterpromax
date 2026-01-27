
import React from 'react';
import { ChefHat, X, Utensils, Clock, FileEdit, Plus, CheckCircle2 } from 'lucide-react';
import { Order } from '../../../../types';

export const KitchenDisplay: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    shiftDate: string;
    activeOrders: Order[];
    updateOrderStatus: (id: string, status: Order['status']) => void;
}> = ({ isOpen, onClose, shiftDate, activeOrders, updateOrderStatus }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex bg-stone-900/95 backdrop-blur-md p-6 overflow-hidden animate-in fade-in">
            <div className="w-full flex flex-col">
                <div className="flex justify-between items-center mb-8 text-white">
                    <h2 className="text-3xl font-bold flex items-center gap-3"><ChefHat className="text-orange-500" size={40}/> ครัว (Kitchen Monitor)</h2>
                    <div className="text-right mr-4">
                        <p className="text-xs text-stone-400 font-bold">DATE</p>
                        <p className="text-xl font-black">{shiftDate}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20"><X size={24}/></button>
                </div>
                
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                    <div className="flex gap-4 h-full">
                        {activeOrders.length === 0 ? (
                            <div className="m-auto text-center text-white/30">
                                <Utensils size={80} className="mx-auto mb-4"/>
                                <p className="text-2xl font-bold">ไม่มีออเดอร์ค้าง (ของวันนี้)</p>
                            </div>
                        ) : (
                            activeOrders.map(order => (
                                <div key={order.id} className="w-[320px] bg-white rounded-3xl shrink-0 flex flex-col overflow-hidden shadow-2xl h-full border-4 border-stone-800 relative snap-center">
                                    <div className="bg-stone-800 text-white p-5 flex justify-between items-center">
                                        <div>
                                            <span className="text-orange-400 font-bold text-xs uppercase">Queue</span>
                                            <h3 className="text-5xl font-black">#{order.queueNumber}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold opacity-50 flex items-center justify-end gap-1"><Clock size={12}/> {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold mt-1 inline-block ${order.channel === 'Dine-In' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>{order.channel || order.paymentMethod}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 p-5 overflow-y-auto bg-stone-50 space-y-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="border-b border-stone-200 pb-3 last:border-0">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-stone-800 text-xl leading-tight">{item.name}</span>
                                                    <span className="bg-stone-200 text-stone-600 px-3 py-1 rounded-lg font-black text-xl">x{item.quantity}</span>
                                                </div>
                                                {item.modifiers && item.modifiers.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {item.modifiers.map((m, i) => (
                                                            <span key={i} className="text-sm bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold">{m}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.toppings && item.toppings.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.toppings.map((t, i) => (
                                                            <span key={i} className="text-sm bg-purple-100 text-purple-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                                                <Plus size={10}/> {t.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.notes && <p className="text-sm text-red-500 font-bold mt-1 flex items-center gap-1"><FileEdit size={12}/> {item.notes}</p>}
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                        className="p-6 bg-green-500 hover:bg-green-600 text-white font-bold text-2xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={32}/> เสร็จแล้ว (Done)
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
