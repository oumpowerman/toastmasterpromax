
import React, { useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { AppState, Equipment, ChecklistItem, ChecklistPreset, Supplier, AssetCategory } from '../../types';

export const useSettingsActions = (
    state: AppState,
    setState: React.Dispatch<React.SetStateAction<AppState>>,
    targetId: string | undefined
) => {
    const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- SETTINGS & NESTED STATE (Sim Ready) ---
    const updateNestedState = (category: keyof AppState, field: string, value: any, target: 'real' | 'sim' = 'real') => {
        if (target === 'sim') {
            // --- SIMULATION MODE ---
            setState(prev => {
                if (!prev.simulationDraft) return prev; // Safety check
                const draft = { ...prev.simulationDraft };
                
                if (field === '') {
                    (draft as any)[category] = value;
                } else {
                    (draft as any)[category] = { ...(draft as any)[category], [field]: value };
                }
                return { ...prev, simulationDraft: draft };
            });

            // Persist Sim Draft to DB (Debounced)
            if (targetId) {
                if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
                updateTimeoutRef.current = setTimeout(async () => {
                    // Note: We need to access the LATEST state here, but in a hook we rely on closure. 
                    // Ideally we should use functional update in DB call or ref, but for simple draft saving, 
                    // re-saving the whole draft object is safer to ensure consistency.
                    // However, we can't access 'state' inside timeout easily without ref.
                    // For now, we will save what we just computed locally if possible, but strict sync needs ref.
                    
                    // Simplified: Just trigger a DB update with current draft from state (might be stale in closure)
                    // Better approach: Trigger an effect or just fire update.
                    // Actually, let's just update the DB with the payload we constructed above.
                    // Wait, we need the FULL draft to save to JSONB. 
                    // Let's assume the user presses "Save" or we auto-save the specific field? 
                    // No, `simulation_draft` column stores the WHOLE state object.
                    // We will implement `saveSimulationDraft` in `useToastActions` instead to handle full save.
                    // Here we just update local state.
                }, 1000);
            }

        } else {
            // --- REAL MODE (Original Logic) ---
            if (field === '') {
                setState(prev => ({ ...prev, [category]: value }));
            } else {
                setState(prev => ({
                    ...prev,
                    [category]: { ...(prev[category] as any), [field]: value }
                }));
            }

            if (targetId) {
                if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
                updateTimeoutRef.current = setTimeout(async () => {
                    let updatePayload: any = {};
                    if (category === 'fixedCosts') updatePayload = { fixed_costs: field === '' ? value : { ...state.fixedCosts, [field]: value } };
                    else if (['traffic', 'pricing', 'hiddenPercentages'].includes(category as string)) {
                        const currentParams = {
                            traffic: state.traffic,
                            pricing: state.pricing,
                            hidden_percentages: state.hiddenPercentages
                        };
                        // We must use the value passed to function because 'state' in closure is old
                        // But we also need other fields from 'state'.
                        // This legacy logic relies on state being relatively fresh.
                        if (field === '') {
                            (currentParams as any)[category] = value;
                        } else {
                            (currentParams as any)[category] = { ...(currentParams as any)[category], [field]: value };
                        }
                        updatePayload = { business_params: currentParams };
                    }

                    if (Object.keys(updatePayload).length > 0) {
                        await supabase.from('shop_settings').update(updatePayload).eq('user_id', targetId);
                    }
                }, 1000);
            }
        }
    };

    // --- ASSET TAXONOMY ---
    const updateAssetTaxonomy = async (newTaxonomy: AssetCategory[]) => {
        setState(prev => ({ ...prev, assetTaxonomy: newTaxonomy }));
        if (targetId) {
            // Optimistic update done, now sync DB
            const { data } = await supabase.from('shop_settings').select('app_config').eq('user_id', targetId).single();
            const newConfig = { ...(data?.app_config || {}), asset_taxonomy: newTaxonomy };
            await supabase.from('shop_settings').update({ app_config: newConfig }).eq('user_id', targetId);
        }
    };

    const setTrafficScenario = (type: 'normal' | 'weekend' | 'rainy') => {
        if (type === 'normal') { updateNestedState('traffic', 'customersPerHour', 60); updateNestedState('traffic', 'conversionRate', 20); }
        else if (type === 'weekend') { updateNestedState('traffic', 'customersPerHour', 120); updateNestedState('traffic', 'conversionRate', 25); }
        else if (type === 'rainy') { updateNestedState('traffic', 'customersPerHour', 20); updateNestedState('traffic', 'conversionRate', 10); }
    };

    // --- CHECKLIST ---
    const updateChecklist = (items: ChecklistItem[]) => {
        setState(prev => ({ ...prev, checklist: items }));
        if (targetId) {
            supabase.from('shop_settings').select('app_config').eq('user_id', targetId).single()
              .then(({ data }) => {
                  const newConfig = { ...(data?.app_config || {}), active_checklist: items };
                  supabase.from('shop_settings').update({ app_config: newConfig }).eq('user_id', targetId).then();
              });
        }
    };

    const updateChecklistPresets = (presets: ChecklistPreset[]) => {
        setState(prev => ({ ...prev, checklistPresets: presets }));
        if (targetId) {
            supabase.from('shop_settings').select('app_config').eq('user_id', targetId).single()
              .then(({ data }) => {
                  const newConfig = { ...(data?.app_config || {}), checklist_presets: presets };
                  supabase.from('shop_settings').update({ app_config: newConfig }).eq('user_id', targetId).then();
              });
        }
    };

    // --- SUPPLIERS ---
    const addSupplier = async (data: Partial<Supplier>) => {
        if (!targetId) return;
        const payload = {
            user_id: targetId,
            name: data.name,
            location_name: data.locationName,
            type: data.type,
            lead_time: data.leadTime,
            map_url: data.mapUrl,
            website_url: data.websiteUrl,
            distance_km: data.distanceKm,
            products: data.products, // Stored as JSONB
            is_home: false,
            image_url: data.image // NEW
        };

        const { data: insertedData } = await supabase.from('suppliers').insert(payload).select().single();
        
        if (insertedData) {
            setState(prev => ({ ...prev, suppliers: [...prev.suppliers, { 
                id: insertedData.id, 
                name: insertedData.name, 
                locationName: insertedData.location_name, 
                type: insertedData.type || 'physical', 
                leadTime: insertedData.lead_time,
                mapUrl: insertedData.map_url,
                websiteUrl: insertedData.website_url,
                distanceKm: insertedData.distance_km,
                products: insertedData.products || [],
                isHome: insertedData.is_home,
                image: insertedData.image_url // NEW
            }] }));
        }
    };

    const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
        if (!targetId) return;
        setState(prev => ({ ...prev, suppliers: prev.suppliers.map(s => s.id === id ? { ...s, ...updates } : s) }));
        
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.locationName !== undefined) payload.location_name = updates.locationName;
        if (updates.type !== undefined) payload.type = updates.type;
        if (updates.leadTime !== undefined) payload.lead_time = updates.leadTime;
        if (updates.mapUrl !== undefined) payload.map_url = updates.mapUrl;
        if (updates.websiteUrl !== undefined) payload.website_url = updates.websiteUrl;
        if (updates.distanceKm !== undefined) payload.distance_km = updates.distanceKm;
        if (updates.products !== undefined) payload.products = updates.products;
        if (updates.image !== undefined) payload.image_url = updates.image; // NEW

        await supabase.from('suppliers').update(payload).eq('id', id);
    };

    const removeSupplier = async (id: string) => {
        setState(prev => ({ ...prev, suppliers: prev.suppliers.filter(s => s.id !== id) }));
        if (targetId) await supabase.from('suppliers').delete().eq('id', id);
    };

    // --- EQUIPMENT ---
    const addEquipment = async (category: string, initialData?: { name: string, price: number }) => {
        if (!targetId) return;
        const newItem = {
            user_id: targetId,
            name: initialData?.name || 'อุปกรณ์ใหม่ ✨',
            category: category,
            purchase_price: initialData?.price || 0,
            resale_price: 0,
            lifespan_days: 365
        };
        const tempId = 'temp-' + Date.now();
        setState(prev => ({ ...prev, equipment: [...prev.equipment, { id: tempId, name: newItem.name, category: category, purchasePrice: newItem.purchase_price, resalePrice: 0, lifespanDays: 365 }] }));
        
        const { data } = await supabase.from('equipment').insert(newItem).select().single();
        if (data) {
            setState(prev => ({
                ...prev,
                equipment: prev.equipment.map(e => e.id === tempId ? {
                    id: data.id,
                    name: data.name,
                    category: data.category,
                    purchasePrice: data.purchase_price,
                    resalePrice: data.resale_price,
                    lifespanDays: data.lifespan_days
                } : e)
            }));
        }
    };

    const removeEquipment = async (id: string) => {
        setState(prev => ({ ...prev, equipment: prev.equipment.filter(e => e.id !== id) }));
        if (!id.startsWith('temp-') && targetId) {
            await supabase.from('equipment').delete().eq('id', id);
        }
    };

    const updateEquipment = async (id: string, field: keyof Equipment, value: any) => {
        setState(prev => ({
            ...prev,
            equipment: prev.equipment.map(e => e.id === id ? { ...e, [field]: value } : e)
        }));
        if (!id.startsWith('temp-') && targetId) {
            const dbField = field === 'purchasePrice' ? 'purchase_price' 
                        : field === 'resalePrice' ? 'resale_price'
                        : field === 'lifespanDays' ? 'lifespan_days'
                        : field === 'category' ? 'category'
                        : 'name';
            await supabase.from('equipment').update({ [dbField]: value }).eq('id', id);
        }
    };

    return {
        updateNestedState,
        setTrafficScenario,
        updateChecklist,
        updateChecklistPresets,
        addSupplier,
        updateSupplier,
        removeSupplier,
        addEquipment,
        removeEquipment,
        updateEquipment,
        updateAssetTaxonomy // NEW
    };
};
