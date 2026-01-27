
import { useState, useMemo } from 'react';
import { Supplier, IngredientLibraryItem } from '../../../types';

export const useSupplierLogic = (suppliers: Supplier[], centralIngredients: IngredientLibraryItem[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // States for Filtering & View Mode
    const [filterType, setFilterType] = useState<'all' | 'physical' | 'online'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // --- 1. Filtering Logic ---
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => {
            // Search Filter
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (s.locationName && s.locationName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            // Type Filter
            const matchesType = filterType === 'all' || s.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [suppliers, searchTerm, filterType]);

    // --- 2. Data Enrichment (Helper) ---
    const getSupplierStats = (supplier: Supplier) => {
        const productCount = supplier.products?.length || 0;
        
        // Get Top 3 Products names
        const topProducts = (supplier.products || []).slice(0, 3).map(p => {
            const item = centralIngredients.find(c => c.id === p.id);
            return item ? item.name : 'Unknown Item';
        });

        // Determine Tag Color based on type
        const typeColor = supplier.type === 'online' 
            ? 'bg-blue-50 text-blue-600 border-blue-100' 
            : 'bg-orange-50 text-orange-600 border-orange-100';

        return {
            productCount,
            topProducts,
            typeColor,
            hasMoreProducts: productCount > 3 ? productCount - 3 : 0
        };
    };

    return {
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        viewMode,
        setViewMode,
        filteredSuppliers,
        getSupplierStats
    };
};
