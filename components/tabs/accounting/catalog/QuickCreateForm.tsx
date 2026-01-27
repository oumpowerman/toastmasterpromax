
import React, { useState, useMemo } from 'react';
import { Package, Armchair, Wheat, Box, Calculator, X, Scale, AlertCircle, Clock, Recycle, Plus, Banknote } from 'lucide-react';
import { StockDeductionItem } from '../TransactionForm';

interface QuickCreateFormProps {
    onConfirm: (item: StockDeductionItem) => void;
}

const COMMON_UNITS = ['กรัม', 'มล.', 'กก.', 'ลิตร', 'ชิ้น', 'แผ่น', 'ฟอง', 'ใบ', 'ขวด', 'กระป๋อง'];

const QuickCreateForm: React.FC<QuickCreateFormProps> = ({ onConfirm }) => {
    // --- STATE ---
    const [newItemType, setNewItemType] = useState<'consumable' | 'asset' | 'service'>('consumable');
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    
    // Consumable Specific
    const [newItemSubCategory, setNewItemSubCategory] = useState<'ingredient' | 'packaging'>('ingredient');
    const [calcMode, setCalcMode] = useState<'direct' | 'bulk'>('direct');
    const [buyQty, setBuyQty] = useState('1');      
    const [packSize, setPackSize] = useState('1');  
    const [newItemUnit, setNewItemUnit] = useState('ชิ้น'); 
    const [newItemMinLevel, setNewItemMinLevel] = useState('5');

    // Asset Specific
    const [newItemQty, setNewItemQty] = useState('1');
    const [newItemLifespan, setNewItemLifespan] = useState('365');
    const [newItemSalvage, setNewItemSalvage] = useState('0');

    // --- COMPUTED VALUES ---
    const finalStockQty = useMemo(() => {
        if (newItemType === 'asset' || newItemType === 'service') return Number(newItemQty);
        
        const q = Number(buyQty) || 0;
        if (calcMode === 'direct') return q;
        
        const size = Number(packSize) || 1;
        return q * size;
    }, [newItemType, newItemQty, calcMode, buyQty, packSize]);

    const costPerBaseUnit = useMemo(() => {
        const price = Number(newItemPrice) || 0;
        if (finalStockQty <= 0) return 0;
        return price / finalStockQty;
    }, [newItemPrice, finalStockQty]);

    const dailyDepreciation = useMemo(() => {
        if (newItemType !== 'asset') return 0;
        const cost = Number(newItemPrice) || 0;
        const salvage = Number(newItemSalvage) || 0;
        const life = Number(newItemLifespan) || 1;
        return (cost - salvage) / life;
    }, [newItemType, newItemPrice, newItemSalvage, newItemLifespan]);

    // --- HANDLER ---
    const handleCreate = () => {
        if (!newItemName || !newItemPrice) return;
        const price = Number(newItemPrice);
        const isAsset = newItemType === 'asset';
        const isService = newItemType === 'service';

        const item: StockDeductionItem = {
            id: `new-${Date.now()}`,
            name: newItemName,
            qty: finalStockQty,
            type: isService ? 'expense' : 'inventory', // Map type correctly
            refId: 'new-item',
            unit: isAsset ? 'เครื่อง/ชิ้น' : (isService ? 'รายการ' : newItemUnit),
            costPerUnit: price / finalStockQty,
            isNew: true,
            category: isAsset ? 'asset' : (isService ? 'general' : newItemSubCategory),
            
            lifespanDays: isAsset ? Number(newItemLifespan) : undefined,
            salvagePrice: isAsset ? Number(newItemSalvage) : undefined,
            minLevel: (isAsset || isService) ? 0 : Number(newItemMinLevel)
        };
        
        onConfirm(item);
        
        // Reset (Partial)
        setNewItemName('');
        setNewItemPrice('');
        setBuyQty('1');
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4">
            
            {/* 1. Type Switcher */}
            <div className="flex bg-stone-100 p-1.5 rounded-2xl relative">
                <div className={`absolute top-1.5 bottom-1.5 w-[calc(33%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${newItemType === 'consumable' ? 'left-1.5' : newItemType === 'asset' ? 'left-[calc(33%+3px)]' : 'left-[calc(66%+3px)]'}`}></div>
                <button onClick={() => setNewItemType('consumable')} className={`flex-1 relative z-10 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 transition-colors ${newItemType === 'consumable' ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>
                    <Package size={14}/> ของใช้/สต็อก
                </button>
                <button onClick={() => setNewItemType('asset')} className={`flex-1 relative z-10 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 transition-colors ${newItemType === 'asset' ? 'text-purple-600' : 'text-stone-400 hover:text-stone-600'}`}>
                    <Armchair size={14}/> ทรัพย์สิน
                </button>
                <button onClick={() => setNewItemType('service')} className={`flex-1 relative z-10 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 transition-colors ${newItemType === 'service' ? 'text-rose-600' : 'text-stone-400 hover:text-stone-600'}`}>
                    <Banknote size={14}/> ค่าบริการ
                </button>
            </div>

            {/* 2. Common Fields */}
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 block mb-1">ชื่อรายการ (Item Name)</label>
                    <input autoFocus type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full px-4 py-3 border-2 border-stone-100 rounded-xl font-bold text-stone-700 outline-none focus:border-blue-300 text-sm" placeholder={newItemType === 'asset' ? "เช่น เตาปิ้ง, ตู้เย็น" : newItemType === 'service' ? "เช่น ค่าขนส่งพิเศษ, ค่าซ่อม" : "เช่น ถุงร้อน, นมข้น"} />
                </div>
            </div>

            {/* 3. Conditional Fields */}
            {newItemType === 'consumable' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    
                    {/* Category Chips */}
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 block mb-2">หมวดหมู่</label>
                        <div className="flex gap-2">
                            <button onClick={() => setNewItemSubCategory('ingredient')} className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${newItemSubCategory === 'ingredient' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}`}>
                                <Wheat size={18}/> วัตถุดิบ
                            </button>
                            <button onClick={() => setNewItemSubCategory('packaging')} className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${newItemSubCategory === 'packaging' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}`}>
                                <Box size={18}/> บรรจุภัณฑ์
                            </button>
                        </div>
                    </div>

                    {/* Calculator */}
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1"><Calculator size={14}/> คำนวณปริมาณ (Calculator)</label>
                            <div className="flex bg-white rounded-lg p-0.5 border border-stone-200">
                                <button onClick={() => setCalcMode('direct')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${calcMode === 'direct' ? 'bg-stone-800 text-white' : 'text-stone-400'}`}>ชิ้นเดียว</button>
                                <button onClick={() => setCalcMode('bulk')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${calcMode === 'bulk' ? 'bg-blue-500 text-white' : 'text-stone-400'}`}>แพ็ค/ลัง</button>
                            </div>
                        </div>

                        {calcMode === 'direct' ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">จำนวนที่ซื้อ</label>
                                    <input type="number" value={buyQty} onChange={e => setBuyQty(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-center text-stone-700 outline-none focus:border-blue-300" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">ราคาซื้อ (รวม)</label>
                                    <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-center text-stone-700 outline-none focus:border-blue-300" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 animate-in slide-in-from-top-2">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">ซื้อกี่แพ็ค?</label>
                                        <input type="number" value={buyQty} onChange={e => setBuyQty(e.target.value)} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold text-center text-stone-700 outline-none focus:border-blue-300" placeholder="1" />
                                    </div>
                                    <div className="pb-2 text-stone-300"><X size={16}/></div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">ขนาดต่อแพ็ค</label>
                                        <input type="number" value={packSize} onChange={e => setPackSize(e.target.value)} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold text-center text-stone-700 outline-none focus:border-blue-300" placeholder="1000" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">ราคาซื้อ (ราคารวมทั้งหมด)</label>
                                    <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-center text-stone-700 outline-none focus:border-blue-300" />
                                </div>
                            </div>
                        )}
                        
                        {/* Unit Chips */}
                        <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block flex items-center gap-1"><Scale size={12}/> หน่วยนับ (Base Unit)</label>
                            <div className="flex gap-2 items-center">
                                <input type="text" value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-700 outline-none focus:border-blue-300 text-sm" placeholder="เช่น กรัม" />
                                <div className="flex gap-1 overflow-x-auto scrollbar-hide max-w-[50%]">
                                    {COMMON_UNITS.slice(0, 5).map(u => (
                                        <button key={u} onClick={() => setNewItemUnit(u)} className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${newItemUnit === u ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'}`}>{u}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Result Summary */}
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-blue-400 font-bold uppercase">เข้าสต็อก (Total Stock)</p>
                                <p className="text-lg font-black text-blue-600 leading-none mt-0.5">
                                    {finalStockQty.toLocaleString()} <span className="text-xs font-bold">{newItemUnit}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-blue-400 font-bold uppercase">ต้นทุน/หน่วย</p>
                                <p className="text-lg font-black text-blue-600 leading-none mt-0.5">
                                    ฿{costPerBaseUnit.toFixed(4)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Min Level */}
                    <div className="flex items-center gap-3">
                        <div className="bg-stone-100 p-2 rounded-xl text-stone-400"><AlertCircle size={20}/></div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">แจ้งเตือนเมื่อต่ำกว่า</label>
                            <input type="number" value={newItemMinLevel} onChange={e => setNewItemMinLevel(e.target.value)} className="w-full px-3 py-2 border-2 border-stone-100 rounded-xl font-bold text-stone-700 outline-none focus:border-red-300 text-sm" placeholder="5" />
                        </div>
                    </div>
                </div>
            ) : newItemType === 'asset' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-purple-400 uppercase ml-1 block mb-1">ราคาซื้อ (บาท)</label>
                            <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold text-purple-800 outline-none focus:border-purple-400 text-sm" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-purple-400 uppercase ml-1 block mb-1">จำนวน</label>
                            <input type="number" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold text-purple-800 outline-none focus:border-purple-400 text-sm" placeholder="1" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-purple-400 uppercase ml-1 block mb-1 flex items-center gap-1"><Clock size={12}/> อายุใช้งาน (วัน)</label>
                            <input type="number" value={newItemLifespan} onChange={e => setNewItemLifespan(e.target.value)} className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold text-purple-800 outline-none focus:border-purple-400 text-sm text-center" placeholder="365" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-purple-400 uppercase ml-1 block mb-1 flex items-center gap-1"><Recycle size={12}/> ขายซาก (บาท)</label>
                            <input type="number" value={newItemSalvage} onChange={e => setNewItemSalvage(e.target.value)} className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold text-purple-800 outline-none focus:border-purple-400 text-sm text-center" placeholder="0" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-purple-100 shadow-sm">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-2"><Calculator size={14}/> ค่าเสื่อม/วัน</span>
                        <span className="font-black text-purple-600 text-lg">฿{dailyDepreciation.toFixed(2)}</span>
                    </div>
                </div>
            ) : (
                /* SERVICE TYPE */
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                    <div>
                        <label className="text-[10px] font-bold text-rose-400 uppercase ml-1 block mb-1">ค่าใช้จ่ายรวม (บาท)</label>
                        <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl font-black text-rose-600 outline-none focus:border-rose-400 text-xl" placeholder="0.00" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-white p-3 rounded-xl border border-rose-100">
                        <AlertCircle size={16}/>
                        <span>รายการนี้จะไม่ถูกนับสต็อก (บันทึกบัญชีอย่างเดียว)</span>
                    </div>
                </div>
            )}

            <button 
                onClick={handleCreate}
                disabled={!newItemName || !newItemPrice}
                className={`w-full py-3.5 text-white rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${newItemType === 'asset' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : newItemType === 'service' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'}`}
            >
                <Plus size={18}/> เพิ่มลงบิล
            </button>
        </div>
    );
};

export default QuickCreateForm;
