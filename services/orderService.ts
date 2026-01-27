
import { supabase } from '../lib/supabase';
import { Order, MenuItem } from '../types';
import { InventoryService } from './inventoryService';

export const OrderService = {
    
    // Original method (kept for backward compatibility if needed, but we will move away from it)
    async createOrder(userId: string, order: Order, menuItems: MenuItem[]) {
        // ... (Legacy code, we can leave it or refactor. 
        // For safety, I will implement the NEW methods below and keep this one strictly as is or alias it)
        
        // RE-IMPLEMENTING LOGIC TO ENSURE ATOMICITY IS HARD WITHOUT FUNCTIONS, 
        // BUT WE WILL USE THE NEW METHODS BELOW FOR THE NEW FLOW.
        await this.createKitchenOrder(userId, order, menuItems);
        await this.finalizeOrderPayment(userId, order);
    },

    // --- NEW: PHASE 1 - Send to Kitchen (Stock Deduct, No Ledger) ---
    async createKitchenOrder(userId: string, order: Order, menuItems: MenuItem[]) {
        // 1. Insert Order to DB (Status should be passed as 'cooking' in the order object)
        const { error } = await supabase.from('orders').insert({
            user_id: userId,
            id: order.id,
            queue_number: order.queueNumber,
            timestamp: order.timestamp,
            status: order.status, // Expected 'cooking'
            items: order.items, 
            total_price: order.totalPrice,
            net_total: order.netTotal,
            payment_method: order.paymentMethod, // Can be placeholder or null initially
            channel: order.channel,
            gp_deduction: order.gpDeduction
        });
        
        if (error) throw error;

        // 2. Calculate & Perform Inventory Deduction (FIFO) & LOGGING
        // Note: We deduct stock NOW because the food is being made.
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
            
            // Log the movement
            await InventoryService.logStockMovement(
                userId, 
                invId, 
                'out', 
                `Kitchen: Order #${order.queueNumber}`, 
                -totalDeduct, 
                order.id
            );
        }
    },

    // --- NEW: PHASE 2 - Collect Payment (Ledger Entry, Update Status) ---
    async finalizeOrderPayment(userId: string, order: Order) {
        // 1. Update Order Status & Payment Details
        const { error } = await supabase.from('orders').update({
            status: 'completed',
            payment_method: order.paymentMethod,
            channel: order.channel,
            total_price: order.totalPrice, // Update incase it changed
            net_total: order.netTotal,
            gp_deduction: order.gpDeduction
        }).eq('id', order.id);

        if (error) throw error;

        // 2. Add Ledger Entry (Income)
        await supabase.from('ledger').insert({
            user_id: userId,
            date: new Date().toISOString().split('T')[0], // Use Transaction Date
            type: 'income',
            category: order.paymentMethod === 'delivery' ? 'delivery' : 'sales',
            title: `Order #${order.queueNumber}`,
            amount: order.totalPrice,
            channel: order.paymentMethod === 'delivery' ? 'delivery' : (order.paymentMethod === 'transfer' ? 'transfer' : 'cash'),
            transaction_date: new Date().toISOString().split('T')[0],
            note: `Queue: ${order.queueNumber}`
        });
        
        // 3. Add Ledger Entry (GP Expense if any)
        if(order.gpDeduction > 0) {
            await supabase.from('ledger').insert({
                user_id: userId,
                date: new Date().toISOString().split('T')[0],
                type: 'expense',
                category: 'general',
                title: `ค่า GP (${order.channel}) - Order #${order.queueNumber}`,
                amount: order.gpDeduction,
                transaction_date: new Date().toISOString().split('T')[0]
            });
        }
    },

    async updateOrderStatus(orderId: string, status: Order['status']) {
        return await supabase.from('orders').update({ status }).eq('id', orderId);
    }
};
