
import React, { useState, useMemo } from 'react';
import { X, Search, Package, Utensils, Wheat, Box, Plus, CheckCircle2 } from 'lucide-react';
import { MenuItem, InventoryItem } from '../../types';

interface StockPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'income' | 'expense';
    category: string; // 'raw_material' | 'waste' | 'marketing' | etc.
    menuItems: MenuItem[];
    inventory: InventoryItem[];
    onSelect: (type: 'menu' | 'inventory', item: any) => void;
    selectedIds: Record<string, number>; // ID -> Qty map to show badges
}

const StockPickerModal: React.FC<StockPickerModalProps> = ({ 
    isOpen, onClose, type, category, menuItems, inventory, onSelect, selectedIds = {}
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (type === 'income') {
            return menuItems.filter(m => m.name.toLowerCase().includes(lowerSearch));
        } else {
            return inventory.filter(i => i.name.toLowerCase().includes(lowerSearch));
        }
    }, [type, menuItems, inventory, searchTerm]);

    // Safer calculation for total selected count
    const totalSelectedCount = useMemo(() => {
        if (!selectedIds) return 0;
        return Object.keys(selectedIds).reduce((sum, key) => sum + (selectedIds[key] || 0), 0);
    }, [selectedIds]);

    if (!isOpen) return null;

    const isRawMat = category === 'raw_material';
    const themeColor = type === 'income' ? 'orange' : (isRawMat ? 'green' : 'red');
    
    // Theme Classes
    const bgHeader = type === 'income' ? 'bg-orange-500' : (isRawMat ? 'bg-emerald-500' : 'bg-rose-500');
    const textHeader = 'text-white';
    const borderFocus = type === 'income' ? 'focus:border-orange-400' : (isRawMat ? 'focus:border-emerald-400' : 'focus:border-rose-400');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-cute">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-stone-50 w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 overflow-hidden border-4 border-white">
                
                {/* Header */}
                <div className={`${bgHeader} p-6 flex justify-between items-center shrink-0 shadow-md`}>
                    <div className={textHeader}>
                        <h3 className="text-2xl font-black flex items-center gap-2">
                            {type === 'income' ? <Utensils size={28}/> : (isRawMat ? <Package size={28}/> : <Box size={28}/>)}
                            {type === 'income' ? 'เลือกเมนูที่ขาย' : (isRawMat ? 'เลือกวัตถุดิบที่ซื้อ' : 'เลือกสินค้าในคลัง')}
                        </h3>
                        <p className="text-white/80 text-sm font-bold mt-1">
                            {type === 'income' ? 'ตัดสต็อกตามสูตรอัตโนมัติ' : (isRawMat ? 'เพิ่มสต็อกทันที' : 'ตัดสต็อกออก')}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-white border-b border-stone-100 sticky top-0 z-20">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="ค้นหาชื่อรายการ..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            className={`w-full pl-12 pr-4 py-4 bg-stone-100 border-2 border-stone-100 rounded-2xl font-bold text-stone-700 outline-none ${borderFocus} text-lg transition-all`}
                        />
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-20 text-stone-300">
                            <p className="text-xl font-bold">ไม่พบรายการ</p>
                            <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือไปเพิ่มในหน้า Master Setup</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredItems.map((item: any) => {
                                const qtySelected = selectedIds[item.id] || 0;
                                return (
                                    <button 
                                        key={item.id}
                                        onClick={() => onSelect(type === 'income' ? 'menu' : 'inventory', item)}
                                        className={`relative p-4 rounded-3xl border-2 text-left transition-all hover:-translate-y-1 group flex flex-col justify-between min-h-[140px] shadow-sm ${
                                            qtySelected > 0 
                                            ? `border-${themeColor}-400 bg-${themeColor}-50 ring-2 ring-${themeColor}-200` 
                                            : 'bg-white border-stone-100 hover:border-orange-200 hover:shadow-md'
                                        }`}
                                    >
                                        {qtySelected > 0 && (
                                            <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md animate-bounce bg-${themeColor}-500`}>
                                                {qtySelected}
                                            </div>
                                        )}

                                        <div className="mb-2">
                                            <div className="flex justify-between items-start mb-2">
                                                {/* Icon/Image Placeholder */}
                                                <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-2xl shadow-inner shrink-0 overflow-hidden">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        type === 'income' ? '🥪' : '📦'
                                                    )}
                                                </div>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${qtySelected > 0 ? `bg-${themeColor}-500 text-white` : 'bg-stone-100 text-stone-300 group-hover:bg-orange-100 group-hover:text-orange-500'}`}>
                                                    <Plus size={18} strokeWidth={3} />
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-stone-700 text-base leading-tight line-clamp-2">{item.name}</h4>
                                        </div>

                                        <div className="mt-auto pt-2 border-t border-stone-100/50 flex justify-between items-end">
                                            {type === 'income' ? (
                                                <span className="font-black text-lg text-orange-500">฿{item.sellingPrice}</span>
                                            ) : (
                                                <div>
                                                    <p className="text-[10px] text-stone-400 font-bold uppercase">คงเหลือ</p>
                                                    <p className={`font-bold text-sm ${item.quantity <= (item.minLevel || 0) ? 'text-red-500' : 'text-stone-600'}`}>
                                                        {item.quantity} {item.unit}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-stone-100 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <div className="text-sm font-bold text-stone-500 ml-2">
                        เลือกแล้ว <span className={`text-xl font-black mx-1 text-${themeColor}-600`}>
                            {totalSelectedCount}
                        </span> รายการ
                    </div>
                    <button 
                        onClick={onClose}
                        className={`px-8 py-3 rounded-2xl font-bold text-white shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 ${bgHeader} hover:brightness-110`}
                    >
                        <CheckCircle2 size={20} /> เสร็จสิ้น
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockPickerModal;
