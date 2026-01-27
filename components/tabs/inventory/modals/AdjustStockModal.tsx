
import React, { useState } from 'react';
import { X, ArrowUp, ArrowDown, DollarSign, Clock, CheckSquare, Plus, Minus } from 'lucide-react';
import { InventoryItem } from '../../../../types';

export const AdjustStockModal: React.FC<{
    item: InventoryItem | null;
    type: 'add' | 'remove';
    onClose: () => void;
    onConfirm: (data: { qty: number; packSize: number; totalCost: number; expiry: string; ledger: boolean; inputMode: 'pack' | 'unit' }) => void;
}> = ({ item, type, onClose, onConfirm }) => {
    if (!item) return null;
    const [inputMode, setInputMode] = useState<'pack' | 'unit'>('pack');
    const [qty, setQty] = useState('');
    const [packSize, setPackSize] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [expiry, setExpiry] = useState('');
    const [ledger, setLedger] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ qty: Number(qty), packSize: Number(packSize), totalCost: Number(totalPrice), expiry, ledger, inputMode });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative z-10 animate-in zoom-in-95 overflow-hidden shadow-2xl">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold font-cute mb-1 flex items-center justify-center gap-2">
                        {type === 'add' ? <ArrowUp className="text-green-500"/> : <ArrowDown className="text-red-500"/>}
                        {type === 'add' ? (item.type === 'asset' ? 'เพิ่มจำนวนทรัพย์สิน' : 'รับของเข้า (Restock)') : 'ตัดสต็อก (Withdraw)'}
                    </h3>
                    <p className="text-stone-500 font-bold text-lg leading-relaxed py-1">{item.name}</p>
                    <p className="text-xs text-stone-400 font-bold bg-stone-100 px-3 py-1 rounded-full inline-block mt-1">คงเหลือ: {item.quantity.toLocaleString()} {item.unit}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {item.type !== 'asset' && (
                        <div className="flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
                            <button type="button" onClick={() => setInputMode('pack')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${inputMode === 'pack' ? 'bg-white shadow-md text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>แบบแพ็ค</button>
                            <button type="button" onClick={() => setInputMode('unit')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${inputMode === 'unit' ? 'bg-white shadow-md text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>ระบุจำนวน</button>
                        </div>
                    )}
                    <div className="space-y-4 bg-stone-50 p-6 rounded-[2rem] border border-stone-100">
                        {inputMode === 'pack' && item.type !== 'asset' ? (
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-stone-400 uppercase ml-1 mb-1 block">จำนวน (แพ็ค)</label>
                                    <input type="number" autoFocus required min="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl font-bold text-stone-700 outline-none focus:border-orange-300 text-lg text-center" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-stone-400 uppercase ml-1 mb-1 block">ขนาดต่อแพ็ค</label>
                                    <input type="number" required min="1" value={packSize} onChange={e => setPackSize(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl font-bold text-stone-700 outline-none focus:border-orange-300 text-lg text-center" />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="text-xs font-bold text-stone-400 uppercase ml-1 mb-1 block">จำนวน ({item.unit})</label>
                                <input type="number" autoFocus required min="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl font-bold text-stone-700 outline-none focus:border-orange-300 text-3xl font-black text-center" />
                            </div>
                        )}
                        {type === 'add' && (
                            <div className="pt-4 border-t border-dashed border-stone-200 mt-2 space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-stone-400 uppercase ml-1 flex items-center gap-1 mb-1"><DollarSign size={12}/> ราคารวม (บาท)</label>
                                    <input type="number" placeholder="0" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl font-bold text-stone-700 outline-none focus:border-green-400 text-xl" />
                                </div>
                                {item.type !== 'asset' && (
                                    <div>
                                        <label className="text-xs font-bold text-stone-400 uppercase ml-1 flex items-center gap-1 mb-1"><Clock size={12}/> วันหมดอายุ (ถ้ามี)</label>
                                        <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl font-bold text-stone-700 outline-none focus:border-orange-300" />
                                    </div>
                                )}
                                <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-xl border border-stone-200 hover:border-blue-400 transition-colors shadow-sm">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors border ${ledger ? 'bg-blue-500 border-blue-500 text-white' : 'bg-stone-100 border-stone-200 text-stone-300'}`}>{ledger && <CheckSquare size={16} />}</div>
                                    <input type="checkbox" checked={ledger} onChange={e => setLedger(e.target.checked)} className="hidden" />
                                    <span className="text-xs font-bold text-stone-600">บันทึกรายจ่ายลงบัญชีอัตโนมัติ</span>
                                </label>
                            </div>
                        )}
                    </div>
                    <button type="submit" className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg transition-transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 ${type === 'add' ? 'bg-green-500 hover:bg-green-600 shadow-green-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}>
                        {type === 'add' ? <Plus size={20}/> : <Minus size={20}/>} ยืนยัน
                    </button>
                </form>
                <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors"><X size={20}/></button>
            </div>
        </div>
    );
};
