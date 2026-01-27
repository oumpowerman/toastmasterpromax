
import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, IngredientLibraryItem, Supplier, MenuItem } from '../../../types';
import { StockDeductionItem } from './TransactionForm';
import { Home, Zap, Truck, Users, Megaphone, Wrench, FileText, Flame, Coins, Gift } from 'lucide-react';

// Import New Modular Components
import CatalogHeader from './catalog/CatalogHeader';
import CatalogGrid from './catalog/CatalogGrid';
import QuickCreateForm from './catalog/QuickCreateForm';
import BulkCalcOverlay from './catalog/BulkCalcOverlay';

interface CatalogPanelProps {
    inventory: InventoryItem[];
    menuItems: MenuItem[]; // Add Menu Items Prop
    centralIngredients: IngredientLibraryItem[];
    selectedSupplierId: string;
    suppliers?: Supplier[]; 
    onAddItem: (item: StockDeductionItem) => void;
    type: 'income' | 'expense';
}

// --- HARDCODED SERVICES LIST ---
const EXPENSE_SERVICES = [
    { id: 'svc_rent', name: 'ค่าเช่าที่ (Rent)', category: 'rent', icon: Home },
    { id: 'svc_util', name: 'ค่าน้ำ/ไฟ (Utilities)', category: 'utilities', icon: Zap },
    { id: 'svc_fuel', name: 'ค่าแก๊ส (Fuel)', category: 'utilities', icon: Flame },
    { id: 'svc_labor', name: 'ค่าแรง/จ้างเหมา (Labor)', category: 'labor', icon: Users },
    { id: 'svc_transport', name: 'ค่าเดินทาง/ขนส่ง (Transport)', category: 'general', icon: Truck },
    { id: 'svc_mkt', name: 'การตลาด/ยิงแอด (Ads)', category: 'marketing', icon: Megaphone },
    { id: 'svc_maint', name: 'ซ่อมแซม/บำรุงรักษา', category: 'general', icon: Wrench },
    { id: 'svc_tax', name: 'ภาษี/ค่าธรรมเนียม', category: 'general', icon: FileText },
];

const INCOME_SERVICES = [
    { id: 'inc_other', name: 'รายได้อื่นๆ (Other Income)', category: 'other_income', icon: Coins },
    { id: 'inc_tip', name: 'ทิป (Tips)', category: 'other_income', icon: Gift },
];

