
import React from 'react';
import { Edit3, Loader2, Image as ImageIcon, Plus, Tag } from 'lucide-react';
import { MenuItem } from '../../../types';

interface MenuHeaderProps {
    menu: MenuItem;
    categories: string[]; // Dynamic categories from parent
    stats: any;
    isUploading: boolean;
    onUpdate: (field: keyof MenuItem, value: any) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ menu, categories, stats, isUploading, onUpdate, onImageUpload }) => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-stone-100 shadow-sm flex flex-col lg:flex-row gap-8 items-center relative">
            {/* Decorative Gradient Bar */}
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-200 via-pink-200 to-blue-200 rounded-t-[2.5rem]"></div>
            
            {/* IMAGE UPLOADER */}
            <div className="shrink-0 relative group">
                <label className={`w-28 h-28 rounded-3xl bg-stone-100 border-4 border-white shadow-lg flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:scale-105 hover:shadow-orange-100 ${isUploading ? 'opacity-50' : ''}`}>
                    {isUploading ? (
                        <Loader2 className="animate-spin text-orange-400" size={32} />
                    ) : menu.image ? (
                        <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={32} className="text-stone-300" />
                    )}
                    {/* Overlay Edit Icon */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 className="text-white drop-shadow-md" size={24} />
                    </div>
                    <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" disabled={isUploading} />
                </label>
                {!menu.image && <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white p-1.5 rounded-full border-2 border-white shadow-sm pointer-events-none"><Plus size={14} strokeWidth={3}/></div>}
            </div>

            {/* Name & Category Input */}
            <div className="flex-1 w-full relative pt-2 flex flex-col gap-3">
                <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-1 font-cute">
                        <Edit3 size={12} /> MENU NAME
                    </label>
                        <input 
                        type="text" 
                        value={menu.name}
                        onChange={(e) => onUpdate('name', e.target.value)}
                        className="
                            w-full
                            text-4xl
                            font-black
                            font-cute
                            bg-transparent
                            border-none
                            outline-none
                            leading-[2.3]
                            py-5
                            before:content-['']
                            before:inline-block
                            before:h-[0.3em]
                        "
                        placeholder="ชื่อเมนู..."
                        />


                </div>

                {/* Category Input (Dynamic Datalist) */}
                <div className="flex items-center gap-2">
                    <div className="bg-stone-100 text-stone-400 p-1.5 rounded-lg">
                        <Tag size={14} />
                    </div>
                    <input 
                        type="text"
                        value={menu.category || ''}
                        onChange={(e) => onUpdate('category', e.target.value)}
                        className="bg-stone-50 hover:bg-stone-100 focus:bg-white border-2 border-transparent focus:border-orange-200 rounded-xl px-3 py-1.5 text-sm font-bold text-stone-600 outline-none transition-all placeholder-stone-300 w-full md:w-64 font-cute"
                        placeholder="หมวดหมู่ (พิมพ์ใหม่ หรือเลือก)"
                        list="category-suggestions"
                    />
                    {/* Dynamic Datalist: Allows typing NEW or picking EXISTING */}
                    <datalist id="category-suggestions">
                        {categories.map((cat, idx) => (
                            <option key={`${cat}-${idx}`} value={cat} />
                        ))}
                    </datalist>
                </div>
            </div>

            {/* Price & Grade Badge */}
            <div className="flex items-center gap-6 w-full lg:w-auto bg-stone-50 p-4 px-8 rounded-[2rem] border border-stone-100 justify-between lg:justify-start shrink-0">
                <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-cute">ราคาขาย (Price)</label>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-stone-400 font-cute">฿</span>
                        <input 
                            type="number"
                            value={menu.sellingPrice}
                            onChange={(e) => onUpdate('sellingPrice', Number(e.target.value))}
                            className="w-28 bg-transparent text-4xl font-black text-stone-800 outline-none p-0 font-cute"
                        />
                    </div>
                </div>
                <div className="h-12 w-px bg-stone-200"></div>
                <div className="text-center">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-cute">Grade</p>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-sm font-cute ${stats.gradeColor}`}>
                        {stats.grade}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuHeader;
