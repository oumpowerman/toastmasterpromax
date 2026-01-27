
import React from 'react';
import { Archive, Armchair, Box, Calculator, Plus, Wheat, Banknote } from 'lucide-react';
import { Supplier } from '../../../../types';

interface CatalogGridProps {
    items: any[];
    viewMode: 'grid' | 'list';
    onItemClick: (item: any) => void;
    bulkMode: boolean;
    type: 'income' | 'expense';
    activeTab: 'stock' | 'assets' | 'services' | 'new';
    selectedSupplierId: string;
    suppliers: Supplier[];
    onSwitchTab: (tab: 'stock' | 'assets' | 'services' | 'new') => void;
}

const CatalogGrid: React.FC<CatalogGridProps> = ({
    items, viewMode, onItemClick, bulkMode, type, activeTab, selectedSupplierId, suppliers, onSwitchTab
}) => {
    
    // Helper to get price to display
    const getDisplayPrice = (item: any) => {
        if (selectedSupplierId && type === 'expense') {
            const sup = suppliers.find(s => s.id === selectedSupplierId);
            const prod = sup?.products?.find(p => p.id === item.id);
            if (prod) return { price: prod.price, isSpecial: true };
        }
        return { price: item.bulkPrice || 0, isSpecial: false };
    };

    // Helper to get Icon
    const getItemIcon = (item: any) => {
        if (activeTab === 'services' && item.icon) {
            return React.createElement(item.icon, { size: 20 });
        }
        if (item.category === 'packaging') return <Box size={20}/>;
        if (item.type === 'asset') return <Armchair size={20}/>;
        return <Wheat size={20}/>;
    };

    // Helper for Color Theme
    const getThemeClass = (item: any) => {
        if (activeTab === 'services') return 'text-rose-400 group-hover:bg-rose-50 group-hover:text-rose-500';
        if (item.category === 'packaging') return 'text-blue-300 group-hover:bg-blue-50 group-hover:text-blue-500';
        if (item.type === 'asset') return 'text-purple-300 group-hover:bg-purple-50 group-hover:text-purple-500';
        return 'text-orange-300 group-hover:bg-orange-50 group-hover:text-orange-500';
    };

    return (
        <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 gap-3" : "flex flex-col gap-2"}>
            {items.map((item: any) => {
                const { price, isSpecial } = getDisplayPrice(item);
                
                return (
                    <button 
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className={`bg-white rounded-2xl border transition-all group relative ${
                            bulkMode && type === 'expense' && activeTab === 'stock'
                            ? 'border-purple-200 hover:border-purple-400 bg-purple-50/10' 
                            : 'border-stone-100 hover:border-orange-300 hover:shadow-md'
                        } ${viewMode === 'grid' ? 'p-3 flex flex-col items-center text-center gap-2 h-full' : 'p-3 flex items-center gap-4 text-left'}`}
                    >
                        {item.image ? (
                            <img src={item.image} className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-10 h-10'} rounded-xl object-cover bg-stone-50`}/> 
                        ) : (
                            <div className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-10 h-10'} bg-stone-50 rounded-xl flex items-center justify-center transition-colors ${getThemeClass(item)}`}>
                                {getItemIcon(item)}
                            </div>
                        )}
                        <div className="w-full min-w-0">
                            <p className={`font-bold text-stone-700 text-xs leading-tight ${viewMode === 'grid' ? 'line-clamp-2' : 'truncate'}`}>{item.name}</p>
                            
                            {activeTab !== 'services' ? (
                                <p className="text-[10px] text-stone-400 mt-1">
                                    {isSpecial ? <span className="text-blue-500 font-bold">฿{price}</span> : `฿${price}`}
                                    <span className="opacity-50 mx-1">|</span> 
                                    {item.totalQuantity || 1} {item.unit || 'ชิ้น'}
                                </p>
                            ) : (
                                <p className="text-[10px] text-rose-400 mt-1 font-bold">ค่าใช้จ่าย</p>
                            )}
                        </div>
                        
                        {bulkMode && type === 'expense' && activeTab === 'stock' ? (
                            <div className={`absolute ${viewMode === 'grid' ? 'top-2 right-2' : 'right-4 top-1/2 -translate-y-1/2'} bg-purple-500 text-white rounded-full p-1 shadow-sm`}>
                                <Calculator size={12}/>
                            </div>
                        ) : (
                            <div className={`absolute ${viewMode === 'grid' ? 'top-2 right-2' : 'right-4 top-1/2 -translate-y-1/2'} opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500 text-white rounded-full p-1 shadow-sm`}>
                                <Plus size={12}/>
                            </div>
                        )}
                    </button>
                );
            })}
            
            {items.length === 0 && (
                <div className="col-span-full text-center py-10 text-stone-400 text-sm">
                    <Archive size={32} className="mx-auto mb-2 opacity-30"/>
                    <p>ไม่พบรายการ</p>
                    <button onClick={() => onSwitchTab('new')} className="text-blue-500 underline mt-2">สร้างใหม่เลย?</button>
                </div>
            )}
        </div>
    );
};

export default CatalogGrid;
