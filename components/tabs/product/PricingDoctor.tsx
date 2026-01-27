
import React from 'react';
import { Tag } from 'lucide-react';

interface PricingDoctorProps {
    realCost: number;
    currentPrice: number;
    onUpdatePrice: (price: number) => void;
    priceSuggestions: { low: number; mid: number; high: number; };
}

const PricingDoctor: React.FC<PricingDoctorProps> = ({ realCost, currentPrice, onUpdatePrice, priceSuggestions }) => {
    
    return (
        <div className="bg-white rounded-[2.5rem] border-2 border-stone-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Tag size={18} fill="currentColor" /></div>
                <h4 className="font-bold text-stone-700 font-cute">แนะนำราคาขาย (Pricing Suggestion)</h4>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                    onClick={() => onUpdatePrice(Math.ceil(priceSuggestions.low))} 
                    className="flex-1 min-w-[100px] p-1 pr-4 rounded-full border-2 border-stone-100 hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-400 group-hover:bg-orange-200 group-hover:text-orange-600 text-xs font-cute">Mass</div>
                    <div className="text-left">
                        <span className="text-[10px] font-bold text-stone-400 uppercase block leading-none font-cute">เริ่มที่</span>
                        <span className="font-black text-stone-700 text-lg font-cute">฿{Math.ceil(priceSuggestions.low)}</span>
                    </div>
                </button>
                
                <button 
                    onClick={() => onUpdatePrice(Math.ceil(priceSuggestions.mid))} 
                    className="flex-1 min-w-[100px] p-1 pr-4 rounded-full border-2 border-blue-100 bg-blue-50/30 hover:bg-blue-100 transition-all flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-500 group-hover:bg-blue-200 text-xs font-cute">Std</div>
                    <div className="text-left">
                        <span className="text-[10px] font-bold text-blue-400 uppercase block leading-none font-cute">แนะนำ</span>
                        <span className="font-black text-blue-600 text-lg font-cute">฿{Math.ceil(priceSuggestions.mid)}</span>
                    </div>
                </button>

                <button 
                    onClick={() => onUpdatePrice(Math.ceil(priceSuggestions.high))} 
                    className="flex-1 min-w-[100px] p-1 pr-4 rounded-full border-2 border-stone-100 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-400 group-hover:bg-purple-200 group-hover:text-purple-600 text-xs font-cute">Pro</div>
                    <div className="text-left">
                        <span className="text-[10px] font-bold text-stone-400 uppercase block leading-none font-cute">พรีเมียม</span>
                        <span className="font-black text-stone-700 text-lg font-cute">฿{Math.ceil(priceSuggestions.high)}</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default PricingDoctor;
