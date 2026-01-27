
import React from 'react';
import { TrendingUp, Sparkles, MousePointerClick, XCircle, Minus, ArrowRight } from 'lucide-react';

interface CostAnalysisCardProps {
    stats: any; // Result from useMenuCalculator
    sellingPrice: number;
    showDetails: boolean;
    setShowDetails: (show: boolean) => void;
}

const CostAnalysisCard: React.FC<CostAnalysisCardProps> = ({ stats, sellingPrice, showDetails, setShowDetails }) => {
    return (
        <>
            <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-stone-700 flex items-center gap-2 font-cute">
                    <TrendingUp className="text-purple-500" /> วิเคราะห์กำไร (Analysis)
                </h3>
            </div>

            <div 
                onClick={() => setShowDetails(!showDetails)}
                className={`bg-gradient-to-br ${stats.themeColor} rounded-[2.5rem] p-8 shadow-xl shadow-stone-200 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 cursor-pointer`}
            >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/40 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/30 rounded-full blur-2xl"></div>
                    <Sparkles className="absolute top-6 right-6 text-white/60 animate-pulse" size={24} />
                    
                    {!showDetails ? (
                        <div className="relative z-10 flex flex-col justify-between gap-6 animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1 ${stats.textColor} opacity-70 font-cute`}>
                                        Net Profit <span className="bg-white/40 px-1.5 rounded text-[10px]">/ Unit</span>
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className={`text-6xl font-black font-cute drop-shadow-sm ${stats.textColor}`}>
                                            ฿{stats.profit.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-white text-stone-800 px-4 py-1.5 rounded-full text-sm font-black shadow-lg flex items-center gap-1 border border-white/50 font-cute">
                                        Margin {stats.margin.toFixed(0)}%
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm transition-all group-hover:bg-white/60">
                                <div className={`flex text-[10px] font-bold mb-2 justify-between uppercase tracking-wide px-1 ${stats.textColor} opacity-80 font-cute`}>
                                    <span>Cost Structure</span>
                                    <span>Real Cost: ฿{stats.realCost.toFixed(2)}</span>
                                </div>
                                
                                <div className="h-6 flex rounded-xl overflow-hidden bg-white/60 shadow-inner w-full border border-white/40">
                                    <div className="bg-sky-400 transition-all duration-700 flex items-center justify-center group/bar" style={{ width: `${Math.min((stats.baseCost/sellingPrice)*100, 100)}%` }}>
                                        <span className="text-[8px] font-bold text-white opacity-0 group-hover/bar:opacity-100 truncate px-1 drop-shadow-md">Material</span>
                                    </div>
                                    <div className="bg-orange-300 transition-all duration-700 flex items-center justify-center group/bar" style={{ width: `${Math.min(((stats.realCost-stats.baseCost)/sellingPrice)*100, 100)}%` }}>
                                        <span className="text-[8px] font-bold text-white opacity-0 group-hover/bar:opacity-100 truncate px-1 drop-shadow-md">Hidden</span>
                                    </div>
                                    <div className="bg-emerald-400 transition-all duration-700 flex items-center justify-center group/bar" style={{ width: `${Math.max(stats.margin, 0)}%` }}>
                                        <span className="text-[8px] font-bold text-white opacity-0 group-hover/bar:opacity-100 truncate px-1 drop-shadow-md">Profit</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`flex justify-end mt-2 ${stats.textColor} opacity-40 text-[10px] font-bold gap-1 animate-pulse items-center`}>
                                <MousePointerClick size={14}/> แตะเพื่อดูที่มา
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 flex flex-col h-full animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-4 border-b border-white/30 pb-2">
                                <h4 className={`font-bold text-lg font-cute ${stats.textColor}`}>ที่มาของกำไร (Breakdown)</h4>
                                <button className={`p-1 rounded-full hover:bg-white/20 ${stats.textColor}`}><XCircle size={24}/></button>
                            </div>
                            
                            <div className="space-y-3 flex-1">
                                <div className="bg-white/60 p-4 rounded-2xl flex items-center justify-between font-cute shadow-sm">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase">ราคาขาย</p>
                                        <p className="text-xl font-black text-stone-700">฿{sellingPrice}</p>
                                    </div>
                                    <Minus size={20} className="text-stone-300"/>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase">ต้นทุนจริง</p>
                                        <p className="text-xl font-black text-red-400">฿{stats.realCost.toFixed(2)}</p>
                                    </div>
                                    <ArrowRight size={20} className="text-stone-300"/>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase">กำไรสุทธิ</p>
                                        <p className="text-xl font-black text-green-500">฿{stats.profit.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="bg-white/40 p-4 rounded-2xl font-cute">
                                    <p className={`text-xs font-bold mb-2 ${stats.textColor}`}>สูตรคิด % Margin:</p>
                                    <div className="flex items-center gap-2 text-sm font-bold opacity-80">
                                        <span>(กำไร ฿{stats.profit.toFixed(1)} ÷ ราคา ฿{sellingPrice}) × 100</span>
                                        <span>=</span>
                                        <span className="text-lg">{stats.margin.toFixed(1)}%</span>
                                    </div>
                                </div>
                                
                                <div className={`text-[10px] font-bold mt-auto ${stats.textColor} opacity-60 bg-white/20 p-2 rounded-xl`}>
                                    *ต้นทุนจริงรวมค่า Waste และ GP แล้ว
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </>
    );
};

export default CostAnalysisCard;
