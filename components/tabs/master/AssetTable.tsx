
import React, { useState } from 'react';
import { Store, Layers, Trash2, X, Box, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Equipment } from '../../../types';
import { EQUIPMENT_CATEGORIES } from '../../../constants';

interface AssetTableProps {
  equipment: Equipment[];
  addEquipment: (category: string) => void;
  updateEquipment: (id: string, field: keyof Equipment, value: any) => void;
  removeEquipment: (id: string) => void;
}

const categoryColors: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-500 border-orange-100 hover:bg-orange-100',
    blue: 'bg-blue-50 text-blue-500 border-blue-100 hover:bg-blue-100',
    amber: 'bg-amber-50 text-amber-500 border-amber-100 hover:bg-amber-100',
    stone: 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100',
    purple: 'bg-purple-50 text-purple-500 border-purple-100 hover:bg-purple-100',
};

const AssetTable: React.FC<AssetTableProps> = ({ equipment, addEquipment, updateEquipment, removeEquipment }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Equipment | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  // Calculate Total Daily Depreciation
  const totalDepreciation = equipment.reduce((sum, item) => {
    return sum + ((item.purchasePrice - item.resalePrice) / item.lifespanDays);
  }, 0);

  // --- SORTING LOGIC ---
  const handleSort = (key: keyof Equipment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = () => {
    let items = selectedCategory === 'ALL' 
      ? [...equipment] 
      : equipment.filter(e => (e.category || 'other') === selectedCategory);

    if (sortConfig.key) {
      items.sort((a, b) => {
        const aValue = a[sortConfig.key!] as any;
        const bValue = b[sortConfig.key!] as any;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  };

  const sortedItems = getSortedItems();

  const renderSortIcon = (key: keyof Equipment) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-stone-300" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-orange-500" /> 
      : <ArrowDown size={14} className="text-orange-500" />;
  };

  const renderRowItem = (item: Equipment) => (
      <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group border-b border-stone-50 last:border-0">
          <td className="px-6 py-4">
            <input type="text" value={item.name} onChange={e => updateEquipment(item.id, 'name', e.target.value)} className="bg-transparent border-b border-dashed border-stone-200 focus:border-orange-400 outline-none w-full py-1 text-stone-700 font-bold" />
          </td>
          {selectedCategory === 'ALL' && sortConfig.key && (
              <td className="px-4 py-4 text-xs text-stone-500">
                  {EQUIPMENT_CATEGORIES.find(c => c.id === item.category)?.label || item.category}
              </td>
          )}
          <td className="px-4 py-4">
            <input type="number" value={item.purchasePrice} onChange={e => updateEquipment(item.id, 'purchasePrice', Number(e.target.value))} className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 focus:border-orange-400 outline-none w-24 text-center font-bold text-stone-600 focus:bg-white transition-colors" />
          </td>
          <td className="px-4 py-4">
            <input type="number" value={item.resalePrice} onChange={e => updateEquipment(item.id, 'resalePrice', Number(e.target.value))} className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 focus:border-orange-400 outline-none w-24 text-center font-bold text-stone-600 focus:bg-white transition-colors" />
          </td>
          <td className="px-4 py-4">
            <input type="number" value={item.lifespanDays} onChange={e => updateEquipment(item.id, 'lifespanDays', Number(e.target.value))} className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 focus:border-orange-400 outline-none w-20 text-center font-bold text-stone-600 focus:bg-white transition-colors" />
          </td>
          <td className="px-4 py-4 text-center">
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg font-bold text-xs">
              ฿{((item.purchasePrice - item.resalePrice) / item.lifespanDays).toFixed(2)}
            </span>
          </td>
          <td className="px-4 py-4 text-right">
            <button onClick={() => removeEquipment(item.id)} className="w-8 h-8 inline-flex items-center justify-center rounded-full text-stone-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
              <Trash2 size={16} />
            </button>
          </td>
      </tr>
  );

  const renderTableRows = () => {
    if (sortedItems.length === 0) {
        return (
             <tr>
                <td colSpan={selectedCategory === 'ALL' ? 7 : 6} className="text-center py-12 text-stone-400 font-cute">
                  ยังไม่มีอุปกรณ์ กดปุ่ม "เพิ่ม" ด้านล่างได้เลย
                </td>
              </tr>
        );
    }

    if (selectedCategory === 'ALL' && !sortConfig.key) {
        return EQUIPMENT_CATEGORIES.map(cat => {
            const catItems = sortedItems.filter(e => (e.category || 'other') === cat.id);
            if (catItems.length === 0) return null;

            return (
                <React.Fragment key={cat.id}>
                    {/* Category Header Row */}
                    <tr className="bg-stone-100/50">
                        <td colSpan={7} className="px-6 py-3">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${categoryColors[cat.color]} bg-opacity-20`}>
                                {React.createElement(cat.icon, { size: 16 })}
                                <span className="font-bold text-xs">{cat.label}</span>
                            </div>
                        </td>
                    </tr>
                    {catItems.map(renderRowItem)}
                </React.Fragment>
            );
        });
    }

    return sortedItems.map(renderRowItem);
  };

  return (
    <>
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-stone-100 p-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                 <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Store className="text-orange-400" size={20}/> 1. อุปกรณ์ (Equipment)</h3>
                 <p className="text-stone-400 text-sm">เลือกหมวดหมู่เพื่อจัดการรายการอุปกรณ์</p>
            </div>
            
            <div className="flex gap-4">
                <button 
                  onClick={() => { setSelectedCategory('ALL'); setSortConfig({ key: null, direction: 'asc' }); }}
                  className="bg-purple-50 text-purple-600 border border-purple-100 px-5 py-3 rounded-2xl flex items-center gap-2 font-bold hover:bg-purple-100 transition-colors shadow-sm"
                >
                    <Layers size={18} /> ดูทั้งหมด
                </button>

                <div className="bg-orange-50 border border-orange-100 px-5 py-3 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                        <Store size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">ค่าเสื่อมรวม / วัน</p>
                        <p className="text-xl font-black text-stone-700 font-cute">฿{totalDepreciation.toFixed(2)}</p>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {EQUIPMENT_CATEGORIES.map(cat => {
              const items = equipment.filter(e => (e.category || 'other') === cat.id);
              const totalCost = items.reduce((sum, item) => sum + item.purchasePrice, 0);
              const totalItems = items.length;

              return (
                <button 
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSortConfig({ key: null, direction: 'asc' }); }}
                  className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 group hover:-translate-y-1 ${categoryColors[cat.color]}`}
                >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-2xl shadow-sm">
                          {React.createElement(cat.icon)}
                      </div>
                      <span className="bg-white/60 px-3 py-1 rounded-full text-xs font-bold">
                          {totalItems} รายการ
                      </span>
                    </div>
                    <h4 className="text-lg font-bold mb-1">{cat.label}</h4>
                    <p className="text-xs opacity-70 mb-4 line-clamp-1">{cat.desc}</p>
                    <div className="flex items-center gap-2 text-sm font-bold bg-white/50 p-3 rounded-xl">
                      <span className="opacity-60">มูลค่ารวม:</span>
                      <span>฿{totalCost.toLocaleString()}</span>
                    </div>
                </button>
              );
            })}
          </div>
      </div>

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCategory(null)}></div>
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-8 border-b border-stone-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${selectedCategory === 'ALL' ? 'bg-purple-100 text-purple-600' : categoryColors[EQUIPMENT_CATEGORIES.find(c => c.id === selectedCategory)?.color || 'stone'].split(' ')[0] + ' ' + categoryColors[EQUIPMENT_CATEGORIES.find(c => c.id === selectedCategory)?.color || 'stone'].split(' ')[1]}`}>
                   {selectedCategory === 'ALL' ? <Layers size={24}/> : React.createElement(EQUIPMENT_CATEGORIES.find(c => c.id === selectedCategory)?.icon || Box)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-stone-800 font-cute">
                    {selectedCategory === 'ALL' ? 'อุปกรณ์ทั้งหมด (All Equipment)' : EQUIPMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </h3>
                  <p className="text-stone-400 text-sm">{selectedCategory === 'ALL' ? 'รวมทุกรายการในร้าน (จัดกลุ่มตามหมวดหมู่)' : 'จัดการรายการอุปกรณ์ในหมวดนี้'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-stone-50/30">
                <div className="bg-white rounded-3xl border-2 border-stone-100 overflow-hidden shadow-sm">
                   <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase border-b border-stone-100">
                        <tr>
                          <th className="px-6 py-4 cursor-pointer hover:bg-stone-100 transition-colors group" onClick={() => handleSort('name')}>
                              <div className="flex items-center gap-1">ชื่ออุปกรณ์ {renderSortIcon('name')}</div>
                          </th>
                          {selectedCategory === 'ALL' && sortConfig.key && <th className="px-4 py-4">หมวดหมู่</th>}
                          <th className="px-4 py-4 text-center cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('purchasePrice')}>
                              <div className="flex items-center justify-center gap-1">ราคาซื้อ {renderSortIcon('purchasePrice')}</div>
                          </th>
                          <th className="px-4 py-4 text-center cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('resalePrice')}>
                              <div className="flex items-center justify-center gap-1">ขายต่อ {renderSortIcon('resalePrice')}</div>
                          </th>
                          <th className="px-4 py-4 text-center cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('lifespanDays')}>
                              <div className="flex items-center justify-center gap-1">อายุ (วัน) {renderSortIcon('lifespanDays')}</div>
                          </th>
                          <th className="px-4 py-4 text-center">ทุน/วัน</th>
                          <th className="px-4 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50 text-sm">
                         {renderTableRows()}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-stone-100 flex justify-end bg-white rounded-b-[2.5rem] shrink-0 items-center">
               {selectedCategory !== 'ALL' && (
                    <button 
                        onClick={() => addEquipment(selectedCategory!)}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-400 text-white rounded-2xl hover:bg-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm"
                    >
                        <Plus size={18} /> เพิ่ม{EQUIPMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                    </button>
               )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssetTable;
