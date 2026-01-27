
import React, { useState, useMemo, useCallback } from 'react';
import { AppState, MenuItem, Order, OrderItem } from '../../types';
import { useAlert } from '../AlertSystem';

// Import UI Components (Previously inline code, now organized)
import ShiftSetup from './pos/ShiftSetup';
import { MenuGrid, CartPanel } from './pos/POSLayouts';
import { 
    PaymentModal, 
    KitchenDisplay, 
    ShiftHistoryModal, 
    FullHistoryModal, 
    ShiftSummaryModal, 
    OpenShiftSuccessModal, 
    OpeningShiftLoadingModal, 
    ProductCustomizeModal,
    WaitingBillsModal 
} from './pos/modals';
import { CLOSING_BLESSINGS } from './pos/blessingsData';

interface OrderTakingProps {
    state: AppState;
    processOrder: (order: Order) => void;
    updateOrderStatus: (id: string, status: Order['status']) => void;
    // New Props for split actions (Logic moved to useOrderActions.ts)
    sendOrderToKitchen?: (order: Order) => void; 
    collectPayment?: (order: Order) => void;
}

const OrderTaking: React.FC<OrderTakingProps> = ({ state, processOrder, updateOrderStatus, sendOrderToKitchen, collectPayment }) => {
    const { showAlert, showConfirm } = useAlert();
    
    // --- SHIFT / DATE STATE ---
    const [shiftDate, setShiftDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isShiftStarted, setIsShiftStarted] = useState(false);
    
    // Modals for opening logic
    const [showOpenShiftSuccess, setShowOpenShiftSuccess] = useState(false);
    const [isOpeningShift, setIsOpeningShift] = useState(false);

    // --- POS STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [orderType, setOrderType] = useState<'dine_in' | 'take_away'>('take_away');
    const [cart, setCart] = useState<OrderItem[]>([]);
    
    // Logic: Item Aggregation
    const [separateItems, setSeparateItems] = useState(false);
    
    // --- POST-PAID FLOW STATE ---
    const [activeBillId, setActiveBillId] = useState<string | null>(null); // Stores ID of the bill currently being paid
    const [showWaitingBills, setShowWaitingBills] = useState(false);

    // Modal States
    const [showPayment, setShowPayment] = useState(false);
    const [showKDS, setShowKDS] = useState(false);
    const [showHistory, setShowHistory] = useState(false); 
    const [showAllOrdersHistory, setShowAllOrdersHistory] = useState(false);
    const [showFullHistoryModal, setShowFullHistoryModal] = useState(false);
    const [showShiftSummary, setShowShiftSummary] = useState(false);
    const [selectedMenuForCustomize, setSelectedMenuForCustomize] = useState<MenuItem | null>(null);

    // Payment Logic
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'delivery'>('cash');
    const [deliveryChannel, setDeliveryChannel] = useState<'Grab' | 'Lineman' | 'Shopee'>('Grab');
    const [cashReceived, setCashReceived] = useState<string>('');

    // History Filter
    const [historyFilterStart, setHistoryFilterStart] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
    const [historyFilterEnd, setHistoryFilterEnd] = useState(new Date().toISOString().split('T')[0]);

    // --- DATA & CALCULATIONS ---
    const availableToppings = useMemo(() => state.centralIngredients.filter(i => i.subCategory === 'topping'), [state.centralIngredients]);

    const expiringMenuIds = useMemo(() => {
        const expiringIngredients = new Set<string>();
        const today = new Date();
        state.inventory.forEach(item => {
            if (item.expiryDate) {
                const expiry = new Date(item.expiryDate);
                if (Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) <= 3) {
                    expiringIngredients.add(item.name.toLowerCase());
                }
            }
        });
        const menuIds = new Set<string>();
        state.menuItems.forEach(menu => {
            if (menu.ingredients.some(ing => expiringIngredients.has(ing.name.toLowerCase()))) menuIds.add(menu.id);
        });
        return menuIds;
    }, [state.inventory, state.menuItems]);

    const ordersForThisShift = useMemo(() => state.orders.filter(o => o.timestamp.startsWith(shiftDate)), [state.orders, shiftDate]);
    
    // Status Logic: 'cooking' = In Kitchen, 'served' = Done Cooking (Wait Pay), 'completed' = Paid
    const waitingOrders = useMemo(() => ordersForThisShift.filter(o => o.status === 'cooking' || o.status === 'pending' || o.status === 'served'), [ordersForThisShift]);
    
    const activeOrders = useMemo(() => ordersForThisShift.filter(o => o.status !== 'completed' && o.status !== 'cancelled'), [ordersForThisShift]);
    
    const lastQueue = ordersForThisShift.length > 0 ? Math.max(...ordersForThisShift.map(o => o.queueNumber)) : 0;
    const nextQueue = (lastQueue % 99) + 1;

    // Resolve Queue Number: If editing active bill, show that number. Else show next.
    const displayQueue = activeBillId 
        ? ordersForThisShift.find(o => o.id === activeBillId)?.queueNumber || nextQueue 
        : nextQueue;

    const categories = useMemo(() => ['All', ...Array.from(new Set(state.menuItems.map(m => m.category || 'General')))], [state.menuItems]);

    const filteredMenus = useMemo(() => {
        const filtered = state.menuItems.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === 'All' || (m.category || 'General') === selectedCategory)
        );
        return filtered.sort((a, b) => {
            const aExp = expiringMenuIds.has(a.id) ? 1 : 0;
            const bExp = expiringMenuIds.has(b.id) ? 1 : 0;
            if (bExp !== aExp) return bExp - aExp;
            const catA = a.category || 'General';
            const catB = b.category || 'General';
            if (catA !== catB) return catA.localeCompare(catB);
            return a.name.localeCompare(b.name);
        });
    }, [state.menuItems, searchTerm, selectedCategory, expiringMenuIds]);

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

    const gpAmount = useMemo(() => {
        if (paymentMethod !== 'delivery') return 0;
        return Math.ceil(cartTotal * (state.hiddenPercentages.paymentFee / 100));
    }, [cartTotal, paymentMethod, state.hiddenPercentages.paymentFee]);

    const netTotal = cartTotal - gpAmount;
    const change = Number(cashReceived) - cartTotal;

    const shiftTotalSales = useMemo(() => ordersForThisShift.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalPrice, 0), [ordersForThisShift]);
    
    const salesHistoryLog = useMemo(() => {
        const historyMap: Record<string, { total: number; count: number }> = {};
        state.orders.forEach(o => {
            if (o.status === 'completed') {
                const date = o.timestamp.split('T')[0];
                if (!historyMap[date]) historyMap[date] = { total: 0, count: 0 };
                historyMap[date].total += o.totalPrice;
                historyMap[date].count += 1;
            }
        });
        return Object.entries(historyMap).sort((a, b) => b[0].localeCompare(a[0]));
    }, [state.orders]);

    // --- HELPER: CONSTRUCT ORDER OBJECT ---
    const createOrderObject = useCallback((status: Order['status']): Order => {
        const currentTime = new Date();
        const timeString = currentTime.toLocaleTimeString('en-GB', { hour12: false });
        const isoTimestamp = `${shiftDate}T${timeString}`;
        const orderId = crypto.randomUUID ? crypto.randomUUID() : `ord-${Date.now()}`;

        return {
            id: orderId,
            queueNumber: displayQueue,
            timestamp: isoTimestamp,
            status: status,
            items: cart,
            totalPrice: cartTotal,
            netTotal: netTotal,
            paymentMethod,
            channel: paymentMethod === 'delivery' ? deliveryChannel : orderType === 'dine_in' ? 'Dine-In' : 'Take-Away',
            gpDeduction: gpAmount
        };
    }, [shiftDate, displayQueue, cart, cartTotal, netTotal, paymentMethod, deliveryChannel, orderType, gpAmount]);

    // --- HANDLERS ---
    const handleStartShift = () => { setIsOpeningShift(true); setTimeout(() => { setIsOpeningShift(false); if (ordersForThisShift.length > 0) setIsShiftStarted(true); else setShowOpenShiftSuccess(true); }, 1500); };
    const confirmStartShift = () => { setShowOpenShiftSuccess(false); setIsShiftStarted(true); };

    const handleAddToCart = (menu: MenuItem, customize: boolean) => {
        if (customize) setSelectedMenuForCustomize(menu);
        else {
            const newItem: OrderItem = { id: `item-${Date.now()}`, menuId: menu.id, name: menu.name, price: menu.sellingPrice, quantity: 1, modifiers: [], toppings: [], image: menu.image };
            setCart(prev => {
                if (!separateItems) {
                    const idx = prev.findIndex(i => i.menuId === newItem.menuId && JSON.stringify(i.modifiers) === JSON.stringify(newItem.modifiers) && JSON.stringify(i.toppings) === JSON.stringify(newItem.toppings));
                    if (idx !== -1) { const newCart = [...prev]; newCart[idx].quantity += 1; return newCart; }
                }
                return [...prev, newItem];
            });
        }
    };

    const confirmAddToCart = (data: { qty: number, modifiers: string[], toppings: any[] }) => {
        if (!selectedMenuForCustomize) return;
        const menu = selectedMenuForCustomize;
        const toppingsPrice = data.toppings.reduce((sum, t) => sum + t.price, 0);
        const newItem: OrderItem = { id: `item-${Date.now()}`, menuId: menu.id, name: menu.name, price: menu.sellingPrice + toppingsPrice, quantity: data.qty, modifiers: data.modifiers, toppings: data.toppings, image: menu.image };
        setCart(prev => {
            if (!separateItems) {
                const idx = prev.findIndex(i => i.menuId === newItem.menuId && JSON.stringify(i.modifiers) === JSON.stringify(newItem.modifiers) && JSON.stringify(i.toppings) === JSON.stringify(newItem.toppings));
                if (idx !== -1) { const newCart = [...prev]; newCart[idx].quantity += data.qty; return newCart; }
            }
            return [...prev, newItem];
        });
        setSelectedMenuForCustomize(null);
    };

    const updateCartQty = (id: string, d: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i));
    const updateCartItemNote = (id: string, n: string) => setCart(prev => prev.map(i => i.id === id ? { ...i, notes: n } : i));
    const removeCartItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
    const toggleModifier = (id: string, m: string) => setCart(prev => prev.map(i => i.id === id ? { ...i, modifiers: i.modifiers?.includes(m) ? i.modifiers.filter(x => x !== m) : [...(i.modifiers || []), m] } : i));

    // --- MAIN ACTION HANDLERS ---

    const handleActionClick = () => {
        if (cart.length === 0) return;

        if (activeBillId) {
            // Case: Paying for existing bill -> Go to Payment Modal
            setShowPayment(true);
        } else {
            // Case: New Order -> Send to Kitchen (Stock Deduct)
            handleSendToKitchen();
        }
    };

    const handleSendToKitchen = async () => {
        // Validation: Logic safety check
        if (!sendOrderToKitchen) {
             console.error("System Error: missing sendOrderToKitchen prop. Please refresh.");
             await showAlert("ระบบขัดข้อง: ไม่พบฟังก์ชันส่งครัว (กรุณารีเฟรชหน้าจอ)", 'error');
             return;
        }
        
        // 1. Construct Order with 'cooking' status
        const newOrder = createOrderObject('cooking');

        // 2. Perform Stock Deduction & Save to DB
        // Logic handled in hooks/features/useOrderActions.ts -> sendOrderToKitchen
        sendOrderToKitchen(newOrder);
        
        await showAlert(`ส่งเข้าครัวเรียบร้อย! (ตัดสต็อกแล้ว)`, 'success');
        
        // 3. Reset UI
        setCart([]); 
    };

    // --- NEW HANDLER: Quick Pay from KDS ---
    const handlePaymentFromKDS = (order: Order) => {
        // 1. Update Status to Served (To be safe)
        updateOrderStatus(order.id, 'served');

        // 2. Load Order into Cart / Active Bill Context
        setActiveBillId(order.id);
        setCart(order.items || []);
        setOrderType((order.channel === 'Dine-In' ? 'dine_in' : 'take_away'));

        // 3. Switch Modals
        setShowKDS(false);
        setShowPayment(true);
    };

    const handlePaymentCheckout = async () => {
        // This function is triggered by "Confirm Payment" in the modal
        // It connects to REAL accounting via 'collectPayment' -> 'useFinanceActions'
        
        if (activeBillId && collectPayment) {
             // === FLOW 2: PAY EXISTING BILL (Post-Paid) ===
             const existingOrder = state.orders.find(o => o.id === activeBillId);
             
             if (existingOrder) {
                 // Merge existing ID/Queue with new Payment Info
                 const updatedOrder: Order = {
                     ...existingOrder,
                     // Override with latest payment details from Modal
                     totalPrice: cartTotal,
                     netTotal: netTotal,
                     paymentMethod: paymentMethod,
                     channel: paymentMethod === 'delivery' ? deliveryChannel : existingOrder.channel,
                     gpDeduction: gpAmount,
                     status: 'completed' // Mark as Paid
                 };
                 
                 // Execute Payment (Ledger + Update Status)
                 collectPayment(updatedOrder);
                 await showAlert(`รับเงินและลงบัญชีเรียบร้อย! (คิว #${existingOrder.queueNumber})`, 'success');
             }
        } else {
             // === FLOW 3: INSTANT PAY (Pre-Paid / Fallback) ===
             const newOrder = createOrderObject('completed'); // Direct to completed
             
             // Use processOrder (Legacy wrapper that does BOTH Send+Pay)
             processOrder(newOrder);
             await showAlert(`รับเงินและลงบัญชีเรียบร้อย!`, 'success');
        }

        // Cleanup
        setCart([]);
        setActiveBillId(null);
        setShowPayment(false);
        setCashReceived('');
        setOrderType('take_away'); // Reset default
    };

    const handleSelectWaitingBill = (order: Order) => {
        setActiveBillId(order.id);
        setCart(order.items || []); // Load items back to cart
        setShowWaitingBills(false);
        setOrderType((order.channel === 'Dine-In' ? 'dine_in' : 'take_away'));
    };

    const handleClearCart = () => {
        if (activeBillId) {
            // Cancel editing, return to new order mode
            setActiveBillId(null);
            setCart([]);
        } else {
            setCart([]);
        }
    };

    const handleVoidOrder = async (orderId: string) => {
        if (await showConfirm('ต้องการยกเลิกบิลนี้ใช่ไหม?')) updateOrderStatus(orderId, 'cancelled');
    };

    const handleCloseShift = async () => { if (await showConfirm("ต้องการปิดยอดขายและปิดร้านเลยใช่ไหมครับ?")) setShowShiftSummary(true); };
    const confirmCloseShift = async () => { setShowShiftSummary(false); const msg = CLOSING_BLESSINGS[Math.floor(Math.random()*CLOSING_BLESSINGS.length)]; await showAlert(msg, "success", {title: "ปิดร้านเรียบร้อย"}); setIsShiftStarted(false); setCart([]); };

    if (!isShiftStarted) return (
        <>
            <ShiftSetup 
                shiftDate={shiftDate} 
                setShiftDate={setShiftDate} 
                onStartShift={handleStartShift} 
                salesHistoryLog={salesHistoryLog} 
                onOpenFullHistory={() => setShowFullHistoryModal(true)}
            />
            <FullHistoryModal isOpen={showFullHistoryModal} onClose={() => setShowFullHistoryModal(false)} filterStart={historyFilterStart} setFilterStart={setHistoryFilterStart} filterEnd={historyFilterEnd} setFilterEnd={setHistoryFilterEnd} historyStats={{count:0,total:0}} filteredOrders={[]} onVoidOrder={() => {}} mode="log" salesHistoryLog={salesHistoryLog} onSelectDate={(d) => { setShiftDate(d); handleStartShift(); setShowFullHistoryModal(false); }}/>
            <OpenShiftSuccessModal isOpen={showOpenShiftSuccess} onClose={confirmStartShift}/>
            <OpeningShiftLoadingModal isOpen={isOpeningShift}/>
        </>
    );

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col xl:flex-row gap-4 animate-in fade-in font-cute pb-2 relative">
            <MenuGrid 
                shiftDate={shiftDate} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categories={categories} filteredMenus={filteredMenus} activeOrdersCount={activeOrders.length} addToCart={handleAddToCart} onCloseShift={handleCloseShift} onOpenHistory={() => setShowHistory(true)} onOpenAllHistory={() => setShowAllOrdersHistory(true)} onOpenKDS={() => setShowKDS(true)} expiringMenuIds={expiringMenuIds} separateItems={separateItems} setSeparateItems={setSeparateItems}
            />
            
            <CartPanel 
                cart={cart} nextQueue={nextQueue} orderType={orderType} setOrderType={setOrderType} shiftTotalSales={shiftTotalSales} onOpenShiftHistory={() => setShowHistory(true)} 
                onClearCart={handleClearCart} 
                updateCartItemNote={updateCartItemNote} toggleModifier={toggleModifier} updateCartQty={updateCartQty} removeCartItem={removeCartItem} cartTotal={cartTotal} 
                onCheckout={handleActionClick} 
                // NEW PROPS for Queue Management
                activeBillId={activeBillId}
                activeBillQ={displayQueue}
                onOpenWaitingBills={() => setShowWaitingBills(true)}
                waitingCount={waitingOrders.length}
            />

            <ProductCustomizeModal isOpen={!!selectedMenuForCustomize} onClose={() => setSelectedMenuForCustomize(null)} menu={selectedMenuForCustomize} availableToppings={availableToppings} onConfirm={confirmAddToCart}/>
            
            <PaymentModal 
                isOpen={showPayment} onClose={() => setShowPayment(false)} total={cartTotal} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod as any} deliveryChannel={deliveryChannel} setDeliveryChannel={setDeliveryChannel as any} cashReceived={cashReceived} setCashReceived={setCashReceived} change={change} gpAmount={gpAmount} netTotal={netTotal} gpPercent={state.hiddenPercentages.paymentFee} 
                onCheckout={handlePaymentCheckout} // Main Payment Handler connected to Real Ledger
                cart={cart}
            />

            <WaitingBillsModal 
                isOpen={showWaitingBills}
                onClose={() => setShowWaitingBills(false)}
                orders={waitingOrders}
                onSelectOrder={handleSelectWaitingBill}
            />

            <KitchenDisplay 
                isOpen={showKDS} 
                onClose={() => setShowKDS(false)} 
                shiftDate={shiftDate} 
                activeOrders={activeOrders} 
                updateOrderStatus={updateOrderStatus}
                onPaymentRequest={handlePaymentFromKDS} // Pass the new handler
            />
            
            <ShiftHistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} shiftDate={shiftDate} shiftTotalSales={shiftTotalSales} orders={ordersForThisShift} onVoidOrder={handleVoidOrder}/>
            <FullHistoryModal isOpen={showAllOrdersHistory} onClose={() => setShowAllOrdersHistory(false)} filterStart={historyFilterStart} setFilterStart={setHistoryFilterStart} filterEnd={historyFilterEnd} setFilterEnd={setHistoryFilterEnd} historyStats={{count:0,total:0}} filteredOrders={[]} onVoidOrder={handleVoidOrder} mode="orders"/>
            <ShiftSummaryModal isOpen={showShiftSummary} onClose={() => setShowShiftSummary(false)} shiftDate={shiftDate} orders={ordersForThisShift} onConfirmClose={confirmCloseShift}/>
        </div>
    );
};

export default OrderTaking;
