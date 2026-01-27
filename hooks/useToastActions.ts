
import React, { useEffect, useRef } from 'react';
import { AppState } from '../types';
import { useSettingsActions } from './features/useSettingsActions';
import { useMenuActions } from './features/useMenuActions';
import { useInventoryActions } from './features/useInventoryActions';
import { useFinanceActions } from './features/useFinanceActions';
import { useOrderActions } from './features/useOrderActions';
import { supabase } from '../lib/supabase';

export const useToastActions = (
    state: AppState,
    setState: React.Dispatch<React.SetStateAction<AppState>>,
    currentUserId: string | undefined, // The logged in user
    fetchInventoryLayer: (userId: string) => Promise<void>
) => {
    
    // We use the active shop ID from state to write data (Owner's ID)
    // If state.activeShopId is undefined, fallback to currentUserId (Self-owned)
    const targetId = state.activeShopId || currentUserId;
    
    // Draft Save Debounce Ref
    const draftSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 1. Initialize Sub-hooks
    const settingsActions = useSettingsActions(state, setState, targetId);
    const financeActions = useFinanceActions(state, setState, targetId);
    const inventoryActions = useInventoryActions(state, setState, targetId, fetchInventoryLayer);
    
    // Menu actions needs logic to calculate cost from Inventory Actions
    const menuActions = useMenuActions(state, setState, targetId, inventoryActions.calculateIngredientCost);

    // Order actions needs access to other actions to perform 'Cross-Cutting' logic (Ledger & Stock)
    const orderActions = useOrderActions(
        state, 
        setState, 
        targetId, 
        { 
            addLedgerItem: financeActions.addLedgerItem,
            performFifoDeduction: inventoryActions.performFifoDeduction,
            fetchInventoryLayer: fetchInventoryLayer
        }
    );

    // --- SIMULATION ACTIONS ---
    
    const initializeSimulation = () => {
        // If we already have a loaded draft from DB (via useToastData), use it.
        // If not, clone from real state.
        if (state.simulationDraft) return;

        const draft = JSON.parse(JSON.stringify(state));
        draft.simulationDraft = null; 
        
        setState(prev => ({ ...prev, simulationDraft: draft }));
    };

    const applySimulationToReal = async () => {
        if (!state.simulationDraft) return;
        if (!targetId) return;

        const draft = state.simulationDraft;

        // 1. Apply to Local State (Immediate Feedback)
        setState(prev => ({
            ...prev,
            menuItems: draft.menuItems,
            fixedCosts: draft.fixedCosts,
            traffic: draft.traffic,
            pricing: draft.pricing,
            hiddenPercentages: draft.hiddenPercentages,
            // Keep the draft object in sync (it becomes equal to real)
            simulationDraft: null 
        }));

        // 2. Apply Settings to DB
        await supabase.from('shop_settings').update({
            fixed_costs: draft.fixedCosts,
            business_params: {
                traffic: draft.traffic,
                pricing: draft.pricing,
                hidden_percentages: draft.hiddenPercentages
            },
            simulation_draft: null // Clear draft in DB too
        }).eq('user_id', targetId);

        // 3. Deep Sync: Apply Menu & Recipe Changes
        // Note: This is potentially expensive, but necessary for data consistency.
        for (const menu of draft.menuItems) {
            // 3.1 Update Menu Price & Image
            await supabase.from('menu_items').update({ 
                selling_price: menu.sellingPrice,
                category: menu.category
            }).eq('id', menu.id);

            // 3.2 Update Recipes (Quantities changed in Sim?)
            // For robustness, we update quantity_used for each linked ingredient
            for (const ing of menu.ingredients) {
                if (ing.masterId) {
                    await supabase.from('menu_recipes').update({
                        quantity_used: ing.quantity
                    }).match({ 
                        menu_item_id: menu.id, 
                        inventory_item_id: ing.masterId 
                    });
                }
            }
        }

        // 4. Sync Inventory Costs (If user adjusted ingredient costs in Sim)
        // We scan the draft ingredients and update the real inventory items
        // Note: This only works for items that exist in both.
        if (draft.inventory) {
            for (const simItem of draft.inventory) {
                const realItem = state.inventory.find(i => i.id === simItem.id);
                // If cost changed significantly
                if (realItem && Math.abs((realItem.costPerUnit || 0) - (simItem.costPerUnit || 0)) > 0.01) {
                    await supabase.from('inventory_items').update({
                        cost_per_unit: simItem.costPerUnit
                    }).eq('id', simItem.id);
                }
            }
        }
        
        // Refresh to ensure everything is clean
        fetchInventoryLayer(targetId);
    };

    // --- AUTO-SAVE DRAFT EFFECT ---
    useEffect(() => {
        if (state.simulationDraft && targetId) {
            if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);
            
            // Debounce save to avoid hammering DB on every slider move
            draftSaveTimeoutRef.current = setTimeout(async () => {
                await supabase.from('shop_settings').update({
                    simulation_draft: state.simulationDraft
                }).eq('user_id', targetId);
                // console.log("Auto-saved Draft to DB");
            }, 2000); // 2 seconds debounce
        }
    }, [state.simulationDraft, targetId]);

    // Manual Save (Optional, used if user wants to force save before leaving)
    const saveSimulationDraft = async () => {
        if (!targetId || !state.simulationDraft) return;
        await supabase.from('shop_settings').update({
            simulation_draft: state.simulationDraft
        }).eq('user_id', targetId);
    };

    // 2. Return Unified Interface
    return {
        ...settingsActions,
        ...menuActions,
        ...inventoryActions,
        ...financeActions,
        ...orderActions,
        // Sim
        initializeSimulation,
        applySimulationToReal,
        saveSimulationDraft
    };
};
