
import React, { useState, useMemo } from 'react';
import { AppState, MenuItem, Order, OrderItem } from '../../types';
import { useAlert } from '../AlertSystem';

// Import New Components
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
    ProductCustomizeModal 
} from './pos/modals'; // Updated Import Path
import { CLOSING_BLESSINGS } from './pos/blessingsData';

interface OrderTakingProps {
    state: AppState;
    processOrder: (order: Order) => void;
    updateOrderStatus: (id: string, status: Order['status']) => void;
}

const OrderTaking: React.FC<OrderTakingProps> = ({ state, processOrder, updateOrderStatus }) => {
    const { showAlert, showConfirm } = useAlert();
    
    // --- SHIFT / DATE STATE ---
    const [shiftDate, setShiftDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isShiftStarted, setIsShiftStarted] = useState(false);
    
    // New: Modals for opening logic
    const [showOpenShiftSuccess, setShowOpenShiftSuccess] = useState(false);
    const [isOpeningShift, setIsOpeningShift] = useState(false); // Loading state

    // --- POS STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [orderType, setOrderType] = useState<'dine_in' | 'take_away'>('take_away');
    const [cart, setCart] = useState<OrderItem[]>([]);
    
    // Logic: Item Aggregation
    const [separateItems, setSeparateItems] = useState(false); // Default: Merge items (false)
    
    // Modal States
    const [showPayment, setShowPayment] = useState(false);
    const [showKDS, setShowKDS] = useState(false);
    const [showHistory, setShowHistory] = useState(false); // Current Shift
    const [showAllOrdersHistory, setShowAllOrdersHistory] = useState(false); // Full Search
    const [showFullHistoryModal, setShowFullHistoryModal] = useState(false); // For Setup Screen
    const [showShiftSummary, setShowShiftSummary] = useState(false); // New Summary Modal
    
    // Customize Modal State
    const [selectedMenuForCustomize, setSelectedMenuForCustomize] = useState<MenuItem | null>(null);

    // Payment Logic
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'delivery'>('cash');
    const [deliveryChannel, setDeliveryChannel] = useState<'Grab' | 'Lineman' | 'Shopee'>('Grab');
    const [cashReceived, setCashReceived] = useState<string>('');

    // History Filter
    const [historyFilterStart, setHistoryFilterStart] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
    const [historyFilterEnd, setHistoryFilterEnd] = useState(new Date().toISOString().split('T')[0]);

    // --- TOPPING DATA ---
    const availableToppings = useMemo(() => {
        return state.centralIngredients.filter(i => i.subCategory === 'topping');
    }, [state.centralIngredients]);

    // --- EXPIRY LOGIC (CHEER SELL) ---
    const expiringMenuIds = useMemo(() => {
        const expiringIngredients = new Set<string>();
        const today = new Date();
        
        state.inventory.forEach(item => {
            if (item.expiryDate) {
                const expiry = new Date(item.expiryDate);
                const diffTime = expiry.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 3) {
                    expiringIngredients.add(item.name.toLowerCase()); // Use name matching
                    // Also check library IDs if linked (simplified to name for now as inventory list is source of truth)
                }
            }
        });

        // Find menus using these ingredients
        const menuIds = new Set<string>();
        state.menuItems.forEach(menu => {
            const hasExpiring = menu.ingredients.some(ing => expiringIngredients.has(ing.name.toLowerCase()));
            if (hasExpiring) menuIds.add(menu.id);
        });

        return menuIds;
    }, [state.inventory, state.menuItems]);

    // --- DATA FILTERING ---
    const ordersForThisShift = useMemo(() => {
        return state.orders.filter(o => o.timestamp.startsWith(shiftDate));
    }, [state.orders, shiftDate]);

    // KDS Sort: FIFO (Oldest First / Queue 1 -> 2 -> 3)
    const activeOrders = useMemo(() => {
        return ordersForThisShift
            .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [ordersForThisShift]);
    
    const salesHistoryLog = useMemo(() => {
        const history: Record<string, { total: number; count: number }> = {};
        state.orders.forEach(o => {
            if (o.status === 'cancelled') return;
            const date = o.timestamp.split('T')[0];
            if (!history[date]) history[date] = { total: 0, count: 0 };
            history[date].total += o.totalPrice;
            history[date].count += 1;
        });
        return Object.entries(history).sort((a, b) => b[0].localeCompare(a[0]));
    }, [state.orders]);

    const filteredAllHistory = useMemo(() => {
        return state.orders.filter(o => {
            const date = o.timestamp.split('T')[0];
            return date >= historyFilterStart && date <= historyFilterEnd;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [state.orders, historyFilterStart, historyFilterEnd]);

    const historyStats = useMemo(() => {
        const validOrders = filteredAllHistory.filter(o => o.status !== 'cancelled');
        return {
            count: validOrders.length,
            total: validOrders.reduce((sum, o) => sum + o.totalPrice, 0)
        };
    }, [filteredAllHistory]);
    
    const lastQueue = ordersForThisShift.length > 0 ? Math.max(...ordersForThisShift.map(o => o.queueNumber)) : 0;
    const nextQueue = (lastQueue % 99) + 1;

    const categories = useMemo(() => {
        const cats = new Set(state.menuItems.map(m => m.category || 'General'));
        return ['All', ...Array.from(cats)];
    }, [state.menuItems]);

    // Enhanced Filter: Sort logic for grouping
    const filteredMenus = useMemo(() => {
        const filtered = state.menuItems.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === 'All' || (m.category || 'General') === selectedCategory)
        );
        
        // Multi-level Sort:
        // 1. Cheer Sell (Expiring) - Priority
        // 2. Category Name (Alphabetical) - For Grouping
        // 3. Menu Name (Alphabetical)
        return filtered.sort((a, b) => {
            const aExp = expiringMenuIds.has(a.id) ? 1 : 0;
            const bExp = expiringMenuIds.has(b.id) ? 1 : 0;
            
            // Priority 1: Expiring Items First
            if (bExp !== aExp) return bExp - aExp;

            // Priority 2: Category Grouping
            const catA = a.category || 'General';
            const catB = b.category || 'General';
            if (catA !== catB) return catA.localeCompare(catB);

            // Priority 3: Name
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

    const shiftTotalSales = useMemo(() => {
        return ordersForThisShift.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0);
    }, [ordersForThisShift]);

    // --- HANDLERS ---
    const handleStartShift = () => {
        // Show Loading Animation First
        setIsOpeningShift(true);

        setTimeout(() => {
            setIsOpeningShift(false);
            if (ordersForThisShift.length > 0) {
                // Already have orders, just enter
                setIsShiftStarted(true);
            } else {
                // New shift, show blessing modal
                setShowOpenShiftSuccess(true);
            }
        }, 1500); // 1.5s delay
    };

    const confirmStartShift = () => {
        setShowOpenShiftSuccess(false);
        setIsShiftStarted(true);
    };

    // Helper: Find identical item in cart
    const findIdenticalItemIndex = (newItem: OrderItem) => {
        return cart.findIndex(item => {
            if (item.menuId !== newItem.menuId) return false;
            // Compare Notes
            if ((item.notes || '') !== (newItem.notes || '')) return false;
            
            // Compare Modifiers (sort to ensure order doesn't matter)
            const mod1 = [...(item.modifiers || [])].sort().join(',');
            const mod2 = [...(newItem.modifiers || [])].sort().join(',');
            if (mod1 !== mod2) return false;

            // Compare Toppings
            const top1 = [...(item.toppings || [])].map(t => t.id).sort().join(',');
            const top2 = [...(newItem.toppings || [])].map(t => t.id).sort().join(',');
            if (top1 !== top2) return false;

            return true;
        });
    };

    const handleAddToCart = (menu: MenuItem, customize: boolean) => {
        if (customize) {
            // Open Modal for customization
            setSelectedMenuForCustomize(menu);
        } else {
            // Quick Add (Default)
            const newItem: OrderItem = {
                id: `item-${Date.now()}`,
                menuId: menu.id,
                name: menu.name,
                price: menu.sellingPrice,
                quantity: 1,
                modifiers: [],
                toppings: [],
                image: menu.image
            };

            setCart(prev => {
                // If Merge is ON (separateItems = false), try to merge
                if (!separateItems) {
                    const existingIdx = findIdenticalItemIndex(newItem);
                    if (existingIdx !== -1) {
                        const newCart = [...prev];
                        newCart[existingIdx] = { 
                            ...newCart[existingIdx], 
                            quantity: newCart[existingIdx].quantity + 1 
                        };
                        return newCart;
                    }
                }
                return [...prev, newItem];
            });
        }
    };

    const confirmAddToCart = (data: { qty: number, modifiers: string[], toppings: any[] }) => {
        if (!selectedMenuForCustomize) return;
        
        const menu = selectedMenuForCustomize;
        const toppingsPrice = data.toppings.reduce((sum, t) => sum + t.price, 0);
        const itemPrice = menu.sellingPrice + toppingsPrice;

        const newItem: OrderItem = {
            id: `item-${Date.now()}`,
            menuId: menu.id,
            name: menu.name,
            price: itemPrice,
            quantity: data.qty,
            modifiers: data.modifiers,
            toppings: data.toppings,
            image: menu.image
        };

        setCart(prev => {
            // If Merge is ON (separateItems = false), try to merge
            if (!separateItems) {
                const existingIdx = findIdenticalItemIndex(newItem);
                if (existingIdx !== -1) {
                    const newCart = [...prev];
                    newCart[existingIdx] = { 
                        ...newCart[existingIdx], 
                        quantity: newCart[existingIdx].quantity + data.qty 
                    };
                    return newCart;
                }
            }
            return [...prev, newItem];
        });
        setSelectedMenuForCustomize(null);
    };

    const updateCartQty = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
    };

    const updateCartItemNote = (itemId: string, note: string) => {
        setCart(prev => prev.map(i => i.id === itemId ? { ...i, notes: note } : i));
    };

    const removeCartItem = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const toggleModifier = (itemId: string, mod: string) => {
        setCart(prev => prev.map(i => i.id === itemId ? { ...i, modifiers: (i.modifiers || []).includes(mod) ? i.modifiers!.filter(m => m !== mod) : [...(i.modifiers || []), mod] } : i));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        
        const currentTime = new Date();
        // FORCE Timestamp to match Shift Date Day to allow Queue Running & Filter to work correctly
        // We concatenate shiftDate (YYYY-MM-DD) with current Time
        const timeString = currentTime.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS
        const isoTimestamp = `${shiftDate}T${timeString}`;

        const orderId = crypto.randomUUID ? crypto.randomUUID() : `ord-${Date.now()}`;

        const newOrder: Order = {
            id: orderId, 
            queueNumber: nextQueue,
            timestamp: isoTimestamp,
            status: 'pending',
            items: cart,
            totalPrice: cartTotal,
            netTotal: netTotal,
            paymentMethod,
            channel: paymentMethod === 'delivery' ? deliveryChannel : orderType === 'dine_in' ? 'Dine-In' : 'Take-Away',
            gpDeduction: gpAmount
        };

        processOrder(newOrder);
        await showAlert(`รับออเดอร์คิว #${newOrder.queueNumber} เรียบร้อย!`, 'success');
        setCart([]);
        setShowPayment(false);
        setCashReceived('');
        setOrderType('take_away'); 
    };

    const handleVoidOrder = async (orderId: string) => {
        if (await showConfirm('ต้องการยกเลิกบิลนี้ใช่ไหม? (สต็อกจะคืนค่าไม่ได้ในเวอร์ชั่นนี้)')) {
            updateOrderStatus(orderId, 'cancelled');
        }
    };

    const handleCloseShift = async () => {
        if (await showConfirm("ต้องการปิดยอดขายและปิดร้านเลยใช่ไหมครับ?")) {
            setShowShiftSummary(true);
        }
    };

    const confirmCloseShift = async () => {
        setShowShiftSummary(false);
        const randomMsg = CLOSING_BLESSINGS[Math.floor(Math.random() * CLOSING_BLESSINGS.length)];
        await showAlert(randomMsg, "success", { title: "ปิดร้านเรียบร้อย" });
        setIsShiftStarted(false);
        setCart([]);
    };

    // --- SCREEN RENDER ---
    if (!isShiftStarted) {
        return (
            <>
                <ShiftSetup 
                    shiftDate={shiftDate}
                    setShiftDate={setShiftDate}
                    onStartShift={handleStartShift}
                    salesHistoryLog={salesHistoryLog}
                    onOpenFullHistory={() => setShowFullHistoryModal(true)}
                />
                
                <FullHistoryModal 
                    isOpen={showFullHistoryModal}
                    onClose={() => setShowFullHistoryModal(false)}
                    filterStart={historyFilterStart}
                    setFilterStart={setHistoryFilterStart}
                    filterEnd={historyFilterEnd}
                    setFilterEnd={setHistoryFilterEnd}
                    historyStats={historyStats}
                    filteredOrders={[]} 
                    onVoidOrder={() => {}} 
                    mode="log"
                    salesHistoryLog={salesHistoryLog}
                    onSelectDate={(d) => { setShiftDate(d); handleStartShift(); setShowFullHistoryModal(false); }}
                />

                <OpenShiftSuccessModal 
                    isOpen={showOpenShiftSuccess}
                    onClose={confirmStartShift}
                />

                <OpeningShiftLoadingModal 
                    isOpen={isOpeningShift}
                />
            </>
        );
    }

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col xl:flex-row gap-4 animate-in fade-in font-cute pb-2 relative">
            
            {/* Left Panel */}
            <MenuGrid 
                shiftDate={shiftDate}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                filteredMenus={filteredMenus}
                activeOrdersCount={activeOrders.length}
                addToCart={handleAddToCart} 
                onCloseShift={handleCloseShift}
                onOpenHistory={() => setShowHistory(true)}
                onOpenAllHistory={() => setShowAllOrdersHistory(true)}
                onOpenKDS={() => setShowKDS(true)}
                expiringMenuIds={expiringMenuIds} 
                separateItems={separateItems}
                setSeparateItems={setSeparateItems}
            />

            {/* Right Panel */}
            <CartPanel 
                cart={cart}
                nextQueue={nextQueue}
                orderType={orderType}
                setOrderType={setOrderType}
                shiftTotalSales={shiftTotalSales}
                onOpenShiftHistory={() => setShowHistory(true)}
                onClearCart={() => setCart([])}
                updateCartItemNote={updateCartItemNote}
                toggleModifier={toggleModifier}
                updateCartQty={updateCartQty}
                removeCartItem={removeCartItem}
                cartTotal={cartTotal}
                onCheckout={() => setShowPayment(true)}
            />

            {/* --- MODALS --- */}
            
            <ProductCustomizeModal 
                isOpen={!!selectedMenuForCustomize}
                onClose={() => setSelectedMenuForCustomize(null)}
                menu={selectedMenuForCustomize}
                availableToppings={availableToppings}
                onConfirm={confirmAddToCart}
            />

            <PaymentModal 
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
                total={cartTotal}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod as any}
                deliveryChannel={deliveryChannel}
                setDeliveryChannel={setDeliveryChannel as any}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
                change={change}
                gpAmount={gpAmount}
                netTotal={netTotal}
                gpPercent={state.hiddenPercentages.paymentFee}
                onCheckout={handleCheckout}
                cart={cart}
            />

            <KitchenDisplay 
                isOpen={showKDS}
                onClose={() => setShowKDS(false)}
                shiftDate={shiftDate}
                activeOrders={activeOrders}
                updateOrderStatus={updateOrderStatus}
            />

            <ShiftHistoryModal 
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                shiftDate={shiftDate}
                shiftTotalSales={shiftTotalSales}
                orders={ordersForThisShift}
                onVoidOrder={handleVoidOrder}
            />

            <FullHistoryModal 
                isOpen={showAllOrdersHistory}
                onClose={() => setShowAllOrdersHistory(false)}
                filterStart={historyFilterStart}
                setFilterStart={setHistoryFilterStart}
                filterEnd={historyFilterEnd}
                setFilterEnd={setHistoryFilterEnd}
                historyStats={historyStats}
                filteredOrders={filteredAllHistory}
                onVoidOrder={handleVoidOrder}
                mode="orders"
            />

            <ShiftSummaryModal 
                isOpen={showShiftSummary}
                onClose={() => setShowShiftSummary(false)}
                shiftDate={shiftDate}
                orders={ordersForThisShift}
                onConfirmClose={confirmCloseShift}
            />

        </div>
    );
};

export default OrderTaking;
