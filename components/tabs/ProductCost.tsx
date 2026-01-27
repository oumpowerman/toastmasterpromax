
import React, { useState, useEffect, useMemo } from 'react';
import { ChefHat, Archive, ChevronDown, MousePointerClick, Tag, FlaskConical, AlertTriangle } from 'lucide-react';
import { AppState, MenuItem, IngredientLibraryItem, IngredientItem } from '../../types';
import { useAlert } from '../AlertSystem';
import { uploadImage } from '../../lib/supabase';

// Modular Components
import { useMenuCalculator } from './product/useMenuCalculator';
import MenuHeader from './product/MenuHeader';
import RecipeEditor from './product/RecipeEditor';
import CostAnalysisCard from './product/CostAnalysisCard';
import HiddenCostPanel from './product/HiddenCostPanel';
import PricingDoctor from './product/PricingDoctor';

// Modals
import MenuSelectorModal from '../modals/MenuSelectorModal';
import PantryManagerModal from '../modals/PantryManagerModal';
import IngredientPickerModal from '../modals/IngredientPickerModal';

interface ProductCostProps {
  state: AppState;
  updateNestedState: (category: keyof AppState, field: string, value: any) => void;
  showHelper: string | null;
  setShowHelper: React.Dispatch<React.SetStateAction<string | null>>;
  realCost: number; // Avg real cost
  addMenu: () => string;
  updateMenu: (id: string, field: keyof MenuItem, value: any) => void;
  deleteMenu: (id: string) => void;
  addIngredientToMenu: (menuId: string, initialData?: Partial<IngredientItem>) => void;
  updateIngredientInMenu: (menuId: string, ingId: string, field: 'name' | 'cost' | 'quantity', value: any) => void;
  removeIngredientFromMenu: (menuId: string, ingId: string) => void;
  
  // New Library Props
  addCentralIngredient: (item: Omit<IngredientLibraryItem, 'id' | 'costPerUnit'>) => void;
  updateCentralIngredient: (id: string, updates: Partial<IngredientLibraryItem>) => void;
  deleteCentralIngredient: (id: string) => void;
  
  // Mode Prop
  isSimMode?: boolean;
}

