
import React, { useState, useMemo, useEffect } from 'react';
import { Zap, X } from 'lucide-react';
import { LedgerItem, AppState, MenuItem, InventoryItem } from '../../types';
import { useAlert } from '../AlertSystem';
import { calculateAccountingStats } from '../../utils/calculations';

// Refactored Modular Components
import { useDailyCostEngine } from './accounting/useDailyCost';
import FinancialStats from './accounting/FinancialStats';
import LedgerFeed from './accounting/LedgerFeed';
import TransactionForm, { StockDeductionItem } from './accounting/TransactionForm';
import { AccountingHeader, AccountingDateControl } from './accounting/AccountingViews';

// Legacy/Shared Modals
import MonthlySummaryModal from '../modals/MonthlySummaryModal';
import InventoryAIScanner, { ScannedStockItem } from '../modals/InventoryAIScanner';

interface AccountingProps {
  ledger: LedgerItem[];
  addLedgerItem: (item: Omit<LedgerItem, 'id'>) => void;
  updateLedgerItem: (id: string, updates: Partial<LedgerItem>) => void;
  deleteLedgerItem: (id: string) => void;
  state?: AppState; 
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  updateInventory: (items: InventoryItem[]) => void;
  // NEW: Need addSingleItem to create new inventory items from expenses
  addSingleItem?: (item: InventoryItem) => void; 
  addSupplier?: (data: any) => void; // New Prop
}

