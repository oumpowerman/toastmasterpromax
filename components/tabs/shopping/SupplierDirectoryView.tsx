
import React from 'react';
import { Search, Plus, Map, Store, ArrowRight, LayoutGrid, List, Smartphone } from 'lucide-react';
import { Supplier, IngredientLibraryItem } from '../../../types';
import { useSupplierLogic } from './useSupplierLogic';
import { SupplierCard } from './SupplierCard';

interface SupplierDirectoryViewProps {
    suppliers: Supplier[];
    centralIngredients: IngredientLibraryItem[];
    onAddSupplier: () => void;
    onEditSupplier: (supplier: Supplier) => void;
    onDeleteSupplier: (id: string) => void;
    onGoToPlanning: () => void;
    totalToBuy: number;
}

export const SupplierDirectoryView: React.FC<SupplierDirectoryViewProps> = ({ 
    suppliers, centralIngredients, onAddSupplier, onEditSupplier, onDeleteSupplier, onGoToPlanning, totalToBuy
}) => {
    
    // Logic Hook
    const { 
        searchTerm, setSearchTerm, 
        filterType, setFilterType,
        viewMode, setViewMode,
        filteredSuppliers, getSupplierStats 
    } = useSupplierLogic(suppliers, centralIngredients);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-cute pb-20">
            
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-stone-800 flex items-center gap-3">
                        <Store className="text-orange-500" size={40} />
                        สมุดร้านค้า (Supplier Directory)
                    </h2>
                    <p className="text-stone-400 font-bold text-base mt-2 ml-1">จัดการรายชื่อร้านค้าและสินค้าที่ขาย</p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={onGoToPlanning}
                        className="group bg-blue-50 text-blue-600 px-6 py-3 rounded-[2rem] font-bold border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-100 transition-all flex items-center gap-2"
                    >
                        <Map size={20} />
                        วางแผนเส้นทาง
                        {totalToBuy > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{totalToBuy} ต้องซื้อ</span>
                        )}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                    <button 
                        onClick={onAddSupplier}
                        className="bg-stone-800 text-white px-6 py-3 rounded-[2rem] font-bold flex items-center gap-2 hover:bg-stone-900 shadow-lg hover:-translate-y-1 transition-all"
                    >
                        <Plus size={20} /> เพิ่มร้านค้าใหม่
                    </button>
                </div>
            </div>

            {/* 2. Controls Bar (Search + Filter + View Toggle) */}
            <div className="flex flex-col xl:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="ค้นหาร้านค้า..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-stone-100 rounded-2xl font-bold text-stone-600 outline-none focus:border-orange-400 text-lg shadow-sm transition-colors"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-stone-100 rounded-2xl shrink-0">
                        <button 
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${filterType === 'all' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            ทั้งหมด ({suppliers.length})
                        </button>
                        <button 
                            onClick={() => setFilterType('physical')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${filterType === 'physical' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Store size={16}/> หน้าร้าน
                        </button>
                        <button 
                            onClick={() => setFilterType('online')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${filterType === 'online' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Smartphone size={16}/> ออนไลน์
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex p-1 bg-stone-100 rounded-2xl shrink-0 border border-stone-200">
                        <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-500' : 'text-stone-400 hover:text-stone-600'}`}>
                            <LayoutGrid size={20} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-500' : 'text-stone-400 hover:text-stone-600'}`}>
                            <List size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Main Layout */}
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
                
                {/* Add New Card/Row */}
                <button 
                    onClick={onAddSupplier}
                    className={`
                        border-2 border-dashed border-stone-300 text-stone-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50/50 transition-all group font-bold flex items-center justify-center gap-2
                        ${viewMode === 'grid' ? 'rounded-[2.5rem] flex-col p-10 min-h-[300px]' : 'rounded-2xl p-4 w-full'}
                    `}
                >
                    <div className={`rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors ${viewMode === 'grid' ? 'w-16 h-16 bg-stone-100 mb-4' : 'w-8 h-8 bg-stone-100'}`}>
                        <Plus size={viewMode === 'grid' ? 32 : 18} />
                    </div>
                    <span>เพิ่มร้านค้าใหม่</span>
                </button>

                {/* Mapped Supplier Cards */}
                {filteredSuppliers.map(supplier => (
                    <SupplierCard 
                        key={supplier.id}
                        supplier={supplier}
                        stats={getSupplierStats(supplier)}
                        viewMode={viewMode}
                        onEdit={onEditSupplier}
                        onDelete={onDeleteSupplier}
                    />
                ))}
            </div>
        </div>
    );
};
