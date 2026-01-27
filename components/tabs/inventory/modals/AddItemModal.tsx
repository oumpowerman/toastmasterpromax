
import React, { useState, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon, Edit3, Package, Armchair, RefreshCw, ChevronRight, Settings2, Tag, DollarSign, Layers, Calendar, AlertCircle, Hash, Box } from 'lucide-react';
import { InventoryItem, AssetCategory } from '../../../../types';
import { uploadImage } from '../../../../lib/supabase';
import { useAlert } from '../../../AlertSystem';
import { DEFAULT_ASSET_TAXONOMY } from '../../../../constants';
import { TaxonomyManagerModal } from './TaxonomyManagerModal';

export const AddItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;
    initialData?: InventoryItem | null; 
    inventory?: InventoryItem[];
    // NEW Props for Taxonomy
    taxonomy?: AssetCategory[];
    onUpdateTaxonomy?: (newTax: AssetCategory[]) => void;
}> = ({ isOpen, onClose, onConfirm, initialData, inventory = [], taxonomy = DEFAULT_ASSET_TAXONOMY, onUpdateTaxonomy }) => {
    const { showAlert } = useAlert();
    const [type, setType] = useState<'stock' | 'asset'>('stock'); 
    
    // Common
    const [name, setName] = useState('');
    const [qty, setQty] = useState('');
    const [unit, setUnit] = useState('ชิ้น'); // Changed default to 'ชิ้น'
    const [price, setPrice] = useState('');
    const [notes, setNotes] = useState(''); 
    
    // Stock Fields
    const [min, setMin] = useState('1000');
    const [expiry, setExpiry] = useState('');
    const [category, setCategory] = useState<'ingredient' | 'packaging'>('ingredient');

    // Asset Fields (Taxonomy)
    const [assetCatId, setAssetCatId] = useState<string>(taxonomy[0]?.id || '');
    const [assetTypeName, setAssetTypeName] = useState<string>(''); // Can be new or existing
    const [assetCode, setAssetCode] = useState('');
    const [details, setDetails] = useState(''); // Specific details e.g. "Red Handle"

    const [lifespanDays, setLifespanDays] = useState('365');
    const [salvagePrice, setSalvagePrice] = useState('0');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [assetStatus, setAssetStatus] = useState<'active' | 'repair' | 'broken' | 'lost'>('active');

    // Image
    const [image, setImage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    
    // State for managing taxonomy modal
    const [showTaxonomyManager, setShowTaxonomyManager] = useState(false);

    // Filtered Types based on Category
    const currentCategory = taxonomy.find(c => c.id === assetCatId);
    
    // Auto Gen Code Logic
    useEffect(() => {
        if (type === 'asset' && !initialData && !assetCode) {
            const today = new Date();
            const yy = today.getFullYear().toString().slice(-2);
            const mm = (today.getMonth() + 1).toString().padStart(2, '0');
            // Count total assets to get running number
            const assetCount = inventory.filter(i => i.type === 'asset').length + 1;
            const running = assetCount.toString().padStart(3, '0');
            setAssetCode(`AST-${yy}${mm}-${running}`);
        }
    }, [type, initialData, inventory]);

    // Pre-fill Data
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setQty(initialData.quantity.toString());
            setUnit(initialData.unit);
            setImage(initialData.image || '');
            setType(initialData.type || 'stock');
            setNotes(initialData.notes || '');
            
            if (initialData.type === 'asset') {
                setPrice(initialData.costPerUnit?.toString() || '');
                setLifespanDays(initialData.lifespanDays?.toString() || '365');
                setSalvagePrice(initialData.salvagePrice?.toString() || '0');
                setPurchaseDate(initialData.purchaseDate || new Date().toISOString().split('T')[0]);
                setAssetStatus(initialData.status || 'active'); 
                setAssetCode(initialData.assetCode || '');
                
                if (initialData.subCategory && taxonomy.some(t => t.id === initialData.subCategory)) {
                    setAssetCatId(initialData.subCategory);
                }
                setDetails(initialData.notes || ''); 
            } else {
                setPrice((initialData.quantity * (initialData.costPerUnit || 0)).toString());
                setMin(initialData.minLevel.toString());
                setExpiry(initialData.expiryDate || '');
                setCategory((initialData.category as any) || 'ingredient');
            }
        } else {
            // Reset
            setName('');
            setQty('1');
            setUnit('ชิ้น'); // Default unit
            setPrice('');
            setMin('1000');
            setExpiry('');
            setCategory('ingredient');
            setLifespanDays('365');
            setSalvagePrice('0');
            setPurchaseDate(new Date().toISOString().split('T')[0]);
            setImage('');
            setType('stock');
            setNotes('');
            setAssetStatus('active');
            setAssetCode('');
            setDetails('');
            setAssetCatId(taxonomy[0]?.id || '');
            setAssetTypeName('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Dynamic Taxonomy Update Logic
        if (type === 'asset' && onUpdateTaxonomy && currentCategory) {
            // If user typed a new Type that doesn't exist, add it
            if (assetTypeName && !currentCategory.types.includes(assetTypeName)) {
                const newTaxonomy = taxonomy.map(c => 
                    c.id === assetCatId ? { ...c, types: [...c.types, assetTypeName] } : c
                );
                onUpdateTaxonomy(newTaxonomy);
            }
        }

        onConfirm({ 
            type, 
            name: name, 
            qty: Number(qty), unit, price: Number(price), image, 
            notes: type === 'asset' ? details : notes, 
            
            // Conditionals
            min: type === 'stock' ? Number(min) : undefined,
            expiry: type === 'stock' ? expiry : undefined,
            category: type === 'stock' ? category : 'asset',
            
            // Asset Specifics
            subCategory: type === 'asset' ? assetCatId : undefined, 
            lifespanDays: type === 'asset' ? Number(lifespanDays) : undefined,
            salvagePrice: type === 'asset' ? Number(salvagePrice) : undefined,
            purchaseDate: type === 'asset' ? purchaseDate : undefined,
            status: type === 'asset' ? assetStatus : undefined,
            assetCode: type === 'asset' ? assetCode : undefined
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const publicUrl = await uploadImage(file, 'inventory');
            if (publicUrl) setImage(publicUrl);
            else await showAlert('อัปโหลดรูปไม่สำเร็จ', 'error');
        } catch (error) { console.error(error); await showAlert('เกิดข้อผิดพลาดในการอัปโหลด', 'error'); } 
        finally { setIsUploading(false); }
    };

    const handleCreateCategory = (input: string) => {
        if (!input || !onUpdateTaxonomy) return;
        const newId = `cat_${Date.now()}`;
        const newCat: AssetCategory = { id: newId, name: input, isSystem: false, types: [] };
        onUpdateTaxonomy([...taxonomy, newCat]);
        setAssetCatId(newId);
    };

    if (!isOpen) return null;

    // --- THEMING HELPERS ---
    const isAsset = type === 'asset';
    const themeColor = isAsset ? 'purple' : 'orange';
    const ThemeIcon = isAsset ? Armchair : Package;

    const activeTabClass = isAsset 
        ? 'bg-purple-500 text-white shadow-md' 
        : 'bg-orange-500 text-white shadow-md';
    const inactiveTabClass = 'text-stone-400 hover:text-stone-600 hover:bg-stone-100';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 border-4 border-white overflow-hidden">
                
                {/* Header Area */}
                <div className={`px-8 pt-8 pb-6 flex-shrink-0 bg-gradient-to-b ${isAsset ? 'from-purple-50' : 'from-orange-50'} to-white`}>
                    <div className="text-center mb-6">
                        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-sm ${isAsset ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                            <ThemeIcon size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-stone-800 font-cute">
                            {initialData ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
                        </h3>
                        <p className="text-stone-400 text-sm font-bold">
                            {isAsset ? 'จัดการทรัพย์สินและอุปกรณ์' : 'จัดการสต็อกและวัตถุดิบ'}
                        </p>
                    </div>

                    {/* Type Switcher */}
                    <div className="flex p-1.5 bg-stone-100 rounded-2xl relative">
                        <button 
                            type="button" 
                            onClick={() => { if(!initialData) { setType('stock'); setUnit('กรัม'); } }} 
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative z-10 ${type === 'stock' ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-400'} ${initialData ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <Package size={16}/> ของใช้/สต็อก
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { if(!initialData) { setType('asset'); setUnit('เครื่อง'); } }} 
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative z-10 ${type === 'asset' ? 'bg-white text-purple-600 shadow-sm' : 'text-stone-400'} ${initialData ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <Armchair size={16}/> ทรัพย์สิน
                        </button>
                        
                        {/* Background Slider Indicator (Optional Visual Flair) */}
                        <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-transparent rounded-xl transition-all duration-300 ${type === 'stock' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* 1. Basic Info Section */}
                        <div className="flex gap-5">
                            {/* Image Uploader */}
                            <div className="shrink-0">
                                <label className={`w-24 h-24 rounded-3xl bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center cursor-pointer hover:border-${themeColor}-400 hover:bg-${themeColor}-50 transition-all relative overflow-hidden group shadow-inner ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                    {isUploading ? <Loader2 className={`animate-spin text-${themeColor}-400`} size={24} /> : image ? <><img src={image} alt="preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="text-white" size={24} /></div></> : <div className="text-center"><ImageIcon size={24} className="text-stone-300 mx-auto" /><span className="text-[10px] text-stone-400 font-bold block mt-1">รูปภาพ</span></div>}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                                </label>
                            </div>

                            {/* Name Input */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">ชื่อรายการ (Name)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        className={`w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl font-bold text-stone-700 outline-none focus:border-${themeColor}-400 focus:bg-white text-lg placeholder-stone-300 transition-all`}
                                        placeholder={isAsset ? "เช่น ตู้เย็น, เตาปิ้ง" : "เช่น นมข้น, ถุงกระดาษ"}
                                    />
                                </div>
                                
                                {isAsset && (
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"><Hash size={14}/></div>
                                        <input type="text" value={assetCode} onChange={e => setAssetCode(e.target.value)} className="w-full pl-8 pr-8 py-2 bg-purple-50/50 border border-purple-100 rounded-xl font-mono font-bold text-xs text-purple-700 outline-none focus:border-purple-300" placeholder="รหัสทรัพย์สิน" />
                                        <button type="button" onClick={() => setAssetCode(`AST-${Date.now().toString().slice(-6)}`)} className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-500"><RefreshCw size={12}/></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Logic Specific Fields */}
                        {isAsset ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-purple-50 p-5 rounded-[2rem] border border-purple-100 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 text-purple-100 opacity-50 pointer-events-none"><Layers size={100}/></div>
                                    
                                    <div className="flex justify-between items-center mb-3 relative z-10">
                                        <label className="text-xs font-bold text-purple-600 uppercase flex items-center gap-2"><Settings2 size={14}/> หมวดหมู่ (Classification)</label>
                                        <button type="button" onClick={() => setShowTaxonomyManager(true)} className="text-[10px] bg-white px-2 py-1 rounded-lg border border-purple-200 text-purple-500 hover:bg-purple-100 font-bold shadow-sm">จัดการ</button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 relative z-10">
                                        <div className="relative group">
                                            <select 
                                                value={assetCatId} 
                                                onChange={(e) => {
                                                    if (e.target.value === 'NEW') {
                                                        const newName = prompt("ชื่อหมวดหมู่ใหม่:");
                                                        if (newName) handleCreateCategory(newName);
                                                    } else {
                                                        setAssetCatId(e.target.value);
                                                    }
                                                }}
                                                className="w-full px-3 py-3 bg-white border-2 border-purple-100 rounded-xl text-sm font-bold text-stone-600 outline-none appearance-none focus:border-purple-300"
                                            >
                                                {taxonomy.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                <option value="NEW">+ เพิ่มหมวดใหม่...</option>
                                            </select>
                                            <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 rotate-90 pointer-events-none"/>
                                        </div>
                                        <div className="relative group">
                                            <input 
                                                type="text" 
                                                list="type-options"
                                                value={assetTypeName}
                                                onChange={(e) => { 
                                                    setAssetTypeName(e.target.value); 
                                                    if(!name) setName(e.target.value); 
                                                }}
                                                className="w-full px-3 py-3 bg-white border-2 border-purple-100 rounded-xl text-sm font-bold text-stone-600 outline-none focus:border-purple-300 placeholder-purple-200"
                                                placeholder="ระบุชนิด..."
                                            />
                                            <datalist id="type-options">
                                                {currentCategory?.types.map(t => <option key={t} value={t} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 relative z-10">
                                        <input 
                                            type="text" 
                                            value={details} 
                                            onChange={e => setDetails(e.target.value)} 
                                            className="w-full px-3 py-2 bg-white/50 border-b border-dashed border-purple-200 text-xs font-bold text-stone-600 outline-none focus:bg-white focus:border-purple-300 placeholder-purple-300 rounded-lg transition-all"
                                            placeholder="ระบุรายละเอียด เช่น สี, รุ่น, ตำหนิ" 
                                        />
                                    </div>
                                </div>

                                {/* Asset Valuation Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase block mb-2">ราคาซื้อ (Cost)</label>
                                        <div className="flex items-center gap-1">
                                            <span className="text-stone-300 font-bold">฿</span>
                                            <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-transparent font-black text-xl text-stone-700 outline-none placeholder-stone-200" placeholder="0" />
                                        </div>
                                    </div>
                                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase block mb-2">จำนวน (Qty)</label>
                                        <input type="number" required value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-transparent font-black text-xl text-stone-700 outline-none text-center" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">อายุ (วัน)</label>
                                        <input type="number" required value={lifespanDays} onChange={e => setLifespanDays(e.target.value)} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold text-center text-sm" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">ขายซาก</label>
                                        <input type="number" required value={salvagePrice} onChange={e => setSalvagePrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold text-center text-sm" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">สถานะ</label>
                                        <select value={assetStatus} onChange={e => setAssetStatus(e.target.value as any)} className="w-full px-2 py-2 bg-white border border-stone-200 rounded-xl font-bold text-xs outline-none">
                                            <option value="active">ใช้งาน</option>
                                            <option value="repair">ซ่อม</option>
                                            <option value="broken">ชำรุด</option>
                                            <option value="lost">หาย</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                {/* Unit & Tags */}
                                <div>
                                    <label className="text-xs font-bold text-stone-400 uppercase ml-1 mb-2 block flex items-center gap-1"><Tag size={12}/> หน่วยนับ (Unit)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={unit} 
                                            onChange={e => setUnit(e.target.value)} 
                                            className="w-full px-4 py-3 bg-white border-2 border-stone-100 rounded-2xl font-bold text-stone-700 outline-none focus:border-orange-300 text-center text-lg"
                                            placeholder="เช่น ชิ้น, กล่อง"
                                        />
                                        <div className="flex justify-center gap-2 mt-2 flex-wrap">
                                            {['กรัม', 'มล.', 'ชิ้น', 'แพ็ค', 'กล่อง', 'ถุง', 'ขวด'].map(u => (
                                                <button 
                                                    key={u} 
                                                    type="button" 
                                                    onClick={() => setUnit(u)} 
                                                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${unit === u ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-stone-50 border-stone-100 text-stone-400 hover:bg-stone-100'}`}
                                                >
                                                    {u}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Quantity & Cost */}
                                <div className="bg-stone-50 p-5 rounded-[2rem] border border-stone-100">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="border-r border-stone-200 pr-4">
                                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">จำนวนตั้งต้น</label>
                                            <input type="number" required value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-transparent font-black text-3xl text-stone-800 outline-none placeholder-stone-200" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block flex items-center gap-1"><DollarSign size={10}/> ราคารวม (บาท)</label>
                                            <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-transparent font-black text-3xl text-green-600 outline-none placeholder-green-200" placeholder="0" />
                                        </div>
                                    </div>
                                </div>

                                {/* Alerts */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block ml-1 flex items-center gap-1"><AlertCircle size={10}/> เตือนขั้นต่ำ</label>
                                        <input type="number" required value={min} onChange={e => setMin(e.target.value)} className="w-full px-4 py-2 bg-white border-2 border-stone-100 rounded-xl font-bold text-stone-700 outline-none focus:border-red-300 text-center" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block ml-1 flex items-center gap-1"><Calendar size={10}/> วันหมดอายุ</label>
                                        <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full px-4 py-2 bg-white border-2 border-stone-100 rounded-xl font-bold text-stone-600 outline-none focus:border-blue-300 text-xs" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 mt-4 border-t border-stone-100">
                            <button type="submit" disabled={isUploading} className={`w-full py-4 text-white rounded-2xl font-bold text-xl shadow-xl transition-transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isAsset ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-stone-800 hover:bg-stone-900 shadow-stone-300'}`}>
                                {isUploading ? 'กำลังอัปโหลด...' : (initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายการ')}
                            </button>
                        </div>
                    </form>
                </div>

                <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-stone-400 hover:text-stone-600 flex items-center justify-center transition-colors shadow-sm backdrop-blur-sm z-20"><X size={20}/></button>
            </div>

            {/* Taxonomy Manager Modal */}
            {showTaxonomyManager && onUpdateTaxonomy && taxonomy && (
                <TaxonomyManagerModal 
                    taxonomy={taxonomy} 
                    onUpdate={onUpdateTaxonomy} 
                    onClose={() => setShowTaxonomyManager(false)} 
                />
            )}
        </div>
    );
};
