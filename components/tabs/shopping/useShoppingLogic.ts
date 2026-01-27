
import { useMemo } from 'react';
import { AppState, NeededItem, PurchaseOption, RouteGroup, CostBreakdown, Supplier } from '../../../types';
import { calculateUnitsPerDay } from '../../../utils/calculations';

// --- LOGIC HOOK (The Smarter Brain 4.0 - Human Override) ---
export const useShoppingLogic = (state: AppState, forcedSuppliers: Record<string, string> = {}) => {
    // 1. Identify Needs & Burn Rate
    const neededItems: NeededItem[] = useMemo(() => {
        const dailyUnitsSold = calculateUnitsPerDay(state);
        
        return state.inventory
            .filter(i => i.quantity <= i.minLevel)
            .map(invItem => {
                const libItem = state.centralIngredients.find(l => l.name === invItem.name);
                
                let dailyUsage = 0;
                state.menuItems.forEach(menu => {
                    const ing = menu.ingredients.find(i => i.name === invItem.name || (libItem && i.masterId === libItem.id));
                    if (ing) {
                        const menuShare = dailyUnitsSold / Math.max(1, state.menuItems.length);
                        dailyUsage += menuShare * (ing.quantity || 0);
                    }
                });
                if (dailyUsage === 0) dailyUsage = Math.max(1, invItem.quantity * 0.1); 

                const daysLeft = dailyUsage > 0 ? invItem.quantity / dailyUsage : 99;
                // Buy up to 3x min level or enough for 7 days
                const safeLevel = Math.max(invItem.minLevel * 2.5, dailyUsage * 5); 
                
                return {
                    id: invItem.id,
                    name: invItem.name,
                    current: invItem.quantity,
                    toBuy: Math.max(1, Math.ceil(safeLevel - invItem.quantity)),
                    unit: invItem.unit,
                    usagePerDay: dailyUsage,
                    daysLeft: daysLeft,
                    libId: libItem?.id || '',
                    isUrgent: daysLeft < 2.0
                };
            });
    }, [state.inventory, state.menuItems, state.traffic, state.centralIngredients]);

    // 2. The 3-Pass Optimization (Critical > Manual > Normal)
    const shoppingPlan = useMemo(() => {
        const plan: PurchaseOption[] = [];
        const unassigned: NeededItem[] = [];
        const activePhysicalStores = new Set<string>();

        // HELPER: Calculate Cost & Feasibility
        const calculateOptionCost = (item: NeededItem, supplier: Supplier, isStoreActive: boolean): CostBreakdown => {
            const libItem = state.centralIngredients.find(l => l.id === item.libId);
            const product = supplier.products?.find(p => p.id === item.libId);
            
            const leadTime = supplier.leadTime !== undefined ? supplier.leadTime : (supplier.type === 'online' ? 3 : 0);

            if (!product || !libItem) return { 
                supplierName: supplier.name, productCost: 0, logisticsCost: 0, totalCost: Infinity, 
                note: 'ไม่มีของ', isFeasible: false, leadTime, daysLeft: item.daysLeft 
            };

            const packsToBuy = Math.ceil(item.toBuy / (libItem.totalQuantity || 1));
            const productCost = product.price * packsToBuy;
            
            let logisticsCost = 0;
            let note = "";
            let isFeasible = true;

            // Logic 3: Dynamic Lead Time Check (Safety Stock)
            if (leadTime > item.daysLeft) {
                // If forced, we ignore feasibility warning but mark note
                if (forcedSuppliers[item.id] !== supplier.id) {
                     isFeasible = false;
                     note = `ส่งไม่ทัน (รอ ${leadTime} วัน)`;
                } else {
                     note = `⚠️ เสี่ยงส่งไม่ทัน (รอ ${leadTime} วัน)`;
                }
            } else {
                if (supplier.type === 'online') {
                    logisticsCost = 30; // Standard shipping
                    note = "ค่าส่ง";
                } else {
                    // Physical
                    if (supplier.isHome) {
                        logisticsCost = 0;
                        note = "มีของที่บ้าน";
                    } else if (isStoreActive) {
                        logisticsCost = 0; // Sunk cost! Visiting anyway.
                        note = "ทางผ่าน/แวะอยู่แล้ว";
                    } else {
                        // Precise Distance Calculation (if available)
                        if (supplier.distanceKm && supplier.distanceKm > 0) {
                            const costPerKm = 5; // Assume 5 THB per km (fuel + wear)
                            logisticsCost = supplier.distanceKm * costPerKm;
                            note = `ค่าเดินทาง ${supplier.distanceKm} กม.`;
                        } else {
                            // Fallback to Index Proxy
                            const idx = state.suppliers.findIndex(s => s.id === supplier.id);
                            logisticsCost = 50 + (idx * 20); 
                            note = "ค่าน้ำมัน (ประมาณการ)";
                        }
                    }
                }
            }

            return {
                supplierName: supplier.name,
                productCost,
                logisticsCost,
                totalCost: isFeasible ? productCost + logisticsCost : Infinity,
                note,
                isFeasible,
                leadTime,
                daysLeft: item.daysLeft
            };
        };

        // Pre-Pass: Identify Forced Stores to set them as "Active" for Sunk Cost calculation
        Object.keys(forcedSuppliers).forEach(itemId => {
             const supplierId = forcedSuppliers[itemId];
             const supplier = state.suppliers.find(s => s.id === supplierId);
             if (supplier && supplier.type === 'physical') {
                 activePhysicalStores.add(supplier.id);
             }
        });

        // --- MAIN PASS: Evaluate All Items ---
        neededItems.forEach(item => {
            let bestOption: PurchaseOption | null = null;
            let minCost = Infinity;
            const comparisons: CostBreakdown[] = [];
            const forcedSupplierId = forcedSuppliers[item.id];

            state.suppliers.forEach(supplier => {
                const isActive = activePhysicalStores.has(supplier.id);
                const breakdown = calculateOptionCost(item, supplier, isActive);
                comparisons.push(breakdown);

                const isForced = supplier.id === forcedSupplierId;
                
                // Logic: 
                // 1. If Forced -> Always Pick (Unless product strictly unavailable)
                // 2. Else -> Pick Cheapest Feasible
                
                if (breakdown.totalCost !== Infinity) { // If product exists
                    if (isForced) {
                        // FORCE PICK
                        bestOption = {
                            item,
                            supplierId: supplier.id,
                            supplierName: supplier.name,
                            supplierType: supplier.type,
                            unitPrice: breakdown.productCost / item.toBuy,
                            qty: item.toBuy,
                            totalProductCost: breakdown.productCost,
                            reason: "📌 คุณเลือกเอง (User Pick)",
                            analysis: { winner: breakdown, allOptions: [] } // Will fill allOptions later
                        };
                        // Override cost for comparisons logic
                        minCost = -1; 
                    } else if (minCost !== -1) {
                        // Normal Logic (Only if not already forced)
                        if (breakdown.isFeasible && breakdown.totalCost < minCost) {
                            minCost = breakdown.totalCost;
                            let reason = "ราคาดีที่สุด";
                            
                            if (item.isUrgent) reason = "ของด่วน (ต้องได้ของทันที)";
                            else if (supplier.type === 'physical' && isActive) reason = "พ่วงซื้อ (ประหยัดค่ารถ)";
                            else if (supplier.type === 'online') reason = "สั่ง Online ถูกกว่า";
                            else if (breakdown.leadTime > 0) reason = `รอของได้ (${breakdown.leadTime} วัน)`;

                            bestOption = {
                                item,
                                supplierId: supplier.id,
                                supplierName: supplier.name,
                                supplierType: supplier.type,
                                unitPrice: breakdown.productCost / item.toBuy,
                                qty: item.toBuy,
                                totalProductCost: breakdown.productCost,
                                reason,
                                analysis: { winner: breakdown, allOptions: [] }
                            };
                        }
                    }
                }
            });

            if (bestOption) {
                (bestOption as PurchaseOption).analysis.allOptions = comparisons.sort((a,b) => a.totalCost - b.totalCost);
                (bestOption as PurchaseOption).analysis.runnerUp = comparisons.find(c => c.supplierName !== (bestOption as PurchaseOption)?.supplierName && c.totalCost !== Infinity);
                plan.push(bestOption);
                
                if ((bestOption as PurchaseOption).supplierType === 'physical') {
                    activePhysicalStores.add((bestOption as PurchaseOption).supplierId);
                }
            } else {
                unassigned.push(item);
            }
        });

        // Group by Supplier
        const routeGroups: Record<string, RouteGroup> = {};
        plan.forEach(opt => {
            if (!routeGroups[opt.supplierId]) {
                const sup = state.suppliers.find(s => s.id === opt.supplierId)!;
                routeGroups[opt.supplierId] = { supplier: sup, items: [], totalCost: 0 };
            }
            routeGroups[opt.supplierId].items.push(opt);
            routeGroups[opt.supplierId].totalCost += opt.totalProductCost;
        });

        return { routeGroups, unassigned, allItems: neededItems };
    }, [neededItems, state.suppliers, state.centralIngredients, forcedSuppliers]);

    return shoppingPlan;
};
