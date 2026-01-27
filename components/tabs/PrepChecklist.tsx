
import React, { useState, useMemo } from 'react';
import { ClipboardCheck, RotateCcw, CheckSquare, Square, Wand2, Plus, Minus, Trash2, Edit2, X, Save, Bookmark, ChevronDown, FolderOpen, Package, AlertTriangle, ArrowRight, Search, Image as ImageIcon, Utensils, Briefcase, Sparkles, Check, ZoomIn, ArrowLeft } from 'lucide-react';
import { ChecklistItem, Equipment, MenuItem, ChecklistPreset, InventoryItem } from '../../types';
import { MentorTip, CuteButton, CheerProgressBar } from '../UI';
import { useAlert } from '../AlertSystem';

interface PrepChecklistProps {
  checklist: ChecklistItem[];
  presets: ChecklistPreset[];
  equipment: Equipment[];
  menuItems: MenuItem[];
  inventory: InventoryItem[]; 
  updateChecklist: (items: ChecklistItem[]) => void;
  updatePresets: (presets: ChecklistPreset[]) => void;
}

const PrepChecklist: React.FC<PrepChecklistProps> = ({ checklist, presets, equipment, menuItems, inventory, updateChecklist, updatePresets }) => {
  const { showConfirm, showAlert } = useAlert();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  
  // Category Modal State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Form State for Add/Edit
  const [addMode, setAddMode] = useState<'stock' | 'manual'>('stock');
  const [stockSearch, setStockSearch] = useState('');
  
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemUnit, setItemUnit] = useState('ชิ้น');
  const [itemCategory, setItemCategory] = useState<'equipment' | 'ingredient' | 'misc'>('misc');

  const generateChecklist = async () => {
     if (checklist.length > 0 && !(await showConfirm('สร้างรายการใหม่? รายการเดิมจะถูกล้างทั้งหมด'))) return;

     const newItems: ChecklistItem[] = [];
     
     // 1. Group Equipment by Name
     const equipMap = new Map<string, number>();
     equipment.forEach(eq => {
         equipMap.set(eq.name, (equipMap.get(eq.name) || 0) + 1);
     });

     equipMap.forEach((qty, name) => {
         newItems.push({
             id: `eq-${name}-${Date.now()}`,
             name: name,
             category: 'equipment',
             isChecked: false,
             quantity: qty,
             unit: 'ชิ้น'
         });
     });

     // 2. Add Ingredients (Sync with Inventory)
     const uniqueIngredients = new Set<string>();
     menuItems.forEach(menu => {
         menu.ingredients.forEach(ing => {
             const cleanName = ing.name.trim();
             if (!uniqueIngredients.has(cleanName)) {
                 uniqueIngredients.add(cleanName);
                 const stockItem = inventory.find(inv => inv.name.trim() === cleanName);
                 newItems.push({
                     id: `ing-${cleanName}-${Date.now()}`,
                     name: cleanName,
                     category: 'ingredient',
                     isChecked: false,
                     quantity: 1, 
                     unit: stockItem ? stockItem.unit : (ing.unit || 'แพ็ค') 
                 });
             }
         });
     });

     // 3. Add Misc (Standard)
     const miscItems = [
         { name: 'เงินทอน', unit: 'กล่อง', qty: 1 },
         { name: 'ผ้าเช็ดโต๊ะ', unit: 'ผืน', qty: 2 },
         { name: 'ถุงขยะ', unit: 'แพ็ค', qty: 1 },
         { name: 'เจลแอลกอฮอล์', unit: 'ขวด', qty: 1 },
         { name: 'กรรไกร/คัตเตอร์', unit: 'อัน', qty: 1 }
     ];
     
     miscItems.forEach((m, idx) => {
         newItems.push({
            id: `misc-${idx}`,
            name: m.name,
            category: 'misc',
            isChecked: false,
            quantity: m.qty,
            unit: m.unit
         });
     });

     updateChecklist(newItems);
  };

  const toggleItem = (id: string) => {
      updateChecklist(checklist.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
  };

  const updateQuantity = (id: string, delta: number) => {
      updateChecklist(checklist.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item
      ));
  };

  const deleteItem = async (id: string) => {
      if(await showConfirm('ลบรายการนี้?')) {
          updateChecklist(checklist.filter(item => item.id !== id));
      }
  };

  const resetAll = async () => {
      if (!(await showConfirm('รีเซ็ตเครื่องหมายถูกทั้งหมด?'))) return;
      updateChecklist(checklist.map(item => ({ ...item, isChecked: false })));
  };
  
  const handleSaveItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingItem) {
          // Edit Mode
          updateChecklist(checklist.map(i => i.id === editingItem.id ? {
              ...i,
              name: itemName,
              quantity: itemQty,
              unit: itemUnit,
              category: itemCategory
          } : i));
          setEditingItem(null);
      } else {
          // Add Mode
          const newItem: ChecklistItem = {
              id: `custom-${Date.now()}`,
              name: itemName,
              quantity: itemQty,
              unit: itemUnit,
              category: itemCategory,
              isChecked: false
          };
          updateChecklist([...checklist, newItem]);
      }
      setShowAddModal(false);
      resetForm();
  };

  const openAddModal = () => {
      resetForm();
      setAddMode('stock'); // Default to stock picker
      setShowAddModal(true);
  };

  const openEdit = (item: ChecklistItem) => {
      setEditingItem(item);
      setItemName(item.name);
      setItemQty(item.quantity || 1);
      setItemUnit(item.unit || 'ชิ้น');
      setItemCategory(item.category);
      setAddMode('manual'); // Force manual for edit
      setShowAddModal(true);
  };

  const resetForm = () => {
      setItemName('');
      setItemQty(1);
      setItemUnit('ชิ้น');
      setItemCategory('misc');
      setEditingItem(null);
      setStockSearch('');
  };

  const handleSelectStockItem = (inv: InventoryItem) => {
      setItemName(inv.name);
      setItemUnit(inv.unit);
      // Guess category
      const cat = inv.category === 'packaging' ? 'misc' : 'ingredient'; 
      setItemCategory(cat as any);
      setItemQty(1);
      setAddMode('manual'); // Move to form to confirm qty
  };

  // --- PRESET LOGIC ---
  const savePreset = async () => {
      if (!newPresetName) return;
      const newPreset: ChecklistPreset = {
          id: `preset-${Date.now()}`,
          name: newPresetName,
          items: checklist.map(item => ({...item, isChecked: false})) // Reset checks when saving
      };
      updatePresets([...presets, newPreset]);
      setIsCreatingPreset(false);
      setNewPresetName('');
      await showAlert('บันทึก Preset เรียบร้อย!', 'success');
  };

  const loadPreset = async (preset: ChecklistPreset) => {
      if (checklist.length > 0 && !(await showConfirm('โหลดรายการใหม่? รายการปัจจุบันจะหายไป'))) return;
      // Deep copy logic
      const loadedItems = preset.items.map(i => {
          const stockItem = inventory.find(inv => inv.name.trim() === i.name.trim());
          return {
              ...i,
              unit: stockItem ? stockItem.unit : i.unit
          };
      }); 
      updateChecklist(loadedItems);
      setIsPresetMenuOpen(false);
  };

  const deletePreset = async (id: string) => {
      if (!(await showConfirm('ต้องการลบ Preset นี้ใช่ไหม?'))) return;
      updatePresets(presets.filter(p => p.id !== id));
  };

  const progress = useMemo(() => {
      if (checklist.length === 0) return 0;
      const checked = checklist.filter(c => c.isChecked).length;
      return Math.round((checked / checklist.length) * 100);
  }, [checklist]);

  // NEW: Summary Card Renderer
  const renderCategoryCard = (title: string, category: string, bgClass: string, iconColor: string, icon: React.ElementType) => {
      const items = checklist.filter(c => c.category === category);
      const completedCount = items.filter(c => c.isChecked).length;
      const totalCount = items.length;
      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      return (
          <div 
            onClick={() => setSelectedCategory(category)}
            className="bg-white p-6 rounded-[2rem] border-2 border-stone-100 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
          >
              <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${iconColor} bg-opacity-20 group-hover:scale-110 transition-transform`}>
                      {React.createElement(icon, { size: 32 })}
                  </div>
                  <div className="text-right">
                      <span className="text-4xl font-black text-stone-800 font-cute">{completedCount}</span>
                      <span className="text-stone-400 font-bold text-lg">/{totalCount}</span>
                  </div>
              </div>
              
              <h3 className="text-xl font-bold text-stone-700 mb-4 font-cute flex items-center gap-2">
                  {title} <ChevronDown size={16} className="text-stone-300 -rotate-90"/>
              </h3>
              
              {/* Mini Progress Bar */}
              <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${percent === 100 ? 'bg-green-500' : 'bg-orange-400'}`} 
                    style={{ width: `${percent}%` }}
                  ></div>
              </div>
              <p className={`text-xs mt-2 font-bold text-right ${percent === 100 ? 'text-green-500' : 'text-stone-400'}`}>
                  {percent === 100 ? 'ครบแล้ว! 🎉' : `${percent}% เสร็จสิ้น`}
              </p>
          </div>
      );
  };

  // Helper to get Title from Category ID
  const getCategoryTitle = (id: string) => {
      switch(id) {
          case 'equipment': return 'อุปกรณ์ (Equipment)';
          case 'ingredient': return 'วัตถุดิบ (Ingredients)';
          case 'misc': return 'อื่นๆ (Misc)';
          default: return id;
      }
  };

  const getCategoryIcon = (id: string) => {
      switch(id) {
          case 'equipment': return Briefcase;
          case 'ingredient': return Utensils;
          case 'misc': return Package;
          default: return Package;
      }
  };

  const getCategoryColor = (id: string) => {
      switch(id) {
          case 'equipment': return 'bg-orange-100 text-orange-500';
          case 'ingredient': return 'bg-blue-100 text-blue-500';
          case 'misc': return 'bg-purple-100 text-purple-500';
          default: return 'bg-stone-100 text-stone-500';
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col font-cute pb-20">
       
       {/* HEADER & ACTIONS */}
       <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-stone-800 flex items-center gap-3 drop-shadow-sm">
                <span className="text-4xl animate-bounce">🎒</span>
                เตรียมของออกบูธ
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-lg border border-green-200 animate-pulse">Realtime Sync</span>
            </h2>
            <p className="text-stone-500 font-bold text-base mt-2 ml-1">เช็คให้ชัวร์ก่อนออกเดินทาง จะได้ไม่ลืมของสำคัญ!</p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
             {/* Preset Menu */}
             <div className="relative">
                 <CuteButton 
                    label={`โหลด Preset (${presets.length})`}
                    onClick={() => setIsPresetMenuOpen(!isPresetMenuOpen)}
                    theme="stone"
                    icon={FolderOpen}
                 />
                 
                 {isPresetMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border-4 border-white p-3 z-30 animate-in zoom-in-95">
                         <p className="text-xs font-bold text-stone-400 px-3 py-2 uppercase">เลือกรายการที่บันทึกไว้</p>
                         {presets.length === 0 ? (
                             <div className="text-center py-6 text-stone-300 text-sm bg-stone-50 rounded-xl">ยังไม่มี Preset</div>
                         ) : (
                             <div className="space-y-1 mb-2 max-h-48 overflow-y-auto custom-scrollbar">
                                 {presets.map(p => (
                                     <div key={p.id} className="flex items-center justify-between p-3 hover:bg-orange-50 rounded-2xl group transition-colors cursor-pointer" onClick={() => loadPreset(p)}>
                                         <span className="flex-1 text-left font-bold text-stone-600 text-sm hover:text-orange-600 truncate">
                                             {p.name}
                                         </span>
                                         <button onClick={(e) => { e.stopPropagation(); deletePreset(p.id); }} className="text-stone-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <Trash2 size={14} />
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         )}
                         <div className="border-t-2 border-stone-100 pt-2 mt-1">
                             {!isCreatingPreset ? (
                                 <button 
                                    onClick={() => setIsCreatingPreset(true)}
                                    className="w-full py-3 bg-stone-100 text-stone-500 rounded-xl text-xs font-bold hover:bg-orange-400 hover:text-white transition-all flex items-center justify-center gap-2"
                                 >
                                     <Bookmark size={14} /> บันทึกรายการปัจจุบัน
                                 </button>
                             ) : (
                                 <div className="flex gap-2">
                                     <input 
                                        type="text" 
                                        placeholder="ตั้งชื่อ..." 
                                        autoFocus
                                        value={newPresetName}
                                        onChange={e => setNewPresetName(e.target.value)}
                                        className="flex-1 bg-stone-50 border-2 border-stone-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-300"
                                    />
                                     <button onClick={savePreset} disabled={!newPresetName} className="bg-orange-400 text-white rounded-xl px-3 hover:bg-orange-500 disabled:opacity-50"><Save size={16}/></button>
                                     <button onClick={() => setIsCreatingPreset(false)} className="bg-stone-200 text-stone-500 rounded-xl px-3 hover:bg-stone-300"><X size={16}/></button>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}
             </div>

             <div className="h-10 w-px bg-stone-200 mx-2 hidden md:block"></div>

             <CuteButton 
                label="สร้างใหม่ (Auto)" 
                onClick={generateChecklist} 
                theme="blue" 
                icon={Wand2}
             />
             
             <CuteButton 
                label="เพิ่มรายการ" 
                onClick={openAddModal} 
                theme="orange" 
                icon={Plus}
             />
             
             <CuteButton 
                label="" 
                onClick={resetAll} 
                theme="stone" 
                icon={RotateCcw}
                className="w-12 px-0"
             />
          </div>
       </div>

       {/* Mentor Tips */}
       <MentorTip 
         tips={[
             { title: "เชื่อมต่อสต็อกแล้ว! 🔗", desc: "ระบบจะเช็คยอดคงเหลือในคลังให้ทันที ถ้าเห็น 'สีแดง' แปลว่าของไม่พอรีบไปเติมด่วน!" },
             { title: "ระบบ Realtime ⚡️", desc: "ถ้ามีหลายคนช่วยกันจัดของ กดติ๊กที่เครื่องไหน อีกเครื่องก็จะขึ้นทันทีครับ ไม่ต้องตะโกนถามกัน!" },
             { title: "แยกกันเช็คของ 🔍", desc: "กดที่การ์ดหมวดหมู่เพื่อเปิดหน้าต่างแยก จะได้ไม่สับสนกับเพื่อนเวลาช่วยกันเช็คหลายคนครับ" }
         ]}
       />

       {/* New Cheer Progress Bar (Global) */}
       <CheerProgressBar progress={progress} />

       {/* Category Cards Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {renderCategoryCard('อุปกรณ์ (Equipment)', 'equipment', 'bg-orange-400', 'bg-orange-100 text-orange-500', Briefcase)}
           {renderCategoryCard('วัตถุดิบ (Ingredients)', 'ingredient', 'bg-blue-400', 'bg-blue-100 text-blue-500', Utensils)}
           {renderCategoryCard('อื่นๆ (Misc)', 'misc', 'bg-purple-400', 'bg-purple-100 text-purple-500', Package)}
       </div>

       {/* CATEGORY DETAIL MODAL */}
       {selectedCategory && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCategory(null)}></div>
               <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 duration-200 border-8 border-white overflow-hidden">
                   
                   {/* Modal Header */}
                   <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0 bg-[#FFF9F2]">
                       <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-2xl ${getCategoryColor(selectedCategory)} shadow-sm`}>
                               {React.createElement(getCategoryIcon(selectedCategory), { size: 32 })}
                           </div>
                           <div>
                               <h3 className="text-2xl font-bold text-stone-800 font-cute">{getCategoryTitle(selectedCategory)}</h3>
                               <p className="text-stone-400 text-xs font-bold">เช็คให้ครบทุกรายการนะครับ</p>
                           </div>
                       </div>
                       <button onClick={() => setSelectedCategory(null)} className="w-12 h-12 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors">
                           <X size={24} />
                       </button>
                   </div>

                   {/* Modal Body: List of Items */}
                   <div className="flex-1 overflow-y-auto p-6 bg-stone-50 custom-scrollbar">
                       {checklist.filter(c => c.category === selectedCategory).length === 0 ? (
                           <div className="flex flex-col items-center justify-center py-20 opacity-50">
                               <Package size={64} className="text-stone-300 mb-4"/>
                               <p className="font-bold text-stone-400">หมวดนี้ยังไม่มีรายการ</p>
                               <button onClick={openAddModal} className="mt-4 text-orange-500 underline font-bold">เพิ่มรายการใหม่</button>
                           </div>
                       ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {checklist.filter(c => c.category === selectedCategory).map(item => {
                                   const stockItem = inventory.find(inv => inv.name.trim() === item.name.trim());
                                   const stockQty = stockItem ? stockItem.quantity : 0;
                                   const isLowStock = (selectedCategory === 'ingredient' || selectedCategory === 'misc') && stockItem && stockQty < item.quantity;
                                   
                                   return (
                                       <div 
                                         key={item.id} 
                                         className={`relative group p-4 rounded-[1.5rem] transition-all duration-300 border-2 shadow-sm cursor-pointer select-none active:scale-[0.98] ${
                                             item.isChecked 
                                             ? 'bg-green-50/50 border-green-200 opacity-60 grayscale-[0.5]' 
                                             : 'bg-white border-stone-100 hover:border-orange-300 hover:shadow-md'
                                         }`}
                                         onClick={() => toggleItem(item.id)}
                                       >
                                           <div className="flex items-center gap-4">
                                               {/* Checkbox Visual */}
                                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${item.isChecked ? 'bg-green-500 text-white shadow-inner scale-110' : 'bg-stone-100 text-stone-300 border border-stone-200 group-hover:bg-orange-50 group-hover:text-orange-400'}`}>
                                                    {item.isChecked ? <Check size={28} strokeWidth={4} /> : <div className="w-5 h-5 rounded-full border-2 border-current"></div>}
                                               </div>

                                               <div className="flex-1 min-w-0">
                                                   <p className={`font-bold text-lg truncate font-cute leading-snug ${item.isChecked ? 'line-through text-stone-400' : 'text-stone-700'}`}>{item.name}</p>
                                                   <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center bg-stone-50 rounded-lg px-2 py-0.5 border border-stone-100" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-700 active:bg-stone-200 rounded"><Minus size={12}/></button>
                                                            <span className="text-sm font-black w-8 text-center text-stone-600 font-cute">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-700 active:bg-stone-200 rounded"><Plus size={12}/></button>
                                                        </div>
                                                        <span className="text-xs text-stone-400 font-bold">{item.unit}</span>
                                                   </div>
                                                   
                                                   {stockItem && (
                                                       <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${isLowStock ? 'text-red-500 bg-red-50 px-2 py-0.5 rounded-md w-fit animate-pulse' : 'text-stone-400'}`}>
                                                           {isLowStock && <AlertTriangle size={10} />}
                                                           คลัง: {stockQty.toLocaleString()} {stockItem.unit}
                                                       </div>
                                                   )}
                                               </div>
                                               
                                               <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                   <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="p-2 text-stone-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 size={16}/></button>
                                                   <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16}/></button>
                                               </div>
                                           </div>
                                       </div>
                                   );
                               })}
                           </div>
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* Add/Edit Modal (Enhanced with Inventory Picker) */}
       {showAddModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)}></div>
               <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 flex flex-col border-8 border-white overflow-hidden">
                   
                   {/* Header */}
                   <div className="p-6 pb-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                       <div>
                           <h3 className="text-2xl font-black text-stone-800 font-cute">{editingItem ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h3>
                           <p className="text-xs text-stone-400 font-bold">จัดเตรียมของให้ครบถ้วน</p>
                       </div>
                       <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-white hover:bg-stone-200 text-stone-400 flex items-center justify-center transition-colors shadow-sm"><X size={20}/></button>
                   </div>
                   
                   {/* Tab Switcher (Only in Add Mode) */}
                   {!editingItem && (
                       <div className="px-6 pt-6">
                           <div className="bg-stone-100 p-1.5 rounded-2xl flex relative font-bold text-sm">
                               <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${addMode === 'stock' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
                               <button 
                                   onClick={() => setAddMode('stock')} 
                                   className={`flex-1 relative z-10 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${addMode === 'stock' ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                               >
                                   <Package size={16}/> เลือกจากสต็อก
                               </button>
                               <button 
                                   onClick={() => setAddMode('manual')} 
                                   className={`flex-1 relative z-10 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${addMode === 'manual' ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                               >
                                   <Edit2 size={16}/> กรอกเอง
                               </button>
                           </div>
                       </div>
                   )}

                   <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                       
                       {/* STOCK PICKER MODE */}
                       {addMode === 'stock' && !editingItem ? (
                           <div className="space-y-4">
                               <div className="relative">
                                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18}/>
                                   <input 
                                       type="text" 
                                       placeholder="ค้นหาสินค้าในคลัง..." 
                                       value={stockSearch}
                                       onChange={e => setStockSearch(e.target.value)}
                                       autoFocus
                                       className="w-full pl-12 pr-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl font-bold text-stone-600 outline-none focus:border-orange-300 transition-all"
                                   />
                               </div>

                               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                   {inventory
                                       .filter(inv => inv.name.toLowerCase().includes(stockSearch.toLowerCase()))
                                       .map(inv => (
                                           <button 
                                               key={inv.id}
                                               onClick={() => handleSelectStockItem(inv)}
                                               className="bg-white p-3 rounded-2xl border-2 border-stone-100 hover:border-orange-300 hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group"
                                           >
                                               <div className="w-14 h-14 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                                                   {inv.image ? (
                                                       <img src={inv.image} alt={inv.name} className="w-full h-full object-cover" />
                                                   ) : (
                                                       <ImageIcon size={24} className="text-stone-300" />
                                                   )}
                                               </div>
                                               <div>
                                                   <p className="text-xs font-bold text-stone-700 line-clamp-1">{inv.name}</p>
                                                   <p className="text-[10px] text-stone-400">{inv.quantity} {inv.unit}</p>
                                               </div>
                                           </button>
                                       ))
                                   }
                                   {inventory.length === 0 && (
                                       <div className="col-span-full text-center py-8 text-stone-300">
                                           <p>ไม่พบสินค้าในคลัง</p>
                                       </div>
                                   )}
                               </div>
                           </div>
                       ) : (
                           /* MANUAL / EDIT FORM */
                           <form onSubmit={handleSaveItem} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                               <div>
                                   <label className="text-xs font-bold text-stone-400 uppercase ml-1 mb-1 block">ชื่อรายการ</label>
                                   <input 
                                       type="text" 
                                       required 
                                       value={itemName} 
                                       onChange={e => setItemName(e.target.value)} 
                                       className="w-full px-5 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl font-bold text-stone-700 outline-none focus:border-orange-300 text-lg" 
                                       placeholder="เช่น ถุงมือยาง" 
                                   />
                               </div>

                               <div className="flex gap-4">
                                   <div className="flex-1">
                                       <label className="text-xs font-bold text-stone-400 uppercase ml-1 mb-1 block">หมวดหมู่</label>
                                       <select 
                                           value={itemCategory} 
                                           onChange={e => setItemCategory(e.target.value as any)}
                                           className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl font-bold text-stone-700 outline-none focus:border-orange-300"
                                       >
                                           <option value="equipment">อุปกรณ์</option>
                                           <option value="ingredient">วัตถุดิบ</option>
                                           <option value="misc">อื่นๆ</option>
                                       </select>
                                   </div>
                               </div>

                               <div className="flex gap-4">
                                   <div className="flex-1">
                                       <label className="text-xs font-bold text-stone-400 uppercase ml-1 mb-1 block">จำนวน</label>
                                       <input 
                                           type="number" 
                                           required 
                                           min="1"
                                           value={itemQty} 
                                           onChange={e => setItemQty(Number(e.target.value))} 
                                           className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl font-bold text-stone-700 outline-none focus:border-orange-300 text-center text-xl" 
                                       />
                                   </div>
                                   <div className="flex-1">
                                       <label className="text-xs font-bold text-stone-400 uppercase ml-1 mb-1 block">หน่วย</label>
                                       <input 
                                           type="text" 
                                           required 
                                           value={itemUnit} 
                                           onChange={e => setItemUnit(e.target.value)} 
                                           className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl font-bold text-stone-700 outline-none focus:border-orange-300 text-center" 
                                           placeholder="ชิ้น" 
                                       />
                                   </div>
                               </div>

                               <CuteButton 
                                    label="บันทึกรายการ" 
                                    theme="orange" 
                                    icon={Save} 
                                    className="w-full py-4 text-lg"
                                    onClick={() => {}} // Form submit handles logic
                               />
                               
                               {!editingItem && (
                                   <button type="button" onClick={() => setAddMode('stock')} className="w-full text-stone-400 text-xs font-bold hover:text-stone-600">
                                       กลับไปเลือกจากสต็อก
                                   </button>
                               )}
                           </form>
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default PrepChecklist;