const ProductCost: React.FC<ProductCostProps> = ({ 
    state, 
    updateNestedState, 
    showHelper, 
    setShowHelper, 
    addMenu,
    updateMenu,
    deleteMenu,
    addIngredientToMenu,
    updateIngredientInMenu,
    removeIngredientFromMenu,
    addCentralIngredient,
    updateCentralIngredient,
    deleteCentralIngredient,
    isSimMode = false
}) => {
  const { showAlert } = useAlert();
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  
  // Modal States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [showPantryPicker, setShowPantryPicker] = useState(false);
  
  // Analysis Detail State
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  
  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);

  // Auto-select first menu
  useEffect(() => {
      if (!selectedMenuId && state.menuItems.length > 0) {
          setSelectedMenuId(state.menuItems[0].id);
      }
  }, [state.menuItems.length]);

  // NEW: Calculate all unique categories used in the shop
  const existingCategories = useMemo(() => {
      const cats = new Set(state.menuItems.map(m => m.category || 'General'));
      // Add default suggestions
      ['Toast', 'Beverage', 'Set', 'General'].forEach(c => cats.add(c));
      return Array.from(cats).sort();
  }, [state.menuItems]);

  const activeMenu = state.menuItems.find(m => m.id === selectedMenuId);

  // Logic Hook
  const { stats, priceSuggestions } = useMenuCalculator(activeMenu, state.hiddenPercentages);

  // --- Handlers ---

  const handleAddMenu = () => {
      const newId = addMenu();
      setSelectedMenuId(newId);
      setIsMenuModalOpen(false);
  };

  const handlePickFromPantry = (libItem: IngredientLibraryItem) => {
      if (!activeMenu) return;
      // Calculate initial cost for 1 unit (default)
      const initialCost = 1 * libItem.costPerUnit;
      
      addIngredientToMenu(activeMenu.id, {
          name: libItem.name,
          cost: initialCost,
          masterId: libItem.id,
          image: libItem.image,
          quantity: 1, // Default quantity
          unit: libItem.unitType === 'unit' ? 'ชิ้น' : 'กรัม'
      });
      setShowPantryPicker(false);
  };

  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!activeMenu) return;
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
          await showAlert('ไฟล์ภาพใหญ่เกินไป (ต้องไม่เกิน 5MB)', 'warning');
          return;
      }

      setIsUploading(true);
      try {
          const publicUrl = await uploadImage(file, 'menu_items');
          if (publicUrl) {
              updateMenu(activeMenu.id, 'image', publicUrl);
          } else {
              await showAlert('อัปโหลดรูปภาพไม่สำเร็จ', 'error');
          }
      } catch (error) {
          console.error(error);
          await showAlert('เกิดข้อผิดพลาดในการอัปโหลด', 'error');
      } finally {
          setIsUploading(false);
      }
  };

  // Needed for MenuSelectorModal to render stats
  const getMenuStatsHelper = (menu: MenuItem) => {
      // Replicating logic for the list view (simplified)
      const baseCost = menu.ingredients.reduce((sum, i) => sum + i.cost, 0);
      const multiplier = (state.hiddenPercentages.waste + state.hiddenPercentages.promoLoss + state.hiddenPercentages.paymentFee) / 100;
      const realCost = baseCost * (1 + multiplier);
      const profit = menu.sellingPrice - realCost;
      const margin = menu.sellingPrice > 0 ? (profit / menu.sellingPrice) * 100 : 0;
      
      let grade = 'C';
      let gradeColor = 'bg-red-100 text-red-500 border-red-200';

      if (margin >= 50) { grade = 'S'; gradeColor = 'bg-purple-100 text-purple-600 border-purple-200'; }
      else if (margin >= 40) { grade = 'A'; gradeColor = 'bg-green-100 text-green-600 border-green-200'; }
      else if (margin >= 25) { grade = 'B'; gradeColor = 'bg-blue-100 text-blue-600 border-blue-200'; }
      else if (margin > 0) { grade = 'C'; gradeColor = 'bg-orange-100 text-orange-600 border-orange-200'; }

      return { profit, grade, gradeColor };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col relative font-cute pb-20">
        
        {/* Dynamic Context Banner */}
        {isSimMode ? (
            <div className="bg-purple-50 border-2 border-purple-200 text-purple-700 px-6 py-4 rounded-3xl flex items-center gap-3 shadow-sm animate-pulse">
                <div className="bg-white p-2 rounded-full shadow-sm"><FlaskConical size={20} /></div>
                <div>
                    <p className="font-bold text-sm">🧪 เมนูจำลอง (Draft Mode)</p>
                    <p className="text-xs opacity-80">ปรับแต่งได้เต็มที่! การแก้ไขในหน้านี้จะ **ไม่กระทบ** หน้าร้านจริง</p>
                </div>
            </div>
        ) : (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-3xl flex items-center gap-3 shadow-sm">
                <div className="bg-white p-2 rounded-full shadow-sm"><AlertTriangle size={20} /></div>
                <div>
                    <p className="font-bold text-sm">⚠️ แก้ไขเมนูจริง (Live Menu)</p>
                    <p className="text-xs opacity-80">การแก้ไขจะมีผลทันทีต่อหน้า POS และการตัดสต็อก!</p>
                </div>
            </div>
        )}

        {/* TOP BAR: Header & Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h2 className="text-3xl font-bold text-stone-800 font-cute flex items-center gap-2">
                    <ChefHat className={isSimMode ? "text-purple-500" : "text-green-500"} size={32} />
                    จัดการเมนู (Menu Engineering)
                </h2>
                <p className="text-stone-400 text-sm mt-1 font-cute">ออกแบบสูตรและคำนวณต้นทุนอย่างละเอียด</p>
             </div>

             <div className="flex items-center gap-3">
                 {/* Pantry Button */}
                 <button 
                    onClick={() => setShowPantryModal(true)}
                    className="flex items-center gap-2 bg-stone-800 text-white px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all font-bold text-sm font-cute"
                 >
                     <Archive size={18} /> คลังวัตถุดิบกลาง (Pantry)
                 </button>

                 {/* Active Menu Selector Button (Visual Updated) */}
                 {activeMenu && (
                     <div 
                        onClick={() => setIsMenuModalOpen(true)}
                        className={`group relative cursor-pointer rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border-2 ${isSimMode ? 'border-purple-100 hover:border-purple-300' : 'border-stone-100 hover:border-orange-300'}`}
                        style={{ minWidth: '240px' }}
                     >
                        {/* Background Image Layer */}
                        {activeMenu.image && (
                            <div 
                                className="absolute inset-0 z-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity"
                                style={{ backgroundImage: `url(${activeMenu.image})` }}
                            />
                        )}
                        
                        {/* Content Layer */}
                        <div className={`relative z-10 flex items-center gap-3 pl-4 pr-6 py-2 bg-white/80 backdrop-blur-sm group-hover:bg-white/60 transition-colors`}>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider font-cute">กำลังแก้ไขเมนู</p>
                                <p className="font-bold text-lg text-stone-800 font-cute truncate">
                                    {activeMenu.name}
                                </p>
                            </div>
                            <ChevronDown className="text-stone-400 group-hover:text-orange-500 shrink-0" />
                        </div>
                     </div>
                 )}
             </div>
        </div>
        
        {/* --- MODALS --- */}
        <MenuSelectorModal 
            isOpen={isMenuModalOpen}
            onClose={() => setIsMenuModalOpen(false)}
            state={state}
            selectedMenuId={selectedMenuId}
            onSelect={setSelectedMenuId}
            onAdd={handleAddMenu}
            onDelete={deleteMenu}
            getMenuStats={getMenuStatsHelper}
        />

        <PantryManagerModal 
            isOpen={showPantryModal}
            onClose={() => setShowPantryModal(false)}
            centralIngredients={state.centralIngredients}
            suppliers={state.suppliers} 
            onAdd={addCentralIngredient}
            onUpdate={updateCentralIngredient}
            onDelete={deleteCentralIngredient}
        />

        <IngredientPickerModal 
            isOpen={showPantryPicker}
            onClose={() => setShowPantryPicker(false)}
            centralIngredients={state.centralIngredients}
            onPick={handlePickFromPantry}
            onOpenPantry={() => { setShowPantryPicker(false); setShowPantryModal(true); }}
        />

        {/* --- MAIN WORKSPACE --- */}
        {activeMenu && stats ? (
            <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-500 pb-10">
                
                {/* 1. Header: Name & Price */}
                <MenuHeader 
                    menu={activeMenu}
                    categories={existingCategories} // Pass dynamic categories here
                    stats={stats}
                    isUploading={isUploading}
                    onUpdate={(field, value) => updateMenu(activeMenu.id, field, value)}
                    onImageUpload={handleMenuImageUpload}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left: Recipe */}
                    <RecipeEditor 
                        menuId={activeMenu.id}
                        ingredients={activeMenu.ingredients}
                        centralIngredients={state.centralIngredients}
                        showHelper={showHelper}
                        setShowHelper={setShowHelper}
                        onUpdateIngredient={updateIngredientInMenu}
                        onRemoveIngredient={removeIngredientFromMenu}
                        onAddIngredient={addIngredientToMenu}
                        onPickFromPantry={() => setShowPantryPicker(true)}
                    />

                    {/* Right: Analysis */}
                    <div className="flex flex-col gap-6">
                        
                        <CostAnalysisCard 
                            stats={stats}
                            sellingPrice={activeMenu.sellingPrice}
                            showDetails={showAnalysisDetails}
                            setShowDetails={setShowAnalysisDetails}
                        />

                        <HiddenCostPanel 
                            values={state.hiddenPercentages}
                            onChange={(field, value) => updateNestedState('hiddenPercentages', field, value)}
                        />

                        <PricingDoctor 
                            realCost={stats.realCost}
                            currentPrice={activeMenu.sellingPrice}
                            onUpdatePrice={(price) => updateMenu(activeMenu.id, 'sellingPrice', price)}
                            priceSuggestions={priceSuggestions}
                        />
                    </div>
                </div>
            </div>
        ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-stone-300 bg-white rounded-[2.5rem] border-2 border-dashed border-stone-200 p-10 min-h-[400px]">
                 <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <ChefHat size={48} className="text-stone-300" />
                 </div>
                 <p className="font-bold text-xl text-stone-400 mb-2 font-cute">ยังไม่ได้เลือกเมนู</p>
                 <p className="text-sm text-stone-300 mb-6 font-cute">เริ่มสร้างสรรค์เมนูใหม่ของคุณได้เลย</p>
                 <button onClick={() => setIsMenuModalOpen(true)} className="bg-orange-400 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-500 transition-all shadow-lg hover:-translate-y-1 flex items-center gap-2 font-cute">
                     <MousePointerClick size={20} /> เลือกเมนูตรงนี้
                 </button>
             </div>
        )}
    </div>
  );
};

export default ProductCost;
