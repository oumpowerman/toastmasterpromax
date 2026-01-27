
import React, { useMemo } from 'react';
import { X, AlertTriangle, CheckSquare, Box, Plus } from 'lucide-react';
import { InventoryItem } from '../../../../types';

export const LowStockAlertModal: React.FC<{
    inventory: InventoryItem[];
    onClose: () => void;
    onRestock: (item: InventoryItem) => void;
}> = ({ inventory, onClose, onRestock }) => {
    const lowStockItems = useMemo(() => {
        return inventory.filter(i => i.quantity <= i.minLevel && i.type !== 'asset').sort((a, b) => {
            const pctA = a.quantity / Math.max(1, a.minLevel);
            const pctB = b.quantity / Math.max(1, b.minLevel);
            return pctA - pctB;
        });
    }, [inventory]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md max-h-[85vh] rounded-[2.5rem] p-8 relative z-10 animate-in zoom-in-95 flex flex-col shadow-2xl border-4 border-white overflow-hidden">
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-red-500">
                            <div className="bg-red-100 p-2 rounded-full animate-pulse"><AlertTriangle size={24} /></div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-red-50 px-2 py-1 rounded-lg">แจ้งเตือนสต็อก</span>
                        </div>
                        <h3 className="text-2xl font-bold text-stone-800 font-cute leading-tight mt-2">ของต้องเติมด่วน! 🚨</h3>
                        <p className="text-stone-400 text-sm font-bold">พบ {lowStockItems.length} รายการที่ต่ำกว่าเกณฑ์</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-3">
                    {lowStockItems.length === 0 ? (
                        <div className="text-center py-10 bg-green-50 rounded-3xl border-2 border-green-100">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><CheckSquare size={32} className="text-green-500" /></div>
                            <p className="text-green-700 font-bold text-lg">สต็อกแน่นเปรี้ยะ!</p>
                            <p className="text-green-500 text-xs">ไม่มีรายการที่ต้องเติมในขณะนี้</p>
                        </div>
                    ) : (
                        lowStockItems.map(item => {
                            const percent = Math.min((item.quantity / item.minLevel) * 100, 100);
                            return (
                                <div key={item.id} className="bg-white p-4 rounded-3xl border-2 border-stone-100 hover:border-red-200 shadow-sm transition-all group relative overflow-hidden">
                                    <div className="absolute bottom-0 left-0 h-1 bg-red-100 w-full"><div className="h-full bg-red-500" style={{ width: `${percent}%` }}></div></div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0">
                                                {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-2xl"/> : <Box size={20} className="text-stone-300"/>}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-stone-700 truncate text-base">{item.name}</h4>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-red-500 font-bold">เหลือ {item.quantity.toLocaleString()}</span>
                                                    <span className="text-stone-300">/</span>
                                                    <span className="text-stone-400">ขั้นต่ำ {item.minLevel.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => onRestock(item)} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 shadow-md shadow-red-200 transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap"><Plus size={14}/> เติมของ</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
