
import React, { memo, useState, useMemo } from 'react';
import { Calendar, FileText, LogOut, Search, ChefHat, Utensils, Plus, ShoppingBag, Minus, Trash2, ArrowRight, History, Flame, LayoutGrid, List, Tag, Edit3, Settings2, Receipt, ReceiptText } from 'lucide-react';
import { MenuItem, OrderItem } from '../../../types';
import { MODIFIERS } from './constants';

// --- LEFT PANEL: MENU GRID ---
interface MenuGridProps {
    shiftDate: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;
    categories: string[];
    filteredMenus: MenuItem[];
    activeOrdersCount: number;
    addToCart: (menu: MenuItem, customize: boolean) => void;
    onCloseShift: () => void;
    onOpenHistory: () => void;
    onOpenAllHistory: () => void;
    onOpenKDS: () => void;
    expiringMenuIds?: Set<string>; 
    separateItems: boolean; 
    setSeparateItems: (val: boolean) => void; 
}

export const MenuGrid = memo<MenuGridProps>(({
    shiftDate, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories, filteredMenus, activeOrdersCount, addToCart, onCloseShift, onOpenHistory, onOpenAllHistory, onOpenKDS, expiringMenuIds, separateItems, setSeparateItems
}) => {
    
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const groupedItems = useMemo(() => {
        const groups: Record<string, MenuItem[]> = {};
        filteredMenus.forEach(menu => {
            const cat = menu.category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(menu);
        });
        return groups;
    }, [filteredMenus]);

    return (
        <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border-2 border-stone-100 shadow-sm overflow-hidden relative">
            {/* Top Bar */}
            <div className="bg-white z-10 border-b border-stone-100">
                <div className="p-5 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-3 bg-stone-100 p-2 pr-4 rounded-full border border-stone-200 shrink-0">
                            <div className="bg-white p-2 rounded-full shadow-sm text-stone-600">
                                <Calendar size={18} />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] font-bold text-stone-400 uppercase">วันที่ขาย</span>
                                <span className="font-black text-stone-700 whitespace-nowrap">
                                    {new Date(shiftDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex bg-stone-100 p-1 rounded-full border border-stone-200">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow text-orange-500' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white shadow text-orange-500' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>

                        <div className="w-px h-8 bg-stone-200 mx-1 hidden md:block"></div>

                        <button 
                            onClick={onCloseShift}
                            className="bg-rose-500 text-white pl-4 pr-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5 transition-all border-2 border-rose-600 shadow-md shrink-0 group"
                            title="ปิดยอดร้านค้า"
                        >
                            <div className="bg-white/20 p-1.5 rounded-full group-hover:bg-white/30 transition-colors">
                                <LogOut size={18} strokeWidth={3} />
                            </div>
                            <span>ปิดร้าน</span>
                        </button>
                    </div>

                    <div className="relative flex-1 w-full flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={22} />
                            <input 
                                type="text" 
                                placeholder="ค้นหาเมนู..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:border-orange-400 font-bold text-lg text-stone-600 transition-colors"
                            />
                        </div>
                        {/* Separate Items Toggle */}
                        <button 
                            onClick={() => setSeparateItems(!separateItems)}
                            className={`px-4 py-2 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all min-w-[80px] ${separateItems ? 'bg-purple-50 border-purple-400 text-purple-600' : 'bg-stone-50 border-stone-100 text-stone-400 hover:border-stone-300'}`}
                            title="การรวมรายการสินค้า"
                        >
                            <Settings2 size={16} />
                            {separateItems ? 'แยกรายการ' : 'รวมรายการ'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-5 pb-5 pt-2">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-3 rounded-2xl font-bold text-base whitespace-nowrap transition-all border-2 shrink-0 ${selectedCategory === cat ? 'bg-orange-400 text-white border-orange-400 shadow-md transform scale-105' : 'bg-white border-stone-100 text-stone-400 hover:border-orange-200 hover:text-stone-600'}`}
                        >
                            {cat === 'All' ? 'ทั้งหมด' : cat}
                        </button>
                    ))}
                    
                    <div className="w-px h-8 bg-stone-200 mx-2 self-center shrink-0"></div>

                    <button 
                        onClick={onOpenKDS}
                        className="bg-stone-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-stone-900 shadow-lg relative transition-transform active:scale-95 text-sm whitespace-nowrap shrink-0"
                    >
                        <ChefHat size={18} /> ครัว (Kitchen)
                        {activeOrdersCount > 0 && (
                            <span className="absolute -top-3 -right-2 min-w-[1.25rem] h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] border-2 border-white animate-bounce z-50 px-1 shadow-sm font-bold">
                                {activeOrdersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30 custom-scrollbar">
                {Object.keys(groupedItems).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-stone-300">
                        <Utensils size={64} className="mb-4 opacity-20" />
                        <p className="text-xl font-bold">ไม่พบเมนู</p>
                    </div>
                ) : (
                    Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category} className="mb-8">
                            {selectedCategory === 'All' && (
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <div className="h-6 w-1.5 bg-orange-400 rounded-full"></div>
                                    <h4 className="text-lg font-bold text-stone-600">{category}</h4>
                                    <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{(items as MenuItem[]).length}</span>
                                </div>
                            )}

                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                                    {(items as MenuItem[]).map(menu => {
                                        const isCheerSell = expiringMenuIds?.has(menu.id);
                                        return (
                                            <div 
                                                key={menu.id}
                                                className={`relative group flex flex-col h-full bg-white rounded-[2.5rem] border-2 transition-all hover:shadow-xl overflow-hidden ${isCheerSell ? 'border-orange-400 shadow-lg shadow-orange-100 ring-2 ring-orange-200 ring-offset-2' : 'border-stone-100 hover:border-orange-400'}`}
                                            >
                                                <button 
                                                    onClick={() => addToCart(menu, false)}
                                                    className="flex flex-col justify-between h-full text-left active:scale-95 transition-transform"
                                                >
                                                    {isCheerSell && (
                                                        <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl z-20 flex items-center gap-1 animate-pulse shadow-md">
                                                            <Flame size={12} fill="white"/> เชียร์ขาย
                                                        </div>
                                                    )}

                                                    {menu.image ? (
                                                        <>
                                                            <img src={menu.image} alt={menu.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                                                        </>
                                                    ) : (
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                            <Utensils size={100} />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="z-10 relative flex flex-col justify-between h-full p-6">
                                                        <div className="mt-auto">
                                                            <h4 className={`font-bold text-xl leading-snug py-1 line-clamp-2 drop-shadow-md ${menu.image ? 'text-white' : 'text-stone-700'}`}>{menu.name}</h4>
                                                            <p className={`text-xs mt-1 font-bold ${menu.image ? 'text-white/80' : 'text-stone-400'}`}>{menu.ingredients.length} วัตถุดิบ</p>
                                                        </div>
                                                        <div className="flex justify-between items-end mt-4">
                                                            <span className={`text-3xl font-black ${menu.image ? 'text-white drop-shadow-md' : 'text-orange-500'}`}>฿{menu.sellingPrice}</span>
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${menu.image ? 'bg-white text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-stone-100 text-stone-400 group-hover:bg-orange-400 group-hover:text-white'}`}>
                                                                <Plus size={24} strokeWidth={3} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                                
                                                {/* Edit Button (Absolute Top Right) */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); addToCart(menu, true); }}
                                                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-stone-400 hover:text-orange-500 hover:bg-white shadow-sm transition-all z-30 opacity-0 group-hover:opacity-100"
                                                    title="ปรับแต่ง"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {(items as MenuItem[]).map(menu => {
                                        const isCheerSell = expiringMenuIds?.has(menu.id);
                                        return (
                                            <div 
                                                key={menu.id}
                                                className={`flex items-center p-3 rounded-2xl border-2 bg-white hover:border-orange-300 transition-all group relative ${isCheerSell ? 'border-orange-300 bg-orange-50/30' : 'border-stone-100'}`}
                                            >
                                                <div 
                                                    className="flex-1 flex items-center gap-3 cursor-pointer"
                                                    onClick={() => addToCart(menu, false)}
                                                >
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative">
                                                        {menu.image ? (
                                                            <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-stone-300"><Utensils size={24}/></div>
                                                        )}
                                                        {isCheerSell && (
                                                            <div className="absolute bottom-0 w-full bg-red-500 text-white text-[8px] font-bold text-center py-0.5">
                                                                HOT
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-stone-700 text-lg line-clamp-1">{menu.name}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-stone-400 font-bold mt-0.5">
                                                            <Tag size={12}/> {menu.category || 'General'} 
                                                            <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                                                            {menu.ingredients.length} วัตถุดิบ
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <span className="text-2xl font-black text-stone-800">฿{menu.sellingPrice}</span>
                                                        <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center group-hover:bg-orange-400 group-hover:text-white transition-colors">
                                                            <Plus size={20} strokeWidth={3}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Edit Button */}
                                                <button 
                                                    onClick={() => addToCart(menu, true)}
                                                    className="ml-2 p-2 rounded-xl text-stone-300 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div className="h-20"></div>
            </div>
        </div>
    );
});

// --- RIGHT PANEL: CART ---
interface CartPanelProps {
    cart: OrderItem[];
    nextQueue: number;
    orderType: 'dine_in' | 'take_away';
    setOrderType: (type: 'dine_in' | 'take_away') => void;
    shiftTotalSales: number;
    onOpenShiftHistory: () => void;
    onClearCart: () => void;
    updateCartItemNote: (id: string, note: string) => void;
    toggleModifier: (id: string, mod: string) => void;
    updateCartQty: (id: string, delta: number) => void;
    removeCartItem: (id: string) => void;
    cartTotal: number;
    onCheckout: () => void;
    // New Props for Post-Paid Flow
    activeBillId?: string | null;
    activeBillQ?: number | null;
    onOpenWaitingBills?: () => void;
    waitingCount?: number;
}

export const CartPanel = memo<CartPanelProps>(({
    cart, nextQueue, orderType, setOrderType, shiftTotalSales, onOpenShiftHistory, onClearCart, updateCartItemNote, toggleModifier, updateCartQty, removeCartItem, cartTotal, onCheckout,
    activeBillId, activeBillQ, onOpenWaitingBills, waitingCount = 0
}) => {
    
    const isEditMode = !!activeBillId;

    return (
        <div className={`w-full xl:w-[420px] flex flex-col bg-white rounded-[2.5rem] border-4 shadow-xl overflow-hidden relative shrink-0 h-[40vh] xl:h-auto transition-colors duration-300 ${isEditMode ? 'border-green-200' : 'border-stone-100'}`}>
            
            {/* Cart Header */}
            <div className={`p-6 text-white flex justify-between items-center shadow-md z-10 shrink-0 transition-colors duration-300 ${isEditMode ? 'bg-green-600' : 'bg-stone-800'}`}>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-bold font-cute">{isEditMode ? 'รับเงิน (Pay)' : 'ออเดอร์ใหม่'}</h3>
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${isEditMode ? 'bg-green-700 text-green-100' : 'bg-stone-700 text-stone-300'}`}>
                            Q #{isEditMode ? activeBillQ : nextQueue}
                        </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => setOrderType('take_away')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${orderType === 'take_away' ? 'bg-white text-stone-800 shadow-md' : 'bg-black/20 text-white/60 hover:bg-black/40'}`}>กลับบ้าน</button>
                        <button onClick={() => setOrderType('dine_in')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${orderType === 'dine_in' ? 'bg-white text-stone-800 shadow-md' : 'bg-black/20 text-white/60 hover:bg-black/40'}`}>ทานร้าน</button>
                    </div>
                </div>
                <div className="flex gap-2">
                    {onOpenWaitingBills && (
                        <button onClick={onOpenWaitingBills} className="text-white p-3 hover:bg-white/10 rounded-full transition-colors relative group" title="บิลรอจ่าย">
                            <ReceiptText size={24} />
                            {waitingCount > 0 && <div className="absolute top-2 right-2 min-w-[1rem] h-4 flex items-center justify-center bg-orange-500 rounded-full text-[10px] border border-white font-bold">{waitingCount}</div>}
                        </button>
                    )}
                    <button onClick={onClearCart} className="text-white/60 hover:text-red-200 p-3 hover:bg-white/10 rounded-full transition-colors" title="ล้างบิล">
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-stone-300 opacity-50 space-y-4">
                        <div className="w-32 h-32 bg-stone-100 rounded-full flex items-center justify-center">
                            <ShoppingBag size={64} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-2xl">ยังไม่มีรายการ</p>
                            <p className="text-lg">เลือกเมนูทางซ้ายได้เลย</p>
                        </div>
                    </div>
                ) : (
                    cart.map(item => (
                        <div 
                            key={item.id} 
                            className="relative rounded-[1.5rem] shadow-sm animate-in slide-in-from-right-2 group overflow-hidden border border-stone-100 bg-white"
                        >
                            {/* Background Image Overlay */}
                            {item.image && (
                                <div 
                                    className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                ></div>
                            )}
                            
                            {/* Content Layer */}
                            <div className="relative z-10 p-4 bg-white/40 backdrop-blur-[1px]">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 pr-2">
                                        <h4 className="font-bold text-stone-800 text-lg leading-relaxed py-1">{item.name}</h4>
                                        
                                        {item.toppings && item.toppings.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {item.toppings.map((t, idx) => (
                                                    <span key={idx} className="text-xs bg-purple-100/80 text-purple-700 px-2 py-0.5 rounded font-bold flex items-center gap-1 border border-purple-200">
                                                        <Plus size={10}/> {t.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <input 
                                            type="text" 
                                            placeholder="+ โน้ต (เช่น ไม่ผัก)" 
                                            value={item.notes || ''}
                                            onChange={(e) => updateCartItemNote(item.id, e.target.value)}
                                            className="text-sm text-stone-600 bg-transparent border-b border-dashed border-stone-400 w-full outline-none focus:border-orange-400 placeholder-stone-500 py-1 font-medium"
                                        />
                                    </div>
                                    <span className="font-black text-stone-800 text-xl mt-1">฿{item.price * item.quantity}</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {MODIFIERS.map(mod => (
                                        <button 
                                            key={mod.id}
                                            onClick={() => toggleModifier(item.id, mod.label)}
                                            className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${item.modifiers?.includes(mod.label) ? 'bg-orange-100 border-orange-300 text-orange-700 font-bold shadow-sm' : 'bg-white/50 border-stone-300 text-stone-600 hover:bg-white'}`}
                                        >
                                            {mod.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center bg-white/70 rounded-xl p-1.5 shadow-sm border border-stone-200">
                                        <button onClick={() => updateCartQty(item.id, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-stone-600 hover:text-red-500 transition-colors"><Minus size={18}/></button>
                                        <span className="w-12 text-center font-black text-stone-800 text-xl">{item.quantity}</span>
                                        <button onClick={() => updateCartQty(item.id, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-stone-600 hover:text-green-500 transition-colors"><Plus size={18}/></button>
                                    </div>
                                    <button onClick={() => removeCartItem(item.id)} className="text-stone-400 hover:text-red-500 p-3 rounded-full hover:bg-red-50 transition-colors"><Trash2 size={20}/></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Total & Action */}
            <div className="p-6 bg-white border-t border-stone-100 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10 shrink-0">
                <div className="flex justify-between items-end">
                    <span className="text-stone-500 font-bold uppercase text-lg mb-1">ยอดรวมสุทธิ</span>
                    <span className="text-6xl font-black text-stone-800 tracking-tighter leading-none">฿{cartTotal.toLocaleString()}</span>
                </div>
                
                {isEditMode ? (
                    <button 
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                        className="w-full py-6 bg-green-500 text-white rounded-2xl font-bold text-3xl shadow-lg hover:bg-green-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95 shadow-green-200"
                    >
                        💰 รับเงิน (Pay)
                    </button>
                ) : (
                    <button 
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                        className="w-full py-6 bg-orange-500 text-white rounded-2xl font-bold text-3xl shadow-lg hover:bg-orange-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95 shadow-orange-200"
                    >
                        🔥 ส่งเข้าครัว (Send)
                    </button>
                )}
            </div>
        </div>
    );
});
