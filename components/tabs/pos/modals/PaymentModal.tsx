
import React from 'react';
import { Banknote, Smartphone, Bike, CheckCircle2 } from 'lucide-react';
import { QUICK_CASH } from '../constants';
import { OrderItem } from '../../../../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    paymentMethod: 'cash' | 'transfer' | 'delivery';
    setPaymentMethod: (m: 'cash' | 'transfer' | 'delivery') => void;
    deliveryChannel: string;
    setDeliveryChannel: (c: string) => void;
    cashReceived: string;
    setCashReceived: (val: string) => void;
    change: number;
    gpAmount: number;
    netTotal: number;
    gpPercent: number;
    onCheckout: () => void;
    cart: OrderItem[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen, onClose, total, paymentMethod, setPaymentMethod, deliveryChannel, setDeliveryChannel, cashReceived, setCashReceived, change, gpAmount, netTotal, gpPercent, onCheckout, cart
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 md:p-8 relative z-10 animate-in zoom-in-95 flex flex-col overflow-hidden shadow-2xl">
                
                {/* PAYMENT CONTROLS */}
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <div className="text-center mb-6 shrink-0">
                        <p className="text-stone-400 font-bold uppercase mb-1 text-sm">ยอดที่ต้องชำระ</p>
                        <h2 className="text-6xl font-black text-stone-800 tracking-tighter">฿{total}</h2>
                    </div>

                    <div className="flex p-1.5 bg-stone-100 rounded-2xl mb-6 shrink-0">
                        {[
                            { id: 'cash', label: 'เงินสด', icon: Banknote },
                            { id: 'transfer', label: 'โอนเงิน', icon: Smartphone },
                            { id: 'delivery', label: 'App', icon: Bike },
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setPaymentMethod(m.id as any)}
                                className={`flex-1 py-3 md:py-4 rounded-xl font-bold flex flex-col items-center gap-1 transition-all text-sm md:text-base ${paymentMethod === m.id ? 'bg-white text-stone-800 shadow-md transform scale-100' : 'text-stone-400 hover:text-stone-600 scale-95'}`}
                            >
                                <m.icon size={24} /> {m.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1">
                        {paymentMethod === 'cash' && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">รับเงินมา</span>
                                    <input 
                                        type="number" 
                                        autoFocus
                                        value={cashReceived}
                                        onChange={e => setCashReceived(e.target.value)}
                                        className="w-full pl-32 pr-6 py-4 md:py-5 bg-stone-50 border-2 border-stone-200 rounded-2xl text-right text-4xl md:text-5xl font-black outline-none focus:border-green-500 transition-colors"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {QUICK_CASH.map(amount => (
                                        <button 
                                            key={amount}
                                            onClick={() => setCashReceived(amount.toString())}
                                            className="py-3 md:py-4 bg-stone-100 rounded-xl font-black text-stone-600 hover:bg-stone-200 transition-colors text-lg md:text-xl"
                                        >
                                            {amount}
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-stone-800 text-white p-5 md:p-6 rounded-2xl flex justify-between items-center shadow-lg">
                                    <span className="font-bold text-lg md:text-xl text-stone-400">เงินทอน</span>
                                    <span className={`text-4xl md:text-5xl font-black ${change < 0 ? 'text-red-400' : 'text-green-400'}`}>฿{Math.max(0, change)}</span>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'delivery' && (
                            <div className="space-y-4">
                                <p className="text-center text-stone-500 font-bold">เลือกค่าย (หัก GP อัตโนมัติ)</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Grab', 'Lineman', 'Shopee'].map((app) => (
                                        <button
                                            key={app}
                                            onClick={() => setDeliveryChannel(app)}
                                            className={`py-6 rounded-2xl font-black text-lg md:text-xl border-4 transition-all ${deliveryChannel === app ? 'border-green-500 bg-green-50 text-green-700' : 'border-stone-100 bg-white text-stone-400 hover:border-green-200'}`}
                                        >
                                            {app}
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-orange-700 text-center">
                                    <p className="text-xs font-bold uppercase mb-1">หักค่า GP ({gpPercent}%)</p>
                                    <p className="text-2xl font-black">-฿{gpAmount}</p>
                                    <p className="text-xs mt-1 opacity-70">เหลือเข้ากระเป๋า ฿{netTotal}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex gap-3 shrink-0">
                        <button onClick={onClose} className="px-6 md:px-8 py-4 md:py-5 text-stone-400 font-bold hover:text-stone-600 hover:bg-stone-100 rounded-2xl transition-colors text-base md:text-lg">ยกเลิก</button>
                        <button 
                            onClick={onCheckout}
                            disabled={paymentMethod === 'cash' && change < 0}
                            className="flex-1 py-4 md:py-5 bg-green-500 text-white rounded-2xl font-bold text-xl md:text-2xl shadow-lg shadow-green-200 hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95"
                        >
                            <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8" /> จบการขาย
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
