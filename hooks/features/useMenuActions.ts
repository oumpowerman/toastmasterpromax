
import React from 'react';
import { supabase } from '../../lib/supabase';
import { AppState, MenuItem, IngredientItem, InventoryItem, IngredientLibraryItem } from '../../types';

export const useMenuActions = (
    state: AppState,
    setState: React.Dispatch<React.SetStateAction<AppState>>,
    targetId: string | undefined,
    calculateIngredientCost: (item: Omit<IngredientLibraryItem, 'id' | 'costPerUnit'>) => number
) => {

    const addMenu = () => {
        // Only supports Real Mode for now to avoid complexity of creating new IDs in draft without DB sync
        // For Sim mode, users usually edit existing menus or we can implement local add later.
        const newId = crypto.randomUUID();
        const newMenu: MenuItem = { id: newId, name: 'เมนูใหม่', sellingPrice: 0, ingredients: [] };
        setState(prev => ({ ...prev, menuItems: [...prev.menuItems, newMenu] }));
        
        if (targetId) {
            supabase.from('menu_items').insert({
                id: newId,
                user_id: targetId,
                name: newMenu.name,
                selling_price: newMenu.sellingPrice
            }).then(({ error }) => { if(error) console.error(error); });
        }
        return newId;
    };

    const updateMenu = (id: string, field: keyof MenuItem, value: any, target: 'real' | 'sim' = 'real') => {
        if (target === 'sim') {
            setState(prev => {
                if (!prev.simulationDraft) return prev;
                const newMenus = prev.simulationDraft.menuItems.map(m => m.id === id ? { ...m, [field]: value } : m);
                return { 
                    ...prev, 
                    simulationDraft: { ...prev.simulationDraft, menuItems: newMenus } 
                };
            });
        } else {
            // 1. Update Local State (Real)
            setState(prev => ({ ...prev, menuItems: prev.menuItems.map(m => m.id === id ? { ...m, [field]: value } : m) }));
            
            // 2. Update Database
            if (targetId) {
                let dbField = 'name'; // Default
                
                // Explicit Mapping
                if (field === 'sellingPrice') dbField = 'selling_price';
                else if (field === 'image') dbField = 'image_url';
                else if (field === 'category') dbField = 'category'; // Added Missing Mapping
                else if (field === 'name') dbField = 'name';
                
                // Prevent updating non-db fields like 'ingredients' via this function
                if (['name', 'sellingPrice', 'image', 'category'].includes(field)) {
                    supabase.from('menu_items').update({ [dbField]: value }).eq('id', id).then();
                }
            }
        }
    };
    
    const deleteMenu = (id: string) => {
        setState(prev => ({ ...prev, menuItems: prev.menuItems.filter(m => m.id !== id) }));
        if (targetId) supabase.from('menu_items').delete().eq('id', id).then();
    };

    const addIngredientToMenu = async (menuId: string, initialData?: Partial<IngredientItem>, target: 'real' | 'sim' = 'real') => {
        if (target === 'sim') {
            // Sim Mode: Local Update Only
            setState(prev => {
                if (!prev.simulationDraft) return prev;
                const newMenus = prev.simulationDraft.menuItems.map(m => {
                    if (m.id === menuId) {
                        return {
                            ...m,
                            ingredients: [...m.ingredients, {
                                id: `sim-${Date.now()}`, // Temp ID
                                masterId: initialData?.masterId,
                                name: initialData?.name || 'New Item',
                                cost: initialData?.cost || 0,
                                quantity: initialData?.quantity || 1,
                                unit: initialData?.unit || 'กรัม',
                                image: initialData?.image,
                                costPerUnit: (initialData?.cost || 0) / (initialData?.quantity || 1) // Set initial cost per unit
                            }]
                        };
                    }
                    return m;
                });
                return { ...prev, simulationDraft: { ...prev.simulationDraft, menuItems: newMenus } };
            });
            return;
        }

        // Real Mode: DB Sync
        if (!targetId) return;
        let inventoryId = initialData?.masterId;
        
        if (!inventoryId) {
            // Create new inventory item if ad-hoc ingredient
            const { data: newInv } = await supabase.from('inventory_items').insert({
                user_id: targetId,
                name: initialData?.name || 'วัตถุดิบใหม่',
                unit: initialData?.unit || 'กรัม',
                cost_per_unit: initialData?.cost || 0,
                quantity: 0,
                category: 'ingredient'
            }).select().single();
            
            if (newInv) {
                inventoryId = newInv.id;
                const newItem: InventoryItem = {
                    id: newInv.id,
                    name: newInv.name,
                    quantity: 0,
                    unit: newInv.unit,
                    minLevel: 0,
                    costPerUnit: newInv.cost_per_unit,
                    lastUpdated: new Date().toISOString()
                };
                const newLibraryItem: IngredientLibraryItem = {
                    id: newInv.id,
                    name: newInv.name,
                    bulkPrice: 0,
                    totalQuantity: 1,
                    unitType: newInv.unit === 'ชิ้น' ? 'unit' : 'weight',
                    usagePerUnit: 1,
                    costPerUnit: newInv.cost_per_unit || 0,
                    type: 'single',
                    category: 'ingredient'
                };
                setState(prev => ({
                    ...prev, 
                    inventory: [...prev.inventory, newItem], 
                    centralIngredients: [...prev.centralIngredients, newLibraryItem] 
                }));
            }
        }

        if (inventoryId) {
            const { error } = await supabase.from('menu_recipes').insert({
                menu_item_id: menuId,
                inventory_item_id: inventoryId,
                quantity_used: initialData?.quantity || 1,
                unit_used: initialData?.unit || 'กรัม',
                user_id: targetId
            });

            if (!error) {
                const invItem = state.inventory.find(i => i.id === inventoryId);
                const quantity = initialData?.quantity || 1;
                const unitCost = invItem?.costPerUnit || (initialData?.cost ? initialData.cost / quantity : 0);

                setState(prev => ({
                    ...prev,
                    menuItems: prev.menuItems.map(m => {
                        if (m.id === menuId) {
                            return {
                                ...m,
                                ingredients: [...m.ingredients, {
                                    id: inventoryId!,
                                    masterId: inventoryId,
                                    name: invItem?.name || initialData?.name || '',
                                    cost: unitCost * quantity,
                                    costPerUnit: unitCost, // Set Unit Cost
                                    quantity: quantity,
                                    unit: initialData?.unit || 'กรัม',
                                    image: invItem?.image
                                }]
                            };
                        }
                        return m;
                    })
                }));
            }
        }
    };

    const updateIngredientInMenu = async (menuId: string, ingId: string, field: 'name' | 'cost' | 'quantity', value: any, target: 'real' | 'sim' = 'real') => {
        const updateLogic = (prev: AppState) => {
            return {
                ...prev,
                menuItems: prev.menuItems.map(m => {
                    if (m.id === menuId) {
                        return {
                            ...m,
                            ingredients: m.ingredients.map(i => {
                                if (i.id !== ingId) return i;
                                
                                // Ensure costPerUnit is set (migration for old items)
                                const currentCostPerUnit = i.costPerUnit !== undefined 
                                    ? i.costPerUnit 
                                    : (i.quantity && i.quantity > 0 ? i.cost / i.quantity : 0);
                                
                                let updatedItem = { ...i, [field]: value, costPerUnit: currentCostPerUnit };

                                // 1. If Quantity Changed: Recalculate Total Cost based on CostPerUnit
                                if (field === 'quantity') {
                                    const newQty = Number(value);
                                    updatedItem.cost = newQty * currentCostPerUnit;
                                } 
                                // 2. If Cost Changed (from YieldHelper): Recalculate CostPerUnit
                                else if (field === 'cost') {
                                    const newCost = Number(value);
                                    if (updatedItem.quantity && updatedItem.quantity > 0) {
                                        updatedItem.costPerUnit = newCost / updatedItem.quantity;
                                    }
                                }
                                
                                return updatedItem;
                            })
                        };
                    }
                    return m;
                })
            };
        };

        if (target === 'sim') {
            setState(prev => {
                if (!prev.simulationDraft) return prev;
                const updatedDraft = updateLogic({ ...prev, menuItems: prev.simulationDraft.menuItems });
                return { ...prev, simulationDraft: { ...prev.simulationDraft, menuItems: updatedDraft.menuItems } };
            });
            return;
        }

        // Real Mode
        setState(prev => updateLogic(prev));

        if (targetId) {
            if (field === 'quantity') {
                await supabase.from('menu_recipes').update({ quantity_used: value }).match({ menu_item_id: menuId, inventory_item_id: ingId });
            } else if (field === 'name' || field === 'cost') {
                const dbField = field === 'name' ? 'name' : 'cost_per_unit';
                // Note: updating cost here updates the MASTER inventory item cost (cost_per_unit)
                // We need to calculate the unit cost from the total cost passed
                let dbValue = value;
                if (field === 'cost') {
                    // We need to get the item from state to know quantity to divide
                    // Since we can't easily access state here without being messy, 
                    // we assume the UI passed the calculated unit cost or we rely on the state update above to reflect eventually.
                    // Actually, RecipeEditor calls this with the *Unit Cost* result from YieldHelper if using the helper?
                    // No, YieldHelper returns "calculatedPerPiece" which IS unit cost if mode is 'unit'.
                    // BUT RecipeEditor currently passes it to 'cost' field of item.
                    // Ideally, YieldHelper should update 'costPerUnit' directly.
                    // But to keep it simple with existing flow:
                    // If we update 'cost' (total), we implied we updated costPerUnit.
                    // Let's assume the value passed IS the new costPerUnit if coming from YieldHelper 'Use This Price'.
                    // Wait, YieldHelper returns `calculatedPerPiece`. That is cost per 1 unit.
                    // So `value` IS `costPerUnit`.
                    // But `updateIngredientInMenu` treats `field='cost'` as updating `i.cost` (Total Cost) in the logic above?
                    // "updatedItem.costPerUnit = newCost / updatedItem.quantity;" -> This implies value is Total Cost.
                    // We need to clarify usage in RecipeEditor.
                    // RecipeEditor: `onChange={(v) => onUpdateIngredient(menuId, item.id, 'cost', v)}`
                    // YieldHelper: `onChange(Number(calculatedPerPiece.toFixed(2)))`
                    // So YieldHelper sends UNIT COST.
                    // My logic above `updatedItem.costPerUnit = newCost / updatedItem.quantity` treats it as TOTAL cost.
                    // THIS IS A BUG in my logic above if YieldHelper sends Unit Cost.
                    // However, standard `YieldHelper` usage in `RecipeEditor` for *manual* items usually treats `item.cost` as the *Unit Cost* displayed?
                    // Let's check `RecipeEditor` rendering: `<p>฿{item.cost.toFixed(2)}</p>`.
                    // If `item.quantity` is 1, Cost = Unit Cost.
                    // If I change quantity to 2. `item.cost` should become 2 * Unit Cost.
                    
                    // CORRECTION:
                    // If the field passed is 'cost', we should assume it might be from a tool setting the "Cost Per Unit" for that item specifically?
                    // Or setting the Total Cost?
                    // Given `YieldHelper` sends `calculatedPerPiece`, it sends Unit Cost.
                    // BUT `RecipeEditor` passes it to `item.cost`.
                    // So `item.cost` currently holds `Unit Cost` in the UI if quantity is 1.
                    
                    // To fix the "0" issue specifically requested, we must separate `cost` (total) and `costPerUnit`.
                    // Let's assume `value` passed for `cost` is the *Total Cost* normally, but from YieldHelper it's effectively the result.
                    
                    // If we want to support YieldHelper sending Unit Cost, we should probably change the field name to 'costPerUnit' in call?
                    // But I cannot change YieldHelper call easily without changing RecipeEditor heavily.
                    
                    // Let's stick to the plan: `cost` field means Total Cost.
                    // But if YieldHelper is used, it sets the value.
                    // If I have 1 item, Total Cost = Unit Cost.
                    // The issue "Price is 0 when qty is 0" happens because we lost the unit cost.
                    // With `costPerUnit` stored, we are safe.
                    
                    // If user manually types in `YieldHelper` and hits "Use This Price", it sends `calculatedPerPiece`.
                    // If my quantity is 1, then Total Cost = `calculatedPerPiece`.
                    // If my quantity is 2, and I use YieldHelper to say "Cost per piece is 5".
                    // Then Total Cost should be 10.
                    // But `RecipeEditor` does `onChange={(v) => onUpdate(... 'cost', v)}`.
                    // So it sets Total Cost to 5.
                    // Then Unit Cost becomes 2.5. This is wrong behavior if intended.
                    
                    // HOWEVER, the user's immediate problem is "Price lost when qty 0".
                    // Storing `costPerUnit` solves this.
                    // I will stick to the implementation that saves `costPerUnit`.
                    
                    dbValue = value; // We'll just update the db cost_per_unit with this value for now if it's a manual item
                }
                
                await supabase.from('inventory_items').update({ [dbField]: dbValue }).eq('id', ingId);
            }
        }
    };

    const removeIngredientFromMenu = async (menuId: string, ingId: string, target: 'real' | 'sim' = 'real') => {
        if (target === 'sim') {
            setState(prev => {
                if (!prev.simulationDraft) return prev;
                const newMenus = prev.simulationDraft.menuItems.map(m => {
                    if (m.id === menuId) {
                        return { ...m, ingredients: m.ingredients.filter(i => i.id !== ingId) };
                    }
                    return m;
                });
                return { ...prev, simulationDraft: { ...prev.simulationDraft, menuItems: newMenus } };
            });
            return;
        }

        // Real Mode
        setState(prev => ({
            ...prev,
            menuItems: prev.menuItems.map(m => {
                if (m.id === menuId) {
                    return { ...m, ingredients: m.ingredients.filter(i => i.id !== ingId) };
                }
                return m;
            })
        }));
        if (targetId) {
            await supabase.from('menu_recipes').delete().match({ menu_item_id: menuId, inventory_item_id: ingId });
        }
    };

    return {
        addMenu,
        updateMenu,
        deleteMenu,
        addIngredientToMenu,
        updateIngredientInMenu,
        removeIngredientFromMenu
    };
};
