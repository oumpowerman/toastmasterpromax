
import React, { useState, useEffect } from 'react';
import { X, Check, ArrowLeft, Package, Layers, DollarSign, Calculator, Equal } from 'lucide-react';
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
    
    // Pricing State (2-Way Binding)
    const [pricePerPack, setPricePerPack] = useState<string>(''); 
    const [totalPrice, setTotalPrice] = useState<string>(defaultPrice ? defaultPrice.toString() : '');

    // --- INITIALIZE ---
    useEffect(() => {
        if (defaultPrice && item) {
             // If defaultPrice (Total) is provided, reverse calc Price Per Pack
             const qty = 1; // Default assumes 1 pack if coming from catalog click without context, but let's be safe
             // Actually, usually defaultPrice comes from the item's bulkPrice (Price per Pack in library context)
             // So let's assume defaultPrice IS Price Per Pack initially
             setPricePerPack(defaultPrice.toString());
             setTotalPrice(defaultPrice.toString());
        }
    }, [defaultPrice, item]);

    // --- HANDLERS (Reactive Logic) ---

    // 1. When Quantity Changes -> Update Total Price (Keep Price/Pack constant)
    const handleQtyChange = (val: string) => {
        setBuyQty(val);
        const qty = parseFloat(val) || 0;
        const ppp = parseFloat(pricePerPack) || 0;
        if (ppp > 0) {
            setTotalPrice((qty * ppp).toString()); // Forward Calc
        }
    };

    // 2. When Price Per Pack Changes -> Update Total Price
    const handlePricePerPackChange = (val: string) => {
        setPricePerPack(val);
        const ppp = parseFloat(val) || 0;
        const qty = parseFloat(buyQty) || 0;
        setTotalPrice((qty * ppp).toString()); // Forward Calc
    };

    // 3. When Total Price Changes -> Update Price Per Pack
    const handleTotalPriceChange = (val: string) => {
        setTotalPrice(val);
        const total = parseFloat(val) || 0;
        const qty = parseFloat(buyQty) || 1;
        if (qty > 0) {
            setPricePerPack((total / qty).toFixed(2)); // Reverse Calc
        }
    };

    // --- DERIVED VALUES ---
    const totalUnits = (parseFloat(buyQty) || 0) * (parseFloat(packSize) || 1);
    const costPerUnit = totalUnits > 0 ? (parseFloat(totalPrice) || 0) / totalUnits : 0;

    // --- ACTIONS ---
    const handleConfirm = () => {
        if (!item) return;
        
        const totalMoney = parseFloat(totalPrice) || 0;
        if (totalUnits <= 0) return;

        const resultItem: StockDeductionItem = {
            id: `bulk-${Date.now()}-${Math.random()}`,
            name: item.name,
            qty: totalUnits, // Convert to Base Units for Inventory
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
        <div className="fixed inset-0 z-[150] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200 font-cute">
            <div className="bg-white w-full h-[100dvh] md:h-auto md:w-full md:max-w-md rounded-none md:rounded-[2.5rem] shadow-2xl md:border-4 border-stone-100 relative flex flex-col overflow-hidden">
                
                {/* 1. Header (Fixed Top) */}
                <div className="shrink-0 p-6 pb-2 relative bg-stone-50 z-10 border-b border-stone-100">
                    <button onClick={onClose} className="absolute top-6 left-6 text-stone-400 hover:text-stone-600 z-10 p-2 bg-white rounded-full shadow-sm">
                        <ArrowLeft size={24}/>
                    </button>
                    <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 z-10 hidden md:block">
                        <X size={24}/>
                    </button>
                    
                    <div className="text-center mt-2">
                        <div className="w-16 h-16 bg-white rounded-3xl mx-auto mb-3 flex items-center justify-center text-3xl shadow-sm border-4 border-stone-100">📦</div>
                        <h3 className="text-xl font-black text-stone-800 line-clamp-1 leading-tight px-4">{item.name}</h3>
                        <p className="text-xs text-stone-400 font-bold mt-1 bg-stone-100 px-3 py-1 rounded-full inline-block">เครื่องคิดเลขซื้อยกแพ็ค</p>
                    </div>
                </div>

                {/* 2. Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 pt-6 custom-scrollbar bg-white">
                    <div className="space-y-6">
                        
                        {/* Section 1: Physical Qty */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-stone-400 font-bold text-xs uppercase mb-1">
                                <Package size={14}/> 1. ระบุจำนวนของ
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-stone-400 block mb-1">จะซื้อกี่แพ็ค?</label>
                                    <input 
                                        autoFocus 
                                        type="number" 
                                        className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-3 py-3 text-center font-black text-2xl outline-none focus:border-blue-400 text-blue-600 focus:bg-white transition-colors" 
                                        value={buyQty} 
                                        onChange={e => handleQtyChange(e.target.value)} 
                                    />
                                </div>
                                <div className="flex items-center pt-6 text-stone-300"><X size={20}/></div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-stone-400 block mb-1">1 แพ็ค มีกี่{item.unit}?</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-3 py-3 text-center font-black text-2xl outline-none focus:border-stone-400 text-stone-600 focus:bg-white transition-colors" 
                                        value={packSize} 
                                        onChange={e => setPackSize(e.target.value)} 
                                    />
                                </div>
                            </div>
                            
                            {/* Calculation Arrow */}
                            <div className="flex justify-center -my-3 relative z-10">
                                <div className="bg-stone-100 text-stone-400 px-3 py-1 rounded-full text-[10px] font-bold border border-stone-200 flex items-center gap-1">
                                    <Equal size={10}/> ได้ของทั้งหมด <span className="text-blue-600 font-black text-sm">{totalUnits.toLocaleString()}</span> {item.unit}
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-stone-100 w-full"></div>
                        
                        {/* Section 2: Pricing */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-stone-400 font-bold text-xs uppercase mb-1">
                                <DollarSign size={14}/> 2. ระบุราคา (แก้ช่องไหนก็ได้)
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 block mb-1">ราคาต่อ 1 แพ็ค</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full bg-white border-2 border-orange-100 rounded-2xl pl-3 pr-3 py-2 text-center font-bold text-lg outline-none focus:border-orange-400 text-stone-700 transition-colors" 
                                            value={pricePerPack} 
                                            onChange={e => handlePricePerPackChange(e.target.value)} 
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 block mb-1">ราคารวม (ตามบิล)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full bg-orange-50 border-2 border-orange-200 rounded-2xl pl-3 pr-3 py-2 text-center font-black text-xl outline-none focus:border-orange-500 text-orange-600 transition-colors" 
                                            value={totalPrice} 
                                            onChange={e => handleTotalPriceChange(e.target.value)} 
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Result Card */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-3xl border border-green-100 flex items-center justify-between shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 rounded-full blur-2xl opacity-50"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] text-green-600 font-bold uppercase mb-1 flex items-center gap-1"><Calculator size={12}/> ต้นทุนเฉลี่ย (Cost Per Unit)</p>
                                <p className="text-3xl font-black text-green-700 leading-none mt-0.5">
                                    ฿{costPerUnit.toFixed(4)}
                                </p>
                                <p className="text-[10px] text-green-500 font-bold mt-1">ต่อ 1 {item.unit}</p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm border border-green-100 relative z-10">
                                <Layers size={24}/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Footer (Fixed Bottom) */}
                <div className="shrink-0 p-6 pt-4 bg-white border-t border-stone-50 pb-8 md:pb-6">
                    <button 
                        onClick={handleConfirm} 
                        disabled={totalUnits <= 0 || parseFloat(totalPrice) <= 0}
                        className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-stone-900 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check size={24}/> ยืนยัน ({totalUnits.toLocaleString()} {item.unit})
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BulkCalcOverlay;
