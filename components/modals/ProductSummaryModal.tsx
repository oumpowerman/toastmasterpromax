
import React, { useMemo } from 'react';
import { X, FileText, TrendingUp, TrendingDown, Package, DollarSign, Percent, Info } from 'lucide-react';
import { MenuItem, AppState } from '../../types';

interface ProductSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

const ProductSummaryModal: React.FC<ProductSummaryModalProps> = ({ isOpen, onClose, state }) => {
  const { menuItems, hiddenPercentages } = state;

  const summaryData = useMemo(() => {
    const multiplier = (hiddenPercentages.waste + hiddenPercentages.promoLoss + hiddenPercentages.paymentFee) / 100;

    return menuItems.map(menu => {
      const baseCost = menu.ingredients.reduce((sum, i) => sum + i.cost, 0);
      const realCost = baseCost * (1 + multiplier);
      const profit = menu.sellingPrice - realCost;
      const margin = menu.sellingPrice > 0 ? (profit / menu.sellingPrice) * 100 : 0;
      
      let grade = 'C';
      let gradeColor = 'text-orange-500 bg-orange-50 border-orange-100';
      if (margin >= 50) { grade = 'S'; gradeColor = 'text-purple-600 bg-purple-50 border-purple-100'; }
      else if (margin >= 40) { grade = 'A'; gradeColor = 'text-green-600 bg-green-50 border-green-100'; }
      else if (margin >= 25) { grade = 'B'; gradeColor = 'text-blue-600 bg-blue-50 border-blue-100'; }

      return {
        ...menu,
        baseCost,
        realCost,
        profit,
        margin,
        grade,
        gradeColor
      };
    });
  }, [menuItems, hiddenPercentages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border-4 border-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-[#FFF9F2] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                <FileText size={28} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-stone-800 font-cute">
                  สรุปภาพรวมต้นทุนและกำไร
                </h3>
                <p className="text-stone-400 text-sm font-cute">ตารางวิเคราะห์เมนูทั้งหมด ({menuItems.length} รายการ)</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-stone-50/30">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-stone-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-4 py-2">เมนู (Menu)</th>
                <th className="px-4 py-2">วัตถุดิบที่ใช้</th>
                <th className="px-4 py-2 text-right">ต้นทุนวัตถุดิบ</th>
                <th className="px-4 py-2 text-right">ต้นทุนจริง (+แฝง)</th>
                <th className="px-4 py-2 text-right">ราคาขาย</th>
                <th className="px-4 py-2 text-right">กำไร/ชิ้น</th>
                <th className="px-4 py-2 text-center">Margin</th>
                <th className="px-4 py-2 text-center">เกรด</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((item) => (
                <tr key={item.id} className="bg-white border-2 border-stone-50 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                  <td className="px-4 py-4 rounded-l-2xl border-y-2 border-l-2 border-stone-50 group-hover:border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-100 shadow-sm">
                        {item.image ? (
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold text-xl">{item.name[0]}</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-stone-700 text-sm truncate">{item.name}</p>
                        <span className="px-1.5 py-0.5 bg-stone-100 text-stone-400 rounded text-[8px] font-bold uppercase">
                          {item.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-y-2 border-stone-50 group-hover:border-orange-100 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                        {item.ingredients.slice(0, 3).map((ing, idx) => (
                            <span key={idx} className="text-[9px] bg-stone-50 text-stone-500 px-1.5 py-0.5 rounded-md border border-stone-100 truncate max-w-full">
                                {ing.name}
                            </span>
                        ))}
                        {item.ingredients.length > 3 && (
                            <span className="text-[9px] text-stone-300 font-bold">+{item.ingredients.length - 3}</span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right border-y-2 border-stone-50 group-hover:border-orange-100">
                    <p className="text-sm font-bold text-stone-500">฿{item.baseCost.toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-4 text-right border-y-2 border-stone-50 group-hover:border-orange-100">
                    <p className="text-sm font-black text-stone-800">฿{item.realCost.toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-4 text-right border-y-2 border-stone-50 group-hover:border-orange-100">
                    <p className="text-sm font-black text-orange-500">฿{item.sellingPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-4 text-right border-y-2 border-stone-50 group-hover:border-orange-100">
                    <div className="flex flex-col items-end">
                      <p className={`text-sm font-black ${item.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.profit > 0 ? '+' : ''}฿{item.profit.toFixed(2)}
                      </p>
                      {item.profit <= 0 && <span className="text-[8px] font-bold text-red-400 uppercase tracking-tighter">ขาดทุน!</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-y-2 border-stone-50 group-hover:border-orange-100">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-1">
                        <div 
                          className={`h-full transition-all duration-1000 ${item.margin >= 40 ? 'bg-green-400' : item.margin >= 25 ? 'bg-blue-400' : 'bg-orange-400'}`}
                          style={{ width: `${Math.max(0, Math.min(100, item.margin))}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-black text-stone-600">{item.margin.toFixed(1)}%</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 rounded-r-2xl border-y-2 border-r-2 border-stone-50 group-hover:border-orange-100 text-center">
                    <span className={`inline-flex w-9 h-9 items-center justify-center rounded-xl font-black text-sm shadow-sm border-2 ${item.gradeColor}`}>
                      {item.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {menuItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-stone-300">
                  <Package size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">ยังไม่มีข้อมูลเมนู</p>
              </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-6 bg-white border-t border-stone-100 shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-stone-50 p-4 rounded-3xl border border-stone-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-stone-400 shadow-sm"><Package size={20}/></div>
            <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">เมนูทั้งหมด</p>
                <p className="text-xl font-black text-stone-700">{menuItems.length} <span className="text-xs font-bold text-stone-400">รายการ</span></p>
            </div>
          </div>
          <div className="bg-green-50/50 p-4 rounded-3xl border border-green-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm"><TrendingUp size={20}/></div>
            <div>
                <p className="text-[10px] font-bold text-green-600/60 uppercase tracking-wider">กำไรเฉลี่ย/ชิ้น</p>
                <p className="text-xl font-black text-green-600">
                  ฿{(summaryData.reduce((sum, i) => sum + i.profit, 0) / (menuItems.length || 1)).toFixed(2)}
                </p>
            </div>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm"><Percent size={20}/></div>
            <div>
                <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-wider">Margin เฉลี่ย</p>
                <p className="text-xl font-black text-blue-600">
                  {(summaryData.reduce((sum, i) => sum + i.margin, 0) / (menuItems.length || 1)).toFixed(1)}%
                </p>
            </div>
          </div>
          <div className="bg-purple-50/50 p-4 rounded-3xl border border-purple-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-purple-500 shadow-sm"><TrendingUp size={20}/></div>
            <div>
                <p className="text-[10px] font-bold text-purple-600/60 uppercase tracking-wider">สถานะภาพรวม</p>
                <p className="text-xl font-black text-purple-600">Healthy ✨</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSummaryModal;
