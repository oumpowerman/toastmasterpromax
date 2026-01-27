
import React, { useState, useMemo, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Receipt, Package } from 'lucide-react';
import { LedgerItem, MenuItem, InventoryItem, Supplier, IngredientLibraryItem } from '../../../types';
import BillPanel from './BillPanel';
import CatalogPanel from './CatalogPanel';
import { SupplierEditModal } from '../shopping/ShoppingModals'; // Import Modal

export interface StockDeductionItem {
    id: string;
    name: string;
    qty: number;
    type: 'menu' | 'inventory' | 'expense'; // Added 'expense' type
    refId: string;
    unit?: string;
    costPerUnit?: number;
    isNew?: boolean;
    // Extra Fields for New Items / Assets
    lifespanDays?: number;
    salvagePrice?: number;
    category?: string;
    minLevel?: number; // Added for advanced creation
}

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (itemData: any, stockDeductions: StockDeductionItem[]) => Promise<void>;
    initialData?: LedgerItem;
    defaultType: 'income' | 'expense';
    defaultCategory?: string;
    menuItems: MenuItem[];
    inventory: InventoryItem[];
    suppliers: Supplier[];
    onAddSupplier?: (data: any) => void;
    // Needed for smart filtering
    centralIngredients?: IngredientLibraryItem[]; 
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
    isOpen, onClose, onSubmit, initialData, defaultType, defaultCategory,
    menuItems, inventory, suppliers, onAddSupplier, centralIngredients = []
}) => {
    
    // --- STATE MANAGEMENT (Orchestrator) ---
    const [showSupplierModal, setShowSupplierModal] = useState(false); // New State
    const [mobileTab, setMobileTab] = useState<'bill' | 'catalog'>('catalog'); // Mobile Tab State
    
    // 1. Transaction Meta
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'income' | 'expense'>(defaultType);
    const [title, setTitle] = useState('');
    const [supplierId, setSupplierId] = useState<string>(''); 
    const [paymentChannel, setPaymentChannel] = useState('cash');
    const [category, setCategory] = useState(defaultCategory || (defaultType === 'income' ? 'sales' : 'raw_material'));
    const [slipImage, setSlipImage] = useState<string | null>(null);
    
    // Split Mode State
    const [isSplitMode, setIsSplitMode] = useState(false);

    // 2. Bill Items (The Cart)
    const [billItems, setBillItems] = useState<StockDeductionItem[]>([]);

    // --- INITIALIZATION ---
    useEffect(() => {
        if (initialData) {
            setDate(initialData.date);
            setType(initialData.type);
            setTitle(initialData.title);
            setCategory(initialData.category);
            setPaymentChannel(initialData.channel || 'cash');
            setSlipImage(initialData.slipImage || null);
            setIsSplitMode(false); // Default to simple editing
            
            // Load Items if available
            if (initialData.items && Array.isArray(initialData.items)) {
                setBillItems(initialData.items);
            } else {
                setBillItems([]);
            }
        } else {
            // Reset for New Entry
            setBillItems([]);
            setTitle('');
            setSupplierId('');
            setSlipImage(null);
            setDate(new Date().toISOString().split('T')[0]);
            setMobileTab('catalog'); // Reset tab to catalog on open
            setIsSplitMode(false);
            
            // FIX: Force reset type and category based on props when opening new form
            setType(defaultType);
            setCategory(defaultCategory || (defaultType === 'income' ? 'sales' : 'raw_material'));
        }
    }, [initialData, isOpen, defaultType, defaultCategory]);

    // --- LOGIC HANDLERS ---

    const handleAddItem = (item: StockDeductionItem) => {
        setBillItems(prev => {
            // If item exists (same refId and unit cost), just increment qty
            // Exception: Expense items usually don't merge quantity in the same way if price differs, but for simplicity we merge if same cost
            const exists = prev.findIndex(p => p.refId === item.refId && p.costPerUnit === item.costPerUnit);
            if (exists >= 0) {
                const newItems = [...prev];
                newItems[exists].qty += item.qty;
                return newItems;
            }
            // Ensure category is set for split mode
            if (!item.category) item.category = 'general';
            return [...prev, item];
        });

        // Auto-set title if empty
        if (!title && billItems.length === 0) {
            setTitle(item.type === 'expense' ? `จ่าย: ${item.name}` : `รับ: ${item.name}`);
        }
    };

    const handleUpdateItem = (id: string, updates: Partial<StockDeductionItem>) => {
        setBillItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const handleRemoveItem = (id: string) => {
        setBillItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSupplierChange = (id: string) => {
        setSupplierId(id);
        const sup = suppliers.find(s => s.id === id);
        if (sup) {
            setTitle(`ซื้อของจาก: ${sup.name}`);
        }
    };

    const handleNewSupplierSaved = (data: any) => {
        if (onAddSupplier) {
            onAddSupplier(data);
        }
        setShowSupplierModal(false);
    };

    const handleAIResult = (scannedItems: any[]) => {
        const newItems: StockDeductionItem[] = scannedItems.map(sc => ({
            id: `scan-${Date.now()}-${Math.random()}`,
            name: sc.name,
            qty: sc.quantity || 1,
            unit: sc.unit || 'ชิ้น',
            costPerUnit: (sc.totalPrice || 0) / (sc.quantity || 1),
            type: 'inventory',
            refId: 'new-item',
            isNew: true,
            category: 'general' // Default category
        }));
        
        setBillItems(prev => [...prev, ...newItems]);
        if (scannedItems.length > 0) {
            setTitle('บิล: ' + scannedItems.map(i => i.name).slice(0, 2).join(', '));
        }
    };

    const handleSubmit = async () => {
        // --- INTELLIGENT GROUPING (Auto-Split) ---
        // 1. Group items by category
        const groups: Record<string, StockDeductionItem[]> = {};
        
        billItems.forEach(item => {
            // If explicit split mode is OFF, and user selected a main category, we might force it?
            // BUT, the new design Philosophy is "Item dictates Category".
            // So we default to item.category. If missing, fall back to form category.
            const cat = item.category || category || 'general';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });

        // 2. Create Payloads
        const payloads: any[] = [];
        const stockItems: StockDeductionItem[] = [];

        Object.entries(groups).forEach(([cat, items]) => {
            const groupTotal = items.reduce((sum, item) => sum + ((item.costPerUnit || 0) * item.qty), 0);
            
            // Build a title for this group
            let groupTitle = title;
            // If multiple groups exist, append category to title to distinguish
            if (Object.keys(groups).length > 1) {
                // If the user typed a generic title like "Shopping", append " (Raw Material)"
                // If title is empty, generate from items e.g. "Pork, Egg"
                const itemNames = items.map(i => i.name).join(', ');
                groupTitle = `${title || (type === 'income' ? 'รายรับ' : 'รายจ่าย')} (${cat})`; 
                if (!title) groupTitle = itemNames.length > 30 ? itemNames.substring(0, 30) + '...' : itemNames;
            } else {
                // Single group, use user title or default
                if (!groupTitle) {
                     const itemNames = items.map(i => i.name).join(', ');
                     groupTitle = itemNames.length > 30 ? itemNames.substring(0, 30) + '...' : itemNames;
                }
            }

            payloads.push({
                date,
                type,
                title: groupTitle,
                amount: groupTotal,
                category: cat,
                channel: paymentChannel,
                slipImage,
                // Pass items list for persistence
                items: items,
                assetData: undefined 
            });

            // Collect items that need stock processing
            // Items with type='expense' (Services) are SKIPPED for stock deduction/addition
            items.forEach(i => {
                // Logic: If income, we allow 'menu' type to perform recipe deduction
                if (i.type === 'inventory' || i.type === 'menu') {
                    stockItems.push(i);
                }
                // If it's a new asset (type='inventory' but category='asset'), it's already in stockItems
                // If it's 'expense' (Rent, Water), we don't push to stockItems
            });
        });

        // 3. Submit
        // We pass the array of payloads (for split ledger) and the filtered stock items
        await onSubmit(payloads, stockItems); 
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="bg-white w-full h-[100dvh] md:h-[90vh] md:w-full md:max-w-7xl md:rounded-[2.5rem] p-0 relative z-10 animate-in zoom-in-95 md:max-h-[90vh] overflow-hidden flex flex-col md:border-4 md:border-white shadow-2xl">
                
                {/* HEADER */}
                <div className={`px-4 md:px-8 py-4 flex justify-between items-center shrink-0 ${type === 'income' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    <div>
                        <h3 className={`text-xl md:text-3xl font-black font-cute flex items-center gap-2 ${type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {type === 'income' ? <ArrowUpRight className="stroke-[3px]" size={24}/> : <ArrowDownLeft className="stroke-[3px]" size={24}/>}
                            {initialData ? 'แก้ไขรายการ' : (type === 'income' ? 'รับเงินเข้า' : 'บันทึกรายจ่าย')}
                        </h3>
                        <p className="text-stone-400 text-xs md:text-sm font-bold ml-8 md:ml-10">
                            {type === 'income' ? 'เลือกเมนูที่ขาย (ตัดสต็อกอัตโนมัติ)' : 'เลือกสินค้า/บริการลงตะกร้า'}
                        </p>
                    </div>
                    <button onClick={onClose} className="bg-white rounded-full p-2 hover:bg-stone-100 text-stone-400 transition-colors shadow-sm"><X size={20}/></button>
                </div>

                {/* MOBILE TABS */}
                <div className="md:hidden flex p-2 gap-2 bg-white border-b border-stone-100 shrink-0">
                    <button 
                        onClick={() => setMobileTab('catalog')} 
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${mobileTab === 'catalog' ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-50 text-stone-400'}`}
                    >
                        <Package size={16}/> เลือกรายการ
                    </button>
                    <button 
                        onClick={() => setMobileTab('bill')} 
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${mobileTab === 'bill' ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-50 text-stone-400'}`}
                    >
                        <Receipt size={16}/> บิล ({billItems.length})
                    </button>
                </div>

                {/* SPLIT SCREEN CONTENT */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-stone-50 relative min-h-0">
                    
                    {/* LEFT: BILL PANEL (Form & Cart) */}
                    <div className={`md:w-[45%] flex flex-col h-full border-r border-stone-200 min-h-0 ${mobileTab === 'bill' ? 'flex w-full' : 'hidden md:flex'}`}>
                        <BillPanel 
                            date={date} setDate={setDate}
                            title={title} setTitle={setTitle}
                            paymentChannel={paymentChannel} setPaymentChannel={setPaymentChannel}
                            supplierId={supplierId} setSupplierId={handleSupplierChange}
                            category={category} setCategory={setCategory}
                            slipImage={slipImage} setSlipImage={setSlipImage}
                            billItems={billItems}
                            onUpdateItem={handleUpdateItem}
                            onRemoveItem={handleRemoveItem}
                            suppliers={suppliers}
                            onAddSupplier={onAddSupplier}
                            onOpenAddSupplier={() => setShowSupplierModal(true)} 
                            onAIResult={handleAIResult}
                            onSubmit={handleSubmit}
                            type={type}
                            isSplitMode={isSplitMode} // Keep for manual override if needed
                            setIsSplitMode={setIsSplitMode} 
                        />
                    </div>

                    {/* RIGHT: CATALOG PANEL (Picker) */}
                    <div className={`flex-1 flex flex-col h-full overflow-hidden min-h-0 ${mobileTab === 'catalog' ? 'flex w-full' : 'hidden md:flex'}`}>
                        <CatalogPanel 
                            inventory={inventory}
                            menuItems={menuItems} // PASS MENU ITEMS HERE
                            centralIngredients={centralIngredients}
                            selectedSupplierId={supplierId}
                            suppliers={suppliers} 
                            onAddItem={(item) => {
                                handleAddItem(item);
                            }}
                            type={type}
                        />
                    </div>

                </div>
            </div>

            {/* SUPPLIER MODAL OVERLAY */}
            {showSupplierModal && (
                <div style={{ zIndex: 100, position: 'relative' }}>
                    <SupplierEditModal 
                        supplier={null} 
                        centralIngredients={centralIngredients}
                        onClose={() => setShowSupplierModal(false)}
                        onSave={handleNewSupplierSaved}
                        onDelete={() => {}} 
                    />
                </div>
            )}
        </div>
    );
};

export default TransactionForm;