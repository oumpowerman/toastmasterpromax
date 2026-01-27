
import React, { useState, useMemo } from 'react';
import { InventoryItem, IngredientLibraryItem, Supplier } from '../../../types';
import { StockDeductionItem } from './TransactionForm';

// Import New Modular Components
import CatalogHeader from './catalog/CatalogHeader';
import CatalogGrid from './catalog/CatalogGrid';
import QuickCreateForm from './catalog/QuickCreateForm';
import BulkCalcOverlay from './catalog/BulkCalcOverlay';

interface CatalogPanelProps {
    inventory: InventoryItem[];
    centralIngredients: IngredientLibraryItem[];
    selectedSupplierId: string;
    suppliers?: Supplier[]; 
    onAddItem: (item: StockDeductionItem) => void;
    type: 'income' | 'expense';
}

const CatalogPanel: React.FC<CatalogPanelProps> = ({ 
    inventory, centralIngredients, selectedSupplierId, suppliers = [], onAddItem, type 
}) => {
    
    // --- MAIN STATE ---
    const [activeTab, setActiveTab] = useState<'stock' | 'assets' | 'new'>('stock');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter State
    const [stockFilter, setStockFilter] = useState<'all' | 'ingredient' | 'packaging'>('all');

    // Bulk Mode State (Default to true for Calculator mode)
    const [bulkMode, setBulkMode] = useState(true);
    const [bulkConfigItem, setBulkConfigItem] = useState<InventoryItem | IngredientLibraryItem | null>(null);

    // --- FILTER LOGIC (Keep here to pass clean data to Grid) ---
    const filteredItems = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        
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
        
        if (activeTab === 'assets') {
            return inventory.filter(i => i.type === 'asset' && i.name.toLowerCase().includes(lowerSearch));
        }

        return [];
    }, [activeTab, stockFilter, searchTerm, selectedSupplierId, centralIngredients, inventory, type, suppliers]);


    // --- HANDLERS ---
    const handleItemClick = (sourceItem: any) => {
        // Case 1: Bulk Mode Active -> Open Overlay
        if (type === 'expense' && bulkMode && activeTab === 'stock') {
            setBulkConfigItem(sourceItem);
            return;
        }

        // Case 2: Normal Direct Add
        const isAsset = activeTab === 'assets';
        let cost = sourceItem.costPerUnit || sourceItem.bulkPrice || 0;

        // Try to find supplier specific price
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
