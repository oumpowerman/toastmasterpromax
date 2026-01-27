
import React, { useState } from 'react';
import { Box, Plus, ScanLine, LayoutGrid, List, Search, ChevronLeft, ChevronRight, Wheat, Package, Monitor, Armchair, ScrollText, AlertTriangle } from 'lucide-react';
import { InventoryItem, LedgerItem, AssetCategory } from '../../types';
import { MentorTip } from '../UI';
import InventoryAIScanner, { ScannedStockItem } from '../modals/InventoryAIScanner';
import { useAlert } from '../AlertSystem';
import { InventoryService } from '../../services/inventoryService'; // Import Service

// New Modular Imports
import { useInventoryLogic } from './inventory/useInventoryLogic';
import InventoryStats from './inventory/InventoryStats';
import InventoryList from './inventory/InventoryList';
import { BatchDetailModal, AdjustStockModal, AddItemModal, LowStockAlertModal, StockHistoryModal, InventoryAuditModal } from './inventory/InventoryModals'; // Add Audit Modal

interface InventoryProps {
  inventory: InventoryItem[];
  updateInventory: (items: InventoryItem[]) => void;
  updateSingleItem: (item: InventoryItem) => void; 
  addSingleItem: (item: InventoryItem) => void; 
  addLedgerItem: (item: Omit<LedgerItem, 'id'>) => void;
  deleteInventoryItem: (id: string) => void;
  // NEW: Dynamic Taxonomy Props
  taxonomy?: AssetCategory[];
  onUpdateTaxonomy?: (newTax: AssetCategory[]) => void;
  activeShopId?: string; // New Prop for Global Logs
  // Mode Prop
  isSimMode?: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ 
    inventory, updateInventory, updateSingleItem, addSingleItem, addLedgerItem, deleteInventoryItem,
    taxonomy, onUpdateTaxonomy, activeShopId, isSimMode = false
}) => {
  const { showConfirm, showAlert } = useAlert();
  
  // Logic Hook
  const { 
      stats, 
      searchTerm, setSearchTerm, 
      viewMode, setViewMode, 
      activeFilter, setActiveFilter,
      categoryFilter, setCategoryFilter,
      currentPage, setCurrentPage, itemsPerPage, totalPages, paginatedItems 
  } = useInventoryLogic(inventory);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false); // New Audit Modal State
  
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  
  // New: History Modal State
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  // Editing State
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // --- HANDLERS ---

  const handleSaveItem = (data: any) => {
    // 1. Calculate Cost Logic
    const calculatedCost = data.type === 'asset' ? data.price : ((data.qty > 0 && data.price > 0) ? data.price / data.qty : 0);
    const calculatedDepreciation = data.type === 'asset' ? (data.price - (data.salvagePrice || 0)) / (data.lifespanDays || 365) : undefined;

    if (editingItem) {
        // --- UPDATE EXISTING (Optimized) ---
        const updatedItem: InventoryItem = {
            ...editingItem,
            name: data.name,
            unit: data.unit,
            minLevel: data.min || 0,
            image: data.image,
            category: data.type === 'asset' ? 'asset' : (data.category || 'ingredient'),
            subCategory: data.subCategory, // Update Sub Category (Taxonomy ID)
            // Asset Specifics
            type: data.type,
            costPerUnit: data.type === 'asset' ? data.price : editingItem.costPerUnit, 
            salvagePrice: data.salvagePrice,
            lifespanDays: data.lifespanDays,
            dailyDepreciation: calculatedDepreciation,
            purchaseDate: data.purchaseDate,
            notes: data.notes, 
            status: data.status, // Fix: Include Status
            assetCode: data.assetCode,
            lastUpdated: new Date().toISOString()
        };
        updateSingleItem(updatedItem);
        setEditingItem(null);
        showAlert('แก้ไขข้อมูลเรียบร้อย', 'success');

    } else {
        // --- ADD NEW (Optimized) ---
        const newItem: InventoryItem = {
            id: Date.now().toString(),
            name: data.name,
            quantity: data.qty,
            unit: data.unit,
            minLevel: data.min || 0,
            costPerUnit: calculatedCost,
            lastUpdated: new Date().toISOString(),
            expiryDate: data.expiry || undefined,
            image: data.image,
            // New Fields
            type: data.type,
            category: data.type === 'asset' ? 'asset' : (data.category || 'ingredient'),
            subCategory: data.subCategory, // Save Sub Category (Taxonomy ID)
            salvagePrice: data.salvagePrice,
            lifespanDays: data.lifespanDays,
            dailyDepreciation: calculatedDepreciation,
            purchaseDate: data.purchaseDate,
            notes: data.notes,
            status: data.status, // Fix: Include Status
            assetCode: data.assetCode
        };
        addSingleItem(newItem);
        showAlert('เพิ่มรายการใหม่เรียบร้อย', 'success');
    }
    setShowAddModal(false);
  };

  const handleEditClick = (item: InventoryItem) => {
      setEditingItem(item);
      setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (await showConfirm('⚠️ คำเตือน: การลบรายการนี้จะทำให้ข้อมูลหายไปจากทั้ง "คลังสินค้า" และ "สูตรอาหาร" ที่ใช้วัตถุดิบนี้\n\nยืนยันการลบ?')) {
      deleteInventoryItem(id);
      await showAlert('ลบรายการเรียบร้อย', 'success');
    }
  };

  const openAdjustModal = (item: InventoryItem, type: 'add' | 'remove') => {
      setAdjustItem(item);
      setAdjustType(type);
  };

  const handleRestockFromAlert = (item: InventoryItem) => {
      setShowLowStockModal(false); 
      openAdjustModal(item, 'add'); 
  };

  const confirmAdjustment = async (data: any) => {
      if (!adjustItem) return;
      const { qty, packSize, totalCost, expiry, ledger, inputMode } = data;
      const totalChange = inputMode === 'pack' ? (qty * packSize) : qty;
      
      let newQuantity = adjustItem.quantity;
      let newCostPerUnit = adjustItem.costPerUnit || 0;
      let newExpiry = expiry;

      if (adjustType === 'add') {
          newQuantity += totalChange;
          if (totalCost > 0) {
              // Weighted Average Cost Logic (Simplified)
              newCostPerUnit = totalChange > 0 ? totalCost / totalChange : 0; 
              
              if (ledger) {
                  addLedgerItem({
                      date: new Date().toISOString().split('T')[0],
                      type: 'expense',
                      title: `ซื้อ${adjustItem.type === 'asset' ? 'อุปกรณ์' : 'วัตถุดิบ'}: ${adjustItem.name}`,
                      amount: totalCost,
                      category: adjustItem.type === 'asset' ? 'equipment' : 'raw_material',
                      note: `Added ${totalChange} ${adjustItem.unit} (Batch Exp: ${expiry || 'None'})`
                  });
              }
          }
      } else {
          newQuantity = Math.max(0, adjustItem.quantity - totalChange);
      }

      // Use updateSingleItem for better performance
      const updatedItem = { 
          ...adjustItem, 
          quantity: newQuantity,
          costPerUnit: newCostPerUnit, 
          expiryDate: newExpiry, 
          lastUpdated: new Date().toISOString() 
      };
      
      updateSingleItem(updatedItem);
      
      // LOGGING
      const { data: { session } } = await import('../../lib/supabase').then(m => m.supabase.auth.getSession());
      if (session?.user?.id) {
          const logType = adjustType === 'add' ? 'in' : 'out';
          const reason = adjustType === 'add' ? 'Restock (Manual)' : 'Adjustment / Waste';
          const change = adjustType === 'add' ? totalChange : -totalChange;
          
          await InventoryService.logStockMovement(
              session.user.id,
              adjustItem.id,
              logType,
              reason,
              change
          );
      }

      setAdjustItem(null);
  };

  const handleSaveScannedItems = async (scannedItems: ScannedStockItem[]) => {
      const selectedItems = scannedItems.filter(i => i.selected);
      if (selectedItems.length === 0) return;

      const newInventory = [...inventory];
      const ledgerEntries: Omit<LedgerItem, 'id'>[] = [];

      selectedItems.forEach(scanned => {
          const existingIndex = newInventory.findIndex(inv => inv.name.toLowerCase() === scanned.name.toLowerCase());
          const costPerUnit = scanned.quantity > 0 ? scanned.totalPrice / scanned.quantity : 0;

          if (existingIndex >= 0) {
              const existing = newInventory[existingIndex];
              const newQty = existing.quantity + scanned.quantity; 
              newInventory[existingIndex] = {
                  ...existing,
                  quantity: newQty,
                  costPerUnit: costPerUnit, 
                  lastUpdated: new Date().toISOString()
              };
          } else {
              newInventory.push({
                  id: Date.now().toString() + Math.random(),
                  name: scanned.name,
                  quantity: scanned.quantity,
                  unit: scanned.unit,
                  minLevel: 5,
                  costPerUnit: costPerUnit,
                  lastUpdated: new Date().toISOString(),
                  type: 'stock',
                  category: 'ingredient'
              });
          }

          ledgerEntries.push({
              date: new Date().toISOString().split('T')[0],
              type: 'expense',
              category: 'raw_material',
              title: `ซื้อ: ${scanned.name}`,
              amount: scanned.totalPrice,
              note: 'Auto-scanned from Inventory'
          });
      });

      updateInventory(newInventory);
      ledgerEntries.forEach(l => addLedgerItem(l));
      setShowScanner(false);
      await showAlert(`บันทึก ${selectedItems.length} รายการเรียบร้อย!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col font-cute pb-10">
       
       {/* SIM MODE WARNING BANNER */}
       {isSimMode && (
           <div className="bg-yellow-100 border-2 border-yellow-300 text-yellow-800 px-6 py-4 rounded-3xl flex items-center gap-4 shadow-sm animate-in slide-in-from-top-2">
               <div className="bg-white p-2 rounded-full shadow-sm"><AlertTriangle size={24} className="text-yellow-600"/></div>
               <div>
                   <p className="font-bold text-lg leading-tight">⚠️ คุณกำลังจัดการสต็อกจริง (Real Inventory)</p>
                   <p className="text-xs font-bold opacity-80 mt-1">
                       การเปลี่ยนแปลงในหน้านี้ **มีผลทันที** ต่อจำนวนของในคลัง แม้จะอยู่ในโหมดจำลอง (Sim) ก็ตาม
                   </p>
               </div>
           </div>
       )}

       {/* HEADER & CONTROLS */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-2xl animate-bounce shadow-sm">
                    <Box className="text-orange-500" size={32} strokeWidth={2.5} />
                </div>
                <div>
                    คลังสินค้าและทรัพย์สิน
                    <p className="text-stone-400 text-sm font-medium mt-0.5">Unified Warehouse & Assets</p>
                </div>
            </h2>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="bg-stone-100 p-1 rounded-xl flex gap-1 border border-stone-200 mr-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-500' : 'text-stone-400 hover:text-stone-600'}`} title="มุมมองการ์ด"><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-500' : 'text-stone-400 hover:text-stone-600'}`} title="มุมมองรายการ"><List size={20} /></button>
            </div>
            
            {/* New Audit Log Button */}
            <button onClick={() => setShowAuditModal(true)} className="bg-white border-2 border-stone-200 text-stone-500 px-4 py-3 rounded-2xl font-bold flex items-center gap-2 hover:border-orange-300 hover:text-orange-500 transition-all shadow-sm hover:-translate-y-1 text-sm"><ScrollText size={18} /> <span className="hidden lg:inline">ประวัติรวม</span></button>
            
            <button onClick={() => setShowScanner(true)} className="bg-purple-500 text-white px-4 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-purple-600 transition-all shadow-lg hover:-translate-y-1 text-sm"><ScanLine size={18} /> <span className="hidden md:inline">AI สแกนของ</span></button>
            <button onClick={() => { setEditingItem(null); setShowAddModal(true); }} className="bg-stone-800 text-white px-4 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-stone-900 transition-all shadow-lg hover:-translate-y-1 text-sm"><Plus size={18} /> <span className="hidden md:inline">เพิ่มสินค้า/อุปกรณ์</span></button>
          </div>
       </div>

       <MentorTip tips={[
           { title: "รวมศูนย์ครบจบที่เดียว 🏢", desc: "หน้านี้รวมทุกอย่างไว้แล้วครับ ทั้งวัตถุดิบ (Stock) และ อุปกรณ์ (Asset) ไม่ต้องสลับหน้าไปมาแล้วนะ!" },
           { title: "แยกประเภทให้ชัดเจน 🏷️", desc: "กดเลือก Tab ด้านล่างเพื่อดูเฉพาะ 'ของสด', 'แพ็คเกจ' หรือ 'อุปกรณ์' ได้เลยครับ จะได้ไม่งง" }
       ]} />

       {/* STATS & FILTER */}
       <InventoryStats 
          stats={stats} 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
          onLowStockClick={() => setShowLowStockModal(true)}
       />

       {/* SEARCH BAR & CATEGORY TABS (UPDATED) */}
       <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex p-1 bg-stone-100 rounded-2xl shrink-0 w-full md:w-auto overflow-x-auto">
              <button 
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${categoryFilter === 'all' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                  <Box size={16}/> ทั้งหมด
              </button>
              <button 
                onClick={() => setCategoryFilter('ingredient')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${categoryFilter === 'ingredient' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                  <Wheat size={16}/> วัตถุดิบ
              </button>
              <button 
                onClick={() => setCategoryFilter('packaging')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${categoryFilter === 'packaging' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                  <Package size={16}/> บรรจุภัณฑ์
              </button>
              <button 
                onClick={() => setCategoryFilter('asset')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${categoryFilter === 'asset' ? 'bg-purple-100 text-purple-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                  <Armchair size={16}/> สินทรัพย์/อุปกรณ์
              </button>
          </div>

          <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input type="text" placeholder="ค้นหาสินค้า หรือ อุปกรณ์..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-2 border-stone-100 outline-none focus:border-orange-300 font-bold text-stone-600 shadow-sm text-lg placeholder-stone-300" />
          </div>
       </div>

       {/* INVENTORY LIST */}
       <InventoryList 
          items={paginatedItems}
          viewMode={viewMode}
          onItemClick={setSelectedItemForDetail}
          onAdjust={openAdjustModal}
          onDelete={handleDelete}
          onEdit={handleEditClick}
          expandedItemId={expandedItemId}
          setExpandedItemId={setExpandedItemId}
          onHistoryClick={setHistoryItem} // Wire up History Click
       />

       {/* PAGINATION CONTROLS */}
       {totalPages > 1 && (
           <div className="flex justify-center items-center gap-4 pt-4">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 className="p-3 rounded-xl bg-white border-2 border-stone-100 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                   <ChevronLeft size={20} />
               </button>
               <span className="font-bold text-stone-600">
                   หน้าที่ {currentPage} จาก {totalPages}
               </span>
               <button 
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={currentPage === totalPages}
                 className="p-3 rounded-xl bg-white border-2 border-stone-100 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                   <ChevronRight size={20} />
               </button>
           </div>
       )}

       {/* MODALS */}
       <BatchDetailModal item={selectedItemForDetail} onClose={() => setSelectedItemForDetail(null)} />
       
       <AdjustStockModal item={adjustItem} type={adjustType} onClose={() => setAdjustItem(null)} onConfirm={confirmAdjustment} />
       
       <AddItemModal 
            isOpen={showAddModal} 
            onClose={() => { setShowAddModal(false); setEditingItem(null); }} 
            onConfirm={handleSaveItem} 
            initialData={editingItem}
            inventory={inventory} 
            taxonomy={taxonomy} 
            onUpdateTaxonomy={onUpdateTaxonomy} 
       />
       
       {/* History Modal (Single Item) */}
       {historyItem && (
           <StockHistoryModal 
               item={historyItem} 
               onClose={() => setHistoryItem(null)} 
           />
       )}

       {/* Global Audit Modal (All Items) */}
       {showAuditModal && activeShopId && (
           <InventoryAuditModal 
               isOpen={showAuditModal}
               onClose={() => setShowAuditModal(false)}
               activeShopId={activeShopId}
               inventory={inventory}
           />
       )}
       
       {showScanner && <InventoryAIScanner onClose={() => setShowScanner(false)} onSave={handleSaveScannedItems} />}
       
       {showLowStockModal && (
           <LowStockAlertModal 
              inventory={inventory} 
              onClose={() => setShowLowStockModal(false)} 
              onRestock={handleRestockFromAlert}
           />
       )}
    </div>
  );
};

export default Inventory;
