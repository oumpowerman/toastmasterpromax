
import React, { useState } from 'react';
import { AppState, InventoryItem, LedgerItem } from '../../types';
import { Wallet, Smartphone, Bike, AlertCircle, TrendingUp, Clock, Package, Check, X, ArrowRight, Zap, Coins, Minus, Equal } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAlert } from '../AlertSystem';
import { useDailyCostEngine } from './accounting/useDailyCost'; // Reuse engine

// New Imports
import { useRealDashboard } from './real_dashboard/useRealDashboard';
import { DashboardHeaderCard, PaymentCard } from './real_dashboard/StatCards';
import { RealDetailModal, MetricType } from './real_dashboard/RealDetailModal';

interface RealDashboardProps {
    state: AppState;
    onAddLedgerItem: (item: Omit<LedgerItem, 'id'>) => void;
    onUpdateInventoryItem: (item: InventoryItem) => void;
}

const RealDashboard: React.FC<RealDashboardProps> = ({ state, onAddLedgerItem, onUpdateInventoryItem }) => {
    const { showAlert, showConfirm } = useAlert();
    const { 
        today, todaySales, todayCOGS, dailyFixedCost, todayNetProfit, hasLoggedFixedCost,
        paymentStats, itemAnalysis, topItems, 
        hourlyData, lowStockItems, dailyTarget, progressPercent, todayOrders 
    } = useRealDashboard(state);

    const { calculateDailyCosts } = useDailyCostEngine(state);

    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [quickRestockItem, setQuickRestockItem] = useState<InventoryItem | null>(null);
    
    // Drill Down Modal State
    const [detailMetric, setDetailMetric] = useState<MetricType>(null);

    // Handler for One-Click Fixed Cost Log
    const handleLogFixedCost = async () => {
        if (await showConfirm(`ต้องการบันทึกค่าที่+ค่าแรง+ค่าเสื่อม ของวันนี้ (รวม ฿${dailyFixedCost.toLocaleString()}) ลงบัญชีใช่ไหม?`)) {
            const { costs } = calculateDailyCosts(today);
            costs.forEach(cost => {
                onAddLedgerItem({
                    date: today,
                    type: 'expense',
                    title: cost.title,
                    amount: cost.amount,
                    category: cost.category,
                    note: 'Quick Log from Dashboard'
                });
            });
            await showAlert("บันทึกค่าใช้จ่ายคงที่เรียบร้อย!", "success");
        }
    };

    // --- RENDER ---
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cute pb-20">
            
            {/* 1. Header (Clickable for Total Sales Detail) */}
            <DashboardHeaderCard 
                todaySales={todaySales}
                dailyTarget={dailyTarget}
                progressPercent={progressPercent}
                date={new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
                onClick={() => setDetailMetric('sales')}
            />

            {/* 2. PROFIT ANALYSIS CARD (NEW) */}
            <div className="bg-white rounded-[2.5rem] border-2 border-stone-100 shadow-sm p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-stone-700 flex items-center gap-2">
                        <Coins className="text-yellow-500" /> กำไรสุทธิวันนี้ (Net Profit)
                    </h3>
                    {!hasLoggedFixedCost && (
                        <button 
                            onClick={handleLogFixedCost}
                            className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-yellow-200 transition-all flex items-center gap-2 animate-pulse"
                        >
                            <Zap size={14}/> บันทึกค่าที่/ค่าแรงเดี๋ยวนี้
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-2xl">
                    <div className="text-center w-full md:w-auto">
                        <p className="text-xs text-stone-400 font-bold uppercase">ยอดขาย</p>
                        <p className="text-xl font-black text-stone-700">฿{todaySales.toLocaleString()}</p>
                    </div>
                    <Minus size={20} className="text-stone-300 hidden md:block" />
                    <div className="text-center w-full md:w-auto">
                        <p className="text-xs text-stone-400 font-bold uppercase">ต้นทุนของ (COGS)</p>
                        <p className="text-xl font-black text-red-400">฿{todayCOGS.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                    </div>
                    <Minus size={20} className="text-stone-300 hidden md:block" />
                    <div className="text-center w-full md:w-auto">
                        <p className="text-xs text-stone-400 font-bold uppercase">ค่าที่/แรง (Fixed)</p>
                        <p className="text-xl font-black text-orange-400">฿{dailyFixedCost.toLocaleString()}</p>
                    </div>
                    <Equal size={20} className="text-stone-300 hidden md:block" />
                    <div className={`text-center w-full md:w-auto p-4 rounded-xl ${todayNetProfit > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        <p className="text-xs font-bold uppercase opacity-80">กำไรสุทธิ</p>
                        <p className="text-3xl font-black">{todayNetProfit > 0 ? '+' : ''}฿{todayNetProfit.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                    </div>
                </div>
                {!hasLoggedFixedCost && (
                    <p className="text-center text-[10px] text-stone-400 mt-2">
                        *ตัวเลขนี้หักค่าที่/ค่าแรงออกให้ดูเฉยๆ (ยังไม่ได้บันทึกลงบัญชีจริง จนกว่าจะกดปุ่มด้านบน)
                    </p>
                )}
            </div>

            {/* 3. Payment Cards (Clickable) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PaymentCard 
                    title="เงินสด (ในลิ้นชัก)" 
                    amount={paymentStats.cash.total} 
                    count={paymentStats.cash.count} 
                    icon={Wallet} colorTheme="green"
                    onClick={() => setDetailMetric('cash')}
                />
                <PaymentCard 
                    title="เงินโอน (เช็คแอป)" 
                    amount={paymentStats.transfer.total} 
                    count={paymentStats.transfer.count} 
                    icon={Smartphone} colorTheme="blue"
                    onClick={() => setDetailMetric('transfer')}
                />
                <PaymentCard 
                    title="Delivery (รอโอน)" 
                    amount={paymentStats.delivery.total} 
                    count={paymentStats.delivery.count} 
                    icon={Bike} colorTheme="orange"
                    onClick={() => setDetailMetric('delivery')}
                />
            </div>

            {/* 4. Charts & Top Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Hourly Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border-2 border-stone-100 shadow-sm h-80 flex flex-col">
                    <h3 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
                        <Clock className="text-orange-400" size={20}/> ช่วงเวลาขายดี (Hourly)
                    </h3>
                    <div className="flex-1 w-full text-xs font-bold">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#a8a29e'}} />
                                <Tooltip 
                                    cursor={{fill: '#f5f5f4', radius: 8}}
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                />
                                <Bar dataKey="total" radius={[6, 6, 6, 6]}>
                                    {hourlyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.total > 500 ? '#f97316' : '#fdba74'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Items (Clickable) */}
                <div 
                    onClick={() => setDetailMetric('topItems')}
                    className="bg-white p-6 rounded-[2.5rem] border-2 border-stone-100 shadow-sm h-80 flex flex-col cursor-pointer hover:border-red-200 transition-all group"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-stone-700 flex items-center gap-2">
                            <TrendingUp className="text-red-400" size={20}/> เมนูฮิตวันนี้
                        </h3>
                        <ArrowRight size={16} className="text-stone-300 group-hover:text-red-400 transition-colors"/>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {topItems.length === 0 ? (
                            <div className="text-center text-stone-300 py-10">ยังไม่มีข้อมูล</div>
                        ) : (
                            topItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-yellow-400 text-white' : 'bg-stone-200 text-stone-500'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-stone-600 text-sm truncate max-w-[120px]">{item.name}</span>
                                    </div>
                                    <span className="font-black text-stone-800">{item.qty} <span className="text-[10px] text-stone-400 font-normal">ชิ้น</span></span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 5. Operations & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Stock Alerts */}
                <div className={`p-6 rounded-[2.5rem] border-2 shadow-sm ${lowStockItems.length > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-stone-100'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-bold flex items-center gap-2 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-stone-700'}`}>
                            <AlertCircle size={20} /> ของใกล้หมด ({lowStockItems.length})
                        </h3>
                    </div>
                    
                    {lowStockItems.length === 0 ? (
                        <div className="text-center py-8 text-stone-400 font-bold">
                            <CheckIcon className="mx-auto mb-2 text-green-400" size={32}/>
                            สต็อกเพียงพอทุกรายการ
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {lowStockItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                    <div>
                                        <p className="font-bold text-stone-700 text-sm">{item.name}</p>
                                        <p className="text-xs text-red-500 font-bold">เหลือ {item.quantity} {item.unit}</p>
                                    </div>
                                    <button 
                                        onClick={() => setQuickRestockItem(item)}
                                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors shadow-sm"
                                    >
                                        เติมของ
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setShowExpenseModal(true)}
                        className="bg-white p-6 rounded-[2.5rem] border-2 border-stone-100 hover:border-orange-300 hover:shadow-lg transition-all group flex flex-col items-center justify-center gap-3 h-40"
                    >
                        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <Wallet size={28} />
                        </div>
                        <span className="font-bold text-stone-600">ลงบันทึกจ่ายด่วน</span>
                    </button>

                    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-stone-100 hover:border-blue-300 hover:shadow-lg transition-all group flex flex-col items-center justify-center gap-3 h-40 cursor-pointer">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Package size={28} />
                        </div>
                        <span className="font-bold text-stone-600">เช็คของรับเข้า</span>
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}
            {/* 1. Detail Drill Down */}
            <RealDetailModal 
                type={detailMetric} 
                onClose={() => setDetailMetric(null)}
                data={{
                    title: detailMetric === 'sales' ? 'ยอดขายวันนี้ทั้งหมด' 
                         : detailMetric === 'cash' ? 'รายการรับเงินสด' 
                         : detailMetric === 'transfer' ? 'รายการเงินโอน'
                         : detailMetric === 'delivery' ? 'รายการ Delivery'
                         : detailMetric === 'topItems' ? 'อันดับสินค้าขายดี' : '',
                    orders: detailMetric === 'sales' ? todayOrders
                          : detailMetric === 'cash' ? paymentStats.cash.orders
                          : detailMetric === 'transfer' ? paymentStats.transfer.orders
                          : detailMetric === 'delivery' ? paymentStats.delivery.orders
                          : undefined,
                    items: detailMetric === 'topItems' ? itemAnalysis : undefined
                }}
            />

            {/* 2. Actions */}
            {showExpenseModal && (
                <QuickExpenseModal 
                    onClose={() => setShowExpenseModal(false)}
                    onSave={(title, amount) => {
                        onAddLedgerItem({
                            date: new Date().toISOString().split('T')[0],
                            type: 'expense',
                            category: 'general',
                            title,
                            amount,
                            note: 'Quick Add from Dashboard'
                        });
                        setShowExpenseModal(false);
                        showAlert('บันทึกค่าใช้จ่ายเรียบร้อย', 'success');
                    }}
                />
            )}

            {quickRestockItem && (
                <QuickRestockModal
                    item={quickRestockItem}
                    onClose={() => setQuickRestockItem(null)}
                    onConfirm={(qty) => {
                        const updated = { ...quickRestockItem, quantity: quickRestockItem.quantity + qty, lastUpdated: new Date().toISOString() };
                        onUpdateInventoryItem(updated);
                        setQuickRestockItem(null);
                        showAlert(`เติมสต็อก ${quickRestockItem.name} +${qty} เรียบร้อย`, 'success');
                    }}
                />
            )}

        </div>
    );
};

// --- Helper Components ---
const QuickExpenseModal: React.FC<{ onClose: () => void, onSave: (t: string, a: number) => void }> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border-4 border-white animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-stone-800">💸 จ่ายอะไรไป?</h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400"/></button>
                </div>
                <div className="space-y-3">
                    <input autoFocus placeholder="รายการ (เช่น น้ำแข็ง, แก๊ส)" className="w-full p-3 bg-stone-50 rounded-xl font-bold border-2 border-stone-100 outline-none focus:border-orange-300" value={title} onChange={e => setTitle(e.target.value)} />
                    <input type="number" placeholder="จำนวนเงิน" className="w-full p-3 bg-stone-50 rounded-xl font-bold border-2 border-stone-100 outline-none focus:border-orange-300" value={amount} onChange={e => setAmount(e.target.value)} />
                    <button 
                        onClick={() => onSave(title, Number(amount))}
                        disabled={!title || !amount}
                        className="w-full py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 disabled:opacity-50"
                    >
                        บันทึกทันที
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuickRestockModal: React.FC<{ item: InventoryItem, onClose: () => void, onConfirm: (q: number) => void }> = ({ item, onClose, onConfirm }) => {
    const [qty, setQty] = useState('');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border-4 border-white animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-stone-800">📦 รับของเข้า: {item.name}</h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400"/></button>
                </div>
                <div className="space-y-3">
                    <p className="text-xs text-stone-500 font-bold">ปัจจุบันมี: {item.quantity} {item.unit}</p>
                    <div className="flex items-center gap-2">
                        <input type="number" autoFocus placeholder="จำนวนที่เพิ่ม" className="flex-1 p-3 bg-stone-50 rounded-xl font-bold border-2 border-stone-100 outline-none focus:border-green-300" value={qty} onChange={e => setQty(e.target.value)} />
                        <span className="font-bold text-stone-400">{item.unit}</span>
                    </div>
                    <button 
                        onClick={() => onConfirm(Number(qty))}
                        disabled={!qty}
                        className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50"
                    >
                        ยืนยันรับของ
                    </button>
                </div>
            </div>
        </div>
    );
};

const CheckIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default RealDashboard;
