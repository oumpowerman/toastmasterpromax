
import React, { useEffect, useState } from 'react';
import { X, Clock, ArrowRight, ArrowLeft, RotateCcw, Package, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { InventoryItem, InventoryLog } from '../../../../types';
import { InventoryService } from '../../../../services/inventoryService';

interface StockHistoryModalProps {
    item: InventoryItem;
    onClose: () => void;
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ item, onClose }) => {
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                // If it's a legacy item without real ID, we can't fetch logs easily
                if (!item.id.startsWith('asset-') && !item.id.startsWith('temp-')) {
                    const data = await InventoryService.getStockHistory(item.id);
                    setLogs(data);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [item.id]);

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'in') return log.type === 'in';
        if (filter === 'out') return log.type === 'out';
        return true;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'in': return <TrendingUp size={20} className="text-green-500" />;
            case 'out': return <TrendingDown size={20} className="text-red-500" />;
            case 'audit': return <RotateCcw size={20} className="text-orange-500" />;
            default: return <Clock size={20} className="text-stone-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2.5rem] relative z-10 animate-in zoom-in-95 flex flex-col shadow-2xl border-4 border-white overflow-hidden">
                
                {/* Header */}
                <div className="p-6 bg-stone-50 border-b border-stone-100 flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
                                <Clock size={16} />
                            </div>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Movement History</span>
                        </div>
                        <h3 className="text-2xl font-black text-stone-800 font-cute leading-tight">{item.name}</h3>
                        <p className="text-sm font-bold text-stone-500 mt-1">คงเหลือปัจจุบัน: {item.quantity} {item.unit}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white hover:bg-stone-200 text-stone-400 flex items-center justify-center transition-colors shadow-sm"><X size={20}/></button>
                </div>

                {/* Filter Tabs */}
                <div className="px-6 py-4 bg-white border-b border-stone-50 shrink-0">
                    <div className="flex p-1 bg-stone-100 rounded-xl">
                        <button onClick={() => setFilter('all')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white shadow text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>ทั้งหมด</button>
                        <button onClick={() => setFilter('in')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'in' ? 'bg-white shadow text-green-600' : 'text-stone-400 hover:text-stone-600'}`}>รับเข้า (In)</button>
                        <button onClick={() => setFilter('out')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'out' ? 'bg-white shadow text-red-600' : 'text-stone-400 hover:text-stone-600'}`}>จ่ายออก (Out)</button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-stone-50/30">
                    {loading ? (
                        <div className="text-center py-10 text-stone-400">กำลังโหลด...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-10 opacity-50 flex flex-col items-center">
                            <Package size={48} className="text-stone-300 mb-2"/>
                            <p className="text-stone-400 font-bold">ไม่พบประวัติรายการ</p>
                        </div>
                    ) : (
                        filteredLogs.map(log => (
                            <div key={log.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-stone-50 border border-stone-100`}>
                                        {getIcon(log.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-stone-700">{log.reason || (log.type === 'in' ? 'รับของเข้า' : 'ตัดสต็อก')}</p>
                                        <p className="text-[10px] text-stone-400 font-medium">
                                            {new Date(log.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-right font-black text-lg ${log.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {log.quantityChange > 0 ? '+' : ''}{log.quantityChange} <span className="text-[10px] text-stone-400 font-normal">{item.unit}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
