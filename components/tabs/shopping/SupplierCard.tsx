
import React from 'react';
import { MapPin, Smartphone, Store, Trash2, Box, Globe, Map } from 'lucide-react';
import { Supplier } from '../../../types';

interface SupplierCardProps {
    supplier: Supplier;
    stats: {
        productCount: number;
        topProducts: string[];
        typeColor: string;
        hasMoreProducts: number;
    };
    viewMode: 'grid' | 'list';
    onEdit: (supplier: Supplier) => void;
    onDelete: (id: string) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, stats, viewMode, onEdit, onDelete }) => {
    
    // --- LIST VIEW LAYOUT ---
    if (viewMode === 'list') {
        return (
            <div 
                onClick={() => onEdit(supplier)}
                className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-4 hover:border-orange-300 hover:shadow-md transition-all group relative cursor-pointer"
            >
                {/* Icon or Image */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${supplier.image ? 'border border-stone-100 bg-white' : supplier.type === 'online' ? 'bg-blue-100 text-blue-500' : 'bg-orange-100 text-orange-500'}`}>
                    {supplier.image ? (
                        <img src={supplier.image} alt={supplier.name} className="w-full h-full object-cover" />
                    ) : (
                        supplier.type === 'online' ? <Smartphone size={20} /> : <Store size={20} />
                    )}
                </div>

                {/* Name & Type */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-stone-700 truncate group-hover:text-orange-600 transition-colors">{supplier.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${stats.typeColor}`}>
                            {supplier.type === 'online' ? 'Online' : 'หน้าร้าน'}
                        </span>
                    </div>
                    {supplier.locationName && (
                        <p className="text-xs text-stone-400 flex items-center gap-1 truncate">
                            <MapPin size={10}/> {supplier.locationName}
                        </p>
                    )}
                </div>

                {/* Product Stats (Hide on small screens) */}
                <div className="hidden md:flex flex-col items-end px-4 border-l border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase">สินค้า</p>
                    <span className="font-black text-stone-700 text-lg">{stats.productCount}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {supplier.mapUrl && (
                        <a 
                            href={supplier.mapUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                        >
                            <Map size={16} />
                        </a>
                    )}
                    {supplier.websiteUrl && (
                        <a 
                            href={supplier.websiteUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                        >
                            <Globe size={16} />
                        </a>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(supplier.id); }} 
                        className="p-2 rounded-lg bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // --- GRID VIEW LAYOUT (Original) ---
    return (
        <div 
            onClick={() => onEdit(supplier)}
            className="bg-white rounded-[2.5rem] border-2 border-stone-100 p-6 flex flex-col justify-between hover:border-orange-300 hover:shadow-xl transition-all group relative overflow-hidden h-full cursor-pointer"
        >
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm overflow-hidden ${supplier.image ? 'border-2 border-stone-100 bg-white' : supplier.type === 'online' ? 'bg-blue-100 text-blue-500' : 'bg-orange-100 text-orange-500'}`}>
                        {supplier.image ? (
                            <img src={supplier.image} alt={supplier.name} className="w-full h-full object-cover" />
                        ) : (
                            supplier.type === 'online' ? <Smartphone size={24} /> : <Store size={24} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-stone-700 line-clamp-1 group-hover:text-orange-600 transition-colors">{supplier.name}</h3>
                        <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border mt-1 ${stats.typeColor}`}>
                            {supplier.type === 'online' ? 'ร้านออนไลน์ (Online)' : 'หน้าร้าน (Physical)'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Info */}
            {supplier.locationName && (
                <div className="mb-4 flex items-center gap-2 text-xs text-stone-500 font-bold bg-stone-50 p-2 rounded-xl border border-stone-100 group-hover:bg-white transition-colors">
                    <MapPin size={14} className="text-orange-400" />
                    <span className="truncate">{supplier.locationName}</span>
                </div>
            )}

            {/* Products Preview */}
            <div className="flex-1 mb-6 relative z-10">
                <p className="text-xs font-bold text-stone-400 uppercase mb-2 flex items-center gap-1">
                    <Box size={12}/> สินค้าที่มีขาย ({stats.productCount})
                </p>
                <div className="flex flex-wrap gap-2">
                    {stats.topProducts.length > 0 ? (
                        stats.topProducts.map((name, i) => (
                            <span key={i} className="bg-white text-stone-600 px-3 py-1 rounded-xl text-xs font-bold border border-stone-200 shadow-sm truncate max-w-[150px] group-hover:border-orange-100 transition-colors">
                                {name}
                            </span>
                        ))
                    ) : (
                        <span className="text-stone-300 text-xs italic bg-stone-50 px-3 py-1 rounded-xl border border-dashed border-stone-200 w-full text-center">
                            ยังไม่ได้ระบุสินค้า
                        </span>
                    )}
                    {stats.hasMoreProducts > 0 && (
                        <span className="bg-stone-100 text-stone-400 px-2 py-1 rounded-xl text-xs font-bold border border-stone-200">
                            +{stats.hasMoreProducts}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer: Actions */}
            <div className="flex gap-2 pt-4 border-t border-stone-100 relative z-10">
                {supplier.mapUrl && (
                    <a 
                        href={supplier.mapUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 rounded-2xl bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors" 
                        title="Google Maps"
                    >
                        <Map size={20} />
                    </a>
                )}
                {supplier.websiteUrl && (
                    <a 
                        href={supplier.websiteUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 rounded-2xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors" 
                        title="Website / App"
                    >
                        <Globe size={20} />
                    </a>
                )}
                
                <div className="flex-1 text-right">
                    <span className="text-xs font-bold text-stone-300 group-hover:text-orange-400 transition-colors">แตะเพื่อดูสินค้า</span>
                </div>
            </div>
            
            {/* Delete (Hover) */}
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(supplier.id); }}
                className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20"
                title="ลบร้านค้า"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};