const CatalogPanel: React.FC<CatalogPanelProps> = ({ 
    inventory, menuItems, centralIngredients, selectedSupplierId, suppliers = [], onAddItem, type 
}) => {
    
    // --- MAIN STATE ---
    const [activeTab, setActiveTab] = useState<'stock' | 'assets' | 'services' | 'new' | 'menu'>('stock');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter State
    const [stockFilter, setStockFilter] = useState<'all' | 'ingredient' | 'packaging'>('all');
    const [menuFilter, setMenuFilter] = useState<string>('all'); // NEW: Menu Category Filter

    // Bulk Mode State (Default to true for Calculator mode)
    const [bulkMode, setBulkMode] = useState(true);
    const [bulkConfigItem, setBulkConfigItem] = useState<InventoryItem | IngredientLibraryItem | null>(null);

    // Initial Tab Selection based on Type
    useEffect(() => {
        if (type === 'income') setActiveTab('menu');
        else setActiveTab('stock');
    }, [type]);

    // NEW: Extract Menu Categories
    const menuCategories = useMemo(() => {
        const cats = new Set(menuItems.map(m => m.category || 'General'));
        return Array.from(cats).sort();
    }, [menuItems]);

    // --- FILTER LOGIC ---
    const filteredItems = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        
        // 1. STOCK TAB (Expense Only)
        if (activeTab === 'stock') {
            let candidates = [...centralIngredients]; 
            
            // Smart Filter: Supplier
            if (type === 'expense' && selectedSupplierId) {
                const currentSupplier = suppliers.find(s => s.id === selectedSupplierId);
                const supplierProductIds = new Set(currentSupplier?.products?.map(p => p.id) || []);

                candidates = candidates.filter(i => {
                    const matchesDirectLink = i.supplierId === selectedSupplierId;
                    const matchesProductList = supplierProductIds.has(i.id);
                    return matchesDirectLink || matchesProductList;
                });
            }

            // Exclude Assets
            candidates = candidates.filter(i => i.category !== 'asset');

            // Apply Sub-filter
            if (stockFilter !== 'all') {
                candidates = candidates.filter(i => (i.category || 'ingredient') === stockFilter);
            }

            if (lowerSearch) {
                candidates = candidates.filter(i => i.name.toLowerCase().includes(lowerSearch));
            }
            
            return candidates;
        } 
        
        // 2. MENU TAB (Income Only)
        if (activeTab === 'menu') {
            let candidates = menuItems;
            
            // Apply Menu Category Filter
            if (menuFilter !== 'all') {
                candidates = candidates.filter(m => (m.category || 'General') === menuFilter);
            }

            return candidates.filter(m => m.name.toLowerCase().includes(lowerSearch));
        }

        // 3. ASSETS TAB (Expense Only)
        if (activeTab === 'assets') {
            return inventory.filter(i => i.type === 'asset' && i.name.toLowerCase().includes(lowerSearch));
        }

        // 4. SERVICES TAB (Both)
        if (activeTab === 'services') {
            const list = type === 'income' ? INCOME_SERVICES : EXPENSE_SERVICES;
            return list.filter(i => i.name.toLowerCase().includes(lowerSearch));
        }

        return [];
    }, [activeTab, stockFilter, menuFilter, searchTerm, selectedSupplierId, centralIngredients, inventory, menuItems, type, suppliers]);


    // --- HANDLERS ---
    const handleItemClick = (sourceItem: any) => {
        
        // Case A: Menu Item (Income)
        if (activeTab === 'menu') {
            const item: StockDeductionItem = {
                id: `menu-${Date.now()}-${Math.random()}`,
                name: sourceItem.name,
                qty: 1,
                type: 'menu',
                refId: sourceItem.id,
                unit: 'ชิ้น',
                costPerUnit: sourceItem.sellingPrice, // Use selling price for income amount
                category: 'sales'
            };
            onAddItem(item);
            return;
        }

        // Case B: Service Item (Expense/Income)
        if (activeTab === 'services') {
            const item: StockDeductionItem = {
                id: `svc-${Date.now()}-${Math.random()}`,
                name: sourceItem.name,
                qty: 1,
                type: 'expense',
                refId: sourceItem.id,
                unit: 'รายการ',
                costPerUnit: 0,
                category: sourceItem.category
            };
            onAddItem(item);
            return;
        }

        // Case C: Bulk Mode Active (Stock Expense)
        if (type === 'expense' && bulkMode && activeTab === 'stock') {
            setBulkConfigItem(sourceItem);
            return;
        }

        // Case D: Direct Add (Stock/Asset Expense)
        const isAsset = activeTab === 'assets';
        let cost = sourceItem.costPerUnit || sourceItem.bulkPrice || 0;

        if (type === 'expense' && selectedSupplierId) {
            const currentSupplier = suppliers.find(s => s.id === selectedSupplierId);
            const supplierProduct = currentSupplier?.products?.find(p => p.id === sourceItem.id);
            if (supplierProduct) {
                cost = supplierProduct.price; 
            }
        }

        const item: StockDeductionItem = {
            id: `cat-${Date.now()}-${Math.random()}`,
            name: sourceItem.name,
            qty: 1,
            type: 'inventory',
            refId: sourceItem.id,
            unit: sourceItem.unit || 'ชิ้น',
            costPerUnit: cost, 
            category: isAsset ? 'asset' : 'ingredient'
        };
        onAddItem(item);
    };

    const handleBulkConfirm = (item: StockDeductionItem) => {
        onAddItem(item);
        setBulkConfigItem(null);
    };

    const handleQuickCreateConfirm = (item: StockDeductionItem) => {
        onAddItem(item);
    };

    // Helper to get default price for Bulk Overlay
    const getBulkDefaultPrice = (item: any) => {
        if (!item) return 0;
        let defaultPrice = 0;
        if (selectedSupplierId) {
            const sup = suppliers.find(s => s.id === selectedSupplierId);
            const prod = sup?.products?.find(p => p.id === item.id);
            if (prod) defaultPrice = prod.price;
        }
        if (!defaultPrice) defaultPrice = (item as IngredientLibraryItem).bulkPrice || 0;
        return defaultPrice;
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50/50 relative min-h-0">
            
            {/* 1. Header Control */}
            <CatalogHeader 
                activeTab={activeTab} setActiveTab={setActiveTab}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                stockFilter={stockFilter} setStockFilter={setStockFilter}
                menuFilter={menuFilter} setMenuFilter={setMenuFilter} menuCategories={menuCategories}
                viewMode={viewMode} setViewMode={setViewMode}
                bulkMode={bulkMode} setBulkMode={setBulkMode}
                type={type} selectedSupplierId={selectedSupplierId}
            />

            {/* 2. Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                {activeTab !== 'new' ? (
                    <CatalogGrid 
                        items={filteredItems}
                        viewMode={viewMode}
                        onItemClick={handleItemClick}
                        bulkMode={bulkMode}
                        type={type}
                        activeTab={activeTab}
                        selectedSupplierId={selectedSupplierId}
                        suppliers={suppliers}
                        onSwitchTab={setActiveTab}
                    />
                ) : (
                    <QuickCreateForm onConfirm={handleQuickCreateConfirm} />
                )}
            </div>

            {/* 3. Bulk Overlay */}
            {bulkConfigItem && (
                <BulkCalcOverlay 
                    item={bulkConfigItem}
                    onClose={() => setBulkConfigItem(null)}
                    onConfirm={handleBulkConfirm}
                    defaultPrice={getBulkDefaultPrice(bulkConfigItem)}
                />
            )}
        </div>
    );
};

export default CatalogPanel;
