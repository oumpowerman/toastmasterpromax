
import React, { useState, useEffect } from 'react';
import { Tag, DollarSign, TrendingUp, ShoppingBag, LayoutGrid, ChevronDown, X, Check, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { AppState, MenuItem } from '../../types';
import { MentorTip, InputField } from '../UI';

interface PricingProps {
  state: AppState;
  updateNestedState: (category: keyof AppState, field: string, value: any) => void;
  updateMenu: (id: string, field: keyof MenuItem, value: any) => void;
}

const Pricing: React.FC<PricingProps> = ({ state, updateNestedState, updateMenu }) => {
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  // Auto-select first menu
  useEffect(() => {
    if (!selectedMenuId && state.menuItems.length > 0) {
        setSelectedMenuId(state.menuItems[0].id);
    }
  }, [state.menuItems.length]);

  const activeMenu = state.menuItems.find(m => m.id === selectedMenuId);

  // Helper: Calculate Cost & Margin for specific menu
  const getMenuMetrics = (menu: MenuItem) => {
    const baseCost = menu.ingredients.reduce((sum, i) => sum + i.cost, 0);
    const hiddenPercent = (state.hiddenPercentages.waste + state.hiddenPercentages.promoLoss + state.hiddenPercentages.paymentFee) / 100;
    const realCost = baseCost * (1 + hiddenPercent);
    const profit = menu.sellingPrice - realCost;
    const margin = menu.sellingPrice > 0 ? (profit / menu.sellingPrice) * 100 : 0;
    return { realCost, profit, margin };
  };

  const metrics = activeMenu ? getMenuMetrics(activeMenu) : null;

  // Psychological Pricing Suggestions
  const suggestPrice = (targetMargin: number) => {
      if (!metrics) return 0;
      const targetPrice = metrics.realCost / (1 - targetMargin);
      // Round to nearest 9 or 5 for psychological effect
      return Math.ceil(targetPrice / 5) * 5 - 1; // e.g. 29, 34, 39
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
        
        {/* HEADER & SELECTOR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold text-stone-800 font-cute flex items-center gap-2">
                    <Tag className="text-orange-400" size={32} />
                    ตั้งราคาขาย (Pricing Strategy)
                </h2>
                <p className="text-stone-400 text-sm mt-1">กำหนดราคาขายรายเมนูและจัดโปรโมชั่น</p>
            </div>

            {/* Menu Selector */}
            {activeMenu && (
                 <button 
                    onClick={() => setIsMenuModalOpen(true)}
                    className="flex items-center gap-3 bg-white border-2 border-stone-100 pl-4 pr-6 py-2 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
                 >
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">กำลังตั้งราคา</p>
                        <p className="font-bold text-lg text-stone-700 font-cute group-hover:text-orange-500 truncate max-w-[200px]">
                            {activeMenu.name}
                        </p>
                    </div>
                    <ChevronDown className="text-stone-300 group-hover:text-orange-500" />
                 </button>
            )}
        </div>

        {/* Modal: Menu List (Reused Layout) */}
        {isMenuModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuModalOpen(false)}></div>
                <div className="bg-white w-full max-w-5xl max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0 bg-[#FFF9F2] rounded-t-[2.5rem]">
                        <h3 className="text-2xl font-bold text-stone-800 font-cute flex items-center gap-2">
                            <LayoutGrid className="text-orange-400" /> เลือกเมนูเพื่อตั้งราคา
                        </h3>
                        <button onClick={() => setIsMenuModalOpen(false)} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 bg-stone-50/50">
                        {/* UPDATED GRID FOR 2XL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                             {state.menuItems.map(menu => {
                                 const mMetrics = getMenuMetrics(menu);
                                 return (
                                     <button 
                                        key={menu.id}
                                        onClick={() => { setSelectedMenuId(menu.id); setIsMenuModalOpen(false); }}
                                        className={`relative p-6 rounded-[2rem] border-2 text-left transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[160px] bg-white group ${selectedMenuId === menu.id ? 'border-orange-400 ring-4 ring-orange-100' : 'border-stone-100 hover:border-stone-200'}`}
                                     >
                                         <div>
                                            <h4 className="font-bold text-lg text-stone-800 font-cute line-clamp-1 mb-1">{menu.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">Cost: ฿{mMetrics.realCost.toFixed(1)}</span>
                                            </div>
                                         </div>
                                         <div className="mt-4 pt-4 border-t border-stone-50 flex items-end justify-between">
                                             <div>
                                                 <p className="text-[10px] text-stone-400 font-bold uppercase">ราคาปัจจุบัน</p>
                                                 <p className="text-xl font-black text-stone-700">฿{menu.sellingPrice}</p>
                                             </div>
                                             {mMetrics.margin > 40 && (
                                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                             )}
                                         </div>
                                     </button>
                                 );
                             })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* MAIN CONTENT AREA */}
        {activeMenu && metrics ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT: Price Setting (7 Cols) */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-stone-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-300 to-pink-300"></div>
                        
                        <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                             <div className="flex-1 w-full">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <Tag size={14} /> Selling Price (ราคาขาย)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-black text-stone-300 pl-4">฿</span>
                                    <input 
                                        type="number" 
                                        value={activeMenu.sellingPrice}
                                        onChange={(e) => updateMenu(activeMenu.id, 'sellingPrice', Number(e.target.value))}
                                        className="w-full pl-12 pr-6 py-4 text-5xl font-black text-stone-800 bg-stone-50 rounded-3xl border-2 border-stone-100 outline-none focus:border-orange-400 focus:bg-white transition-all"
                                    />
                                </div>
                             </div>

                             {/* Metrics Badge */}
                             <div className="flex gap-4 shrink-0">
                                 <div className="text-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                                     <p className="text-[10px] font-bold text-stone-400 uppercase">Real Cost</p>
                                     <p className="text-xl font-bold text-stone-600">฿{metrics.realCost.toFixed(1)}</p>
                                 </div>
                                 <div className={`text-center p-4 rounded-2xl border ${metrics.profit > 0 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                                     <p className="text-[10px] font-bold uppercase opacity-70">Profit</p>
                                     <p className="text-xl font-black">{metrics.profit > 0 ? '+' : ''}฿{metrics.profit.toFixed(1)}</p>
                                 </div>
                             </div>
                        </div>

                        {/* Margin Progress Bar */}
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-stone-500">Margin Analysis</span>
                                <span className={`text-2xl font-black ${metrics.margin >= 40 ? 'text-green-500' : metrics.margin >= 20 ? 'text-orange-400' : 'text-red-500'}`}>
                                    {metrics.margin.toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-4 w-full bg-stone-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${metrics.margin >= 40 ? 'bg-green-500' : metrics.margin >= 20 ? 'bg-orange-400' : 'bg-red-500'}`} 
                                    style={{ width: `${Math.max(0, Math.min(100, metrics.margin))}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-stone-400 mt-2 text-right">
                                {metrics.margin < 20 ? '⚠️ กำไรน้อยไป ควร > 30%' : metrics.margin < 40 ? '🙂 พอใช้ได้ แต่ยังเพิ่มได้อีก' : '🚀 เยี่ยม! กำไรสูงมาก'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-stone-100">
                        <h3 className="font-bold text-stone-700 flex items-center gap-2 mb-6">
                            <Zap className="text-yellow-400 fill-yellow-400" /> แนะนำราคาทางจิตวิทยา (Magic Prices)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[0.35, 0.45, 0.55].map((targetMargin, idx) => {
                                const suggested = suggestPrice(targetMargin);
                                const isCurrent = activeMenu.sellingPrice === suggested;
                                const labels = ["ประหยัด", "ยอดนิยม", "พรีเมียม"];
                                const labelColors = ["text-blue-500", "text-orange-500", "text-purple-500"];
                                
                                return (
                                    <button 
                                        key={idx}
                                        onClick={() => updateMenu(activeMenu.id, 'sellingPrice', suggested)}
                                        className={`relative p-4 rounded-2xl border-2 text-center transition-all hover:-translate-y-1 ${isCurrent ? 'border-orange-500 bg-orange-50' : 'border-stone-100 hover:border-orange-200'}`}
                                    >
                                        <p className={`text-xs font-bold uppercase mb-1 ${labelColors[idx]}`}>{labels[idx]}</p>
                                        <p className="text-2xl font-black text-stone-800">฿{suggested}</p>
                                        <p className="text-[10px] text-stone-400 mt-1">Margin {(targetMargin * 100).toFixed(0)}%</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Bundle Strategy (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                     <div className="bg-orange-50/50 p-8 rounded-[2.5rem] border-2 border-orange-100 h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <ShoppingBag size={150} />
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-stone-800 mb-2 flex items-center gap-2">
                                <Sparkles className="text-orange-500" /> โปรโมชั่นร้าน (Bundle)
                            </h3>
                            <p className="text-sm text-stone-500 mb-8 leading-relaxed">
                                ตั้งราคาแบบ "เหมา" เพื่อกระตุ้นให้ลูกค้าซื้อมากกว่า 1 ชิ้น (ใช้ได้กับทุกเมนู)
                            </p>

                            <div className="flex gap-2 p-1 bg-white rounded-xl border border-stone-200 mb-6">
                                {['none', 'bundle'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => updateNestedState('pricing', 'promoType', type)}
                                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                                            state.pricing.promoType === type 
                                            ? 'bg-orange-400 text-white shadow-md' 
                                            : 'text-stone-400 hover:bg-stone-50'
                                        }`}
                                    >
                                        {type === 'none' ? 'ปิดโปรฯ' : 'เปิดโปรฯ เหมา'}
                                    </button>
                                ))}
                            </div>

                            {state.pricing.promoType === 'bundle' ? (
                                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in bg-white p-6 rounded-[2rem] border border-orange-100 shadow-sm">
                                    <InputField label="จำนวนชิ้นในชุด (Set)" value={state.pricing.bundleQty} onChange={v => updateNestedState('pricing', 'bundleQty', v)} />
                                    <div>
                                        <InputField label="ราคายกชุด (บาท)" value={state.pricing.bundlePrice} onChange={v => updateNestedState('pricing', 'bundlePrice', v)} prefix="฿" large />
                                        <div className="mt-3 flex items-center justify-between text-xs text-stone-500 font-bold px-2">
                                            <span>เฉลี่ยตกชิ้นละ:</span>
                                            <span className="text-orange-500 text-lg">฿{(state.pricing.bundlePrice / (state.pricing.bundleQty || 1)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-40">
                                    <ShoppingBag size={48} className="mx-auto mb-2" />
                                    <p className="font-bold">ยังไม่เปิดใช้โปรโมชั่น</p>
                                </div>
                            )}
                        </div>
                     </div>
                </div>

            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-300 bg-white rounded-[2.5rem] border-2 border-dashed border-stone-200 p-10 min-h-[400px]">
                 <Tag size={64} className="mb-4 opacity-20" />
                 <p className="font-bold text-lg text-stone-400">ยังไม่ได้เลือกเมนู</p>
                 <button onClick={() => setIsMenuModalOpen(true)} className="mt-4 bg-orange-400 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-500 transition-all">
                     เลือกเมนูเพื่อตั้งราคา
                 </button>
             </div>
        )}
    </div>
  );
};

export default Pricing;
