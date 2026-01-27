
import React, { useState, useEffect, useMemo } from 'react';
import { Coffee, Loader2, PartyPopper, Sparkles, LogOut, Banknote, Smartphone, Bike } from 'lucide-react';
import { Order } from '../../../../types';
import { BLESSINGS, LOADING_TEXTS } from '../blessingsData';

// --- LOADING MODAL ---
export const OpeningShiftLoadingModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const [text, setText] = useState(LOADING_TEXTS[0]);

    useEffect(() => {
        if (isOpen) {
            setText(LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-orange-50/90 backdrop-blur-sm animate-in fade-in duration-300 cursor-wait">
            <div className="flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-orange-200 animate-bounce">
                        <Coffee size={64} className="text-orange-500" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border-2 border-orange-100">
                        <Loader2 size={24} className="animate-spin text-orange-400" />
                    </div>
                </div>
                <h3 className="mt-8 text-2xl font-black text-stone-800 font-cute animate-pulse">{text}</h3>
                <p className="text-stone-500 text-sm font-bold mt-2">กรุณารอสักครู่...</p>
            </div>
        </div>
    );
};

// --- OPEN SHIFT SUCCESS MODAL ---
export const OpenShiftSuccessModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const [blessing, setBlessing] = useState("");

    useEffect(() => {
        if (isOpen) {
            const randomMsg = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
            setBlessing(randomMsg);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm transition-opacity"></div>
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative z-10 animate-in zoom-in-95 flex flex-col items-center text-center shadow-2xl border-4 border-orange-100 overflow-hidden">
                
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-50 to-white -z-10"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200 rounded-full blur-3xl opacity-50"></div>

                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-100 border-4 border-orange-200 animate-bounce">
                    <PartyPopper size={48} className="text-orange-500" />
                </div>

                <h3 className="text-2xl font-black text-stone-800 font-cute mb-2">เปิดบิลสำเร็จ! 🎉</h3>
                <p className="text-stone-500 font-bold mb-6 text-sm">พร้อมลุยสำหรับวันนี้แล้ว</p>

                <div className="bg-white/60 p-4 rounded-2xl border-2 border-dashed border-orange-200 mb-8 w-full relative">
                    <Sparkles className="absolute -top-3 -right-2 text-yellow-400 fill-yellow-400 animate-pulse" size={24}/>
                    <p className="text-lg font-bold text-orange-600 font-cute leading-relaxed">
                        "{blessing}"
                    </p>
                </div>

                <button 
                    onClick={onClose}
                    className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl font-black text-xl shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    ลุยเลย! 🚀
                </button>
            </div>
        </div>
    );
};

// --- SHIFT SUMMARY MODAL ---
export const ShiftSummaryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    shiftDate: string;
    orders: Order[];
    onConfirmClose: () => void;
}> = ({ isOpen, onClose, shiftDate, orders, onConfirmClose }) => {
    if (!isOpen) return null;

    const stats = useMemo(() => {
        const validOrders = orders.filter(o => o.status !== 'cancelled');
        const totalSales = validOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const cash = validOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalPrice, 0);
        const transfer = validOrders.filter(o => o.paymentMethod === 'transfer').reduce((sum, o) => sum + o.totalPrice, 0);
        const delivery = validOrders.filter(o => o.paymentMethod === 'delivery').reduce((sum, o) => sum + o.totalPrice, 0);
        return { totalSales, cash, transfer, delivery, count: validOrders.length };
    }, [orders]);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative z-10 animate-in zoom-in-95 flex flex-col border-4 border-white shadow-2xl">
                
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-inner">
                        <LogOut size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-stone-800 font-cute">สรุปยอดวันนี้ 🎉</h3>
                    <p className="text-stone-400 font-bold mt-1">ประจำวันที่ {new Date(shiftDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <div className="bg-stone-50 p-6 rounded-[2rem] border-2 border-stone-100 mb-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-rose-500"></div>
                    <p className="text-stone-500 font-bold uppercase text-sm mb-2">ยอดขายรวมสุทธิ</p>
                    <p className="text-6xl font-black text-stone-800 tracking-tighter">฿{stats.totalSales.toLocaleString()}</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-stone-100 text-stone-500">{stats.count} บิล</span>
                    </div>
                </div>

                <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl border border-green-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl text-green-600 shadow-sm"><Banknote size={20}/></div>
                            <span className="font-bold text-stone-600">เงินสด</span>
                        </div>
                        <span className="font-black text-green-600 text-xl">฿{stats.cash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm"><Smartphone size={20}/></div>
                            <span className="font-bold text-stone-600">เงินโอน</span>
                        </div>
                        <span className="font-black text-blue-600 text-xl">฿{stats.transfer.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl text-orange-600 shadow-sm"><Bike size={20}/></div>
                            <span className="font-bold text-stone-600">Delivery</span>
                        </div>
                        <span className="font-black text-orange-600 text-xl">฿{stats.delivery.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="px-6 py-4 rounded-2xl font-bold text-stone-400 hover:bg-stone-50 transition-colors">กลับไปขายต่อ</button>
                    <button onClick={onConfirmClose} className="flex-1 bg-rose-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-200 hover:bg-rose-600 hover:-translate-y-1 transition-all">
                        ปิดร้าน & พักผ่อน 🌙
                    </button>
                </div>
            </div>
        </div>
    );
};
