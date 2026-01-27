
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppState, InventoryItem, IngredientLibraryItem, MenuItem, LedgerItem, Equipment, Order, InventoryBatch } from '../types';
import { INITIAL_STATE, DEFAULT_ASSET_TAXONOMY } from '../constants';

export const useToastData = (
    setState: React.Dispatch<React.SetStateAction<AppState>>
) => {
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeShopId, setActiveShopId] = useState<string | null>(null);

    const mapOrderFromDB = (o: any): Order => ({
        id: o.id,
        queueNumber: o.queue_number,
        timestamp: o.timestamp,
        status: o.status,
        items: o.items,
        totalPrice: o.total_price,
        netTotal: o.net_total,
        paymentMethod: o.payment_method,
        channel: o.channel,
        gpDeduction: o.gp_deduction || 0
    });

    const mapLedgerFromDB = (l: any): LedgerItem => ({
        id: l.id,
        title: l.title,
        amount: l.amount,
        type: l.type,
        category: l.category,
        channel: l.channel,
        date: l.transaction_date,
        slipImage: l.slip_image,
        note: l.note,
        items: l.items || [] // Map items from DB
    });

    // --- HELPER: FETCH INVENTORY & BATCHES ---
    const fetchInventoryLayer = async (targetUserId: string) => {
        // Fetch Regular Inventory Items
        const { data: invItems } = await supabase.from('inventory_items').select('*').eq('user_id', targetUserId);
        
        // Fetch Batches
        const { data: batches } = await supabase
            .from('inventory_batches')
            .select('*')
            .eq('user_id', targetUserId)
            .gt('quantity', 0)
            .order('expiry_date', { ascending: true, nullsFirst: false });

        // Fetch Legacy Equipment to Merge into Inventory View
        const { data: equipData } = await supabase.from('equipment').select('*').eq('user_id', targetUserId);

        if (invItems) {
            // Map Regular Items
            const mappedInventory: InventoryItem[] = invItems.map((i: any) => {
                const itemBatches = batches?.filter((b: any) => b.inventory_item_id === i.id) || [];
                const totalQty = itemBatches.reduce((sum: number, b: any) => sum + b.quantity, 0);
                
                let weightedCost = 0;
                if (totalQty > 0) {
                    const totalValue = itemBatches.reduce((sum: number, b: any) => sum + (b.quantity * b.cost_per_unit), 0);
                    weightedCost = totalValue / totalQty;
                } else {
                    weightedCost = i.cost_per_unit || 0;
                }

                const earliestExpiry = itemBatches.find((b: any) => b.expiry_date)?.expiry_date;

                const mappedBatches: InventoryBatch[] = itemBatches.map((b: any) => ({
                    id: b.id,
                    quantity: b.quantity,
                    originalQuantity: b.original_quantity || b.quantity,
                    costPerUnit: b.cost_per_unit,
                    receivedDate: b.received_date,
                    expiryDate: b.expiry_date
                }));
                
                // Calculate depreciation if Asset (Per Unit)
                let dailyDepreciation = undefined;
                if (i.category === 'asset' && i.purchase_date && i.lifespan_days) {
                    dailyDepreciation = (i.cost_per_unit - (i.salvage_price || 0)) / i.lifespan_days;
                }

                // Determine final quantity (Priority: Batches > DB Column > 0)
                const finalQuantity = totalQty > 0 ? totalQty : (i.quantity || 0);

                return {
                    id: i.id,
                    name: i.name,
                    quantity: finalQuantity,
                    unit: i.unit,
                    minLevel: i.min_level,
                    costPerUnit: i.category === 'asset' ? i.cost_per_unit : weightedCost,
                    lastUpdated: i.updated_at,
                    image: i.image_url,
                    expiryDate: earliestExpiry,
                    category: i.category || 'ingredient',
                    subCategory: i.sub_category,
                    type: i.category === 'asset' ? 'asset' : 'stock',
                    batches: mappedBatches,
                    
                    // Map DB Asset Columns
                    status: i.item_status || 'active', 
                    purchaseDate: i.purchase_date,
                    lifespanDays: i.lifespan_days,
                    salvagePrice: i.salvage_price,
                    notes: i.details,
                    assetCode: i.asset_code, // NEW
                    dailyDepreciation: dailyDepreciation
                };
            });

            // Merge Legacy Equipment as Assets (Fallback for old data)
            if (equipData) {
                const equipmentAssets: InventoryItem[] = equipData.map((e: any) => ({
                    id: `asset-${e.id}`, // Prefix to avoid collision
                    name: e.name,
                    quantity: 1, 
                    unit: 'เครื่อง/ชิ้น',
                    minLevel: 0,
                    costPerUnit: e.purchase_price,
                    lastUpdated: e.created_at,
                    image: null,
                    category: 'asset',
                    type: 'asset',
                    status: 'active', // Default for legacy
                    salvagePrice: e.resale_price,
                    lifespanDays: e.lifespan_days,
                    dailyDepreciation: (e.purchase_price - e.resale_price) / e.lifespan_days,
                    notes: 'Legacy Equipment'
                }));
                
                // Add to inventory list (avoid duplicates if migrated)
                equipmentAssets.forEach(legacy => {
                    if (!mappedInventory.some(m => m.name === legacy.name && m.type === 'asset')) {
                        mappedInventory.push(legacy);
                    }
                });
            }
            
            // Map Library
            const mappedLibrary: IngredientLibraryItem[] = invItems.map((i: any) => ({
                id: i.id,
                name: i.name,
                bulkPrice: i.bulk_price || 0,
                totalQuantity: i.pack_size || 1, 
                unitType: i.unit === 'ชิ้น' ? 'unit' : 'weight',
                unit: i.unit,
                usagePerUnit: 1,
                costPerUnit: i.cost_per_unit,
                image: i.image_url,
                category: i.category || 'ingredient',
                subCategory: i.sub_category,
                details: i.details,
                supplierId: i.supplier_id
            }));

            setState(prev => ({
                ...prev,
                inventory: mappedInventory,
                centralIngredients: mappedLibrary,
                equipment: [] 
            }));
        }
    };

    // --- MAIN FETCH ---
    const fetchData = async (currentUserId: string) => {
        setLoading(true);
        try {
            let targetUserId = currentUserId;
            let role: 'owner' | 'manager' | 'staff' = 'owner';

            const { data: memberData } = await supabase
                .from('shop_members')
                .select('owner_id, role')
                .eq('user_id', currentUserId)
                .maybeSingle();

            if (memberData) {
                targetUserId = memberData.owner_id;
                role = (memberData.role as any) || 'staff';
            }
            
            setActiveShopId(targetUserId);

            const [
                { data: settingsData },
                { data: suppliersData },
                { data: menuData },
                { data: ledgerData },
                { data: ordersData }
            ] = await Promise.all([
                supabase.from('shop_settings').select('*').eq('user_id', targetUserId).maybeSingle(),
                supabase.from('suppliers').select('*').eq('user_id', targetUserId),
                supabase.from('menu_items').select('*, menu_recipes(*, inventory_items(*))').eq('user_id', targetUserId),
                supabase.from('ledger').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false }),
                supabase.from('orders').select('*').eq('user_id', targetUserId).order('timestamp', { ascending: false }).limit(100)
            ]);

            await fetchInventoryLayer(targetUserId);

            const settings = settingsData || {};
            const fixedCosts = settings.fixed_costs || INITIAL_STATE.fixedCosts;
            const appConfig = settings.app_config || {};
            const businessParams = settings.business_params || {};
            const simulationDraft = settings.simulation_draft || null; // NEW: Load Draft

            const suppliers = suppliersData?.map((s: any) => ({
                id: s.id,
                name: s.name,
                locationName: s.location_name,
                contactInfo: s.contact_info,
                isHome: s.is_home,
                // MAP NEW FIELDS
                type: s.type || 'physical',
                leadTime: s.lead_time,
                mapUrl: s.map_url,
                websiteUrl: s.website_url,
                distanceKm: s.distance_km,
                products: s.products || [],
                image: s.image_url // NEW: Image Map
            })) || INITIAL_STATE.suppliers;

            const menuItems: MenuItem[] = (menuData || []).map((m: any) => ({
                id: m.id,
                name: m.name,
                sellingPrice: m.selling_price,
                category: m.category,
                image: m.image_url,
                ingredients: (m.menu_recipes || []).map((r: any) => ({
                    id: r.inventory_item_id,
                    masterId: r.inventory_item_id,
                    name: r.inventory_items?.name || 'Unknown',
                    cost: (r.quantity_used || 0) * (r.inventory_items?.cost_per_unit || 0),
                    quantity: r.quantity_used,
                    unit: r.unit_used,
                    image: r.inventory_items?.image_url
                }))
            }));

            const ledger: LedgerItem[] = (ledgerData || []).map(mapLedgerFromDB);

            const orders: Order[] = (ordersData || []).map(mapOrderFromDB);

            setState(prev => ({
                ...prev,
                fixedCosts,
                menuItems,
                suppliers,
                ledger,
                checklist: appConfig.active_checklist || [],
                checklistPresets: appConfig.checklist_presets || [],
                orders,
                hiddenPercentages: businessParams.hidden_percentages || INITIAL_STATE.hiddenPercentages,
                pricing: businessParams.pricing || INITIAL_STATE.pricing,
                traffic: businessParams.traffic || INITIAL_STATE.traffic,
                isWorstCase: false,
                activeShopId: targetUserId,
                userRole: role,
                assetTaxonomy: appConfig.asset_taxonomy || DEFAULT_ASSET_TAXONOMY,
                simulationDraft: simulationDraft // NEW: Set Loaded Draft
            }));

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Auth
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setSession(session);
            if (session?.user?.id) fetchData(session.user.id);
            else setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setSession(session);
            if (session?.user?.id) fetchData(session.user.id);
            else {
                setState(INITIAL_STATE);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- REALTIME SUBSCRIPTIONS (Watch activeShopId) ---
    useEffect(() => {
        if (!activeShopId) return;

        // 1. Orders Subscription
        const ordersChannel = supabase.channel('public:orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${activeShopId}` }, 
            (payload: any) => {
                if (payload.eventType === 'INSERT') {
                    const newOrder = mapOrderFromDB(payload.new);
                    setState(prev => {
                        // Prevent duplicates
                        if (prev.orders.find(o => o.id === newOrder.id)) return prev;
                        
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(() => {});
                        return { ...prev, orders: [newOrder, ...prev.orders] };
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setState(prev => ({ ...prev, orders: prev.orders.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o) }));
                }
            }).subscribe();

        // 2. Ledger Subscription (NEW)
        const ledgerChannel = supabase.channel('public:ledger')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ledger', filter: `user_id=eq.${activeShopId}` },
            (payload: any) => {
                const newItem = mapLedgerFromDB(payload.new);
                setState(prev => {
                    // Deduplicate logic
                    const isDuplicate = prev.ledger.some(l => 
                        l.title === newItem.title && 
                        l.amount === newItem.amount && 
                        Math.abs(new Date(l.date).getTime() - new Date(newItem.date).getTime()) < 2000 // Within 2 sec
                    );
                    
                    if (!isDuplicate) {
                        return { ...prev, ledger: [newItem, ...prev.ledger] };
                    }
                    return prev;
                });
            }).subscribe();

        // 3. Inventory Subscription
        const inventoryChannel = supabase.channel('public:inventory')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items', filter: `user_id=eq.${activeShopId}` },
            () => { fetchInventoryLayer(activeShopId); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_batches', filter: `user_id=eq.${activeShopId}` },
            () => { fetchInventoryLayer(activeShopId); })
            .subscribe();

        // 4. Settings Subscription
        const settingsChannel = supabase.channel('public:settings')
            .on('postgres_changes', 
                { event: 'UPDATE', schema: 'public', table: 'shop_settings', filter: `user_id=eq.${activeShopId}` },
                (payload: any) => {
                    const newConfig = payload.new.app_config;
                    if (newConfig) {
                        setState(prev => ({
                            ...prev,
                            checklist: newConfig.active_checklist || prev.checklist,
                            assetTaxonomy: newConfig.asset_taxonomy || prev.assetTaxonomy // Sync Taxonomy
                        }));
                    }
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(ledgerChannel);
            supabase.removeChannel(inventoryChannel);
            supabase.removeChannel(settingsChannel);
        };
    }, [activeShopId]);

    return { session, loading, fetchInventoryLayer };
};