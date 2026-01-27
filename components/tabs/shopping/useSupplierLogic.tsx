
import { useState, useMemo } from 'react';
import { Supplier, IngredientLibraryItem } from '../../../types';

export const useSupplierLogic = (suppliers: Supplier[], centralIngredients: IngredientLibraryItem[]) => {
    const [searchTerm, setSearchTerm] = useState('');

    // --- 1. Filtering Logic ---
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    // --- 2. Data Enrichment (Helper) ---
    // Pre-calculate stats for a specific supplier to avoid logic in the UI
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
        filteredSuppliers,
        getSupplierStats
    };
};
