
import React from 'react';
import { AppState, Order, LedgerItem } from '../../types';
import { OrderService } from '../../services/orderService';

interface OrderDependencies {
    addLedgerItem: (item: Omit<LedgerItem, 'id'>) => Promise<void>;
    performFifoDeduction: (inventoryItemId: string, amountToDeduct: number) => Promise<void>;
    fetchInventoryLayer: (userId: string) => Promise<void>;
}

export const useOrderActions = (
    state: AppState,
    setState: React.Dispatch<React.SetStateAction<AppState>>,
    targetId: string | undefined,
    { fetchInventoryLayer }: OrderDependencies 
) => {

    // --- PHASE 1: Send to Kitchen (Deduct Stock, Create Order as 'Cooking') ---
    const sendOrderToKitchen = async (order: Order) => {
        // 1. Optimistic Update
        setState(prev => {
            const newInventory = [...prev.inventory];
            
            // Deduct Inventory (Local State)
            order.items.forEach(orderItem => {
                const menu = prev.menuItems.find(m => m.id === orderItem.menuId);
                if (menu) {
                    menu.ingredients.forEach(ing => {
                        const invIndex = newInventory.findIndex(inv => 
                            (ing.masterId && inv.id === ing.masterId) || 
                            (inv.name.trim().toLowerCase() === ing.name.trim().toLowerCase())
                        );
                        if (invIndex >= 0) {
                            const deductQty = (ing.quantity || 0) * orderItem.quantity;
                            newInventory[invIndex] = {
                                ...newInventory[invIndex],
                                quantity: Math.max(0, newInventory[invIndex].quantity - deductQty),
                                lastUpdated: new Date().toISOString()
                            };
                        }
                    });
                }
                // Deduct Toppings
                if (orderItem.toppings && orderItem.toppings.length > 0) {
                    orderItem.toppings.forEach(top => {
                        const invIndex = newInventory.findIndex(inv => 
                            (top.refId && inv.id === top.refId) || 
                            (inv.name.trim().toLowerCase() === top.name.trim().toLowerCase())
                        );
                        if (invIndex >= 0) {
                            const deductQty = 1 * orderItem.quantity; 
                            newInventory[invIndex] = {
                                ...newInventory[invIndex],
                                quantity: Math.max(0, newInventory[invIndex].quantity - deductQty),
                                lastUpdated: new Date().toISOString()
                            };
                        }
                    });
                }
            });

            return {
                ...prev,
                inventory: newInventory,
                orders: [order, ...prev.orders] // Add to orders list
            };
        });

        // 2. DB Sync
        if (targetId) {
            try {
                await OrderService.createKitchenOrder(targetId, order, state.menuItems);
                fetchInventoryLayer(targetId);
            } catch (error) {
                console.error("Failed to send order to kitchen:", error);
            }
        }
    };

    // --- PHASE 2: Collect Payment (Update Status, Add Ledger) ---
    const collectPayment = async (order: Order) => {
        // 1. Optimistic Update
        setState(prev => {
            const newLedger = [...prev.ledger];
            
            // Add Income
            newLedger.unshift({
                id: `txn-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                category: order.paymentMethod === 'delivery' ? 'delivery' : 'sales',
                title: `Order #${order.queueNumber} (${order.paymentMethod})`,
                amount: order.totalPrice,
                channel: order.paymentMethod === 'delivery' ? 'delivery' : (order.paymentMethod === 'transfer' ? 'transfer' : 'cash'),
                note: `Queue: ${order.queueNumber}`
            });

            // Add Expense (GP)
            if (order.gpDeduction > 0) {
                newLedger.unshift({
                    id: `fee-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    type: 'expense',
                    category: 'general', 
                    title: `ค่า GP (${order.channel}) - Order #${order.queueNumber}`,
                    amount: order.gpDeduction,
                    note: `Deducted from ${order.totalPrice}`
                });
            }

            // Update Order Status
            const newOrders = prev.orders.map(o => o.id === order.id ? { 
                ...o, 
                status: 'completed' as Order['status'], // Explicitly cast status
                paymentMethod: order.paymentMethod,
                channel: order.channel,
                netTotal: order.netTotal,
                gpDeduction: order.gpDeduction
            } : o);

            return {
                ...prev,
                ledger: newLedger,
                orders: newOrders
            };
        });

        // 2. DB Sync
        if (targetId) {
            try {
                await OrderService.finalizeOrderPayment(targetId, order);
            } catch (error) {
                console.error("Failed to finalize payment:", error);
            }
        }
    };

    // Legacy method wrapper (if needed)
    const processOrder = async (order: Order) => {
        // This simulates the old "Instant Pay" flow by calling both
        await sendOrderToKitchen({ ...order, status: 'cooking' });
        await collectPayment(order);
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        setState(prev => ({
            ...prev,
            orders: prev.orders.map(o => o.id === orderId ? { ...o, status } : o)
        }));
        
        if (targetId) {
            await OrderService.updateOrderStatus(orderId, status);
        }
    };

    return {
        processOrder,
        sendOrderToKitchen,
        collectPayment,
        updateOrderStatus
    };
};
