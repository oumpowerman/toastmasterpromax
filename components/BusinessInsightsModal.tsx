import React, { useState } from 'react';
import { X, TrendingUp, AlertTriangle, Target, Search, CheckCircle2, XCircle, Calculator, ChevronDown, ChevronUp, HelpCircle, FileBarChart2, Coins, Layers, ArrowDownRight, Info, Store, Zap, ShoppingBag, PieChart, ArrowRight, Minus, Equal, User, Truck, Plus } from 'lucide-react';
import { AppState } from '../types';
import { calculateTotalFixedCostPerDay, calculateBaseCostPerUnit } from '../utils/calculations';

interface BusinessInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  results: any;
}

const BusinessInsightsModal: React.FC<BusinessInsightsModalProps> = ({ isOpen, onClose, state, results }) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'cost' | 'risk'>('financial');
  const [showMarginCalc, setShowMarginCalc] = useState(false);
  const [expandedCostId, setExpandedCostId] = useState<string | null>(null);
  
  // New State for Top Cards Drilldown
  const [expandedStatusCard, setExpandedStatusCard] = useState<'cogs' | 'fixed' | 'net' | null>(null);

  if (!isOpen) return null;

  // --- Calculations for Analysis ---
  const netProfitMargin = results.revenue > 0 ? (results.profit / results.revenue) * 100 : 0;
  const fixedCostRatio = results.revenue > 0 ? (calculateTotalFixedCostPerDay(state) / results.revenue) * 100 : 0;
  const cogsRatio = results.revenue > 0 ? ((results.realCost * results.unitsSold) / results.revenue) * 100 : 0;
  
  // Capacity Utilization
  const maxCapacity = state.traffic.openHours * 30; 
  const utilizationRate = (results.unitsSold / maxCapacity) * 100;

  // --- New Cost Breakdown Calculations ---
  const avgPrice = results.unitsSold > 0 ? results.revenue / results.unitsSold : 0;
  const baseCostPerUnit = calculateBaseCostPerUnit(state);
  const hiddenCostPerUnit = results.realCost - baseCostPerUnit;
  const unitContribution = avgPrice - results.realCost;
  
  const dailyFixed = calculateTotalFixedCostPerDay(state);
  const dailyHiddenTotal = hiddenCostPerUnit * results.unitsSold;
  const dailyBaseCostTotal = baseCostPerUnit * results.unitsSold;

  // Grade Calculation
  let grade = 'C';
  let gradeColor = 'text-yellow-500 bg-yellow-100 border-yellow-200';
  if (netProfitMargin > 25 && results.paybackDays < 120) { grade = 'A+'; gradeColor = 'text-green-500 bg-green-100 border-green-200'; }
  else if (netProfitMargin > 20) { grade = 'A'; gradeColor = 'text-green-500 bg-green-100 border-green-200'; }
  else if (netProfitMargin > 15) { grade = 'B'; gradeColor = 'text-blue-500 bg-blue-100 border-blue-200'; }
  else if (netProfitMargin > 5) { grade = 'C'; gradeColor = 'text-yellow-500 bg-yellow-100 border-yellow-200'; }
  else { grade = 'D'; gradeColor = 'text-red-500 bg-red-100 border-red-200'; }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-cute">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden border-4 border-white">
        
        {/* Header */}
        <div className="bg-[#FFF9F2] p-8 border-b-2 border-orange-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm border-2 border-stone-100 relative group hover:scale-110 transition-transform duration-300 cursor-help">
               📊
               <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-4 flex items-center justify-center font-black text-lg shadow-sm ${gradeColor}`}>
                 {grade}
               </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                  วิเคราะห์แผนธุรกิจ (Plan Analysis)
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-lg border border-orange-200">Simulation Mode</span>
              </h2>
              <p className="text-stone-500 text-sm mt-1">ประเมินศักยภาพจาก <span className="font-bold text-orange-500">การตั้งค่าโมเดลธุรกิจของคุณ</span></p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-full bg-stone-100 hover:bg-red-100 hover:text-red-500 text-stone-400 flex items-center justify-center transition-all hover:rotate-90 shadow-sm"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-stone-50 p-6 flex flex-col gap-3 border-r border-stone-100 shrink-0 overflow-y-auto">
                <button 
                    onClick={() => setActiveTab('financial')} 
                    className={`p-4 rounded-2xl text-left font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 ${activeTab === 'financial' ? 'bg-white text-orange-500 shadow-md border-2 border-orange-100' : 'text-stone-400 hover:bg-white hover:text-stone-600 border-2 border-transparent'}`}
                >
                    <div className={`p-2 rounded-xl ${activeTab === 'financial' ? 'bg-orange-100' : 'bg-stone-200'}`}>
                        <TrendingUp size={20} />
                    </div>
                    สุขภาพการเงิน
                </button>
                <button 
                    onClick={() => setActiveTab('cost')} 
                    className={`p-4 rounded-2xl text-left font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 ${activeTab === 'cost' ? 'bg-white text-blue-500 shadow-md border-2 border-blue-100' : 'text-stone-400 hover:bg-white hover:text-stone-600 border-2 border-transparent'}`}
                >
                    <div className={`p-2 rounded-xl ${activeTab === 'cost' ? 'bg-blue-100' : 'bg-stone-200'}`}>
                        <Search size={20} />
                    </div>
                    โครงสร้างต้นทุน
                </button>
                <button 
                    onClick={() => setActiveTab('risk')} 
                    className={`p-4 rounded-2xl text-left font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 ${activeTab === 'risk' ? 'bg-white text-red-500 shadow-md border-2 border-red-100' : 'text-stone-400 hover:bg-white hover:text-stone-600 border-2 border-transparent'}`}
                >
                    <div className={`p-2 rounded-xl ${activeTab === 'risk' ? 'bg-red-100' : 'bg-stone-200'}`}>
                        <AlertTriangle size={20} />
                    </div>
                    ความเสี่ยง
                </button>
                
                <div className="mt-auto pt-4 border-t border-stone-200">
                    <p className="text-[10px] text-stone-400 text-center font-bold">
                        *หากต้องการดูยอดขายจริง<br/>ให้ไปที่เมนู "บัญชี & ยอดขาย"
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar">
                
                {activeTab === 'financial' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Margin Card with Explanation */}
                        <div className="bg-green-50 p-8 rounded-[2.5rem] border-2 border-green-100 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                 <Calculator size={100} />
                             </div>
                             
                             <div className="relative z-10">
                                 <h3 className="text-2xl font-bold text-green-800 mb-2 flex items-center gap-3">
                                    <Target className="text-green-600" size={28} /> 
                                    Net Profit Margin (คาดการณ์): <span className="text-4xl">{netProfitMargin.toFixed(1)}%</span>
                                 </h3>
                                 <p className="text-stone-600 text-lg mb-6">
                                    {netProfitMargin > 20 
                                    ? "🎉 สุดยอด! โมเดลธุรกิจนี้กำไรต่อชิ้นสูงมาก (เกิน 20%) น่าลงทุนครับ" 
                                    : netProfitMargin > 10 
                                    ? "😊 ถือว่าดีครับ อยู่ในเกณฑ์มาตรฐานร้านอาหาร (10-20%)"
                                    : "⚠️ กำไรบางไปหน่อยครับ (< 10%) แผนนี้อาจเหนื่อยฟรี ลองลดต้นทุนหรือเพิ่มราคาดูนะ"}
                                 </p>

                                 {/* Interactive Calculation Explanation */}
                                 <div className="bg-white/80 rounded-2xl border-2 border-green-200 overflow-hidden transition-all duration-500">
                                     <button 
                                        onClick={() => setShowMarginCalc(!showMarginCalc)}
                                        className="w-full flex items-center justify-between p-4 text-green-700 font-bold hover:bg-green-100/50 transition-colors"
                                     >
                                         <div className="flex items-center gap-2">
                                             <HelpCircle size={20} />
                                             Margin คืออะไร? คิดยังไง?
                                         </div>
                                         {showMarginCalc ? <ChevronUp /> : <ChevronDown />}
                                     </button>
                                     
                                     {showMarginCalc && (
                                         <div className="p-6 pt-0 border-t border-green-100 bg-green-50/50 text-stone-700 animate-in slide-in-from-top-2">
                                             <p className="mb-4">
                                                 <strong>Margin (อัตรากำไรสุทธิ)</strong> คือ ตัวเลขที่บอกว่า "ขายของได้เงินมา 100 บาท หักค่าของ ค่าที่ ค่าแรงทุกอย่างแล้ว เหลือเข้ากระเป๋าเราจริงๆ กี่บาท"
                                             </p>
                                             
                                             <div className="bg-white p-4 rounded-xl border border-stone-200 mb-4">
                                                 <p className="text-sm text-stone-400 font-bold mb-2 uppercase">สูตรคำนวณจากแผนของคุณ:</p>
                                                 <div className="flex flex-wrap items-center gap-3 text-lg font-bold">
                                                     <span className="text-green-600 bg-green-100 px-3 py-1 rounded-lg">
                                                         (กำไรจำลอง ฿{Math.round(results.profit).toLocaleString()})
                                                     </span>
                                                     <span className="text-stone-400">÷</span>
                                                     <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">
                                                         (ยอดขายจำลอง ฿{Math.round(results.revenue).toLocaleString()})
                                                     </span>
                                                     <span className="text-stone-400">× 100</span>
                                                     <span className="text-stone-400">=</span>
                                                     <span className="text-orange-500 text-2xl">{netProfitMargin.toFixed(1)}%</span>
                                                 </div>
                                             </div>
                                             
                                             <p className="text-sm text-stone-500">
                                                 💡 <strong>Tip:</strong> ถ้ายอดขายเยอะแต่ Margin น้อย แปลว่าเราเหนื่อยฟรี! ลองลดต้นทุนวัตถุดิบ หรือเพิ่มราคาขายดูนะครับ
                                             </p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border-2 border-stone-100 p-6 rounded-[2rem] hover:border-orange-200 transition-colors">
                                <p className="text-stone-400 font-bold uppercase mb-2 text-sm">จุดคุ้มทุน (Break-even)</p>
                                <p className="text-3xl font-black text-stone-700 mb-2">{Math.ceil(results.breakEvenUnits)} <span className="text-lg text-stone-400">ชิ้น/วัน</span></p>
                                <p className="text-sm text-stone-500">
                                    ต้องขายให้ได้เท่านี้ก่อน ถึงจะเริ่มนับกำไรบาทแรก (ในแผนขายได้ <strong>{Math.floor(results.unitsSold)}</strong> ชิ้น)
                                </p>
                            </div>
                             <div className="border-2 border-stone-100 p-6 rounded-[2rem] hover:border-blue-200 transition-colors">
                                <p className="text-stone-400 font-bold uppercase mb-2 text-sm">ระยะคืนทุน (Payback)</p>
                                <p className="text-3xl font-black text-stone-700 mb-2">{results.paybackDays === Infinity ? 'นานมาก...' : `${Math.ceil(results.paybackDays)} วัน`}</p>
                                <p className="text-sm text-stone-500">
                                    {results.paybackDays < 90 
                                    ? "🚀 คืนทุนไวมาก! เหมือนเสกเงินได้เลย" 
                                    : "⏳ อดทนหน่อยนะ เดี๋ยวก็ได้ทุนคืนแล้ว"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cost' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Summary Ratio Row (Interactive) */}
                        <div className="flex gap-4">
                            {/* COGS Card */}
                            <button 
                                onClick={() => setExpandedStatusCard(expandedStatusCard === 'cogs' ? null : 'cogs')}
                                className={`flex-1 p-6 rounded-[2rem] text-center border-2 transition-all duration-300 group ${expandedStatusCard === 'cogs' ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200' : 'bg-stone-50 border-stone-100 hover:border-orange-300 hover:-translate-y-1'}`}
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <p className="text-sm font-bold text-stone-400 uppercase">ค่าวัตถุดิบ (COGS)</p>
                                    <div className="bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Search size={12} className="text-orange-400"/>
                                    </div>
                                </div>
                                <p className="text-4xl font-black text-stone-700">{cogsRatio.toFixed(0)}%</p>
                                {expandedStatusCard === 'cogs' && <div className="w-8 h-1 bg-orange-400 mx-auto mt-2 rounded-full"></div>}
                            </button>

                            {/* Fixed Cost Card */}
                            <button 
                                onClick={() => setExpandedStatusCard(expandedStatusCard === 'fixed' ? null : 'fixed')}
                                className={`flex-1 p-6 rounded-[2rem] text-center border-2 transition-all duration-300 group ${expandedStatusCard === 'fixed' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-stone-50 border-stone-100 hover:border-blue-300 hover:-translate-y-1'}`}
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <p className="text-sm font-bold text-stone-400 uppercase">ค่าที่ & ค่าแรง</p>
                                    <div className="bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Search size={12} className="text-blue-400"/>
                                    </div>
                                </div>
                                <p className="text-4xl font-black text-stone-700">{fixedCostRatio.toFixed(0)}%</p>
                                {expandedStatusCard === 'fixed' && <div className="w-8 h-1 bg-blue-400 mx-auto mt-2 rounded-full"></div>}
                            </button>

                            {/* Profit Card */}
                            <button 
                                onClick={() => setExpandedStatusCard(expandedStatusCard === 'net' ? null : 'net')}
                                className={`flex-1 p-6 rounded-[2rem] text-center border-2 transition-all duration-300 group ${expandedStatusCard === 'net' ? 'bg-green-50 border-green-400 ring-2 ring-green-200' : 'bg-stone-50 border-stone-100 hover:border-green-300 hover:-translate-y-1'}`}
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <p className="text-sm font-bold text-stone-400 uppercase">กำไรสุทธิ</p>
                                    <div className="bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Search size={12} className="text-green-400"/>
                                    </div>
                                </div>
                                <p className="text-4xl font-black text-green-500">{netProfitMargin.toFixed(0)}%</p>
                                {expandedStatusCard === 'net' && <div className="w-8 h-1 bg-green-400 mx-auto mt-2 rounded-full"></div>}
                            </button>
                        </div>

                        {/* Drill Down Details Logic */}
                        {expandedStatusCard && (
                            <div className="bg-white rounded-[2rem] border-2 border-stone-100 shadow-lg p-6 animate-in slide-in-from-top-2 relative overflow-hidden">
                                <button onClick={() => setExpandedStatusCard(null)} className="absolute top-4 right-4 text-stone-300 hover:text-stone-500"><X size={20}/></button>
                                
                                {expandedStatusCard === 'cogs' && (
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                                            <ShoppingBag size={20}/> เจาะลึกต้นทุนสินค้า (COGS Breakdown)
                                        </h4>
                                        <div className="flex items-center justify-between bg-orange-50 p-4 rounded-2xl border border-orange-100 text-sm font-bold text-stone-600">
                                            <div>
                                                <p className="text-xs text-stone-400 uppercase mb-1">ค่าวัตถุดิบจริง</p>
                                                <p className="text-lg">฿{dailyBaseCostTotal.toFixed(0)}</p>
                                            </div>
                                            <Plus size={16} className="text-orange-300"/>
                                            <div>
                                                <p className="text-xs text-stone-400 uppercase mb-1">ค่าแฝง (Waste/GP)</p>
                                                <p className="text-lg text-red-500">฿{dailyHiddenTotal.toFixed(0)}</p>
                                            </div>
                                            <Equal size={16} className="text-orange-300"/>
                                            <div>
                                                <p className="text-xs text-stone-400 uppercase mb-1">COGS รวม</p>
                                                <p className="text-xl text-orange-600">฿{(results.realCost * results.unitsSold).toFixed(0)}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl">
                                            <span className="font-bold text-orange-500">💡 Guru Tip:</span> ควรคุมให้ไม่เกิน 35% ของยอดขาย หากเกิน ลองเจรจา Supplier หรือปรับสูตรลด Waste ดูนะครับ
                                        </div>
                                    </div>
                                )}

                                {expandedStatusCard === 'fixed' && (
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                                            <Store size={20}/> ภาระคงที่ (Fixed Costs Breakdown)
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase">ค่าเช่า</p>
                                                <p className="text-lg font-black text-blue-700">฿{state.fixedCosts.boothRent}</p>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase">ค่าแรง</p>
                                                <p className="text-lg font-black text-blue-700">฿{state.fixedCosts.laborOwner}</p>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase">เดินทาง</p>
                                                <p className="text-lg font-black text-blue-700">฿{state.fixedCosts.transport}</p>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase">น้ำ/ไฟ</p>
                                                <p className="text-lg font-black text-blue-700">฿{state.fixedCosts.electricityBase}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl">
                                            <span className="font-bold text-blue-500">💡 Guru Tip:</span> ยิ่งขายได้เยอะ % ค่าที่ตรงนี้จะยิ่งลดลง (Economy of Scale) เพราะตัวหารเยอะขึ้นนั่นเองครับ
                                        </div>
                                    </div>
                                )}

                                {expandedStatusCard === 'net' && (
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-green-600 flex items-center gap-2">
                                            <Coins size={20}/> สมการกำไร (Profit Equation)
                                        </h4>
                                        <div className="flex flex-col md:flex-row gap-4 items-center justify-center text-center">
                                            <div className="bg-green-100 p-4 rounded-2xl border border-green-200 w-full">
                                                <p className="text-xs font-bold text-green-600 uppercase">รายรับ</p>
                                                <p className="text-2xl font-black text-green-800">฿{results.revenue.toFixed(0)}</p>
                                            </div>
                                            <Minus size={24} className="text-stone-300"/>
                                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 w-full">
                                                <p className="text-xs font-bold text-red-500 uppercase">ต้นทุนรวม</p>
                                                <p className="text-2xl font-black text-red-600">฿{results.totalCost.toFixed(0)}</p>
                                            </div>
                                            <ArrowRight size={24} className="text-stone-300"/>
                                            <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg w-full">
                                                <p className="text-xs font-bold uppercase opacity-80">กำไรสุทธิ</p>
                                                <p className="text-3xl font-black">฿{results.profit.toFixed(0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Existing Insight Card (Legacy) - Keeping it but maybe simpler logic since we have drilldown */}
                        <div className="bg-blue-50 p-8 rounded-[2.5rem] border-2 border-blue-100">
                             <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center gap-2">
                                <Search className="text-blue-600" size={24} /> สรุปโครงสร้างต้นทุน (Overview)
                             </h3>
                             <div className="space-y-6 text-lg text-stone-600">
                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                   <p className="mb-2"><strong>🍞 1. ค่าวัตถุดิบ ({cogsRatio.toFixed(1)}%):</strong></p>
                                   <p className="text-base">
                                       {cogsRatio > 40 
                                       ? "🚨 สูงเกินไปครับ! ปกติขนมปังปิ้งไม่ควรเกิน 30-35% ลองเช็คดูว่าใช้เนยแพงไปไหม? หรือใส่ไส้เยอะเกินความจำเป็น? หรือมีของเสีย (Waste) เยอะเกินไป?" 
                                       : "✅ ควบคุมได้ดีครับ อยู่ในเกณฑ์ที่ทำกำไรได้สวยๆ เลย"}
                                   </p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                   <p className="mb-2"><strong>🏠 2. ค่าที่/ค่าแรง ({fixedCostRatio.toFixed(1)}%):</strong></p>
                                   <p className="text-base">
                                       {fixedCostRatio > 30 
                                       ? "😓 ภาระหนักอึ้ง! คุณกำลังทำงานเพื่อจ่ายค่าที่ครับ ถ้ายอดขายเพิ่มไม่ได้ ต้องเจรจาลดค่าเช่า หรือพิจารณาย้ายทำเลด่วน" 
                                       : "👍 สัดส่วนกำลังดีครับ แสดงว่ายอดขายคุณ Cover ค่าที่ได้สบายๆ"}
                                   </p>
                                </div>
                             </div>
                        </div>

                        {/* NEW: 3 Cost Pillars Section (Existing) */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-stone-700 flex items-center gap-2 pl-2">
                                <Layers className="text-orange-500"/> เจาะลึก 3 เสาหลักต้นทุน (The 3 Cost Pillars)
                            </h3>
                            <p className="text-stone-400 text-sm pl-2 -mt-2 mb-2">กดที่การ์ดเพื่อดูรายละเอียดและความลับที่ซ่อนอยู่</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* ... (Keeping existing 3 Cost Pillars cards code as is) ... */}
                                {/* Card 1: Unit Contribution */}
                                <button 
                                    onClick={() => setExpandedCostId(expandedCostId === 'contribution' ? null : 'contribution')}
                                    className={`relative p-5 rounded-[2rem] border-2 text-left transition-all duration-300 group hover:-translate-y-1 ${expandedCostId === 'contribution' ? 'bg-orange-50 border-orange-300 ring-4 ring-orange-100' : 'bg-white border-stone-100 hover:border-orange-200 hover:shadow-lg'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-orange-100 rounded-2xl text-orange-500"><Coins size={24}/></div>
                                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">The Engine</div>
                                    </div>
                                    <p className="text-stone-400 font-bold text-xs uppercase mb-1">กำไรส่วนเกิน (ต่อชิ้น)</p>
                                    <p className="text-3xl font-black text-stone-800 mb-2">฿{unitContribution.toFixed(1)}</p>
                                    <p className="text-xs text-stone-500 font-medium">เงินเหลือจริงหลังขาย 1 ชิ้น</p>
                                    {expandedCostId === 'contribution' && <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-400 rounded-b-[2rem]"></div>}
                                </button>

                                {/* Card 2: Hidden Leakage */}
                                <button 
                                    onClick={() => setExpandedCostId(expandedCostId === 'hidden' ? null : 'hidden')}
                                    className={`relative p-5 rounded-[2rem] border-2 text-left transition-all duration-300 group hover:-translate-y-1 ${expandedCostId === 'hidden' ? 'bg-rose-50 border-rose-300 ring-4 ring-rose-100' : 'bg-white border-stone-100 hover:border-rose-200 hover:shadow-lg'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-rose-100 rounded-2xl text-rose-500"><ArrowDownRight size={24}/></div>
                                        <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">The Leaks</div>
                                    </div>
                                    <p className="text-stone-400 font-bold text-xs uppercase mb-1">ค่าแฝง (รายวัน)</p>
                                    <p className="text-3xl font-black text-stone-800 mb-2">฿{dailyHiddenTotal.toFixed(0)}</p>
                                    <p className="text-xs text-stone-500 font-medium">เงินที่หายไปกับ Waste/GP</p>
                                    {expandedCostId === 'hidden' && <div className="absolute inset-x-0 bottom-0 h-1 bg-rose-400 rounded-b-[2rem]"></div>}
                                </button>

                                {/* Card 3: Daily Fixed */}
                                <button 
                                    onClick={() => setExpandedCostId(expandedCostId === 'fixed' ? null : 'fixed')}
                                    className={`relative p-5 rounded-[2rem] border-2 text-left transition-all duration-300 group hover:-translate-y-1 ${expandedCostId === 'fixed' ? 'bg-blue-50 border-blue-300 ring-4 ring-blue-100' : 'bg-white border-stone-100 hover:border-blue-200 hover:shadow-lg'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-100 rounded-2xl text-blue-500"><Store size={24}/></div>
                                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">The Burden</div>
                                    </div>
                                    <p className="text-stone-400 font-bold text-xs uppercase mb-1">ภาระคงที่ (รายวัน)</p>
                                    <p className="text-3xl font-black text-stone-800 mb-2">฿{dailyFixed.toFixed(0)}</p>
                                    <p className="text-xs text-stone-500 font-medium">ค่าเช่า+แรง ที่ต้องหาให้ได้</p>
                                    {expandedCostId === 'fixed' && <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-400 rounded-b-[2rem]"></div>}
                                </button>
                            </div>

                            {/* Detailed Explanation Area */}
                            {expandedCostId && (
                                <div className="bg-white p-6 rounded-[2rem] border-2 border-stone-100 shadow-sm animate-in slide-in-from-top-2 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                        {expandedCostId === 'contribution' && <Coins size={120}/>}
                                        {expandedCostId === 'hidden' && <AlertTriangle size={120}/>}
                                        {expandedCostId === 'fixed' && <Store size={120}/>}
                                    </div>

                                    {/* CONTRIBUTION DETAIL */}
                                    {expandedCostId === 'contribution' && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                                                <Info size={20}/> กำไรส่วนเกินสำคัญยังไง?
                                            </h4>
                                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-stone-600">
                                                <p className="mb-2">คือเงินที่เหลือจากการขายสินค้า 1 ชิ้น เพื่อนำไปจ่าย "ค่าที่" และ "เก็บเป็นกำไร"</p>
                                                <div className="flex flex-wrap items-center gap-2 text-sm font-bold bg-white p-3 rounded-xl border border-orange-200 w-fit">
                                                    <span>ราคาขาย (฿{avgPrice.toFixed(1)})</span>
                                                    <span className="text-stone-300">-</span>
                                                    <span>ต้นทุนผันแปร (฿{results.realCost.toFixed(1)})</span>
                                                    <span className="text-stone-300">=</span>
                                                    <span className="text-orange-500">กำไรส่วนเกิน ฿{unitContribution.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 text-sm">
                                                <div className="flex-1 bg-stone-50 p-3 rounded-xl">
                                                    <span className="block font-bold text-stone-400 text-xs uppercase mb-1">Guru Warning ⚠️</span>
                                                    <p>ถ้าน้อยกว่า 10 บาท/ชิ้น คุณจะเหนื่อยมาก! เพราะต้องขายจำนวนมหาศาลกว่าจะคุ้มค่าเช่า</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* HIDDEN COST DETAIL */}
                                    {expandedCostId === 'hidden' && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                                                <AlertTriangle size={20}/> เงินรั่วไหลไปไหน?
                                            </h4>
                                            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-stone-600">
                                                <p className="mb-3">ตัวเลขนี้คือมูลค่าความสูญเสียที่คุณ "ยอมรับ" ไว้ในระบบแล้ว (Waste + GP + Promo)</p>
                                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                    <div className="bg-white p-2 rounded-lg border border-rose-200">
                                                        <span className="block font-bold text-rose-400">Waste {state.hiddenPercentages.waste}%</span>
                                                        <span>~฿{(results.revenue * state.hiddenPercentages.waste / 100).toFixed(0)}</span>
                                                    </div>
                                                    <div className="bg-white p-2 rounded-lg border border-rose-200">
                                                        <span className="block font-bold text-rose-400">GP/Fee {state.hiddenPercentages.paymentFee}%</span>
                                                        <span>~฿{(results.revenue * state.hiddenPercentages.paymentFee / 100).toFixed(0)}</span>
                                                    </div>
                                                    <div className="bg-white p-2 rounded-lg border border-rose-200">
                                                        <span className="block font-bold text-rose-400">Promo {state.hiddenPercentages.promoLoss}%</span>
                                                        <span>~฿{(results.revenue * state.hiddenPercentages.promoLoss / 100).toFixed(0)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-stone-50 p-3 rounded-xl text-sm">
                                                <span className="block font-bold text-stone-400 text-xs uppercase mb-1">Guru Warning ⚠️</span>
                                                <p>มือใหม่มักลืมคิดค่า Waste! ของเสีย 1 ชิ้น ต้องขายดี 3-4 ชิ้นถึงจะดึงทุนคืนมาได้นะ</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* FIXED COST DETAIL */}
                                    {expandedCostId === 'fixed' && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                                                <Store size={20}/> ภาระที่ต้องแบกทุกเช้า
                                            </h4>
                                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-stone-600">
                                                <p className="mb-3">ไม่ว่าจะขายได้หรือไม่ได้ คุณต้องหาเงินจำนวนนี้มาจ่ายทุกวัน</p>
                                                <ul className="space-y-1 text-sm bg-white p-3 rounded-xl border border-blue-200">
                                                    <li className="flex justify-between"><span>ค่าเช่าที่ (เฉลี่ย)</span> <span className="font-bold">฿{state.fixedCosts.boothRent}</span></li>
                                                    <li className="flex justify-between"><span>ค่าแรงตัวเอง</span> <span className="font-bold">฿{state.fixedCosts.laborOwner}</span></li>
                                                    <li className="flex justify-between"><span>ค่าน้ำ/ไฟ/เดินทาง</span> <span className="font-bold">฿{state.fixedCosts.electricityBase + state.fixedCosts.transport}</span></li>
                                                </ul>
                                            </div>
                                            <div className="bg-stone-50 p-3 rounded-xl text-sm">
                                                <span className="block font-bold text-stone-400 text-xs uppercase mb-1">Guru Warning ⚠️</span>
                                                <p>อย่าลืมใส่ "ค่าแรงตัวเอง"! ไม่งั้นคุณจะแค่ "ซื้อมาขายไป" แต่ไม่ได้อะไรตอบแทนความเหนื่อยเลย</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                     </div>
                )}

                {activeTab === 'risk' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Risk content remains same */}
                        <div className="bg-red-50 p-8 rounded-[2.5rem] border-2 border-red-100">
                             <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="text-red-500" size={24} /> Stress Test: ถ้าวันหนึ่งยอดตก 50%?
                             </h3>
                             <p className="text-stone-600 text-lg mb-6">
                                สมมติว่าฝนตกหนัก หรือมีคู่แข่งมาเปิดข้างๆ ทำให้ยอดขายคุณหายไปครึ่งหนึ่ง จาก {Math.floor(results.unitsSold)} เหลือ {Math.floor(results.unitsSold / 2)} ชิ้น... คุณจะรอดมั้ย?
                             </p>
                             {(() => {
                                 const stressRevenue = results.revenue * 0.5;
                                 const stressVarCost = (results.realCost * results.unitsSold * 0.5);
                                 const stressProfit = stressRevenue - stressVarCost - calculateTotalFixedCostPerDay(state);
                                 return (
                                     <div className={`p-6 rounded-2xl border-4 border-dashed text-center transform rotate-1 transition-transform hover:rotate-0 ${stressProfit > 0 ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-red-300 text-red-500'}`}>
                                         <p className="font-black text-2xl">
                                             คุณจะ {stressProfit > 0 ? `ยังรอด! กำไร ฿${stressProfit.toFixed(0)}` : `ขาดทุนทันที ฿${Math.abs(stressProfit).toFixed(0)}`} ต่อวัน
                                         </p>
                                         <p className="text-sm mt-2 font-bold opacity-80">{stressProfit > 0 ? "โมเดลธุรกิจคุณแข็งแกร่งมากครับ!" : "อันตราย! ต้องรีบสำรองเงินสดไว้นะ"}</p>
                                     </div>
                                 );
                             })()}
                        </div>

                         <div className="bg-orange-50 p-8 rounded-[2.5rem] border-2 border-orange-100">
                             <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="text-orange-500" size={24} /> เช็คความเหนื่อย (Efficiency)
                             </h3>
                             <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-stone-400 mb-2">Utilization Rate (ความแน่นของร้าน)</p>
                                    <div className="w-full bg-stone-200 h-6 rounded-full overflow-hidden border border-stone-300">
                                        <div className="h-full bg-orange-400 striped-bar" style={{ width: `${Math.min(utilizationRate, 100)}%` }}></div>
                                    </div>
                                    <p className="text-right text-sm font-bold text-orange-500 mt-2">{utilizationRate.toFixed(1)}% ของกำลังผลิตสูงสุด</p>
                                </div>
                             </div>
                             <p className="text-stone-600 text-lg">
                                {utilizationRate > 80 
                                ? "🥵 ร้านแน่นมาก! ระวังลูกค้าหนีเพราะรอนาน พิจารณาเพิ่มเตาปิ้งหรือหาลูกมือเพิ่มด่วน" 
                                : utilizationRate < 30 
                                ? "😴 ร้านว่างเกินไป อุปกรณ์และคนว่างงานเยอะ ลองทำโปรโมชั่นช่วง Off-peak ดูครับ" 
                                : "👌 กำลังดีครับ ลูกค้าไม่ต้องรอนานเกินไป และเราก็ไม่ว่างจนเกินไป"}
                             </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInsightsModal;