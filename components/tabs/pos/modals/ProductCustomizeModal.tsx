
import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, IceCream, CheckCircle2 } from 'lucide-react';
import { MenuItem, IngredientLibraryItem } from '../../../../types';
import { MODIFIERS } from '../constants';

export const ProductCustomizeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    menu: MenuItem | null;
    availableToppings: IngredientLibraryItem[];
    onConfirm: (data: { qty: number, modifiers: string[], toppings: any[] }) => void;
}> = ({ isOpen, onClose, menu, availableToppings, onConfirm }) => {
    const [qty, setQty] = useState(1);
    const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
    const [selectedToppings, setSelectedToppings] = useState<{ id: string, name: string, price: number, refId: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            setQty(1);
            setSelectedModifiers([]);
            setSelectedToppings([]);
        }
    }, [isOpen, menu]);

    if (!isOpen || !menu) return null;

    const toggleModifier = (label: string) => {
        setSelectedModifiers(prev => 
            prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
        );
    };

    const toggleTopping = (topping: IngredientLibraryItem) => {
        // Assume selling price is based on cost * 2 rounded to 5 or 10, or default 10 if not set.
        // For simplicity in this demo, let's say 10 THB flat, or calculate dynamic.
        const toppingPrice = Math.ceil((topping.costPerUnit * 2) / 5) * 5 || 10;

        setSelectedToppings(prev => {
            const exists = prev.find(t => t.refId === topping.id);
            if (exists) return prev.filter(t => t.refId !== topping.id);
            return [...prev, { id: `top-${Date.now()}-${topping.id}`, name: topping.name, price: toppingPrice, refId: topping.id }];
        });
    };

    const totalPrice = (menu.sellingPrice + selectedToppings.reduce((sum, t) => sum + t.price, 0)) * qty;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[3rem] p-6 relative z-10 animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div className="pr-8">
                        <h3 className="text-2xl font-black text-stone-800 font-cute leading-tight">{menu.name}</h3>
                        <p className="text-stone-400 font-bold text-sm">฿{menu.sellingPrice} / ชิ้น</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors">
                        <X size={20}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 space-y-6">
                    
                    {/* Qty */}
                    <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <span className="font-bold text-stone-600">จำนวน</span>
                        <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-stone-200">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-800"><Minus size={20}/></button>
                            <span className="font-black text-2xl text-stone-800 w-8 text-center">{qty}</span>
                            <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-800"><Plus size={20}/></button>
                        </div>
                    </div>

                    {/* Modifiers */}
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase mb-3 ml-1">ระดับความหวาน / เพิ่มเติม</p>
                        <div className="flex flex-wrap gap-2">
                            {MODIFIERS.map(mod => (
                                <button
                                    key={mod.id}
                                    onClick={() => toggleModifier(mod.label)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedModifiers.includes(mod.label) ? 'bg-orange-50 border-orange-400 text-orange-600' : 'bg-white border-stone-100 text-stone-400 hover:border-orange-200'}`}
                                >
                                    {mod.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toppings */}
                    {availableToppings.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase mb-3 ml-1 flex items-center gap-1">
                                <IceCream size={14}/> เพิ่ม Topping (เลือกได้เลย)
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {availableToppings.map(top => {
                                    const isSelected = selectedToppings.some(t => t.refId === top.id);
                                    const displayPrice = Math.ceil((top.costPerUnit * 2) / 5) * 5 || 10;
                                    
                                    return (
                                        <button
                                            key={top.id}
                                            onClick={() => toggleTopping(top)}
                                            className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${isSelected ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-100' : 'bg-white border-stone-100 hover:border-purple-200'}`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-purple-100 text-purple-600' : 'bg-stone-50 text-stone-300'}`}>
                                                    {top.image ? <img src={top.image} className="w-full h-full object-cover rounded-xl"/> : <IceCream size={18}/>}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-bold truncate ${isSelected ? 'text-purple-700' : 'text-stone-600'}`}>{top.name}</p>
                                                    <p className="text-[10px] text-stone-400">+฿{displayPrice}</p>
                                                </div>
                                            </div>
                                            {isSelected && <CheckCircle2 size={18} className="text-purple-500 fill-purple-100" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t border-stone-100">
                    <button 
                        onClick={() => onConfirm({ qty, modifiers: selectedModifiers, toppings: selectedToppings })}
                        className="w-full bg-stone-800 text-white py-4 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-100 transition-all"
                    >
                        <span>เพิ่มลงตะกร้า</span>
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-base">฿{totalPrice.toLocaleString()}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
