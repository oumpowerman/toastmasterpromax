
import React from 'react';
import { supabase } from '../../lib/supabase';
import { AppState, InventoryItem, IngredientLibraryItem } from '../../types';
import { InventoryService } from '../../services/inventoryService';

export const useInventoryActions = (
    state: AppState,
    setState: React.Dispatch<React.SetStateAction<AppState>>,
    targetId: string | undefined,
    fetchInventoryLayer: (userId: string) => Promise<void>
) => {

    const calculateIngredientCost = (item: Omit<IngredientLibraryItem, 'id' | 'costPerUnit'>) => {
        if (item.type === 'composite') {
            return Math.max(0, item.bulkPrice / Math.max(1, item.totalQuantity));
        } else {
            return item.unitType === 'unit' 
               ? (item.bulkPrice / Math.max(1, item.totalQuantity))
               : (item.bulkPrice / Math.max(1, item.totalQuantity)) * item.usagePerUnit;
        }
    };

    const addCentralIngredient = async (item: Omit<IngredientLibraryItem, 'id' | 'costPerUnit'>) => {
        if (!targetId) return;
        const costPerUnit = calculateIngredientCost(item);
        
        // Prepare payload for Service
        const payload = {
            ...item,
            costPerUnit,
            pack_size: item.totalQuantity // Mapping specifically for DB
        };

        const { data: createdItem } = await InventoryService.addCentralIngredient(targetId, payload);

        if (createdItem) {
            // --- AUTO-LINK LOGIC: Add to Supplier's Catalog ---
            if (item.supplierId) {
                const supplier = state.suppliers.find(s => s.id === item.supplierId);
                if (supplier) {
                    const existingProducts = supplier.products || [];
                    // Check duplicate to be safe
                    if (!existingProducts.some(p => p.id === createdItem.id)) {
                        const newProductEntry = { id: createdItem.id, price: item.bulkPrice };
                        const updatedProducts = [...existingProducts, newProductEntry];

                        // 1. Update Local State (Immediate Feedback)
                        setState(prev => ({
                            ...prev,
                            suppliers: prev.suppliers.map(s => s.id === item.supplierId ? { ...s, products: updatedProducts } : s)
                        }));

                        // 2. Update DB
                        await supabase.from('suppliers').update({ products: updatedProducts }).eq('id', item.supplierId);
                    }
                }
            }
            // ---------------------------------------------------

            fetchInventoryLayer(targetId);
        }
    };

    const updateCentralIngredient = async (id: string, updates: Partial<IngredientLibraryItem>) => {
        if (!targetId) return;
        const payload: any = {};
        
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.bulkPrice !== undefined) payload.bulk_price = updates.bulkPrice;
        if (updates.totalQuantity !== undefined) payload.pack_size = updates.totalQuantity;
        if (updates.image !== undefined) payload.image_url = updates.image;
        if (updates.supplierId !== undefined) payload.supplier_id = updates.supplierId || null;
        if (updates.details !== undefined) payload.details = updates.details;
        if (updates.subCategory !== undefined) payload.sub_category = updates.subCategory;
        if (updates.unit !== undefined) payload.unit = updates.unit;
        
        if (updates.bulkPrice !== undefined || updates.totalQuantity !== undefined) {
            const item = state.centralIngredients.find(i => i.id === id);
            const price = updates.bulkPrice ?? item?.bulkPrice ?? 0;
            const qty = updates.totalQuantity ?? item?.totalQuantity ?? 1;
            payload.cost_per_unit = price / Math.max(1, qty);
        }

        await InventoryService.updateCentralIngredient(id, payload);
        
        // --- AUTO-LINK LOGIC: Link on Update ---
        if (updates.supplierId) {
             const supplier = state.suppliers.find(s => s.id === updates.supplierId);
             if (supplier) {
                 const existingProducts = supplier.products || [];
                 // If not yet in this supplier's list, add it
                 if (!existingProducts.some(p => p.id === id)) {
                     const itemInState = state.centralIngredients.find(i => i.id === id);
                     const priceToUse = updates.bulkPrice ?? itemInState?.bulkPrice ?? 0;

                     const newProductEntry = { id: id, price: priceToUse };
                     const updatedProducts = [...existingProducts, newProductEntry];

                     // 1. Update Local State
                     setState(prev => ({
                         ...prev,
                         suppliers: prev.suppliers.map(s => s.id === updates.supplierId ? { ...s, products: updatedProducts } : s)
                     }));

                     // 2. Update DB
                     await supabase.from('suppliers').update({ products: updatedProducts }).eq('id', updates.supplierId);
                 }
             }
        }
        // ---------------------------------------

        fetchInventoryLayer(targetId);
    };
    
    const deleteCentralIngredient = async (id: string) => {
        if (!targetId) return;
        setState(prev => ({ 
            ...prev, 
            centralIngredients: prev.centralIngredients.filter(i => i.id !== id),
            inventory: prev.inventory.filter(i => i.id !== id)
        }));

        // Handle Legacy Asset (Equipment)
        if (id.startsWith('asset-')) {
            const realId = id.replace('asset-', '');
            await supabase.from('equipment').delete().eq('id', realId);
        } else {
            await InventoryService.deleteCentralIngredient(id);
        }
    };

    // --- NEW OPTIMIZED ACTIONS ---

    const updateSingleItem = async (item: InventoryItem) => {
        if (!targetId) return;
        
        // Optimistic UI Update
        setState(prev => ({
            ...prev,
            inventory: prev.inventory.map(i => i.id === item.id ? item : i)
        }));

        // --- HANDLE LEGACY ASSET (Equipment Table) ---
        if (item.id.startsWith('asset-')) {
            const realId = item.id.replace('asset-', '');
            // Equipment table has limited fields compared to inventory
            await supabase.from('equipment').update({
                name: item.name,
                purchase_price: item.costPerUnit,
                resale_price: item.salvagePrice,
                lifespan_days: item.lifespanDays,
                // Note: 'equipment' table doesn't have status/notes/image cols yet, 
                // so we only update what we can. 
                // If you want full features, delete this asset and re-add as new Asset in inventory.
            }).eq('id', realId);
        } 
        // --- HANDLE STANDARD INVENTORY/ASSET ---
        else {
            await InventoryService.updateInventoryItemMetadata(item.id, item);
        }
        
        fetchInventoryLayer(targetId);
    };

    const addSingleItem = async (item: InventoryItem) => {
        if (!targetId) return;

        // === ASSET AUTO-SPLIT LOGIC ===
        if (item.type === 'asset' && item.quantity > 1) {
            const promises = [];
            for (let i = 0; i < item.quantity; i++) {
                promises.push(
                    InventoryService.createInventoryItem(targetId, {
                        ...item,
                        quantity: 1 // Force 1 per row
                    })
                );
            }
            await Promise.all(promises);
        } else {
            const { data: createdItem } = await InventoryService.createInventoryItem(targetId, item);
            
            // For Stock items, add batch
            if (item.type !== 'asset' && item.quantity > 0 && createdItem) {
                await InventoryService.addBatch(
                    targetId,
                    createdItem.id,
                    item.quantity,
                    item.costPerUnit || 0,
                    item.expiryDate
                );
            }
        }
        
        fetchInventoryLayer(targetId);
    };

    // --- DEPRECATED / BULK UPDATE (Keep for legacy compatibility if needed) ---
    const updateInventory = async (items: InventoryItem[]) => {
        if (!targetId) return;
        
        for (const newItem of items) {
            // 0. Handle Legacy Asset (Equipment Table)
            if (newItem.id.startsWith('asset-')) {
                const realId = newItem.id.replace('asset-', '');
                await supabase.from('equipment').update({
                    name: newItem.name,
                    purchase_price: newItem.costPerUnit,
                    resale_price: newItem.salvagePrice,
                    lifespan_days: newItem.lifespanDays,
                }).eq('id', realId);
                continue;
            }

            // 1. Standard Update
            await InventoryService.updateInventoryItemMetadata(newItem.id, newItem);
        }
        fetchInventoryLayer(targetId);
    };

    const performFifoDeduction = async (inventoryItemId: string, amountToDeduct: number) => {
        await InventoryService.performFifoDeduction(inventoryItemId, amountToDeduct);
    };

    return {
        calculateIngredientCost,
        addCentralIngredient,
        updateCentralIngredient,
        deleteCentralIngredient,
        updateInventory,
        updateSingleItem, // Updated Logic Here
        addSingleItem,
        performFifoDeduction
    };
};
