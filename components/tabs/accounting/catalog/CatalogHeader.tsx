
import React, { useEffect } from 'react';
import { Search, Package, Armchair, Plus, Calculator, Wheat, Box, Banknote, Coffee, Sparkles, LayoutGrid, List, Filter } from 'lucide-react';

interface CatalogHeaderProps {
    activeTab: 'stock' | 'assets' | 'services' | 'new' | 'menu';
    setActiveTab: (tab: 'stock' | 'assets' | 'services' | 'new' | 'menu') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    
    // Stock Filters
    stockFilter: 'all' | 'ingredient' | 'packaging';
    setStockFilter: (filter: 'all' | 'ingredient' | 'packaging') => void;
    
    // Menu Filters (NEW)
    menuFilter: string;
    setMenuFilter: (cat: string) => void;
    menuCategories: string[];

    // View Mode (NEW)
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;

    bulkMode: boolean;
    setBulkMode: (mode: boolean) => void;
    type: 'income' | 'expense';
    selectedSupplierId: string;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
    activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    stockFilter, setStockFilter,
    menuFilter, setMenuFilter, menuCategories,
    viewMode, setViewMode,
    bulkMode, setBulkMode,
    type, selectedSupplierId
}) => {
    
    // Auto-switch tab based on type if current tab is invalid for that type
    useEffect(() => {
        if (type === 'income') {
            if (activeTab === 'stock' || activeTab === 'assets') {
                setActiveTab('menu');
            }
        } else {
            if (activeTab === 'menu') {
                setActiveTab('stock');
            }
        }
    }, [type]);

    return (
        <div className="p-4 pb-0 space-y-3">
            {/* Main Tabs */}
            <div className="flex p-1 bg-stone-200/50 rounded-2xl overflow-x-auto">
                {type === 'expense' ? (
                    <>
                        <button onClick={() => setActiveTab('stock')} className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'stock' ? 'bg-white shadow text-orange-600' : 'text-stone-500 hover:text-stone-700'}`}>
                            <Package size={16}/> สินค้า/ของสด
                        </button>
                        <button onClick={() => setActiveTab('assets')} className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'assets' ? 'bg-white shadow text-purple-600' : 'text-stone-500 hover:text-stone-700'}`}>
                            <Armchair size={16}/> สินทรัพย์
                        </button>
                        <button onClick={() => setActiveTab('services')} className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'services' ? 'bg-white shadow text-rose-500' : 'text-stone-500 hover:text-stone-700'}`}>
                            <Banknote size={16}/> ค่าใช้จ่าย
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setActiveTab('menu')} className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'menu' ? 'bg-white shadow text-emerald-600' : 'text-stone-500 hover:text-stone-700'}`}>
                            <Coffee size={16}/> เมนูที่ขาย
                        </button>
                        <button onClick={() => setActiveTab('services')} className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'services' ? 'bg-white shadow text-teal-600' : 'text-stone-500 hover:text-stone-700'}`}>
                            <Sparkles size={16}/> รายรับอื่นๆ
                        </button>
                    </>
                )}
                
                {/* Add New Button (Only for Expense usually, or income services) */}
                {(type === 'expense' || activeTab === 'services') && (
                    <button onClick={() => setActiveTab('new')} className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'new' ? 'bg-white shadow text-blue-600' : 'text-stone-500 hover:text-stone-700'}`}>
                        <Plus size={16}/> สร้างใหม่
                    </button>
                )}
            </div>

            {/* Search & Sub Filters */}
            {activeTab !== 'new' && (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18}/>
                            <input 
                                type="text" 
                                placeholder={activeTab === 'menu' ? "ค้นหาเมนู..." : activeTab === 'services' ? "ค้นหารายการ..." : selectedSupplierId ? "ค้นหาสินค้าในร้านนี้..." : "ค้นหา..."}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-600 outline-none focus:border-orange-300 text-sm shadow-sm"
                            />
                        </div>
                        
                        {/* VIEW MODE TOGGLE */}
                        <div className="flex bg-white rounded-xl border border-stone-200 p-1 shrink-0">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-stone-100 text-stone-800' : 'text-stone-400'}`} title="Grid"><LayoutGrid size={18}/></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-stone-100 text-stone-800' : 'text-stone-400'}`} title="List"><List size={18}/></button>
                        </div>

                        {/* BULK MODE TOGGLE (Only in Expense & Stock Tab) */}
                        {type === 'expense' && activeTab === 'stock' && (
                            <button 
                                onClick={() => setBulkMode(!bulkMode)}
                                className={`px-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all ${bulkMode ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-stone-400 border-stone-200 hover:border-purple-300'}`}
                                title="โหมดซื้อยกแพ็ค (คำนวณราคาต่อชิ้นอัตโนมัติ)"
                            >
                                <Calculator size={16}/>
                                <span className="hidden md:inline">{bulkMode ? 'ซื้อยกแพ็ค' : 'ซื้อปกติ'}</span>
                            </button>
                        )}
                    </div>

                    {/* SUB FILTERS ROW */}
                    {activeTab === 'stock' && !bulkMode && (
                        <div className="flex bg-white rounded-xl border border-stone-200 p-1 shrink-0 w-fit">
                            <button onClick={() => setStockFilter('all')} className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-bold ${stockFilter === 'all' ? 'bg-stone-100 text-stone-800' : 'text-stone-400'}`} title="ทั้งหมด">All</button>
                            <button onClick={() => setStockFilter('ingredient')} className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center gap-1 ${stockFilter === 'ingredient' ? 'bg-orange-50 text-orange-500' : 'text-stone-400'}`} title="วัตถุดิบ"><Wheat size={14}/> วัตถุดิบ</button>
                            <button onClick={() => setStockFilter('packaging')} className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center gap-1 ${stockFilter === 'packaging' ? 'bg-blue-50 text-blue-500' : 'text-stone-400'}`} title="บรรจุภัณฑ์"><Box size={14}/> แพ็คเกจ</button>
                        </div>
                    )}

                    {/* MENU FILTERS (NEW) */}
                    {activeTab === 'menu' && (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button 
                                onClick={() => setMenuFilter('all')} 
                                className={`px-3 py-1.5 rounded-xl border font-bold text-xs whitespace-nowrap transition-all ${menuFilter === 'all' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-stone-200 text-stone-400'}`}
                            >
                                ทั้งหมด
                            </button>
                            {menuCategories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setMenuFilter(cat)}
                                    className={`px-3 py-1.5 rounded-xl border font-bold text-xs whitespace-nowrap transition-all ${menuFilter === cat ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-stone-200 text-stone-400'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CatalogHeader;
