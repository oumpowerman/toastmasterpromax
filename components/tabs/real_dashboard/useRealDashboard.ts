
import { useMemo } from 'react';
import { AppState, InventoryItem, Order } from '../../../types';
import { calculateTotalFixedCostPerDay } from '../../../utils/calculations';

export const useRealDashboard = (state: AppState) => {
    // --- DATA PROCESSING ---
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Filter Orders
    const todayOrders = useMemo(() => 
        state.orders.filter(o => o.timestamp.startsWith(today) && o.status !== 'cancelled'), 
    [state.orders, today]);

    // 2. Sales Summary
    const todaySales = useMemo(() => todayOrders.reduce((sum, o) => sum + o.totalPrice, 0), [todayOrders]);
    const billCount = todayOrders.length;

    // 3. COGS Calculation (Approximate based on current menu cost)
    const todayCOGS = useMemo(() => {
        return todayOrders.reduce((total, order) => {
            const orderCost = order.items.reduce((sum, item) => {
                // Find current cost structure
                const menu = state.menuItems.find(m => m.id === item.menuId);
                if (menu) {
                    const baseCost = menu.ingredients.reduce((s, i) => s + i.cost, 0);
                    // Include Hidden Costs (Waste, etc.)
                    const multiplier = (state.hiddenPercentages.waste + state.hiddenPercentages.promoLoss) / 100;
                    return sum + ((baseCost * (1 + multiplier)) * item.quantity);
                }
                return sum;
            }, 0);
            return total + orderCost;
        }, 0);
    }, [todayOrders, state.menuItems, state.hiddenPercentages]);

    // 4. Fixed Cost Calculation
    const dailyFixedCost = useMemo(() => calculateTotalFixedCostPerDay(state), [state]);

    // 5. Net Profit
    const todayNetProfit = todaySales - todayCOGS - dailyFixedCost;

    // Check if Fixed Cost is already logged in Ledger for TODAY
    const hasLoggedFixedCost = useMemo(() => {
        return state.ledger.some(l => 
            l.date === today && 
            (l.category === 'rent' || l.category === 'labor' || l.title.includes('ค่าใช้จ่ายคงที่'))
        );
    }, [state.ledger, today]);

    // 6. Payment Breakdown
    const paymentStats = useMemo(() => {
        const stats = {
            cash: { total: 0, count: 0, orders: [] as Order[] },
            transfer: { total: 0, count: 0, orders: [] as Order[] },
            delivery: { total: 0, count: 0, orders: [] as Order[] }
        };

        todayOrders.forEach(o => {
            if (o.paymentMethod === 'cash') {
                stats.cash.total += o.totalPrice;
                stats.cash.count++;
                stats.cash.orders.push(o);
            } else if (o.paymentMethod === 'transfer') {
                stats.transfer.total += o.totalPrice;
                stats.transfer.count++;
                stats.transfer.orders.push(o);
            } else if (o.paymentMethod === 'delivery') {
                stats.delivery.total += o.totalPrice;
                stats.delivery.count++;
                stats.delivery.orders.push(o);
            }
        });
        return stats;
    }, [todayOrders]);

    // 7. Item Analysis
    const itemAnalysis = useMemo(() => {
        const itemMap: Record<string, { qty: number, total: number }> = {};
        
        todayOrders.forEach(o => {
            o.items.forEach(i => {
                if (!itemMap[i.name]) itemMap[i.name] = { qty: 0, total: 0 };
                itemMap[i.name].qty += i.quantity;
                itemMap[i.name].total += (i.price * i.quantity);
            });
        });

        return Object.entries(itemMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.qty - a.qty);
    }, [todayOrders]);

    const topItems = itemAnalysis.slice(0, 5);

    // 8. Hourly Traffic
    const hourlyData = useMemo(() => {
        const hours: Record<string, number> = {};
        for(let i=8; i<=20; i++) hours[i] = 0;
        
        todayOrders.forEach(o => {
            const hour = new Date(o.timestamp).getHours();
            if (hours[hour] !== undefined) hours[hour] += o.totalPrice;
        });

        return Object.entries(hours).map(([hour, total]) => ({
            hour: `${hour}:00`,
            total
        }));
    }, [todayOrders]);

    // 9. Low Stock
    const lowStockItems = useMemo(() => 
        state.inventory.filter(i => i.quantity <= i.minLevel && i.type !== 'asset'), 
    [state.inventory]);

    // 10. Target (Mock)
    const dailyTarget = 3000;
    const progressPercent = Math.min((todaySales / dailyTarget) * 100, 100);

    return {
        today,
        todaySales,
        todayCOGS,
        dailyFixedCost,
        todayNetProfit,
        hasLoggedFixedCost, // Export this status
        billCount,
        paymentStats,
        itemAnalysis,
        topItems,
        hourlyData,
        lowStockItems,
        dailyTarget,
        progressPercent,
        todayOrders
    };
};
