
import React, { useState, useMemo } from 'react';
import { Archive, X, Utensils, Plus, Box, FlaskConical, LayoutGrid, List, Wheat, Filter } from 'lucide-react';
import { IngredientLibraryItem } from '../../types';
import SearchFilterBar from '../SearchFilterBar';

interface IngredientPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  centralIngredients: IngredientLibraryItem[];
  onPick: (item: IngredientLibraryItem) => void;
  onOpenPantry: () => void;
}

const IngredientPickerModal: React.FC<IngredientPickerModalProps> = ({ 
  isOpen, onClose, centralIngredients, onPick, onOpenPantry 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique sub-categories for the current main category
  const availableSubCategories = useMemo(() => {
    const subs = new Set<string>();
    centralIngredients.forEach(i => {
      if (i.category !== 'asset') {
        const cat = i.category || 'ingredient';
        if (activeTab === 'all' || cat === activeTab) {
          if (i.subCategory && i.subCategory !== 'general') {
            subs.add(i.subCategory);
          }
        }
      }
    });
    return Array.from(subs).sort();
  }, [centralIngredients, activeTab]);

  // Filter Logic: Exclude Assets and apply search/category/sub-category filters
  const displayedItems = useMemo(() => {
    return centralIngredients
      .filter(i => i.category !== 'asset')
      .filter(i => {
        // Category Filter
        const cat = i.category || 'ingredient';
        const matchesTab = activeTab === 'all' || cat === activeTab;
        
        // Sub-Category Filter
        const matchesSubTab = activeSubTab === 'all' || i.subCategory === activeSubTab;

        // Search Filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
          i.name.toLowerCase().includes(query) || 
          (i.subCategory && i.subCategory.toLowerCase().includes(query));
        
        return matchesTab && matchesSubTab && matchesSearch;
      });
  }, [centralIngredients, activeTab, activeSubTab, searchQuery]);

  if (!isOpen) return null;

  const filters = [
    { id: 'all', label: 'ทั้งหมด', icon: Filter },
    { id: 'ingredient', label: 'วัตถุดิบ', icon: Wheat, color: 'bg-orange-500 border-orange-500 text-white' },
    { id: 'packaging', label: 'บรรจุภัณฑ์', icon: Box, color: 'bg-blue-500 border-blue-500 text-white' },
    { id: 'composite', label: 'สูตรผสม', icon: FlaskConical, color: 'bg-purple-500 border-purple-500 text-white' },
  ];

  const subFilters = [
    { id: 'all', label: 'ทุกประเภทย่อย' },
    ...availableSubCategories.map(sub => ({ id: sub, label: sub }))
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="bg-white w-full max-w-5xl max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-bounce-in border-4 border-white overflow-hidden">
            
            {/* Header */}
            <div className="p-6 bg-stone-50 border-b border-stone-100 flex flex-col gap-6 shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-2xl flex items-center gap-3 text-stone-800 font-cute">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-500">
                            <Archive size={24}/> 
                        </div>
                        เลือกจากคลัง (Pantry Picker)
                    </h3>
                    
                    <div className="flex items-center gap-3">
                         {/* View Toggle */}
                        <div className="flex bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-stone-100 text-orange-500' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <LayoutGrid size={20}/>
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-stone-100 text-orange-500' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <List size={20}/>
                            </button>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-200 text-stone-500 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors">
                            <X size={20}/>
                        </button>
                    </div>
                </div>

                {/* Advanced Search & Filters */}
                <div className="flex flex-col gap-4">
                  <SearchFilterBar 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeFilter={activeTab}
                    onFilterChange={(id) => { setActiveTab(id); setActiveSubTab('all'); }}
                    filters={filters}
                    placeholder="ค้นหาชื่อวัตถุดิบ หรือประเภท..."
                  />

                  {/* Sub-Category Chips */}
                  {availableSubCategories.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mt-2">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black text-stone-400 uppercase ml-1">ประเภทย่อย:</span>
                        {subFilters.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setActiveSubTab(sub.id)}
                            className={`
                              px-3 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap transition-all border
                              ${activeSubTab === sub.id 
                                ? 'bg-stone-200 border-stone-300 text-stone-700 shadow-sm' 
                                : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200 hover:text-stone-600'
                              }
                            `}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 custom-scrollbar">
                {displayedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-300 font-cute">
                        <Archive size={48} className="mb-4 opacity-20" />
                        <p className="font-bold text-lg">ไม่พบรายการที่ค้นหา</p>
                        <button onClick={() => { setSearchQuery(''); setActiveTab('all'); }} className="text-orange-500 font-bold mt-2 underline hover:text-orange-600">
                            ล้างการค้นหา
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                        {displayedItems.map(item => {
                            const isComposite = item.type === 'composite';
                            const isPack = item.category === 'packaging';
                            
                            return (
                                <button 
                                    key={item.id}
                                    onClick={() => onPick(item)}
                                    className={`
                                        group relative border-2 transition-all hover:shadow-lg hover:-translate-y-1 text-left
                                        ${viewMode === 'grid' 
                                            ? 'flex flex-col bg-white rounded-[2rem] p-4 h-full justify-between' 
                                            : 'flex items-center gap-4 bg-white rounded-2xl p-3'
                                        }
                                        ${isPack ? 'hover:border-blue-300' : 'hover:border-orange-300'}
                                        border-stone-100
                                    `}
                                >
                                    {/* Icon/Image */}
                                    <div className={`
                                        flex items-center justify-center rounded-2xl shrink-0 overflow-hidden bg-stone-50 border border-stone-100
                                        ${viewMode === 'grid' ? 'w-full aspect-square mb-3' : 'w-14 h-14'}
                                    `}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            isComposite ? <FlaskConical size={viewMode==='grid'?40:20} className="text-purple-300"/> 
                                            : isPack ? <Box size={viewMode==='grid'?40:20} className="text-blue-300"/> 
                                            : <Utensils size={viewMode==='grid'?40:20} className="text-orange-300"/>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {isComposite && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold font-cute">สูตร</span>}
                                            {isPack && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold font-cute">แพ็ค</span>}
                                        </div>
                                        <h4 className={`font-bold text-stone-700 leading-tight font-cute ${viewMode==='grid'?'text-center text-lg line-clamp-2':'text-base truncate'}`}>
                                            {item.name}
                                        </h4>
                                        <p className={`text-xs text-stone-400 font-bold mt-1 font-cute ${viewMode==='grid'?'text-center':''}`}>
                                            ต้นทุน: ฿{item.costPerUnit.toFixed(2)} / {item.unit}
                                        </p>
                                    </div>

                                    {/* Add Icon (Hover) */}
                                    <div className={`
                                        rounded-full flex items-center justify-center transition-colors
                                        ${viewMode === 'grid' 
                                            ? 'absolute top-3 right-3 w-8 h-8 bg-white shadow-sm opacity-0 group-hover:opacity-100' 
                                            : 'w-10 h-10 bg-stone-50 group-hover:bg-orange-100 text-stone-300 group-hover:text-orange-500'
                                        }
                                    `}>
                                        <Plus size={20} strokeWidth={3} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default IngredientPickerModal;
