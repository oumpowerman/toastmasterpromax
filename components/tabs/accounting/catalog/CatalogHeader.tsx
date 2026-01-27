
import React from 'react';
import { Search, Package, Armchair, Plus, Calculator, Wheat, Box, Banknote } from 'lucide-react';

interface CatalogHeaderProps {
    activeTab: 'stock' | 'assets' | 'services' | 'new';
    setActiveTab: (tab: 'stock' | 'assets' | 'services' | 'new') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    stockFilter: 'all' | 'ingredient' | 'packaging';
    setStockFilter: (filter: 'all' | 'ingredient' | 'packaging') => void;
    bulkMode: boolean;
    setBulkMode: (mode: boolean) => void;
    type: 'income' | 'expense';
    selectedSupplierId: string;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
    activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    stockFilter, setStockFilter,
    bulkMode, setBulkMode,
    type, selectedSupplierId
}) => {
    return (
        <div className="p-4 pb-0 space-y-3">
            {/* Main Tabs (Updated to 4) */}
            <div className="flex p-1 bg-stone-200/50 rounded-2xl overflow-x-auto">
                <button onClick={() => setActiveTab('stock')} className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'stock' ? 'bg-white shadow text-orange-600' : 'text-stone-500 hover:text-stone-700'}`}>
                    <Package size={16}/> สินค้า/ของสด
                </button>
                <button onClick={() => setActiveTab('assets')} className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'assets' ? 'bg-white shadow text-purple-600' : 'text-stone-500 hover:text-stone-700'}`}>
                    <Armchair size={16}/> สินทรัพย์
                </button>
                {/* NEW TAB: Services */}
                <button onClick={() => setActiveTab('services')} className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'services' ? 'bg-white shadow text-rose-500' : 'text-stone-500 hover:text-stone-700'}`}>
                    <Banknote size={16}/> ค่าใช้จ่าย
                </button>
                <button onClick={() => setActiveTab('new')} className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'new' ? 'bg-white shadow text-blue-600' : 'text-stone-500 hover:text-stone-700'}`}>
                    <Plus size={16}/> ของใหม่
                </button>
            </div>

            {/* Search & Sub Filters */}
            {activeTab !== 'new' && (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder={activeTab === 'services' ? "ค้นหาค่าใช้จ่าย..." : selectedSupplierId ? "ค้นหาสินค้าในร้านนี้..." : "ค้นหาในคลัง..."}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-600 outline-none focus:border-orange-300 text-sm shadow-sm"
                        />
                    </div>
                    
                    {/* BULK MODE TOGGLE (Only in Expense & Stock Tab) */}
                    {type === 'expense' && activeTab === 'stock' && (
                        <button 
                            onClick={() => setBulkMode(!bulkMode)}
                            className={`px-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all ${bulkMode ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-stone-400 border-stone-200 hover:border-purple-300'}`}
                            title="โหมดซื้อยกแพ็ค (คำนวณราคาต่อชิ้นอัตโนมัติ)"
                        >
                            <Calculator size={16}/>
                            <span>{bulkMode ? 'ซื้อยกแพ็ค' : 'ซื้อปกติ'}</span>
                        </button>
                    )}

                    {activeTab === 'stock' && !bulkMode && (
                        <div className="flex bg-white rounded-xl border border-stone-200 p-1 shrink-0">
                            <button onClick={() => setStockFilter('all')} className={`p-1.5 rounded-lg transition-colors ${stockFilter === 'all' ? 'bg-stone-100 text-stone-800' : 'text-stone-400'}`} title="ทั้งหมด">All</button>
                            <button onClick={() => setStockFilter('ingredient')} className={`p-1.5 rounded-lg transition-colors ${stockFilter === 'ingredient' ? 'bg-orange-50 text-orange-500' : 'text-stone-400'}`} title="วัตถุดิบ"><Wheat size={16}/></button>
                            <button onClick={() => setStockFilter('packaging')} className={`p-1.5 rounded-lg transition-colors ${stockFilter === 'packaging' ? 'bg-blue-50 text-blue-500' : 'text-stone-400'}`} title="บรรจุภัณฑ์"><Box size={16}/></button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CatalogHeader;