const Accounting: React.FC<AccountingProps> = ({ 
    ledger, addLedgerItem, updateLedgerItem, deleteLedgerItem, state,
    menuItems, inventory, updateInventory, addSingleItem, addSupplier
}) => {
  const { showAlert, showConfirm } = useAlert();
  
  const { calculateDailyCosts } = useDailyCostEngine(state || {} as AppState);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState<string | undefined>(undefined);
  const [editingItem, setEditingItem] = useState<LedgerItem | undefined>(undefined);
  
  const [showScanner, setShowScanner] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [viewingSlip, setViewingSlip] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState({
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
      end: new Date().toISOString().split('T')[0] 
  });

  const stats = useMemo(() => {
      return calculateAccountingStats(ledger, dateRange);
  }, [ledger, dateRange]);

  // -- Handlers --

  const setPresetRange = (days: number | 'thisMonth' | 'lastMonth') => {
      const end = new Date();
      const start = new Date();
      if (days === 'thisMonth') {
          start.setDate(1);
      } else if (days === 'lastMonth') {
          start.setMonth(start.getMonth() - 1);
          start.setDate(1);
          end.setDate(0); 
      } else {
          start.setDate(end.getDate() - (days as number));
      }
      setDateRange({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
  };

  const handleEdit = (item: LedgerItem) => {
      setEditingItem(item);
      setShowForm(true);
  };

  const handleImportFixedCosts = async () => {
      if (!state) return;
      if (!(await showConfirm(`ต้องการบันทึกค่าใช้จ่ายประจำวันของ "วันนี้" ใช่ไหม?`))) return;
      
      const today = new Date().toISOString().split('T')[0];
      const { costs } = calculateDailyCosts(today);
      
      let count = 0;
      costs.forEach(cost => {
          addLedgerItem({
              date: today,
              type: 'expense',
              title: cost.title,
              amount: cost.amount,
              category: cost.category,
              note: cost.note
          });
          count++;
      });

      if (count > 0) {
          await showAlert(`บันทึก ${count} รายการเรียบร้อย!`, 'success');
      } else {
          await showAlert("ไม่มีรายการค่าใช้จ่ายคงที่ (ลองตั้งค่าใน Master Setup)", 'info');
      }
  };

  // --- REFACTORED SUBMIT HANDLER ---
  const handleTransactionSubmit = async (itemData: any, stockDeductions: StockDeductionItem[]) => {
      
      // 1. Save Ledger Entry
      if (editingItem) {
          updateLedgerItem(editingItem.id, itemData);
          await showAlert("แก้ไขรายการเรียบร้อย", 'success');
      } else {
          addLedgerItem(itemData);

          // 2. Handle Stock Deductions / Additions
          if (stockDeductions.length > 0) {
                const newInventory = [...inventory];
                let processedCount = 0;

                for (const deduction of stockDeductions) {
                    // Logic: If refId is 'new-item', we CREATE it first
                    if (deduction.refId === 'new-item' && addSingleItem) {
                        const isAsset = deduction.category === 'asset' || (deduction.type === 'inventory' && itemData.category === 'equipment');
                        
                        const newItem: InventoryItem = {
                            id: `auto-gen-${Date.now()}-${Math.random()}`,
                            name: deduction.name,
                            quantity: deduction.qty, // Initial Qty
                            unit: deduction.unit || 'ชิ้น',
                            // Use explicit fields from deduction item if available
                            minLevel: deduction.minLevel ?? (isAsset ? 0 : 5),
                            costPerUnit: deduction.costPerUnit || 0,
                            category: deduction.category || (isAsset ? 'asset' : 'ingredient'),
                            type: isAsset ? 'asset' : 'stock',
                            lastUpdated: new Date().toISOString(),
                            
                            // Asset props from deduction item
                            lifespanDays: isAsset ? (deduction.lifespanDays || 365) : undefined,
                            salvagePrice: isAsset ? (deduction.salvagePrice || 0) : undefined,
                            purchaseDate: itemData.date
                        };
                        addSingleItem(newItem);
                        processedCount++;
                        continue; 
                    }

                    if (deduction.type === 'inventory') {
                        const invIndex = newInventory.findIndex(i => i.id === deduction.refId);
                        
                        if (invIndex >= 0) {
                            if (itemData.type === 'expense' && (itemData.category === 'raw_material' || itemData.category === 'packaging')) {
                                // --- STOCK IN (ADD) ---
                                const currentItem = newInventory[invIndex];
                                const oldQty = currentItem.quantity || 0;
                                const oldCost = currentItem.costPerUnit || 0;
                                const addedQty = deduction.qty;
                                const addedCostPerUnit = deduction.costPerUnit !== undefined ? deduction.costPerUnit : oldCost;

                                // Calculate Weighted Average
                                const newTotalValue = (oldQty * oldCost) + (addedQty * addedCostPerUnit);
                                const newTotalQty = oldQty + addedQty;
                                const newWeightedCost = newTotalQty > 0 ? newTotalValue / newTotalQty : 0;

                                newInventory[invIndex] = {
                                    ...currentItem,
                                    quantity: newTotalQty,
                                    costPerUnit: newWeightedCost,
                                    lastUpdated: new Date().toISOString(),
                                };
                            } else {
                                // --- STOCK OUT (DEDUCT) ---
                                newInventory[invIndex] = {
                                    ...newInventory[invIndex],
                                    quantity: Math.max(0, newInventory[invIndex].quantity - deduction.qty),
                                    lastUpdated: new Date().toISOString()
                                };
                            }
                            processedCount++;
                        }
                    } else if (deduction.type === 'menu') {
                        // Menu Deduct (Existing logic preserved)
                        const menu = menuItems.find(m => m.id === deduction.refId);
                        if (menu) {
                            menu.ingredients.forEach(ing => {
                                const invIndex = newInventory.findIndex(inv => 
                                    (ing.masterId && inv.id === ing.masterId) || 
                                    (inv.name.trim().toLowerCase() === ing.name.trim().toLowerCase())
                                );
                                if (invIndex >= 0) {
                                    const qtyToDeduct = (ing.quantity || 0) * deduction.qty;
                                    newInventory[invIndex] = {
                                        ...newInventory[invIndex],
                                        quantity: Math.max(0, newInventory[invIndex].quantity - qtyToDeduct),
                                        lastUpdated: new Date().toISOString()
                                    };
                                    processedCount++;
                                }
                            });
                        }
                    }
                }

                if (processedCount > 0) {
                    updateInventory(newInventory);
                    await showAlert(`บันทึกและปรับสต็อก ${processedCount} รายการเรียบร้อย!`, 'success');
                } else if (stockDeductions.some(d => d.refId === 'new-item')) {
                     await showAlert("บันทึกบัญชีและเพิ่มสินค้าใหม่เรียบร้อย!", 'success');
                } else {
                    await showAlert("บันทึกบัญชีเรียบร้อย (แต่ไม่พบสินค้าเดิมในระบบให้ตัด)", 'warning');
                }
          } else {
              await showAlert("บันทึกรายการเรียบร้อย", 'success');
          }
      }
      setShowForm(false);
      setEditingItem(undefined);
  };

  const handleSaveScannedItems = async (scannedItems: ScannedStockItem[]) => {
      const selectedItems = scannedItems.filter(i => i.selected);
      if (selectedItems.length === 0) return;

      const newInventory = [...inventory];
      const ledgerEntries: any[] = [];

      selectedItems.forEach(scanned => {
          const existingIndex = newInventory.findIndex(inv => inv.name.toLowerCase() === scanned.name.toLowerCase());
          const costPerUnit = scanned.quantity > 0 ? scanned.totalPrice / scanned.quantity : 0;

          if (existingIndex >= 0) {
              const existing = newInventory[existingIndex];
              const newQty = existing.quantity + scanned.quantity; 
              
              const oldVal = existing.quantity * (existing.costPerUnit || 0);
              const newVal = scanned.totalPrice;
              const newWeightedCost = (oldVal + newVal) / newQty;

              newInventory[existingIndex] = {
                  ...existing,
                  quantity: newQty,
                  costPerUnit: newWeightedCost,
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
                  lastUpdated: new Date().toISOString()
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
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 min-h-full font-cute pb-10">
        
        <AccountingHeader 
            onOpenIncome={() => { setFormType('income'); setFormCategory(undefined); setEditingItem(undefined); setShowForm(true); }}
            onOpenExpense={() => { setFormType('expense'); setFormCategory('raw_material'); setEditingItem(undefined); setShowForm(true); }}
            onOpenScanner={() => setShowScanner(true)}
            onOpenMonthly={() => setShowMonthlyReport(true)}
        />

        <AccountingDateControl dateRange={dateRange} setDateRange={setDateRange} setPresetRange={setPresetRange}>
             {state && (
                <button 
                    onClick={handleImportFixedCosts}
                    className="w-full xl:w-auto group flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 border-2 border-yellow-200 px-5 py-3 rounded-[2rem] font-bold hover:bg-yellow-100 transition-all shadow-sm hover:shadow-md whitespace-nowrap font-cute active:scale-95"
                >
                    <Zap size={18} className="fill-yellow-500 text-yellow-600"/> 
                    <span>ดึงค่าใช้จ่ายคงที่ (Auto)</span>
                </button>
            )}
        </AccountingDateControl>
        
        <FinancialStats stats={stats} />

        <LedgerFeed 
            groupedLedger={stats.sortedGroupedLedger} 
            onDelete={deleteLedgerItem}
            onEdit={handleEdit}
            onViewSlip={setViewingSlip}
        />

        {/* --- MODALS --- */}

        <TransactionForm 
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSubmit={handleTransactionSubmit}
            initialData={editingItem}
            defaultType={formType}
            defaultCategory={formCategory}
            menuItems={menuItems}
            inventory={inventory}
            suppliers={state?.suppliers || []} 
            onAddSupplier={addSupplier} // Pass the function
            centralIngredients={state?.centralIngredients || []} 
        />

        {viewingSlip && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={() => setViewingSlip(null)}>
                <div className="relative max-w-lg w-full">
                    <button className="absolute -top-12 right-0 text-white hover:text-stone-300 p-2"><X size={32}/></button>
                    <img src={viewingSlip} alt="Slip" className="w-full h-auto rounded-lg shadow-2xl border-4 border-stone-800" />
                </div>
            </div>
        )}

        <MonthlySummaryModal 
            isOpen={showMonthlyReport}
            onClose={() => setShowMonthlyReport(false)}
            ledger={ledger}
        />

        {showScanner && (
            <InventoryAIScanner 
                onClose={() => setShowScanner(false)} 
                onSave={handleSaveScannedItems} 
            />
        )}
    </div>
  );
};

export default Accounting;
