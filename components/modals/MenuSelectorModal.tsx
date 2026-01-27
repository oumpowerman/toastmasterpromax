
import React, { useState, useMemo } from 'react';
import { LayoutGrid, X, Trash2, Plus, List, Search, Coffee } from 'lucide-react';
import { MenuItem, AppState } from '../../types';
import { useAlert } from '../AlertSystem';

interface MenuSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  selectedMenuId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  getMenuStats: (menu: MenuItem) => any;
}

const MenuSelectorModal: React.FC<MenuSelectorModalProps> = ({ 
  isOpen, onClose, state, selectedMenuId, onSelect, onAdd, onDelete, getMenuStats 
}) => {
  const { showConfirm } = useAlert();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // 1. Group Categories
  const categories = useMemo(() => {
      const cats = new Set(state.menuItems.map(m => m.category || 'General'));
      return ['all', ...Array.from(cats)];
  }, [state.menuItems]);

  // 2. Filter & Group Items (Explicit Return Type)
  const groupedMenus = useMemo((): Record<string, MenuItem[]> => {
      let filtered = state.menuItems.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (activeTab !== 'all') {
          filtered = filtered.filter(m => (m.category || 'General') === activeTab);
      }

      // Group by Category
      const groups: Record<string, MenuItem[]> = {};
      filtered.forEach(menu => {
          const cat = menu.category || 'General';
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(menu);
      });

      return groups;
  }, [state.menuItems, searchTerm, activeTab]);

  // 3. Count Total Items
  const filteredMenusCount = useMemo(() => {
      return Object.values(groupedMenus).reduce((acc: number, list: MenuItem[]) => acc + list.length, 0);
  }, [groupedMenus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="bg-white w-full max-w-5xl max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 duration-200 border-4 border-white overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-stone-100 bg-[#FFF9F2] shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-stone-800 font-cute flex items-center gap-2">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-500"><Coffee size={24}/></div>
                        เลือกเมนู ({state.menuItems.length})
                    </h3>
                    <div className="flex gap-2">
                        <div className="flex bg-stone-100 p-1 rounded-xl">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-500' : 'text-stone-400 hover:text-stone-600'}`}>
                                <LayoutGrid size={20} />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-500' : 'text-stone-400 hover:text-stone-600'}`}>
                                <List size={20} />
                            </button>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="ค้นหาชื่อเมนู..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-stone-200 rounded-xl font-bold text-stone-600 outline-none focus:border-orange-300"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2 ${activeTab === cat ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-stone-100 text-stone-400 hover:bg-stone-50'}`}
                            >
                                {cat === 'all' ? 'ทั้งหมด' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 custom-scrollbar">
                
                {/* Add New Button (Always visible) */}
                <button 
                    onClick={onAdd}
                    className="w-full mb-6 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-stone-300 text-stone-400 hover:text-orange-500 hover:border-orange-400 hover:bg-orange-50 transition-all font-bold group"
                >
                    <div className="w-8 h-8 rounded-full bg-stone-200 group-hover:bg-orange-200 flex items-center justify-center transition-colors"><Plus size={18}/></div>
                    สร้างเมนูใหม่
                </button>

                {/* Main Loop - Explicitly Typed */}
                {Object.entries(groupedMenus).map(([category, menuList]: [string, MenuItem[]]) => (
                    <div key={category} className="mb-8">
                        <h4 className="text-sm font-bold text-stone-400 uppercase mb-3 flex items-center gap-2 pl-1">
                            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                            {category} ({menuList.length})
                        </h4>
                        
                        <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "flex flex-col gap-2"}>
                            {menuList.map((menu: MenuItem) => {
                                const mStats = getMenuStats(menu);
                                
                                // --- GRID ITEM ---
                                if (viewMode === 'grid') {
                                    return (
                                        <div 
                                            key={menu.id}
                                            onClick={() => { onSelect(menu.id); onClose(); }}
                                            className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer group flex flex-col h-full ${selectedMenuId === menu.id ? 'border-orange-400 ring-2 ring-orange-100' : 'border-stone-100 hover:border-orange-200'}`}
                                        >
                                            <div className="aspect-square bg-stone-100 relative overflow-hidden">
                                                {menu.image ? (
                                                    <img src={menu.image} alt={menu.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-stone-300 font-bold text-4xl select-none">
                                                        {menu.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm ${mStats.gradeColor}`}>
                                                    {mStats.grade}
                                                </div>
                                                
                                                {/* Tags Indicator */}
                                                {menu.tags && menu.tags.length > 0 && (
                                                    <div className="absolute bottom-2 left-2 flex gap-1">
                                                        {menu.tags.map((tag, i) => (
                                                            <span key={i} className="bg-black/50 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded-md font-bold">{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-3 flex flex-col justify-between flex-1">
                                                <h5 className="font-bold text-stone-700 text-sm line-clamp-2 mb-1 leading-tight">{menu.name}</h5>
                                                <div className="mt-auto">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-lg font-black text-stone-800">฿{menu.sellingPrice}</span>
                                                        <span className={`text-xs font-bold ${mStats.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {mStats.profit > 0 ? '+' : ''}฿{mStats.profit.toFixed(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Delete */}
                                            <button 
                                                onClick={async (e) => { e.stopPropagation(); if(await showConfirm('ลบเมนูนี้?')) onDelete(menu.id); }}
                                                className="absolute top-2 left-2 p-1.5 bg-white/80 text-stone-400 hover:text-red-500 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-sm backdrop-blur-sm"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    );
                                } 
                                
                                // --- LIST ITEM ---
                                else {
                                    return (
                                        <div 
                                            key={menu.id}
                                            onClick={() => { onSelect(menu.id); onClose(); }}
                                            className={`flex items-center gap-4 p-3 rounded-2xl border-2 bg-white hover:border-orange-300 transition-all cursor-pointer group ${selectedMenuId === menu.id ? 'border-orange-400 bg-orange-50' : 'border-stone-100'}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                                                {menu.image ? <img src={menu.image} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-stone-300 font-bold">{menu.name.charAt(0)}</div>}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-bold text-stone-700 text-sm truncate">{menu.name}</h5>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-stone-400">{menu.ingredients.length} วัตถุดิบ</p>
                                                    {menu.tags && menu.tags.map((tag, i) => (
                                                        <span key={i} className="text-[10px] bg-stone-100 text-stone-500 px-1.5 rounded font-bold border border-stone-200">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-right">
                                                <div>
                                                    <span className="block text-xs font-bold text-stone-400 uppercase">ราคา</span>
                                                    <span className="font-black text-stone-800">฿{menu.sellingPrice}</span>
                                                </div>
                                                <div className="w-16">
                                                    <span className="block text-xs font-bold text-stone-400 uppercase">กำไร</span>
                                                    <span className={`font-bold ${mStats.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>฿{mStats.profit.toFixed(0)}</span>
                                                </div>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${mStats.gradeColor}`}>
                                                    {mStats.grade}
                                                </div>
                                                <button 
                                                    onClick={async (e) => { e.stopPropagation(); if(await showConfirm('ลบเมนูนี้?')) onDelete(menu.id); }}
                                                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                ))}

                {filteredMenusCount === 0 && (
                    <div className="text-center py-10 text-stone-300">
                        <p>ไม่พบเมนูในหมวดนี้</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default MenuSelectorModal;
