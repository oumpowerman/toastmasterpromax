
import React, { useState } from 'react';
import { X, Check, ArrowLeft } from 'lucide-react';
import { InventoryItem, IngredientLibraryItem } from '../../../../types';
import { StockDeductionItem } from '../TransactionForm';

interface BulkCalcOverlayProps {
    item: InventoryItem | IngredientLibraryItem | null;
    onClose: () => void;
    onConfirm: (item: StockDeductionItem) => void;
    defaultPrice?: number;
}

const BulkCalcOverlay: React.FC<BulkCalcOverlayProps> = ({ item, onClose, onConfirm, defaultPrice }) => {
    
    // --- STATE ---
    const [buyQty, setBuyQty] = useState<string>('1'); // Packs
    const [packSize, setPackSize] = useState<string>((item as IngredientLibraryItem)?.totalQuantity?.toString() || '1');
    const [totalPrice, setTotalPrice] = useState<string>(defaultPrice ? defaultPrice.toString() : (item as IngredientLibraryItem)?.bulkPrice?.toString() || '');

    // --- ACTIONS ---
    const handleConfirm = () => {
        if (!item) return;
        
        const qtyPacks = parseFloat(buyQty) || 0;
        const sizePerPack = parseFloat(packSize) || 1;
        const totalMoney = parseFloat(totalPrice) || 0;
        
        if (qtyPacks <= 0) return;

        const totalUnits = qtyPacks * sizePerPack;
        const costPerUnit = totalUnits > 0 ? totalMoney / totalUnits : 0;

        const resultItem: StockDeductionItem = {
            id: `bulk-${Date.now()}-${Math.random()}`,
            name: item.name,
            qty: totalUnits, // Convert to Base Units
            type: 'inventory',
            refId: item.id,
            unit: item.unit || 'ชิ้น',
            costPerUnit: costPerUnit,
            category: 'ingredient'
        };
        
        onConfirm(resultItem);
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full h-[100dvh] md:h-auto md:w-full md:max-w-sm rounded-none md:rounded-[2.5rem] shadow-2xl md:border-4 border-stone-100 relative flex flex-col overflow-hidden">
                
                {/* 1. Header (Fixed Top) */}
                <div className="shrink-0 p-6 pb-2 relative bg-white z-10">
                    <button onClick={onClose} className="absolute top-6 left-6 text-stone-400 hover:text-stone-600 z-10 p-2 bg-stone-100 rounded-full">
                        <ArrowLeft size={24}/>
                    </button>
                    <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 z-10 hidden md:block">
                        <X size={24}/>
                    </button>
                    
                    <div className="text-center mt-4">
                        <div className="w-16 h-16 bg-stone-100 rounded-3xl mx-auto mb-3 flex items-center justify-center text-3xl shadow-sm border-4 border-white">📦</div>
                        <h3 className="text-xl font-black text-stone-800 line-clamp-1 leading-tight px-4">{item.name}</h3>
                        <p className="text-xs text-stone-400 font-bold mt-1">เครื่องคิดเลขซื้อยกแพ็ค</p>
                    </div>
                </div>

                {/* 2. Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                    <div className="space-y-5">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">จำนวน (แพ็ค)</label>
                                <input autoFocus type="number" className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-3 py-3 text-center font-black text-2xl outline-none focus:border-orange-400 text-stone-700 focus:bg-white transition-colors" value={buyQty} onChange={e => setBuyQty(e.target.value)} />
                            </div>
                            <div className="flex items-center pt-6 text-stone-300"><X size={20}/></div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">ขนาดบรรจุ</label>
                                <input type="number" className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-3 py-3 text-center font-black text-2xl outline-none focus:border-orange-400 text-stone-700 focus:bg-white transition-colors" value={packSize} onChange={e => setPackSize(e.target.value)} />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">ราคารวม (Total Price)</label>
                            <input type="number" placeholder="0" className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-6 py-4 font-black text-4xl outline-none focus:border-green-400 text-right text-green-600 placeholder-stone-300 focus:bg-white transition-colors" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center shadow-sm">
                            <span className="text-xs font-bold text-blue-500 uppercase">ตกหน่วยละ:</span>
                            <span className="text-2xl font-black text-blue-600">
                                ฿{((Number(totalPrice) || 0) / (Number(buyQty) * Number(packSize) || 1)).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Footer (Fixed Bottom) */}
                <div className="shrink-0 p-6 pt-2 bg-white border-t border-stone-50">
                    <button onClick={handleConfirm} className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-stone-900 transition-all flex items-center justify-center gap-3 active:scale-95">
                        <Check size={24}/> ยืนยันลงบิล
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BulkCalcOverlay;
