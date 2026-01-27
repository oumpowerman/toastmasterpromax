
import { supabase } from '../lib/supabase';
import { Order, MenuItem } from '../types';
import { InventoryService } from './inventoryService';

export const OrderService = {
    
    async createOrder(userId: string, order: Order, menuItems: MenuItem[]) {
        // 1. Insert Order to DB
        const { error } = await supabase.from('orders').insert({
            user_id: userId,
            id: order.id,
            queue_number: order.queueNumber,
            timestamp: order.timestamp,
            status: order.status,
            items: order.items, 
            total_price: order.totalPrice,
            net_total: order.netTotal,
            payment_method: order.paymentMethod,
            channel: order.channel,
            gp_deduction: order.gpDeduction
        });
        
        if (error) throw error;

        // 2. Add Ledger Entry (Income)
        await supabase.from('ledger').insert({
            user_id: userId,
            date: order.timestamp.split('T')[0],
            type: 'income',
            category: order.paymentMethod === 'delivery' ? 'delivery' : 'sales',
            title: `Order #${order.queueNumber}`,
            amount: order.totalPrice,
            channel: order.paymentMethod === 'delivery' ? 'delivery' : (order.paymentMethod === 'transfer' ? 'transfer' : 'cash'),
            transaction_date: order.timestamp.split('T')[0] // Ensure date consistency
        });
        
        // 3. Add Ledger Entry (GP Expense if any)
        if(order.gpDeduction > 0) {
            await supabase.from('ledger').insert({
                user_id: userId,
                date: order.timestamp.split('T')[0],
                type: 'expense',
                category: 'general',
                title: `GP Fee #${order.queueNumber}`,
                amount: order.gpDeduction,
                transaction_date: order.timestamp.split('T')[0]
            });
        }

        // 4. Calculate & Perform Inventory Deduction (FIFO)
        const deductions: Record<string, number> = {};

        order.items.forEach(orderItem => {
            // A. Menu Ingredients
            const menu = menuItems.find(m => m.id === orderItem.menuId);
            if (menu) {
                menu.ingredients.forEach(ing => {
                    if (ing.masterId) { 
                        deductions[ing.masterId] = (deductions[ing.masterId] || 0) + ((ing.quantity || 0) * orderItem.quantity);
                    }
                });
            }
            
            // B. Toppings Ingredients
            if (orderItem.toppings) {
                orderItem.toppings.forEach(top => {
                    if (top.refId) {
                        deductions[top.refId] = (deductions[top.refId] || 0) + (1 * orderItem.quantity);
                    }
                });
            }
        });

        // Execute Deductions via InventoryService
        for (const [invId, totalDeduct] of Object.entries(deductions)) {
            await InventoryService.performFifoDeduction(invId, totalDeduct);
        }
    },

    async updateOrderStatus(orderId: string, status: Order['status']) {
        return await supabase.from('orders').update({ status }).eq('id', orderId);
    }
};
