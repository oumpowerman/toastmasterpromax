
import { supabase } from '../lib/supabase';
import { IngredientLibraryItem, InventoryItem, InventoryLog } from '../types';

export const InventoryService = {
  
  // --- Central Ingredients / Library ---

  async addCentralIngredient(userId: string, item: any) {
    return await supabase.from('inventory_items').insert({
        user_id: userId,
        name: item.name,
        category: item.category || 'ingredient',
        sub_category: item.subCategory || 'general',
        image_url: item.image,
        quantity: 0,
        unit: item.unit || (item.unitType === 'unit' ? 'ชิ้น' : 'กรัม'),
        cost_per_unit: item.costPerUnit,
        bulk_price: item.bulkPrice,
        pack_size: item.pack_size, 
        details: item.details,
        supplier_id: item.supplierId || null
    }).select().single();
  },

  async updateCentralIngredient(id: string, payload: any) {
    return await supabase.from('inventory_items').update(payload).eq('id', id);
  },

  async deleteCentralIngredient(id: string) {
    return await supabase.from('inventory_items').delete().eq('id', id);
  },

  // --- Inventory Items & Batches ---

  async createInventoryItem(userId: string, newItem: InventoryItem) {
    return await supabase.from('inventory_items').insert({
       user_id: userId,
       name: newItem.name,
       quantity: newItem.quantity, // Batches handle this
       unit: newItem.unit,
       min_level: newItem.minLevel,
       cost_per_unit: newItem.costPerUnit,
       category: newItem.category || 'ingredient', // Can be 'asset'
       sub_category: newItem.subCategory || 'general',
       image_url: newItem.image || null,
       
       // Asset Fields
       details: newItem.notes, // Map notes -> details
       purchase_date: newItem.purchaseDate || null,
       lifespan_days: newItem.lifespanDays || null,
       salvage_price: newItem.salvagePrice || 0,
       item_status: newItem.status || 'active', // Map Status
       asset_code: newItem.assetCode // NEW: Asset Code on creation
   }).select().single();
  },

  // NEW: Update Item Metadata (Name, Asset Info, etc.)
  async updateInventoryItemMetadata(id: string, updates: Partial<InventoryItem>) {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.minLevel !== undefined) payload.min_level = updates.minLevel;
      if (updates.costPerUnit !== undefined) payload.cost_per_unit = updates.costPerUnit;
      if (updates.image !== undefined) payload.image_url = updates.image;
      
      // Asset Fields
      if (updates.notes !== undefined) payload.details = updates.notes;
      if (updates.purchaseDate !== undefined) payload.purchase_date = updates.purchaseDate;
      if (updates.lifespanDays !== undefined) payload.lifespan_days = updates.lifespanDays;
      if (updates.salvagePrice !== undefined) payload.salvage_price = updates.salvagePrice;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.status !== undefined) payload.item_status = updates.status; 
      
      // FIX: Add missing mappings
      if (updates.subCategory !== undefined) payload.sub_category = updates.subCategory;
      if (updates.assetCode !== undefined) payload.asset_code = updates.assetCode;
      
      // CRITICAL FIXES FOR EDITING
      if (updates.unit !== undefined) payload.unit = updates.unit;
      if (updates.quantity !== undefined) payload.quantity = updates.quantity;

      return await supabase.from('inventory_items').update(payload).eq('id', id);
  },

  async addBatch(userId: string, itemId: string, quantity: number, costPerUnit: number, expiryDate?: string) {
    return await supabase.from('inventory_batches').insert({
        inventory_item_id: itemId,
        user_id: userId,
        quantity: quantity,
        original_quantity: quantity,
        cost_per_unit: costPerUnit,
        expiry_date: expiryDate || null
    });
  },

  async updateItemLevelAndTimestamp(itemId: string, minLevel: number) {
    return await supabase.from('inventory_items').update({
        min_level: minLevel,
        updated_at: new Date()
    }).eq('id', itemId);
  },

  // --- FIFO Logic ---
  
  async performFifoDeduction(inventoryItemId: string, amountToDeduct: number) {
    const { data: batches } = await supabase
        .from('inventory_batches')
        .select('*')
        .eq('inventory_item_id', inventoryItemId)
        .gt('quantity', 0)
        .order('expiry_date', { ascending: true, nullsFirst: false });

    if (!batches) return;

    let remaining = amountToDeduct;

    for (const batch of batches) {
        if (remaining <= 0) break;

        const deduct = Math.min(batch.quantity, remaining);
        const newQty = batch.quantity - deduct;

        if (newQty <= 0) {
            await supabase.from('inventory_batches').delete().eq('id', batch.id);
        } else {
            await supabase.from('inventory_batches').update({ quantity: newQty }).eq('id', batch.id);
        }
        remaining -= deduct;
    }
  },

  // --- LOGGING SYSTEM (NEW) ---

  async logStockMovement(userId: string, itemId: string, type: 'in' | 'out' | 'audit', reason: string, quantityChange: number, refId?: string) {
      // Fetch current quantity to store snapshot (optional but good for audit)
      // Note: We skip fetching precise quantity here for performance, relying on client or separate check if needed.
      
      await supabase.from('inventory_logs').insert({
          user_id: userId,
          inventory_item_id: itemId,
          type,
          reason,
          quantity_change: quantityChange,
          ref_id: refId
      });
  },

  async getStockHistory(itemId: string) {
      const { data } = await supabase
          .from('inventory_logs')
          .select('*')
          .eq('inventory_item_id', itemId)
          .order('created_at', { ascending: false })
          .limit(20); // Last 50 transactions
      
      return (data || []).map((log: any) => ({
          id: log.id,
          inventoryItemId: log.inventory_item_id,
          type: log.type,
          reason: log.reason,
          quantityChange: log.quantity_change,
          newBalance: log.new_balance,
          refId: log.ref_id,
          createdAt: log.created_at
      })) as InventoryLog[];
  },

  // NEW: Global Audit Log Fetcher
  async getGlobalStockLogs(userId: string, limit: number = 20, offset: number = 0, typeFilter?: string, itemId?: string) {
    let query = supabase
        .from('inventory_logs')
        .select('*, inventory_items(name, unit)') // Join to get item name directly
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
    }
    if (itemId) {
        query = query.eq('inventory_item_id', itemId);
    }

    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching global logs:', error);
        return [];
    }
    
    return (data || []).map((log: any) => ({
        id: log.id,
        inventoryItemId: log.inventory_item_id,
        itemName: log.inventory_items?.name || 'Unknown Item', // Mapped from join
        itemUnit: log.inventory_items?.unit || 'หน่วย',
        type: log.type,
        reason: log.reason,
        quantityChange: log.quantity_change,
        newBalance: log.new_balance,
        refId: log.ref_id,
        createdAt: log.created_at
    }));
  }
};
