
import { useState, useMemo } from 'react';
import { InventoryItem } from '../../../types';

export const useInventoryLogic = (inventory: InventoryItem[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // 'all' = Show everything (Default)
  // 'low_stock' = Show only items below minLevel
  // 'value' = Show all but sort by total value desc
  const [activeFilter, setActiveFilter] = useState<'all' | 'low_stock' | 'value'>('all');
  
  // New: Category Filter
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'ingredient' | 'packaging' | 'asset'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(i => i.quantity <= i.minLevel && i.type !== 'asset').length;
    
    const totalValue = inventory.reduce((sum, i) => {
        if (i.batches && i.batches.length > 0) {
            return sum + i.batches.reduce((bSum, b) => bSum + (b.quantity * b.costPerUnit), 0);
        }
        return sum + (i.quantity * (i.costPerUnit || 0));
    }, 0);
    
    return { totalItems, lowStockItems, totalValue };
  }, [inventory]);

  // --- PROCESSING: FILTERING -> GROUPING -> SORTING ---
  const processedItems = useMemo(() => {
      // 1. First Filter by Search & Category
      let filtered = inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (categoryFilter !== 'all') {
          filtered = filtered.filter((i: InventoryItem) => {
              const cat = i.category || 'ingredient'; 
              return cat === categoryFilter;
          });
      }

      if (activeFilter === 'low_stock') {
          filtered = filtered.filter(i => i.quantity <= i.minLevel);
      }

      // 2. Grouping Logic (Hybrid Asset Tracking)
      const groupedResult: InventoryItem[] = [];
      const assetGroups: Record<string, InventoryItem> = {};

      filtered.forEach(item => {
          if (item.type === 'asset') {
              // Standardize key (Name)
              const key = item.name.trim();
              
              if (!assetGroups[key]) {
                  // Create a virtual "Group Leader" based on the first item found
                  assetGroups[key] = {
                      ...item,
                      id: `group-${key}`, // Virtual ID
                      isGroup: true,
                      quantity: 0,
                      costPerUnit: 0, // Will hold Total Value
                      linkedAssets: [],
                      dailyDepreciation: 0 
                  };
              }
              
              const group = assetGroups[key];
              group.linkedAssets?.push(item);
              group.quantity += item.quantity; // Sum quantity from actual item
              group.costPerUnit = (group.costPerUnit || 0) + ((item.costPerUnit || 0) * item.quantity); // Accumulate Total Value based on qty
              group.dailyDepreciation = (group.dailyDepreciation || 0) + ((item.dailyDepreciation || 0) * item.quantity); // Accumulate Depreciation based on qty
          } else {
              // Stock items pass through directly
              groupedResult.push(item);
          }
      });

      // Add groups to result
      Object.values(assetGroups).forEach(group => groupedResult.push(group));

      // 3. Sorting
      if (activeFilter === 'value') {
          // Sort by Total Value High -> Low
          groupedResult.sort((a, b) => {
              // For stock: value = qty * cost
              // For asset group: value = costPerUnit (we stored total value there)
              const valA = a.isGroup ? (a.costPerUnit || 0) : (a.quantity * (a.costPerUnit || 0));
              const valB = b.isGroup ? (b.costPerUnit || 0) : (b.quantity * (b.costPerUnit || 0));
              return valB - valA;
          });
      } else {
          // Default Sort: Expiry & Low Stock (FIFO Aware)
          const getDaysUntilExpiry = (dateStr?: string) => {
              if (!dateStr) return 999;
              const diffTime = new Date(dateStr).getTime() - new Date().getTime();
              return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          };

          groupedResult.sort((a, b) => {
              // Assets last in default view, or sort by name
              if (a.type === 'asset' && b.type !== 'asset') return 1;
              if (b.type === 'asset' && a.type !== 'asset') return -1;

              const aExp = a.expiryDate ? getDaysUntilExpiry(a.expiryDate) : 999;
              const bExp = b.expiryDate ? getDaysUntilExpiry(b.expiryDate) : 999;
              
              if (aExp < 7 && bExp >= 7) return -1;
              if (bExp < 7 && aExp >= 7) return 1;
              if (aExp < 7 && bExp < 7) return aExp - bExp;

              const aIsLow = a.quantity <= a.minLevel ? 1 : 0;
              const bIsLow = b.quantity <= b.minLevel ? 1 : 0;
              return bIsLow - aIsLow;
          });
      }

      return groupedResult;
  }, [inventory, searchTerm, activeFilter, categoryFilter]);

  // --- PAGINATION ---
  const paginatedItems = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return processedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [processedItems, currentPage]);

  const totalPages = Math.ceil(processedItems.length / itemsPerPage);

  const handleFilterChange = (filter: 'all' | 'low_stock' | 'value') => {
      setActiveFilter(filter);
      setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleSearchChange = (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
  };

  return {
      stats,
      searchTerm,
      setSearchTerm: handleSearchChange,
      viewMode,
      setViewMode,
      activeFilter,
      setActiveFilter: handleFilterChange,
      categoryFilter,
      setCategoryFilter,
      currentPage,
      setCurrentPage,
      itemsPerPage,
      processedItems, // All filtered items (for count)
      paginatedItems, // Only current page
      totalPages
  };
};
