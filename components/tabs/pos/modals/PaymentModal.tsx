
import React from 'react';
import { Banknote, Smartphone, Bike, CheckCircle2, RotateCcw, Coins } from 'lucide-react';
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

    // --- LOGIC: Accumulate Cash ---
    const handleAddCash = (amount: number) => {
        const current = Number(cashReceived) || 0;
        setCashReceived((current + amount).toString());
    };

    const handleExact = () => {
        setCashReceived(total.toString());
    };

    const handleClear = () => {
        setCashReceived('');
    };

    const CASH_OPTIONS = [
        { val: 1000, label: '1,000', color: 'bg-stone-100 text-stone-600' },
        { val: 500, label: '500', color: 'bg-purple-50 text-purple-600' },
        { val: 100, label: '100', color: 'bg-red-50 text-red-600' },
        { val: 50, label: '50', color: 'bg-blue-50 text-blue-600' },
        { val: 20, label: '20', color: 'bg-green-50 text-green-600' },
    ];

    const COIN_OPTIONS = [
        { val: 10, label: '10' },
        { val: 5, label: '5' },
        { val: 1, label: '1' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 md:p-8 relative z-10 animate-in zoom-in-95 flex flex-col overflow-hidden shadow-2xl max-h-[90vh]">
                
                {/* PAYMENT CONTROLS */}
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <div className="text-center mb-6 shrink-0">
                        <p className="text-stone-400 font-bold uppercase mb-1 text-sm">ยอดที่ต้องชำระ</p>
                        <h2 className="text-6xl font-black text-stone-800 tracking-tighter">฿{total.toLocaleString()}</h2>
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
                                {/* Display & Controls */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">รับเงินมา</span>
                                        <input 
                                            type="number"
                                            inputMode="decimal" 
                                            pattern="[0-9]*"
                                            autoFocus
                                            value={cashReceived}
                                            onChange={e => setCashReceived(e.target.value)}
                                            className="w-full pl-24 pr-4 py-4 bg-stone-50 border-2 border-stone-200 rounded-2xl text-right text-3xl font-black outline-none focus:border-green-500 transition-colors"
                                            placeholder="0"
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <button onClick={handleExact} className="px-4 bg-blue-500 text-white rounded-2xl font-bold shadow-md hover:bg-blue-600 active:scale-95 transition-all text-sm">
                                        พอดี
                                    </button>
                                    <button onClick={handleClear} className="px-4 bg-stone-200 text-stone-500 rounded-2xl font-bold hover:bg-stone-300 active:scale-95 transition-all">
                                        <RotateCcw size={20}/>
                                    </button>
                                </div>

                                {/* Banknotes Grid */}
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {CASH_OPTIONS.map(opt => (
                                        <button 
                                            key={opt.val}
                                            onClick={() => handleAddCash(opt.val)}
                                            className={`py-3 rounded-xl font-black transition-transform active:scale-90 shadow-sm border border-transparent hover:border-stone-200 ${opt.color}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Coins Grid */}
                                <div className="flex items-center gap-2">
                                    <div className="bg-yellow-50 p-2 rounded-xl text-yellow-600 shrink-0">
                                        <Coins size={20} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 flex-1">
                                        {COIN_OPTIONS.map(opt => (
                                            <button 
                                                key={opt.val}
                                                onClick={() => handleAddCash(opt.val)}
                                                className="py-2 rounded-xl font-bold text-stone-600 bg-yellow-50 border border-yellow-100 hover:bg-yellow-100 transition-transform active:scale-90"
                                            >
                                                +{opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Change Display */}
                                <div className="bg-stone-800 text-white p-5 md:p-6 rounded-2xl flex justify-between items-center shadow-lg mt-2">
                                    <span className="font-bold text-lg md:text-xl text-stone-400">เงินทอน</span>
                                    <span className={`text-4xl md:text-5xl font-black ${change < 0 ? 'text-red-400' : 'text-green-400'}`}>฿{Math.max(0, change).toLocaleString()}</span>
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
                                    <p className="text-2xl font-black">-฿{gpAmount.toLocaleString()}</p>
                                    <p className="text-xs mt-1 opacity-70">เหลือเข้ากระเป๋า ฿{netTotal.toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'transfer' && (
                            <div className="space-y-4 text-center py-4">
                                <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 inline-block mb-2">
                                    <Smartphone size={64} className="text-blue-500 mx-auto mb-2" />
                                    <p className="text-blue-700 font-bold">กรุณาตรวจสอบยอดโอน</p>
                                </div>
                                <p className="text-stone-400 text-sm">ยอดโอนที่ต้องได้รับ</p>
                                <p className="text-5xl font-black text-stone-800">฿{total.toLocaleString()}</p>
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
