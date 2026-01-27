
import React, { useState, useRef } from 'react';
import { ShoppingCart, BrainCircuit, Plus, Map, Zap, Navigation, AlertTriangle, Store, ChevronDown, ChevronUp, Info, Compass, ArrowRight, LayoutGrid } from 'lucide-react';
import { AppState, Supplier, InventoryItem, RouteGroup, PurchaseOption, CartItemState } from '../../types';
import { useAlert } from '../AlertSystem';
import { CuteButton } from '../UI';

// Imported Modular Components
import { useShoppingLogic } from './shopping/useShoppingLogic';
import { DecisionInsightModal, SupplierEditModal } from './shopping/ShoppingModals';
import { ShoppingModeView, PlanningView } from './shopping/ShoppingViews';
import { SupplierDirectoryView } from './shopping/SupplierDirectoryView';

interface ShoppingRouteProps {
  state: AppState;
  updateNestedState: (category: keyof AppState, field: string, value: any) => void;
  addSupplier: (data: any) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  removeSupplier: (id: string) => void;
  updateInventory: (items: InventoryItem[]) => void;
  addLedgerItem: (item: any) => void;
  updateCentralIngredient: (id: string, updates: any) => void; 
}

const ShoppingRoute: React.FC<ShoppingRouteProps> = ({ 
    state, updateNestedState, addSupplier, updateSupplier, removeSupplier, 
    updateInventory, addLedgerItem, updateCentralIngredient 
}) => {
    const { showConfirm, showAlert } = useAlert();
    
    // Manual Override State
    const [forcedSuppliers, setForcedSuppliers] = useState<Record<string, string>>({});

    const { routeGroups, unassigned, allItems } = useShoppingLogic(state, forcedSuppliers);
    
    // View Modes
    const [viewMode, setViewMode] = useState<'directory' | 'planning' | 'shopping'>('directory');
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set()); 
    
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isAddingSupplier, setIsAddingSupplier] = useState(false);
    const [showGuide, setShowGuide] = useState(false); 
    
    // Detail Modal State
    const [viewingDetailOption, setViewingDetailOption] = useState<PurchaseOption | null>(null);

    // Drag & Drop Refs
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // --- CALCULATIONS ---
    const totalToBuy = allItems.reduce((acc, i) => acc + i.toBuy, 0);
    const groupValues = Object.values(routeGroups) as RouteGroup[];
    const totalEstCost = groupValues.reduce((acc, g) => acc + g.totalCost, 0);
    const totalStops = groupValues.filter(g => g.items.length > 0).length;
    const urgentCount = allItems.filter(i => i.isUrgent).length;

    // --- ACTIONS ---
    const handleFinishShopping = async (cartData: CartItemState[]) => {
        if (cartData.length === 0) { setViewMode('directory'); return; }
        
        const totalActualCost = cartData.reduce((sum, item) => sum + item.actualPrice, 0);
        const boughtItemsCount = cartData.length;

        if (await showConfirm(`ยืนยันการซื้อ ${boughtItemsCount} รายการ รวมจ่ายจริง ฿${totalActualCost.toLocaleString()}?`)) {
            const newInventory = [...state.inventory];
            const today = new Date().toISOString().split('T')[0];

            cartData.forEach(({ itemId, actualQty, actualPrice, syncStandardPrice }) => {
                const idx = newInventory.findIndex(i => i.id === itemId);
                if (idx >= 0) {
                    const item = newInventory[idx];
                    newInventory[idx] = {
                        ...item,
                        quantity: item.quantity + actualQty,
                        lastUpdated: new Date().toISOString()
                    };

                    // --- FEEDBACK LOOP LOGIC ---
                    if (syncStandardPrice) {
                        const libItem = state.centralIngredients.find(l => l.name === item.name);
                        if (libItem) {
                            updateCentralIngredient(libItem.id, { bulkPrice: actualPrice });
                        }
                    }
                }
            });

            updateInventory(newInventory);
            addLedgerItem({
                date: today,
                type: 'expense',
                category: 'raw_material',
                title: 'จ่ายตลาด (Smart Shop)',
                amount: totalActualCost,
                note: `Bought ${boughtItemsCount} items. (System Est: ฿${totalEstCost.toFixed(0)})`
            });

            await showAlert("บันทึกสต็อก บัญชี และอัปเดตราคาตลาดเรียบร้อย!", "success");
            setViewMode('directory');
            setCheckedItems(new Set());
        }
    };

    const handleDragStart = (index: number) => { dragItem.current = index; };
    const handleDragEnter = (index: number) => { dragOverItem.current = index; };
    const handleDragEnd = () => {
        const draggedIdx = dragItem.current;
        const overIdx = dragOverItem.current;
        if (draggedIdx !== null && overIdx !== null && draggedIdx !== overIdx) {
            const newSuppliers = [...state.suppliers];
            const draggedItem = newSuppliers[draggedIdx];
            newSuppliers.splice(draggedIdx, 1);
            newSuppliers.splice(overIdx, 0, draggedItem);
            updateNestedState('suppliers', '', newSuppliers);
        }
        dragItem.current = null; dragOverItem.current = null;
    };

    const handleForceSupplier = (itemId: string, supplierId: string) => {
        setForcedSuppliers(prev => ({ ...prev, [itemId]: supplierId }));
        setViewingDetailOption(null); 
        showAlert("ปรับเปลี่ยนแผนเรียบร้อย! (Recalculating...)", "success");
    };

    // --- VIEW SWITCHING ---

    if (viewMode === 'shopping') {
        return (
            <ShoppingModeView 
                state={state}
                routeGroups={routeGroups}
                handleFinishShopping={handleFinishShopping}
            />
        );
    }

    if (viewMode === 'directory') {
        return (
            <>
                <SupplierDirectoryView 
                    suppliers={state.suppliers}
                    centralIngredients={state.centralIngredients}
                    onAddSupplier={() => { setEditingSupplier(null); setIsAddingSupplier(true); }}
                    onEditSupplier={setEditingSupplier}
                    onDeleteSupplier={removeSupplier}
                    onGoToPlanning={() => setViewMode('planning')}
                    totalToBuy={totalToBuy}
                />
                {(isAddingSupplier || editingSupplier) && (
                    <SupplierEditModal 
                        supplier={editingSupplier} 
                        centralIngredients={state.centralIngredients}
                        onClose={() => { setEditingSupplier(null); setIsAddingSupplier(false); }}
                        onSave={(data) => {
                            if (editingSupplier) updateSupplier(editingSupplier.id, data);
                            else addSupplier(data);
                            setEditingSupplier(null); setIsAddingSupplier(false);
                        }}
                        onDelete={(id) => { removeSupplier(id); setEditingSupplier(null); }}
                    />
                )}
            </>
        );
    }

    // Default: Planning Mode
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 font-cute pb-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <button 
                        onClick={() => setViewMode('directory')}
                        className="text-sm font-bold text-stone-400 hover:text-stone-600 mb-2 flex items-center gap-1"
                    >
                        <LayoutGrid size={16}/> กลับไปหน้ารวมร้านค้า
                    </button>
                    <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
                        <BrainCircuit className="text-blue-500" size={32} />
                        Smart Route (Planning)
                    </h2>
                    <p className="text-stone-400 text-sm mt-1">ระบบวิเคราะห์เส้นทางและเปรียบเทียบราคา</p>
                </div>
                
                <div className="flex flex-wrap gap-3 items-center">
                    <CuteButton 
                        label="เริ่มเดินตลาด!" 
                        icon={ShoppingCart} 
                        theme="green" 
                        onClick={() => setViewMode('shopping')} 
                        disabled={allItems.length === 0}
                        className="shadow-[0_4px_0_#059669] active:shadow-none active:translate-y-[4px] py-4 px-8 text-lg"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden group ${showGuide ? 'bg-blue-50 border-blue-200' : 'bg-white border-stone-100 hover:border-blue-200'}`} onClick={() => setShowGuide(!showGuide)}>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                                <Info size={20} strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-700">AI Smart Plan</h4>
                                <p className="text-[10px] text-stone-400">คลิกเพื่อดูวิธีทำงาน</p>
                            </div>
                        </div>
                        {showGuide ? <ChevronUp className="text-blue-400"/> : <ChevronDown className="text-stone-300"/>}
                    </div>
                    {showGuide && (
                        <div className="mt-4 pt-4 border-t border-blue-100 text-xs text-stone-600 space-y-2 animate-in slide-in-from-top-2">
                            <p className="flex items-center gap-2"><span className="bg-white px-2 py-0.5 rounded border border-blue-100 font-bold">1</span> ระบบดึงของที่ "ต้องซื้อ" จากสต็อก</p>
                            <p className="flex items-center gap-2"><span className="bg-white px-2 py-0.5 rounded border border-blue-100 font-bold">2</span> เปรียบเทียบราคา & ค่าเดินทางให้อัตโนมัติ</p>
                            <p className="flex items-center gap-2"><span className="bg-white px-2 py-0.5 rounded border border-blue-100 font-bold">3</span> คุณกดสลับร้านได้เองถ้าไม่ถูกใจ</p>
                        </div>
                    )}
                </div>

                <div className={`p-5 rounded-[2rem] border-2 flex items-center gap-4 ${urgentCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${urgentCount > 0 ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-green-100 text-green-500'}`}>
                        <AlertTriangle size={24} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <p className={`font-bold text-lg ${urgentCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {urgentCount > 0 ? `${urgentCount} รายการด่วน!` : 'สถานะปกติ'}
                        </p>
                        <p className="text-xs text-stone-500 font-bold opacity-70">
                            {urgentCount > 0 ? 'ของจะหมดใน < 2 วัน' : 'สต็อกเพียงพอ'}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-[2rem] border-2 border-stone-100 bg-white flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center shadow-sm">
                        <Navigation size={24} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-stone-700">{totalStops}</span>
                            <span className="text-xs font-bold text-stone-400">/ {state.suppliers.length} ร้าน</span>
                        </div>
                        <p className="text-xs text-stone-500 font-bold opacity-70">จุดที่ต้องแวะซื้อจริง</p>
                    </div>
                </div>
            </div>

            <PlanningView 
                state={state}
                routeGroups={routeGroups}
                allItems={allItems}
                unassigned={unassigned}
                totalToBuy={totalToBuy}
                totalEstCost={totalEstCost}
                totalStops={totalStops}
                onStartShopping={() => setViewMode('shopping')}
                onEditSupplier={setEditingSupplier}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
                setViewingDetailOption={setViewingDetailOption}
            />

            {viewingDetailOption && (
                <DecisionInsightModal 
                    option={viewingDetailOption}
                    onClose={() => setViewingDetailOption(null)}
                    state={state}
                    onSelectSupplier={handleForceSupplier}
                />
            )}
        </div>
    );
};

export default ShoppingRoute;
