
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
    { fetchInventoryLayer }: OrderDependencies // Removed unused dependencies
) => {

    const processOrder = async (order: Order) => {
        // --- 1. Optimistic UI Update (Update State Immediately) ---
        setState(prev => {
            const newLedger = [...prev.ledger];
            const newInventory = [...prev.inventory];
            
            // 1.1 Add to Ledger (Income)
            newLedger.unshift({
                id: `txn-${Date.now()}`,
                date: order.timestamp.split('T')[0],
                type: 'income',
                category: order.paymentMethod === 'delivery' ? 'delivery' : 'sales',
                title: `Order #${order.queueNumber} (${order.paymentMethod})`,
                amount: order.totalPrice,
                channel: order.paymentMethod === 'delivery' ? 'delivery' : (order.paymentMethod === 'transfer' ? 'transfer' : 'cash'),
                note: `Queue: ${order.queueNumber}`
            });

            // 1.2 Add GP Expense if Delivery
            if (order.gpDeduction > 0) {
                newLedger.unshift({
                    id: `fee-${Date.now()}`,
                    date: order.timestamp.split('T')[0],
                    type: 'expense',
                    category: 'general', 
                    title: `ค่า GP (${order.channel}) - Order #${order.queueNumber}`,
                    amount: order.gpDeduction,
                    note: `Deducted from ${order.totalPrice}`
                });
            }

            // 1.3 Deduct Inventory (Local State Calculation)
            order.items.forEach(orderItem => {
                // A. Deduct Menu Ingredients
                const menu = prev.menuItems.find(m => m.id === orderItem.menuId);
                if (menu) {
                    menu.ingredients.forEach(ing => {
                        // Find matching inventory item
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

                // B. Deduct Toppings
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
                ledger: newLedger,
                inventory: newInventory,
                orders: [order, ...prev.orders]
            };
        });

        // --- 2. Async Database Updates via Service ---
        if (targetId) {
            try {
                // Delegate all DB logic to the Service
                // Note: We pass state.menuItems so the service knows recipe structure
                await OrderService.createOrder(targetId, order, state.menuItems);
                
                // Refresh Inventory to sync batches accurately
                fetchInventoryLayer(targetId);
            } catch (error) {
                console.error("Failed to sync order to DB:", error);
                // In a real app, you might want to revert the optimistic update or show an error toast here
            }
        }
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
        updateOrderStatus
    };
};
