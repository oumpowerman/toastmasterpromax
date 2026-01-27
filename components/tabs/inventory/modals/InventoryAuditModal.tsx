
import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Clock, ArrowRight, TrendingUp, TrendingDown, RotateCcw, Filter, ChevronDown, Loader2, ScrollText } from 'lucide-react';
import { InventoryService } from '../../../../services/inventoryService';
import { InventoryItem } from '../../../../types';

interface InventoryAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeShopId: string;
    inventory: InventoryItem[]; // Passed for search filtering
}

export const InventoryAuditModal: React.FC<InventoryAuditModalProps> = ({ isOpen, onClose, activeShopId, inventory }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 20;

    // Filters
    const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
    const [searchItem, setSearchItem] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

    // Initial Fetch
    useEffect(() => {
        if (isOpen && activeShopId) {
            fetchLogs(true);
        }
    }, [isOpen, activeShopId, typeFilter, selectedItemId]);

    const fetchLogs = async (reset = false) => {
        if (!activeShopId) return;
        
        const currentOffset = reset ? 0 : offset;
        if (reset) {
            setLoading(true);
            setLogs([]);
            setHasMore(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const newLogs = await InventoryService.getGlobalStockLogs(
                activeShopId, 
                LIMIT, 
                currentOffset, 
                typeFilter, 
                selectedItemId
            );

            if (newLogs.length < LIMIT) {
                setHasMore(false);
            }

            setLogs(prev => reset ? newLogs : [...prev, ...newLogs]);
            setOffset(currentOffset + LIMIT);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Handle Search Selection (Debounced ideally, but here direct select is safer)
    const handleSearchSelect = (itemId: string) => {
        setSelectedItemId(itemId);
        // Search term update for visual consistency is handled by input, but logic relies on ID
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'in': return <TrendingUp size={20} className="text-green-500" />;
            case 'out': return <TrendingDown size={20} className="text-red-500" />;
            case 'audit': return <RotateCcw size={20} className="text-orange-500" />;
            default: return <Clock size={20} className="text-stone-400" />;
        }
    };

    if (!isOpen) return null;

    // Filter Inventory for Search Dropdown
    const filteredInventory = searchItem 
        ? inventory.filter(i => i.name.toLowerCase().includes(searchItem.toLowerCase())).slice(0, 5) 
        : [];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] relative z-10 animate-in zoom-in-95 flex flex-col shadow-2xl border-4 border-white overflow-hidden font-cute">
                
                {/* Header */}
                <div className="p-6 bg-stone-50 border-b border-stone-100 flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg shadow-sm">
                                <ScrollText size={20} />
                            </div>
                            <h3 className="text-2xl font-black text-stone-800">ประวัติรวม (Audit Log)</h3>
                        </div>
                        <p className="text-sm text-stone-500 font-bold ml-1">ตรวจสอบความเคลื่อนไหวของสินค้าทั้งหมด</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white hover:bg-stone-200 text-stone-400 flex items-center justify-center transition-colors shadow-sm"><X size={20}/></button>
                </div>

                {/* Filter Bar */}
                <div className="px-6 py-4 bg-white border-b border-stone-100 shrink-0 space-y-3">
                    {/* Search & Type Row */}
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search Input with Dropdown */}
                        <div className="relative flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16}/>
                                <input 
                                    type="text" 
                                    placeholder="ค้นหาชื่อสินค้า..." 
                                    value={searchItem}
                                    onChange={(e) => { setSearchItem(e.target.value); if(!e.target.value) setSelectedItemId(undefined); }}
                                    className="w-full pl-9 pr-8 py-2.5 bg-stone-50 border-2 border-stone-100 rounded-xl text-sm font-bold text-stone-600 outline-none focus:border-blue-300"
                                />
                                {searchItem && (
                                    <button 
                                        onClick={() => { setSearchItem(''); setSelectedItemId(undefined); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300 hover:text-red-400"
                                    >
                                        <X size={14}/>
                                    </button>
                                )}
                            </div>
                            
                            {/* Autocomplete Dropdown */}
                            {searchItem && !selectedItemId && filteredInventory.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white border-2 border-stone-100 rounded-xl mt-1 shadow-lg z-20 overflow-hidden">
                                    {filteredInventory.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => { setSearchItem(item.name); handleSearchSelect(item.id); }}
                                            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm font-bold text-stone-600 flex justify-between"
                                        >
                                            <span>{item.name}</span>
                                            <span className="text-xs text-stone-400 font-normal">คงเหลือ: {item.quantity}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Type Toggle */}
                        <div className="flex p-1 bg-stone-100 rounded-xl shrink-0">
                            <button onClick={() => setTypeFilter('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${typeFilter === 'all' ? 'bg-white shadow text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>ทั้งหมด</button>
                            <button onClick={() => setTypeFilter('in')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${typeFilter === 'in' ? 'bg-white shadow text-green-600' : 'text-stone-400 hover:text-stone-600'}`}><TrendingUp size={12}/> รับเข้า</button>
                            <button onClick={() => setTypeFilter('out')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${typeFilter === 'out' ? 'bg-white shadow text-red-600' : 'text-stone-400 hover:text-stone-600'}`}><TrendingDown size={12}/> ออก</button>
                        </div>
                    </div>
                </div>

                {/* Log List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-stone-50/30">
                    {loading ? (
                        <div className="text-center py-20 text-stone-400 flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-blue-300" size={32}/>
                            <p>กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-20 opacity-50 flex flex-col items-center">
                            <Filter size={48} className="text-stone-300 mb-2"/>
                            <p className="text-stone-400 font-bold">ไม่พบประวัติรายการ</p>
                            <p className="text-xs text-stone-300">ลองเปลี่ยนตัวกรองดูนะครับ</p>
                        </div>
                    ) : (
                        <>
                            {logs.map((log) => (
                                <div key={log.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-stone-50 border border-stone-100 shrink-0`}>
                                            {getIcon(log.type)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-stone-700 truncate">{log.itemName}</p>
                                            <p className="text-xs text-stone-400 flex items-center gap-1 truncate">
                                                {new Date(log.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                                                <span className="italic">{log.reason || (log.type === 'in' ? 'รับของเข้า' : 'ตัดสต็อก')}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-right font-black text-lg whitespace-nowrap pl-2 ${log.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.quantityChange > 0 ? '+' : ''}{log.quantityChange} 
                                        <span className="text-[10px] text-stone-400 font-bold ml-1">{log.itemUnit}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Load More Button */}
                            {hasMore && (
                                <button 
                                    onClick={() => fetchLogs()} 
                                    disabled={loadingMore}
                                    className="w-full py-3 mt-4 text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {loadingMore ? <Loader2 className="animate-spin" size={14}/> : <ChevronDown size={14}/>}
                                    {loadingMore ? 'กำลังโหลด...' : 'โหลดประวัติเพิ่มเติม'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
