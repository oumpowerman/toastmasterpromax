
import React, { useState } from 'react';
import { ShoppingCart, Store, Check, Save, MapPin, GripVertical, Smartphone, Clock, Fuel, Info, CheckCircle2, AlertTriangle, Navigation, ExternalLink, X, Plus, Minus, DollarSign, Calculator } from 'lucide-react';
import { AppState, RouteGroup, NeededItem, Supplier, PurchaseOption } from '../../../types';
import { CuteButton } from '../../UI';

// --- LOCAL INTERFACE DEFINITION ---
export interface CartItemState {
    itemId: string;
    actualQty: number;
    actualPrice: number;
    isComplete: boolean;
}

// --- VIEW 1: SHOPPING MODE (Action) ---
export const ShoppingModeView: React.FC<{
    state: AppState;
    routeGroups: Record<string, RouteGroup>;
    checkedItems: Set<string>; 
    setCheckedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
    handleFinishShopping: (cartData: CartItemState[]) => void;
}> = ({ state, routeGroups, handleFinishShopping }) => {
    
    // Local State for "Real-world" Shopping
    const [cartItems, setCartItems] = useState<Record<string, CartItemState>>({});
    const [editingItem, setEditingItem] = useState<string | null>(null); // ID of item currently being edited/confirmed

    // Helper: Initialize or Get Item State
    const getItemState = (opt: PurchaseOption): CartItemState => {
        if (cartItems[opt.item.id]) return cartItems[opt.item.id];
        return {
            itemId: opt.item.id,
            actualQty: opt.qty,
            actualPrice: opt.totalProductCost, // Default to estimated total
            isComplete: false
        };
    };

    const handleItemClick = (opt: PurchaseOption) => {
        // If already complete, toggle back to edit or unchecked
        const current = getItemState(opt);
        if (current.isComplete) {
            // Uncheck
            const next = { ...cartItems };
            delete next[opt.item.id];
            setCartItems(next);
        } else {
            // Open Edit/Confirm Mode
            setEditingItem(opt.item.id);
            // Initialize if not exist
            if (!cartItems[opt.item.id]) {
                setCartItems(prev => ({ ...prev, [opt.item.id]: current }));
            }
        }
    };

    const confirmItem = (id: string, qty: number, price: number) => {
        setCartItems(prev => ({
            ...prev,
            [id]: { itemId: id, actualQty: qty, actualPrice: price, isComplete: true }
        }));
        setEditingItem(null);
    };

    // --- FIX: Explicit Type Casting to solve 'unknown' errors ---
    const cartValues = Object.values(cartItems) as CartItemState[];
    const routeGroupValues = Object.values(routeGroups) as RouteGroup[];

    const totalActualCost = cartValues
        .filter((i) => i.isComplete)
        .reduce((sum: number, i) => sum + i.actualPrice, 0);

    const totalItemsChecked = cartValues
        .filter((i) => i.isComplete).length;

    // Calculate Estimated vs Actual for Dashboard
    const totalEstimatedCostOfChecked = routeGroupValues
        .flatMap((g) => g.items)
        .filter((opt) => cartItems[opt.item.id]?.isComplete)
        .reduce((sum: number, opt) => sum + opt.totalProductCost, 0);

    const budgetDiff = totalActualCost - totalEstimatedCostOfChecked;

    return (
        <div className="space-y-6 animate-in zoom-in-95 duration-300 pb-28 font-cute">
            
            {/* Header Dashboard */}
            <div className="bg-stone-800 text-white p-6 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 border-4 border-stone-600 gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-green-500 p-3 rounded-full animate-bounce shadow-lg shadow-green-900/50">
                        <ShoppingCart className="text-white" size={32}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">โหมดจ่ายตลาด</h2>
                        <div className="flex gap-2 text-sm font-bold text-stone-400">
                            <span>{totalItemsChecked} รายการ</span>
                            <span>•</span>
                            <span className={budgetDiff > 0 ? "text-red-400" : "text-green-400"}>
                                {budgetDiff > 0 ? `เกินงบ ฿${budgetDiff.toLocaleString()}` : `ประหยัด ฿${Math.abs(budgetDiff).toLocaleString()}`}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right bg-stone-700/50 px-6 py-2 rounded-2xl border border-stone-600">
                    <p className="text-[10px] text-stone-400 font-bold uppercase">ยอดจ่ายจริง (Actual)</p>
                    <p className="text-4xl font-black text-green-400">฿{totalActualCost.toLocaleString()}</p>
                </div>
            </div>

            {/* Lists by Supplier */}
            {state.suppliers.map(supplier => {
                const group = routeGroups[supplier.id];
                if (!group || group.items.length === 0) return null;

                // FIX: Use explicit boolean check for safety
                const isGroupDone = group.items.every(opt => !!cartItems[opt.item.id]?.isComplete);

                return (
                    <div key={supplier.id} className={`bg-white rounded-[2rem] border-2 shadow-sm overflow-hidden transition-all duration-500 ${isGroupDone ? 'opacity-60 border-stone-100' : 'border-stone-200'}`}>
                        {/* Supplier Header with Actions */}
                        <div className="bg-stone-50 p-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl text-white shadow-sm ${supplier.type === 'online' ? 'bg-blue-400' : 'bg-orange-400'}`}>
                                    <Store size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-700 text-lg flex items-center gap-2">
                                        {supplier.name}
                                        {isGroupDone && <CheckCircle2 size={16} className="text-green-500"/>}
                                    </h3>
                                    <p className="text-xs text-stone-400 font-bold">{supplier.locationName}</p>
                                </div>
                            </div>
                            
                            {/* ACTION BUTTONS (Link/Map) */}
                            <div className="flex gap-2 w-full sm:w-auto">
                                {supplier.type === 'online' && supplier.websiteUrl && (
                                    <a href={supplier.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-600 transition-colors shadow-sm">
                                        <Smartphone size={14} /> ไปที่ร้าน (App)
                                    </a>
                                )}
                                {supplier.mapUrl && (
                                    <a href={supplier.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-orange-200 transition-colors">
                                        <Navigation size={14} /> นำทาง
                                    </a>
                                )}
                            </div>
                        </div>
                        
                        <div className="divide-y divide-stone-50">
                            {group.items.map((opt) => {
                                const itemState = getItemState(opt);
                                const isEditing = editingItem === opt.item.id;
                                const isChecked = itemState.isComplete;

                                return (
                                    <div key={opt.item.id} className={`transition-all ${isChecked ? 'bg-green-50/30' : ''}`}>
                                        
                                        {/* Row Content */}
                                        <div 
                                            onClick={() => !isEditing && handleItemClick(opt)}
                                            className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-stone-50 ${isEditing ? 'hidden' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? 'bg-green-500 border-green-500 text-white scale-110' : 'border-stone-300 text-transparent'}`}>
                                                <Check size={16} strokeWidth={4} />
                                            </div>
                                            <div className={`flex-1 ${isChecked ? 'opacity-50' : ''}`}>
                                                <p className={`font-bold text-lg ${isChecked ? 'line-through text-stone-400' : 'text-stone-700'}`}>{opt.item.name}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded font-bold">
                                                        {isChecked ? itemState.actualQty : opt.qty} {opt.item.unit}
                                                    </span>
                                                    {opt.item.isUrgent && !isChecked && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded font-bold animate-pulse">ด่วน!</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${isChecked ? 'text-green-600' : 'text-stone-700'}`}>฿{isChecked ? itemState.actualPrice : opt.totalProductCost}</p>
                                                {!isChecked && <p className="text-[10px] text-stone-400">ประมาณการ</p>}
                                            </div>
                                        </div>

                                        {/* INLINE EDIT FORM */}
                                        {isEditing && (
                                            <div className="p-4 bg-orange-50 border-y-2 border-orange-100 animate-in slide-in-from-top-2">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold text-orange-800 text-lg flex items-center gap-2">
                                                        <Calculator size={20}/> บันทึกยอดจริง
                                                    </h4>
                                                    <button onClick={() => setEditingItem(null)} className="p-1 rounded-full hover:bg-orange-100 text-orange-400"><X size={20}/></button>
                                                </div>
                                                
                                                <div className="flex gap-4 mb-4">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-orange-400 uppercase mb-1 block">ราคาที่จ่าย (รวม)</label>
                                                        <div className="flex items-center bg-white rounded-xl border-2 border-orange-200 px-3 py-2">
                                                            <DollarSign size={16} className="text-orange-300 mr-1"/>
                                                            <input 
                                                                type="number" 
                                                                autoFocus
                                                                className="w-full font-black text-xl text-stone-700 outline-none bg-transparent"
                                                                value={itemState.actualPrice}
                                                                onChange={(e) => setCartItems(prev => ({...prev, [opt.item.id]: { ...itemState, actualPrice: Number(e.target.value) }}))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-1/3">
                                                        <label className="text-[10px] font-bold text-orange-400 uppercase mb-1 block">จำนวน ({opt.item.unit})</label>
                                                        <div className="flex items-center bg-white rounded-xl border-2 border-orange-200 px-1 py-1">
                                                            <button onClick={() => setCartItems(prev => ({...prev, [opt.item.id]: { ...itemState, actualQty: Math.max(1, itemState.actualQty - 1) }}))} className="p-1 text-orange-300 hover:text-orange-600"><Minus size={16}/></button>
                                                            <input 
                                                                type="number" 
                                                                className="w-full font-black text-lg text-center text-stone-700 outline-none bg-transparent"
                                                                value={itemState.actualQty}
                                                                onChange={(e) => setCartItems(prev => ({...prev, [opt.item.id]: { ...itemState, actualQty: Number(e.target.value) }}))}
                                                            />
                                                            <button onClick={() => setCartItems(prev => ({...prev, [opt.item.id]: { ...itemState, actualQty: itemState.actualQty + 1 }}))} className="p-1 text-orange-300 hover:text-orange-600"><Plus size={16}/></button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => confirmItem(opt.item.id, itemState.actualQty, itemState.actualPrice)}
                                                    className="w-full py-3 bg-stone-800 text-white rounded-xl font-bold shadow-lg hover:bg-stone-900 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Check size={20}/> ยืนยัน
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            <div className="fixed bottom-6 left-0 w-full px-6 z-50">
                <button 
                    onClick={() => handleFinishShopping(cartValues.filter((i: CartItemState) => i.isComplete))} 
                    className={`w-full py-4 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-2 hover:scale-105 transition-transform ${totalItemsChecked > 0 ? 'bg-stone-800 text-white' : 'bg-white text-stone-400 border-2 border-stone-200'}`}
                >
                    {totalItemsChecked > 0 ? (
                        <><Save size={24}/> จบการซื้อ ({totalItemsChecked} รายการ)</>
                    ) : (
                        'ยกเลิก / กลับ'
                    )}
                </button>
            </div>
        </div>
    );
};

// --- VIEW 2: PLANNING MODE (Map & Dashboard) ---
export const PlanningView: React.FC<{
    state: AppState;
    routeGroups: Record<string, RouteGroup>;
    allItems: NeededItem[];
    unassigned: NeededItem[];
    totalToBuy: number;
    totalEstCost: number;
    totalStops: number;
    onStartShopping: () => void;
    onEditSupplier: (supplier: Supplier) => void;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
    setViewingDetailOption: (opt: PurchaseOption) => void;
}> = ({ 
    state, routeGroups, allItems, unassigned, totalToBuy, totalEstCost, totalStops, 
    onStartShopping, onEditSupplier, onDragStart, onDragEnter, onDragEnd, setViewingDetailOption 
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: VISUAL ROUTE MAP */}
            <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-5 rounded-[2rem] border-2 border-stone-100 shadow-sm flex flex-col gap-2">
                    <h3 className="font-bold text-stone-700 flex items-center gap-2"><MapPin className="text-orange-500"/> จัดลำดับเส้นทาง (Route Plan)</h3>
                    <p className="text-xs text-stone-400">ลากเพื่อเรียงลำดับร้านตามที่คุณจะไปจริง</p>
                    
                    <div className="mt-4 space-y-0 relative pl-4 border-l-2 border-dashed border-stone-200 ml-4 py-2">
                        {state.suppliers.map((supplier, index) => (
                            <div 
                                key={supplier.id}
                                draggable={!supplier.isHome}
                                onDragStart={() => onDragStart(index)}
                                onDragEnter={() => onDragEnter(index)}
                                onDragEnd={onDragEnd}
                                onClick={() => onEditSupplier(supplier)}
                                className={`relative mb-6 pl-6 cursor-pointer group transition-all ${index === state.suppliers.length - 1 ? 'mb-0' : ''}`}
                            >
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 transition-all group-hover:scale-125 ${supplier.isHome ? 'bg-orange-400' : supplier.type === 'online' ? 'bg-blue-400' : 'bg-stone-300'}`}></div>
                                
                                <div className="bg-white p-3 rounded-2xl border-2 border-stone-100 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="text-stone-300 cursor-grab p-1 shrink-0 hover:text-orange-400"><GripVertical size={16} /></div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-stone-700 truncate text-sm">{supplier.name}</h4>
                                            <p className="text-[10px] text-stone-400 truncate">{supplier.locationName || (supplier.type === 'online' ? 'รอส่ง 2-3 วัน' : 'ไม่ระบุพิกัด')}</p>
                                        </div>
                                    </div>
                                    
                                    {routeGroups[supplier.id] && (
                                        <div className="flex flex-col items-end">
                                            <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-lg mb-1">
                                                {routeGroups[supplier.id].items.length} รายการ
                                            </span>
                                            <span className="text-[10px] text-stone-400 font-bold">฿{routeGroups[supplier.id].totalCost.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: SMART PLAN RESULTS */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* STATS DASHBOARD */}
                <div className="bg-stone-800 text-white p-6 rounded-[2.5rem] shadow-xl flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingCart size={120}/></div>
                    <div className="flex gap-8 relative z-10">
                        <div>
                            <p className="text-xs text-stone-400 font-bold uppercase mb-1">ต้องซื้อทั้งหมด</p>
                            <p className="text-3xl font-black">{totalToBuy} <span className="text-sm text-stone-500 font-bold">ชิ้น</span></p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div>
                            <p className="text-xs text-stone-400 font-bold uppercase mb-1">งบประมาณ (Est.)</p>
                            <p className="text-3xl font-black text-green-400">฿{totalEstCost.toLocaleString()}</p>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                        <div className="hidden sm:block">
                            <p className="text-xs text-stone-400 font-bold uppercase mb-1">ต้องแวะกี่ร้าน</p>
                            <p className="text-3xl font-black text-orange-400">{totalStops} <span className="text-sm text-stone-500 font-bold">จุด</span></p>
                        </div>
                    </div>
                </div>

                {allItems.length === 0 ? (
                    <div className="bg-[#F0FDF4] border-4 border-white p-10 rounded-[3rem] text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <CheckCircle2 size={80} className="text-green-500 mx-auto mb-4 animate-bounce"/>
                        <h3 className="text-2xl font-black text-green-700 mb-2">Stock Healthy 100% 🥦</h3>
                        <p className="text-green-600 font-bold">ไม่มีของต้องซื้อเพิ่มในขณะนี้ครับ</p>
                        <p className="text-sm text-green-500/70 mt-2">คุณสามารถพักผ่อน หรือเตรียมร้านได้เลย!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        
                        {/* UNASSIGNED WARNING */}
                        {unassigned.length > 0 && (
                            <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100 flex items-start gap-4 animate-pulse">
                                <div className="bg-red-100 p-2 rounded-xl text-red-500 shrink-0"><AlertTriangle size={24} /></div>
                                <div>
                                    <p className="font-bold text-red-600">หาที่ซื้อไม่ได้ {unassigned.length} รายการ</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {unassigned.map(i => <span key={i.id} className="text-[10px] bg-white border border-red-200 px-2 py-1 rounded text-red-400 font-bold">{i.name}</span>)}
                                    </div>
                                    <p className="text-[10px] text-red-400 mt-2 font-bold">*กรุณาเพิ่มสินค้าลงในร้านค้า (กดที่ร้านค้าด้านซ้าย)</p>
                                </div>
                            </div>
                        )}

                        {/* SMART GROUPING CARDS */}
                        {state.suppliers.map((supplier, idx) => {
                            const group = routeGroups[supplier.id];
                            if (!group || group.items.length === 0) return null;

                            return (
                                <div key={supplier.id} className="bg-white rounded-[2.5rem] border-2 border-stone-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all">
                                    
                                    {/* Shop Header */}
                                    <div className="p-6 pb-4 flex justify-between items-start bg-stone-50/50">
                                        <div className="flex gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-md shrink-0 ${supplier.type === 'online' ? 'bg-blue-400' : 'bg-orange-400'}`}>
                                                {supplier.type === 'online' ? <Smartphone size={24}/> : <Store size={24}/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-stone-800 text-xl">{supplier.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${supplier.type === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        {supplier.type === 'online' ? 'สั่ง Online' : 'ไปซื้อเอง'}
                                                    </span>
                                                    <span className="text-[10px] text-stone-400 flex items-center gap-1 font-bold">
                                                        {supplier.type === 'online' || supplier.leadTime! > 0 ? <><Clock size={10}/> รอ {supplier.leadTime || 3} วัน</> : <><Fuel size={10}/> เดินทางเอง</>}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                <p className="text-[10px] text-stone-400 uppercase font-bold mb-1">ยอดรวมร้านนี้</p>
                                                <p className="text-2xl font-black text-stone-700">฿{group.totalCost.toLocaleString()}</p>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex gap-1">
                                                {supplier.websiteUrl && (
                                                    <a href={supplier.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="ลิงก์ร้าน">
                                                        <ExternalLink size={14}/>
                                                    </a>
                                                )}
                                                {supplier.mapUrl && (
                                                    <a href={supplier.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors" title="แผนที่">
                                                        <Navigation size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="p-4 pt-0 space-y-2">
                                        {group.items.map((opt, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-stone-100 hover:border-orange-200 hover:shadow-md transition-all group/item">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-2 h-10 rounded-full shrink-0 ${opt.item.isUrgent ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`}></div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-stone-700 text-sm truncate">{opt.item.name}</p>
                                                            {opt.item.isUrgent && <span className="text-[8px] bg-red-100 text-red-500 px-1.5 rounded font-bold">ด่วน</span>}
                                                        </div>
                                                        <p className="text-[10px] text-stone-400 font-bold">
                                                            {opt.item.toBuy} {opt.item.unit} <span className="text-stone-300">|</span> ฿{opt.unitPrice}/หน่วย
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${opt.reason.includes('ด่วน') ? 'bg-red-50 text-red-500' : opt.reason.includes('ถูก') ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-500'}`}>
                                                        {opt.reason}
                                                    </span>
                                                    <button 
                                                        onClick={() => setViewingDetailOption(opt)} 
                                                        className="w-8 h-8 rounded-full bg-stone-50 hover:bg-blue-50 text-stone-300 hover:text-blue-500 flex items-center justify-center transition-colors"
                                                    >
                                                        <Info size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
