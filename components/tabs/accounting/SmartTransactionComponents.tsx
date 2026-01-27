
import React from 'react';
import { Camera, Store, Plus, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Supplier } from '../../../types';

// --- AI SCANNER BUTTON ---
export const SmartScannerButton: React.FC<{
    isProcessing: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ isProcessing, onFileChange }) => (
    <label className={`
        relative w-full h-32 rounded-[2rem] border-4 border-dashed border-purple-200 bg-purple-50 
        flex flex-col items-center justify-center cursor-pointer group hover:bg-purple-100 transition-all overflow-hidden
        ${isProcessing ? 'pointer-events-none' : ''}
    `}>
        {isProcessing ? (
            <div className="flex flex-col items-center animate-pulse">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-2" />
                <span className="text-purple-600 font-bold text-sm">AI กำลังอ่านใบเสร็จ...</span>
            </div>
        ) : (
            <>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="text-purple-500" size={28} />
                </div>
                <div className="text-center">
                    <p className="text-purple-700 font-bold flex items-center gap-2 justify-center">
                        <Sparkles size={14} /> AI Magic Scan
                    </p>
                    <p className="text-[10px] text-purple-400 font-bold mt-1">
                        ถ่ายรูปสลิป / อัปโหลดรูป
                    </p>
                </div>
            </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={isProcessing} />
    </label>
);

// --- SUPPLIER GRID ---
export const SupplierSelector: React.FC<{
    suppliers: Supplier[];
    onSelect: (s: Supplier) => void;
    onAddNew: () => void;
}> = ({ suppliers, onSelect, onAddNew }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end px-2">
            <label className="text-xs font-bold text-stone-400 uppercase">ร้านประจำ (Quick Pick)</label>
            <button onClick={onAddNew} className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:underline">
                <Plus size={10} /> เพิ่มร้านใหม่
            </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {suppliers.map(s => (
                <button 
                    key={s.id} 
                    onClick={() => onSelect(s)}
                    className="flex flex-col items-center gap-2 p-3 bg-white border-2 border-stone-100 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center overflow-hidden border border-stone-100 group-hover:scale-105 transition-transform">
                        {s.image ? (
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                            <Store size={18} className="text-stone-300 group-hover:text-blue-500" />
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-stone-600 line-clamp-1 w-full text-center">{s.name}</span>
                </button>
            ))}
            
            <button 
                onClick={onAddNew}
                className="flex flex-col items-center gap-2 p-3 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl hover:bg-stone-100 transition-all text-stone-400 hover:text-stone-600"
            >
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <Plus size={20} />
                </div>
                <span className="text-[10px] font-bold">อื่น ๆ</span>
            </button>
        </div>
    </div>
);

// --- ASSET SECTION ---
export const AssetFields: React.FC<{
    lifespan: string;
    salvage: string;
    onChange: (field: string, val: string) => void;
}> = ({ lifespan, salvage, onChange }) => (
    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 animate-in slide-in-from-top-2">
        <p className="text-xs font-bold text-purple-600 mb-3 flex items-center gap-2">
            🏗️ ข้อมูลทรัพย์สิน (เพื่อคำนวณค่าเสื่อม)
        </p>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">อายุการใช้งาน (วัน)</label>
                <input 
                    type="number" 
                    value={lifespan} 
                    onChange={e => onChange('lifespanDays', e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-purple-200 text-center font-bold text-purple-700 outline-none focus:border-purple-400"
                />
            </div>
            <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">ราคาขายซาก (บาท)</label>
                <input 
                    type="number" 
                    value={salvage} 
                    onChange={e => onChange('salvagePrice', e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-purple-200 text-center font-bold text-purple-700 outline-none focus:border-purple-400"
                />
            </div>
        </div>
    </div>
);
