
import React from 'react';
import { DollarSign, AlertCircle, Archive } from 'lucide-react';

interface InventoryStatsProps {
    stats: { totalItems: number; lowStockItems: number; totalValue: number };
    activeFilter: 'all' | 'low_stock' | 'value';
    onFilterChange: (filter: 'all' | 'low_stock' | 'value') => void;
    onLowStockClick: () => void;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ stats, activeFilter, onFilterChange, onLowStockClick }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Value Card */}
            <button 
                onClick={() => onFilterChange('value')}
                className={`text-left p-5 rounded-[2rem] border-2 shadow-sm flex items-center justify-between transition-all duration-300 group hover:-translate-y-1 ${
                    activeFilter === 'value' 
                    ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200' 
                    : 'bg-white border-stone-50 hover:border-orange-200'
                }`}
            >
                <div>
                    <p className={`text-xs font-bold uppercase ${activeFilter === 'value' ? 'text-orange-600' : 'text-stone-400'}`}>มูลค่าสินค้า (Sort)</p>
                    <p className="text-2xl font-black text-stone-700">฿{stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeFilter === 'value' ? 'bg-orange-200 text-orange-600' : 'bg-stone-100 text-stone-400'}`}>
                    <DollarSign size={20} />
                </div>
            </button>

            {/* Low Stock Card (Triggers Modal) */}
            <button 
                onClick={onLowStockClick}
                className={`text-left p-5 rounded-[2rem] border-2 shadow-sm flex items-center justify-between transition-all duration-300 group hover:-translate-y-1 ${
                    stats.lowStockItems > 0 
                    ? 'bg-red-50 border-red-200 hover:border-red-400 hover:shadow-red-100' 
                    : 'bg-green-50 border-green-200 hover:border-green-400'
                }`}
            >
                <div>
                    <p className={`text-xs font-bold uppercase ${stats.lowStockItems > 0 ? 'text-red-500' : 'text-green-600'}`}>ต้องเติมของ</p>
                    <p className={`text-2xl font-black ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-green-700'}`}>
                        {stats.lowStockItems} รายการ
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.lowStockItems > 0 ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-green-100 text-green-500'}`}>
                    <AlertCircle size={20} />
                </div>
            </button>

            {/* Total Items Card */}
            <button 
                onClick={() => onFilterChange('all')}
                className={`text-left p-5 rounded-[2rem] border-2 shadow-sm flex items-center justify-between transition-all duration-300 group hover:-translate-y-1 ${
                    activeFilter === 'all'
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                    : 'bg-white border-stone-50 hover:border-blue-200'
                }`}
            >
                <div>
                    <p className={`text-xs font-bold uppercase ${activeFilter === 'all' ? 'text-blue-600' : 'text-stone-400'}`}>รายการทั้งหมด</p>
                    <p className="text-2xl font-black text-stone-700">{stats.totalItems}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeFilter === 'all' ? 'bg-blue-200 text-blue-600' : 'bg-stone-100 text-stone-400'}`}>
                    <Archive size={20} />
                </div>
            </button>
        </div>
    );
};

export default InventoryStats;
