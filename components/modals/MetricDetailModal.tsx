
import React from 'react';
import { X, TrendingUp, PiggyBank, Calculator, Heart, ArrowRight, Minus, Divide, Equal, ArrowDown, Plus } from 'lucide-react';
import { AppState } from '../../types';
import { calculateTotalFixedCostPerDay } from '../../utils/calculations';

type MetricType = 'profit' | 'payback' | 'hourly' | 'safety' | null;

interface MetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: MetricType;
  state: AppState;
  results: any;
}

const MetricDetailModal: React.FC<MetricDetailModalProps> = ({ isOpen, onClose, metric, state, results }) => {
  if (!isOpen || !metric) return null;

  const fixedCost = calculateTotalFixedCostPerDay(state);
  const fixedCostPerUnit = results.unitsSold > 0 ? fixedCost / results.unitsSold : 0;

  // Configuration for each metric type
  const config = {
    profit: {
      title: 'กำไรต่อวัน (Daily Profit)',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      accent: 'bg-emerald-500',
      desc: 'รายรับทั้งหมด หัก ลบด้วยต้นทุนทั้งหมด (ค่าของ + ค่าที่ + ค่าแรง)'
    },
    payback: {
      title: 'ระยะคืนทุน (Payback Period)',
      icon: PiggyBank,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      accent: 'bg-blue-500',
      desc: 'จำนวนวันที่ต้องขาย เพื่อให้ได้กำไรสะสมเท่ากับเงินลงทุนเริ่มต้น'
    },
    hourly: {
      title: 'กำไรต่อชั่วโมง (Hourly Profit)',
      icon: Calculator,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      accent: 'bg-orange-500',
      desc: 'ความคุ้มค่าของเวลาที่เสียไป (กำไรสุทธิ ÷ จำนวนชั่วโมงเปิดร้าน)'
    },
    safety: {
      title: 'ราคาปลอดภัย (Safety Price)',
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      accent: 'bg-rose-500',
      desc: 'ราคาขายขั้นต่ำสุดที่ "ห้ามต่ำกว่านี้" ไม่งั้นจะขาดทุน (รวมต้นทุนแฝงแล้ว)'
    }
  };

  const current = config[metric];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-cute">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className={`bg-white w-full max-w-lg rounded-[2.5rem] relative z-10 animate-in zoom-in-95 flex flex-col shadow-2xl border-4 border-white overflow-hidden`}>
        
        {/* Header */}
        <div className={`${current.bg} p-6 border-b ${current.border} flex justify-between items-start`}>
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm ${current.color}`}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className={`text-xl font-black ${current.color}`}>{current.title}</h3>
                    <p className="text-stone-500 text-xs font-bold mt-1">{current.desc}</p>
                </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-stone-400 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Body Content based on Metric */}
        <div className="p-8 space-y-6">
            
            {metric === 'profit' && (
                <>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                            <span className="font-bold text-green-700">รายรับรวม (Revenue)</span>
                            <span className="font-black text-green-600 text-lg">฿{results.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-center"><Minus size={20} className="text-stone-300"/></div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                            <span className="font-bold text-red-700">ต้นทุนรวม (Total Cost)</span>
                            <span className="font-black text-red-600 text-lg">฿{results.totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-center"><ArrowDown size={20} className="text-stone-300"/></div>
                        <div className="flex justify-between items-center p-4 bg-emerald-100 rounded-2xl border border-emerald-200 shadow-sm">
                            <span className="font-bold text-emerald-800">กำไรสุทธิ (Net Profit)</span>
                            <span className="font-black text-emerald-700 text-2xl">฿{results.profit.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-center text-xs text-stone-400 font-bold bg-stone-50 p-2 rounded-lg">
                        *หักค่าวัตถุดิบ ค่าที่ ค่าแรง และค่าแฝงทั้งหมดแล้ว
                    </div>
                </>
            )}

            {metric === 'payback' && (
                <>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                                <p className="text-xs font-bold text-blue-400 uppercase">เงินลงทุนรวม</p>
                                <p className="text-xl font-black text-blue-600">฿{results.totalInvestment.toLocaleString()}</p>
                            </div>
                            <Divide size={24} className="text-blue-200"/>
                            <div className="flex-1 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                <p className="text-xs font-bold text-emerald-400 uppercase">กำไร/วัน</p>
                                <p className="text-xl font-black text-emerald-600">฿{results.profit.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-center"><Equal size={24} className="text-stone-300"/></div>

                        <div className="bg-stone-800 text-white p-6 rounded-[2rem] text-center shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                            <p className="text-sm font-bold opacity-80 mb-1">จะคืนทุนภายใน</p>
                            <p className="text-5xl font-black text-yellow-400">
                                {results.paybackDays === Infinity ? "∞" : Math.ceil(results.paybackDays)} 
                                <span className="text-xl text-white ml-2">วัน</span>
                            </p>
                            {results.paybackDays !== Infinity && (
                                <p className="text-xs mt-2 opacity-60">
                                    (ประมาณวันที่ {new Date(new Date().setDate(new Date().getDate() + Math.ceil(results.paybackDays))).toLocaleDateString('th-TH', { day: 'numeric', month: 'long' })})
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {metric === 'hourly' && (
                <>
                    <div className="flex flex-col gap-3 text-center">
                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                            <p className="text-stone-500 font-bold mb-2">กำไรต่อวัน ฿{results.profit.toLocaleString()}</p>
                            <div className="w-full h-px bg-orange-200 my-2"></div>
                            <p className="text-stone-500 font-bold mt-2">เปิดร้าน {state.traffic.openHours} ชั่วโมง</p>
                        </div>
                        
                        <div className="flex justify-center"><ArrowDown size={24} className="text-orange-200"/></div>

                        <div className="p-6 bg-gradient-to-br from-orange-400 to-amber-500 rounded-[2rem] shadow-lg text-white">
                            <p className="font-bold opacity-90 text-sm uppercase mb-1">กำไรเฉลี่ยชั่วโมงละ</p>
                            <p className="text-5xl font-black">฿{results.profitPerHour.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                        </div>
                        
                        <p className="text-xs text-stone-400 mt-2">
                            *เปรียบเทียบ: ค่าแรงขั้นต่ำรายชั่วโมงประมาณ ฿40-50
                        </p>
                    </div>
                </>
            )}

            {metric === 'safety' && (
                <>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <span className="font-bold text-stone-600 text-sm">ต้นทุนผันแปรเฉลี่ย (ต่อชิ้น)</span>
                            <span className="font-black text-stone-700">฿{results.realCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-center"><Plus size={16} className="text-stone-300"/></div>
                        <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <div className="text-left">
                                <span className="font-bold text-stone-600 text-sm block">ต้นทุนคงที่เฉลี่ย (ต่อชิ้น)</span>
                                <span className="text-[10px] text-stone-400">(ค่าที่+ค่าแรง) ÷ ยอดขาย {Math.floor(results.unitsSold)} ชิ้น</span>
                            </div>
                            <span className="font-black text-stone-700">฿{fixedCostPerUnit.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-center"><Equal size={24} className="text-stone-300"/></div>

                        <div className="p-5 bg-rose-50 rounded-2xl border-2 border-rose-100 text-center relative overflow-hidden">
                            <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-rose-200 rounded-full blur-xl opacity-50"></div>
                            <p className="text-rose-800 font-bold text-sm uppercase mb-1">จุดตาย (ห้ามขายต่ำกว่า)</p>
                            <p className="text-4xl font-black text-rose-600">฿{results.minPrice.toFixed(2)}</p>
                            <p className="text-[10px] text-rose-400 mt-2 font-bold">
                                *ถ้าราคาขายเฉลี่ยต่ำกว่านี้ = ขาดทุนทุกชิ้นที่ขาย
                            </p>
                        </div>
                    </div>
                </>
            )}

        </div>
      </div>
    </div>
  );
};

export default MetricDetailModal;
