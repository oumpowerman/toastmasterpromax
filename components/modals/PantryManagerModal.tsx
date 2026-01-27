
import React, { useState } from 'react';
import { X, Archive, Wheat, Box, Plus, LayoutGrid, List, Beef, Milk, Carrot, IceCream } from 'lucide-react';
import { IngredientLibraryItem } from '../../types';
import { useAlert } from '../AlertSystem';
import PantryItemCard from './pantry/PantryItemCard';
import PantryForm from './pantry/PantryForm';

interface PantryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  centralIngredients: IngredientLibraryItem[];
  onAdd: (item: any) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  suppliers?: { id: string; name: string }[];
}

const INGREDIENT_CATS = [
    { id: 'bread', label: 'ขนมปัง (Bread)', icon: Box, color: 'text-orange-500' },
    { id: 'meat', label: 'เนื้อสัตว์ (Meat)', icon: Beef, color: 'text-red-500' },
    { id: 'dairy', label: 'นม/เนย (Dairy)', icon: Milk, color: 'text-yellow-500' },
    { id: 'veg', label: 'ผัก/ผลไม้ (Veg/Fruit)', icon: Carrot, color: 'text-green-500' },
    { id: 'topping', label: 'Topping', icon: IceCream, color: 'text-pink-500' },
    { id: 'general', label: 'ทั่วไป (General)', icon: Wheat, color: 'text-stone-500' },
];

const PantryManagerModal: React.FC<PantryManagerModalProps> = ({ 
  isOpen, onClose, centralIngredients, onAdd, onUpdate, onDelete, suppliers = [] 
}) => {
  const { showConfirm, showAlert } = useAlert();
  
  // State
  const [editingItem, setEditingItem] = useState<IngredientLibraryItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Grouped Lists
  const pantryIngredients = centralIngredients.filter(i => !i.category || i.category === 'ingredient');
  const pantryPackaging = centralIngredients.filter(i => i.category === 'packaging');

  const handleDelete = async (id: string) => {
      if (await showConfirm('ลบรายการนี้จากคลัง? (สูตรที่ใช้อยู่จะหายไปด้วย)')) {
          onDelete(id);
      }
  };

  const handleSave = (data: any) => {
      const supplierName = suppliers.find(s => s.id === data.supplierId)?.name;
      
      if (editingItem) {
          onUpdate(editingItem.id, data);
          if (data.supplierId && !editingItem.supplierId) {
              showAlert(`อัปเดตและเชื่อมต่อกับร้าน "${supplierName}" เรียบร้อย`, 'success');
          } else {
              showAlert('แก้ไขข้อมูลเรียบร้อย', 'success');
          }
          setEditingItem(null);
      } else {
          onAdd(data);
          if (data.supplierId) {
              showAlert(`เพิ่มเข้าคลังและเพิ่มลงร้าน "${supplierName}" ให้แล้ว!`, 'success');
          } else {
              showAlert('เพิ่มเข้าคลังเรียบร้อย', 'success');
          }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-800 text-white">
                <div>
                    <h3 className="text-xl font-bold font-cute flex items-center gap-2">
                        <Archive className="text-orange-400" /> คลังวัตถุดิบกลาง (Central Pantry)
                    </h3>
                    <p className="text-stone-400 text-xs mt-1">จัดการวัตถุดิบและสูตรผสม เพื่อใช้ร่วมกันในหลายเมนู</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-stone-700 p-1 rounded-xl">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-stone-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-300'}`}>
                            <LayoutGrid size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-stone-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-300'}`}>
                            <List size={18} />
                        </button>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-stone-50">
                
                {/* LEFT: FORM SECTION */}
                <div className="lg:w-[450px] w-full bg-white border-r border-stone-200 flex flex-col shrink-0 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                    <PantryForm 
                        initialData={editingItem}
                        centralIngredients={centralIngredients}
                        suppliers={suppliers}
                        onSave={handleSave}
                        onCancel={() => setEditingItem(null)}
                    />
                </div>

                {/* RIGHT: LIST SECTION */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {centralIngredients.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-stone-300 border-2 border-dashed border-stone-200 rounded-[2rem]">
                                <Archive size={48} className="mb-2 opacity-20" />
                                <p className="font-bold">คลังว่างเปล่า</p>
                                <p className="text-sm">เพิ่มวัตถุดิบแรกทางซ้ายมือได้เลยครับ</p>
                            </div>
                        )}

                        {/* --- CATEGORIZED INGREDIENTS --- */}
                        {pantryIngredients.length > 0 && INGREDIENT_CATS.map(cat => {
                            const catItems = pantryIngredients.filter(i => 
                                cat.id === 'general' 
                                    ? (!i.subCategory || i.subCategory === 'general') 
                                    : i.subCategory === cat.id
                            );

                            if (catItems.length === 0) return null;

                            return (
                                <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h4 className="text-sm font-bold text-stone-400 uppercase mb-3 flex items-center gap-2 pl-1">
                                        <cat.icon size={16} className={cat.color} /> {cat.label}
                                    </h4>
                                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                                        {catItems.map(item => (
                                            <PantryItemCard 
                                                key={item.id}
                                                item={item}
                                                supplierName={suppliers.find(s => s.id === item.supplierId)?.name}
                                                isActive={editingItem?.id === item.id}
                                                viewMode={viewMode}
                                                onEdit={setEditingItem}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* --- PACKAGING SECTION (Always at bottom) --- */}
                        {pantryPackaging.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <h4 className="text-sm font-bold text-stone-400 uppercase mb-3 flex items-center gap-2 pl-1"><Box size={16}/> บรรจุภัณฑ์/ของใช้</h4>
                                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                                    {pantryPackaging.map(item => (
                                        <PantryItemCard 
                                            key={item.id}
                                            item={item}
                                            supplierName={suppliers.find(s => s.id === item.supplierId)?.name}
                                            isActive={editingItem?.id === item.id}
                                            viewMode={viewMode}
                                            onEdit={setEditingItem}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Empty Space for scrolling */}
                        <div className="h-20"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PantryManagerModal;
