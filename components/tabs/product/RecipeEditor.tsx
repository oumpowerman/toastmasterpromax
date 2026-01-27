
import React from 'react';
import { Package, Utensils, Archive, Plus, Link, Minus, Trash2 } from 'lucide-react';
import { IngredientItem, IngredientLibraryItem } from '../../../types';
import { YieldHelper } from '../../UI';

// Internal Sub-component for linked items
const LinkedIngredientRow: React.FC<{
    item: IngredientItem;
    master: IngredientLibraryItem | undefined;
    onUpdateQty: (qty: number) => void;
    onDelete: () => void;
}> = ({ item, master, onUpdateQty, onDelete }) => {
    return (
        <div className="group relative flex items-center gap-3 p-3 bg-white rounded-2xl border-2 border-stone-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
            {/* 1. Image / Icon */}
            <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center">
                {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <Link size={20} className="text-blue-300" />
                )}
            </div>

            {/* 2. Info */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-stone-700 text-sm truncate font-cute">{item.name}</p>
                <p className="text-[10px] text-stone-400 flex items-center gap-1 font-cute">
                    <span className="bg-blue-50 text-blue-500 px-1.5 rounded-md font-bold">Linked</span>
                    ฿{master?.costPerUnit.toFixed(4) || 0} / {item.unit}
                </p>
            </div>

            {/* 3. Quantity Input (Artistic Compact Design) */}
            <div className="flex items-center h-9 bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden hover:border-orange-300 transition-colors">
                <button 
                    onClick={() => onUpdateQty(Math.max(0, (item.quantity || 0) - 1))}
                    className="w-8 h-full flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors active:bg-red-100"
                >
                    <Minus size={12} strokeWidth={3} />
                </button>
                
                <div className="h-full w-px bg-stone-100"></div>

                <div className="flex items-center justify-center gap-1 min-w-[60px] px-2 h-full bg-stone-50/50">
                    <input 
                        type="number" 
                        value={item.quantity || 0}
                        onChange={(e) => onUpdateQty(Math.max(0, Number(e.target.value)))}
                        className="w-8 bg-transparent text-center font-black text-stone-700 outline-none text-base p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-cute"
                    />
                    <span className="text-[10px] font-bold text-stone-400 truncate select-none font-cute pt-1">{item.unit}</span>
                </div>

                <div className="h-full w-px bg-stone-100"></div>

                <button 
                    onClick={() => onUpdateQty((item.quantity || 0) + 1)}
                    className="w-8 h-full flex items-center justify-center text-stone-400 hover:bg-green-50 hover:text-green-500 transition-colors active:bg-green-100"
                >
                    <Plus size={12} strokeWidth={3} />
                </button>
            </div>
            
            {/* 4. Total Cost */}
            <div className="w-20 text-right pr-2">
                <p className="font-black text-stone-800 text-base font-cute">฿{item.cost.toFixed(2)}</p>
            </div>

            {/* 5. Delete (Absolute) */}
            <button 
                onClick={onDelete} 
                className="absolute -top-2 -right-2 bg-white text-stone-300 hover:text-red-500 border border-stone-100 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

interface RecipeEditorProps {
    menuId: string;
    ingredients: IngredientItem[];
    centralIngredients: IngredientLibraryItem[];
    showHelper: string | null;
    setShowHelper: (id: string | null) => void;
    onUpdateIngredient: (menuId: string, ingId: string, field: 'name' | 'cost' | 'quantity', value: any) => void;
    onRemoveIngredient: (menuId: string, ingId: string) => void;
    onAddIngredient: (menuId: string) => void;
    onPickFromPantry: () => void;
}

const RecipeEditor: React.FC<RecipeEditorProps> = ({ 
    menuId, ingredients, centralIngredients, showHelper, setShowHelper, 
    onUpdateIngredient, onRemoveIngredient, onAddIngredient, onPickFromPantry 
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-stone-700 flex items-center gap-2 font-cute">
                    <Package className="text-orange-400" /> สูตรการผลิต (Recipe)
                </h3>
                <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full font-cute">{ingredients.length} วัตถุดิบ</span>
            </div>

            <div className="bg-[#FFF9F2] rounded-[2.5rem] border-2 border-orange-100 p-6 shadow-inner min-h-[400px]">
                <div className="space-y-3">
                    {ingredients.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-stone-300 font-cute">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-stone-100">
                                <Utensils size={32} className="opacity-30" />
                            </div>
                            <p className="font-bold">ยังไม่มีวัตถุดิบ</p>
                            <p className="text-sm">กดปุ่มเลือกจากคลังเพื่อเริ่มปรุงสูตร</p>
                        </div>
                    )}
                    
                    {ingredients.map(item => {
                        if (item.masterId) {
                            const master = centralIngredients.find(m => m.id === item.masterId);
                            return (
                                <LinkedIngredientRow 
                                    key={item.id}
                                    item={item}
                                    master={master}
                                    onUpdateQty={(qty) => onUpdateIngredient(menuId, item.id, 'quantity', qty)}
                                    onDelete={() => onRemoveIngredient(menuId, item.id)}
                                />
                            );
                        } else {
                            return (
                                <YieldHelper 
                                    key={item.id}
                                    label={item.name}
                                    value={item.cost}
                                    id={item.id}
                                    image={item.image}
                                    unit={item.unit} // Pass unit to helper
                                    isOpen={showHelper === item.id}
                                    onToggle={() => setShowHelper(showHelper === item.id ? null : item.id)}
                                    onChange={(v) => onUpdateIngredient(menuId, item.id, 'cost', v)}
                                    onLabelChange={(v) => onUpdateIngredient(menuId, item.id, 'name', v)}
                                    onDelete={() => onRemoveIngredient(menuId, item.id)}
                                    canDelete={true}
                                />
                            );
                        }
                    })}

                    <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t-2 border-dashed border-orange-200/50">
                        <button 
                            onClick={onPickFromPantry}
                            className="col-span-2 py-4 bg-stone-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-900 shadow-md hover:-translate-y-1 transition-all font-cute"
                        >
                            <Archive size={18} /> เลือกจากคลัง (แนะนำ)
                        </button>
                        <button 
                            onClick={() => onAddIngredient(menuId)}
                            className="col-span-2 py-3 text-stone-400 font-bold text-sm hover:text-orange-500 hover:underline transition-all flex items-center justify-center gap-1 font-cute"
                        >
                            <Plus size={14} /> หรือ เพิ่มวัตถุดิบเอง (Manual)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeEditor;
