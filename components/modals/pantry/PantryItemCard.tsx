
import React from 'react';
import { Edit3, Trash2, FlaskConical, Box, Utensils, Package, Store, Wheat, Beef, IceCream, Milk, Carrot } from 'lucide-react';
import { IngredientLibraryItem } from '../../../types';

interface PantryItemCardProps {
    item: IngredientLibraryItem;
    supplierName?: string;
    isActive: boolean;
    viewMode: 'grid' | 'list';
    onEdit: (item: IngredientLibraryItem) => void;
    onDelete: (id: string) => void;
}

const PantryItemCard: React.FC<PantryItemCardProps> = ({ item, supplierName, isActive, viewMode, onEdit, onDelete }) => {
    
    // Helper to get icon
    const getIcon = () => {
        if (item.type === 'composite') return <FlaskConical size={viewMode === 'list' ? 20 : 24} className="text-purple-400" />;
        if (item.category === 'packaging') return <Box size={viewMode === 'list' ? 20 : 24} className="text-blue-300"/>;
        
        const lowerName = (item.name || '').toLowerCase();
        if (lowerName.includes('เนื้อ') || lowerName.includes('หมู') || lowerName.includes('ไก่')) return <Beef size={viewMode === 'list' ? 20 : 24} className="text-red-400"/>;
        if (lowerName.includes('นม') || lowerName.includes('เนย') || lowerName.includes('ชีส')) return <Milk size={viewMode === 'list' ? 20 : 24} className="text-yellow-400"/>;
        if (lowerName.includes('ผัก')) return <Carrot size={viewMode === 'list' ? 20 : 24} className="text-green-400"/>;
        if (lowerName.includes('ซอส') || lowerName.includes('top')) return <IceCream size={viewMode === 'list' ? 20 : 24} className="text-pink-400"/>;
        
        return <Utensils size={viewMode === 'list' ? 20 : 24} className="text-orange-300"/>;
    };

    // Helper for display unit
    const displayUnit = item.unit || (item.unitType === 'unit' ? 'ชิ้น' : 'หน่วย');

    // --- LIST VIEW ---
    if (viewMode === 'list') {
        return (
            <div 
                className={`flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-white hover:border-orange-300 transition-all cursor-pointer group ${isActive ? 'ring-2 ring-orange-400 bg-orange-50' : ''}`}
                onClick={() => onEdit(item)}
            >
                {/* Icon/Image */}
                <div className="w-12 h-12 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        getIcon()
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-stone-700 text-sm truncate">{item.name}</h5>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                        {item.type === 'composite' ? (
                            <span className="text-purple-500 font-bold">สูตรผสม</span>
                        ) : (
                            <span>ซื้อ: ฿{item.bulkPrice} / {item.totalQuantity} {displayUnit}</span>
                        )}
                        {supplierName && <span className="text-blue-400">• {supplierName}</span>}
                    </div>
                </div>

                {/* Cost & Actions */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">ต้นทุน/{displayUnit}</span>
                        <span className={`text-sm font-black ${item.type === 'composite' ? 'text-purple-500' : 'text-orange-500'}`}>
                            ฿{item.costPerUnit.toFixed(item.costPerUnit < 1 ? 4 : 2)}
                        </span>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 bg-white border border-stone-200 rounded-lg text-stone-400 hover:text-red-500 hover:border-red-200 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- GRID VIEW (Original Enhanced) ---
    return (
        <div className={`bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between group hover:border-orange-300 transition-all cursor-pointer ${isActive ? 'ring-2 ring-orange-400 bg-orange-50' : ''}`} onClick={() => onEdit(item)}>
            <div>
                <div className="flex justify-between items-start mb-3">
                    <h5 className="font-bold text-stone-700 text-sm flex items-center gap-3">
                       {/* Large Image/Icon for List */}
                       {item.image ? (
                           <div className="w-14 h-14 rounded-xl overflow-hidden border border-stone-100 shadow-sm shrink-0 bg-white">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                           </div>
                       ) : (
                           <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-stone-50 border border-stone-100 shrink-0 text-stone-300">
                               {getIcon()}
                           </div>
                       )}
                       <div className="flex flex-col">
                           <span className="line-clamp-2 leading-tight">{item.name}</span>
                           <div className="flex flex-wrap gap-1 mt-1">
                               {item.details && (
                                   <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md border border-stone-200 truncate max-w-[120px]">
                                       {item.details}
                                   </span>
                               )}
                               {supplierName && (
                                   <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100 truncate max-w-[120px] flex items-center gap-1">
                                       <Store size={8} /> {supplierName}
                                   </span>
                               )}
                           </div>
                       </div>
                    </h5>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="text-stone-300 hover:text-blue-500 p-1.5 rounded-full hover:bg-blue-50"><Edit3 size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-stone-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                </div>
                
                <div className="text-xs text-stone-500 space-y-1 pl-1">
                    {item.type === 'composite' ? (
                        <div className="bg-purple-50 p-1.5 rounded-lg border border-purple-100 flex items-center justify-between">
                            <span className="text-purple-700 font-bold text-[10px]">สูตรผสม ({item.subIngredients?.length || 0})</span>
                            <span className="text-[10px]">Yield: {item.totalQuantity} {displayUnit}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px] text-stone-400">
                            <Package size={10} />
                            <span>ซื้อ: ฿{item.bulkPrice} / {item.totalQuantity} {displayUnit}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-50 flex justify-between items-center">
                <span className="text-[10px] text-stone-400 font-bold uppercase">ต้นทุน/{displayUnit}</span>
                <span className={`text-base font-black ${item.type === 'composite' ? 'text-purple-500' : 'text-orange-500'}`}>฿{item.costPerUnit.toFixed(4)}</span>
            </div>
        </div>
    );
};

export default PantryItemCard;
