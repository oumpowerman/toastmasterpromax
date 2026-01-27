
import React, { useState, useMemo } from 'react';
import { Store, ShoppingCart, BrainCircuit, AlertTriangle, X, MapPin, CalendarClock, ShoppingBag, Check, Trash2, Navigation, Route, Link as LinkIcon, ArrowRightLeft, MousePointerClick, Globe, Search, Image as ImageIcon, Package, Plus, DollarSign, Box, Wheat, User, FileText, LayoutGrid, Loader2, Settings, Tag, Info, Maximize2, Minimize2 } from 'lucide-react';
import { PurchaseOption, Supplier, SupplierProductInfo, AppState } from '../../../types';
import { uploadImage } from '../../../lib/supabase';
import { useAlert } from '../../AlertSystem';

// --- SUB-COMPONENT: DECISION INSIGHT MODAL ---
export const DecisionInsightModal: React.FC<{
    option: PurchaseOption;
    onClose: () => void;
    state?: AppState; // Optional for safety if called without context, but logic needs suppliers list
    onSelectSupplier?: (itemId: string, supplierId: string) => void;
}> = ({ option, onClose, state, onSelectSupplier }) => {
    
    // Helper to find supplier object if needed (assumes state is passed)
    const getSupplier = (id: string) => state?.suppliers.find(s => s.id === id);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-cute">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 border-4 border-white overflow-hidden">
                <div className="bg-gradient-to-r from-stone-800 to-stone-700 p-6 text-white text-center relative overflow-hidden">
                    <BrainCircuit className="absolute top-4 right-4 opacity-10" size={80}/>
                    <h3 className="text-2xl font-black flex items-center justify-center gap-2">
                        <BrainCircuit size={24} className="text-orange-400"/> AI Analysis
                    </h3>
                    <p className="opacity-80 text-sm mt-1 font-bold">ทำไม AI ถึงเลือกซื้อร้านนี้?</p>
                </div>
                
                <div className="p-6 bg-stone-50 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-stone-200 shadow-sm shrink-0">
                            <ShoppingCart size={32} className="text-stone-400"/>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-stone-800">{option.item.name}</h4>
                            <p className="text-stone-500 text-sm font-bold">จำนวน: {option.qty} {option.item.unit}</p>
                            <p className="text-xs text-orange-500 font-bold mt-1">ของจะหมดใน: {option.item.daysLeft.toFixed(1)} วัน</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Winner */}
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase mb-2 ml-1">ร้านที่เลือก (Current Choice) 🏆</p>
                            <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-200 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-green-800 flex items-center gap-2">
                                        <Store size={16}/> {option.analysis.winner.supplierName}
                                    </span>
                                    <span className="font-black text-green-700 text-lg">฿{option.analysis.winner.totalCost.toFixed(0)}</span>
                                </div>
                                <div className="text-xs text-stone-600 space-y-1 bg-white/60 p-2 rounded-xl">
                                    <div className="flex justify-between">
                                        <span>ค่าสินค้า:</span> <span>฿{option.analysis.winner.productCost}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-green-600">
                                        <span>ค่าเดินทาง/ส่ง ({option.analysis.winner.note}):</span> 
                                        <span>+{option.analysis.winner.logisticsCost > 0 ? `฿${option.analysis.winner.logisticsCost}` : 'ฟรี! (0)'}</span>
                                    </div>
                                    <div className="flex justify-between text-stone-400 italic">
                                        <span>เหตุผล:</span> <span>{option.reason}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Runner Ups (Interactive) */}
                        {option.analysis.allOptions.length > 1 && (
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase mb-2 ml-1">เปลี่ยนไปซื้อร้านอื่น (Alternatives)</p>
                                <div className="space-y-2">
                                    {option.analysis.allOptions.filter(o => o.supplierName !== option.supplierName).map((alt, idx) => {
                                        const supplierId = state?.suppliers.find(s => s.name === alt.supplierName)?.id;

                                        return (
                                            <div key={idx} className={`p-4 rounded-2xl border-2 transition-all ${alt.isFeasible ? 'bg-white border-stone-100 hover:border-orange-300' : 'bg-red-50 border-red-100 opacity-60'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-stone-600 flex items-center gap-2">
                                                        <Store size={14}/> {alt.supplierName}
                                                    </span>
                                                    {alt.isFeasible ? (
                                                        <span className="font-bold text-stone-400">฿{alt.totalCost.toFixed(0)}</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded border border-red-200">ไม่ผ่าน</span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-2">
                                                    {!alt.isFeasible ? (
                                                        <div className="text-xs text-red-500 font-bold flex items-center gap-1">
                                                            <AlertTriangle size={12}/> {alt.note}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-stone-400">
                                                            แพงกว่า ฿{(alt.totalCost - option.analysis.winner.totalCost).toFixed(0)} ({alt.logisticsCost > option.analysis.winner.logisticsCost ? 'ค่าเดินทาง' : 'ราคาของ'})
                                                        </div>
                                                    )}

                                                    {/* SWITCH BUTTON */}
                                                    {supplierId && onSelectSupplier && (
                                                        <button 
                                                            onClick={() => onSelectSupplier(option.item.id, supplierId)}
                                                            className="flex items-center gap-1 bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-stone-800 hover:text-white transition-colors border border-stone-200"
                                                        >
                                                            <MousePointerClick size={12} /> เลือก
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={onClose} className="bg-stone-800 text-white p-4 text-center font-bold text-lg hover:bg-stone-900 transition-colors">ปิดหน้าต่าง</button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: EDIT SUPPLIER MODAL 2.0 (Redesigned) ---
export const SupplierEditModal: React.FC<{
    supplier: Supplier | null;
    centralIngredients: any[];
    onClose: () => void;
    onSave: (data: any) => void;
    onDelete: (id: string) => void;
}> = ({ supplier, centralIngredients, onClose, onSave, onDelete }) => {
    const { showAlert } = useAlert();
    // --- Tabs State ---
    const [activeTab, setActiveTab] = useState<'info' | 'catalog'>('catalog');
    
    // --- UI State ---
    const [isMaximized, setIsMaximized] = useState(false);

    // --- Info State ---
    const [name, setName] = useState(supplier?.name || '');
    const [location, setLocation] = useState(supplier?.locationName || '');
    const [mapUrl, setMapUrl] = useState(supplier?.mapUrl || ''); 
    const [websiteUrl, setWebsiteUrl] = useState(supplier?.websiteUrl || ''); 
    const [distanceKm, setDistanceKm] = useState<number | ''>(supplier?.distanceKm || ''); 
    const [type, setType] = useState<'physical' | 'online'>(supplier?.type || 'physical');
    const [leadTime, setLeadTime] = useState<number>(supplier?.leadTime || 0); 
    const [image, setImage] = useState(supplier?.image || '');
    const [isUploading, setIsUploading] = useState(false);
    
    // --- Catalog State ---
    const [products, setProducts] = useState<SupplierProductInfo[]>(supplier?.products || []);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filterCategory, setFilterCategory] = useState<'all' | 'ingredient' | 'packaging'>('all');

    // --- Logic ---
    const handleTypeChange = (newType: 'physical' | 'online') => {
        setType(newType);
        if (newType === 'online' && leadTime === 0) setLeadTime(3);
        if (newType === 'physical' && leadTime === 3) setLeadTime(0);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const publicUrl = await uploadImage(file, 'suppliers');
            if (publicUrl) setImage(publicUrl);
            else await showAlert('อัปโหลดรูปไม่สำเร็จ', 'error');
        } catch (error) { 
            console.error(error); 
            await showAlert('เกิดข้อผิดพลาดในการอัปโหลด', 'error'); 
        } finally { 
            setIsUploading(false); 
        }
    };

    const addProduct = (item: any) => {
        setProducts(prev => [...prev, { id: item.id, price: item.bulkPrice || item.costPerUnit }]);
    };

    const removeProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const updateProductPrice = (id: string, price: number) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, price } : p));
    };

    // Filter Logic for Catalog
    const availableItems = useMemo(() => {
        return centralIngredients.filter(item => {
            // 0. EXCLUDE ASSETS (Only consumables allowed in supplier logic)
            if (item.category === 'asset') return false;

            // 1. Must not already be in products
            if (products.some(p => p.id === item.id)) return false;
            
            // 2. Search Filter
            const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            // 3. Category Filter
            const cat = item.category || 'ingredient';
            const matchCat = filterCategory === 'all' || cat === filterCategory;

            return matchSearch && matchCat;
        });
    }, [centralIngredients, products, searchTerm, filterCategory]);

    const selectedProductDetails = useMemo(() => {
        return products.map(p => {
            const detail = centralIngredients.find(c => c.id === p.id);
            return { ...p, ...detail }; // Merge info
        });
    }, [products, centralIngredients]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-cute">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div 
                className={`bg-white relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 border-4 border-white transition-all duration-300 ${
                    isMaximized 
                    ? 'w-full h-full max-w-none max-h-none rounded-none fixed inset-0' 
                    : 'w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl'
                }`}
            >
                
                {/* Header (Product-First Design) */}
                <div className="p-6 pb-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 border-white overflow-hidden ${image ? '' : 'bg-orange-100 text-orange-500'}`}>
                            {image ? (
                                <img src={image} alt={name} className="w-full h-full object-cover"/>
                            ) : (
                                <Store size={24}/>
                            )}
                        </div>
                        <div>
                            <h3 className="font-black text-2xl text-stone-800">{name || 'ร้านค้าใหม่'}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${type === 'online' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                    {type === 'online' ? 'Online Shop' : 'Physical Store'}
                                </span>
                                {location && (
                                    <span className="text-xs text-stone-400 font-bold flex items-center gap-1">
                                        <MapPin size={10}/> {location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {activeTab === 'catalog' && (
                            <button 
                                onClick={() => setActiveTab('info')}
                                className="bg-white border-2 border-stone-200 text-stone-600 px-4 py-3 rounded-2xl hover:border-orange-300 hover:text-orange-500 transition-all flex items-center gap-2 font-bold text-sm shadow-sm hover:shadow-md"
                            >
                                <Settings size={18} /> <span className="hidden md:inline">ตั้งค่าร้านค้า (Settings)</span>
                            </button>
                        )}
                        {activeTab === 'info' && (
                            <button 
                                onClick={() => setActiveTab('catalog')}
                                className="bg-orange-100 text-orange-600 p-3 rounded-2xl hover:bg-orange-200 transition-colors flex items-center gap-2 font-bold text-sm"
                            >
                                <ShoppingBag size={18} /> <span className="hidden md:inline">จัดการสินค้า</span>
                            </button>
                        )}
                        
                        <div className="w-px h-10 bg-stone-200 mx-1"></div>

                        <button 
                            onClick={() => setIsMaximized(!isMaximized)} 
                            className="bg-stone-100 text-stone-400 hover:text-stone-600 p-3 rounded-2xl hover:bg-stone-200 transition-colors"
                            title={isMaximized ? "ย่อหน้าต่าง" : "ขยายเต็มจอ"}
                        >
                            {isMaximized ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}
                        </button>
                        <button onClick={onClose} className="bg-stone-100 text-stone-400 hover:text-stone-600 p-3 rounded-2xl hover:bg-stone-200 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
                    
                    {/* === TAB 1: INFO (Settings) === */}
                    {activeTab === 'info' && (
                        <div className="space-y-6 max-w-2xl mx-auto p-8 animate-in fade-in slide-in-from-left-4">
                            
                            <h4 className="text-xl font-bold text-stone-700 mb-6 flex items-center gap-2 border-b pb-2 border-stone-100">
                                <FileText className="text-orange-500" /> ข้อมูลทั่วไป (General Info)
                            </h4>

                            {/* Image Uploader */}
                            <div className="flex gap-5 items-start">
                                <label className={`w-28 h-28 rounded-3xl bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all relative overflow-hidden group shadow-inner shrink-0 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                    {isUploading ? <Loader2 className="animate-spin text-orange-400" size={24} /> : image ? (
                                        <>
                                            <img src={image} alt="preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRightLeft className="text-white" size={24} /></div>
                                        </>
                                    ) : (
                                        <div className="text-center"><ImageIcon size={24} className="text-stone-300 mx-auto" /><span className="text-[10px] text-stone-400 font-bold block mt-1">รูปร้าน</span></div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                                </label>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-stone-400 uppercase">ชื่อร้าน</label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-stone-50 border-2 border-stone-100 rounded-xl font-bold text-stone-700 outline-none focus:border-orange-400" placeholder="เช่น แม็คโคร สาขา 1" autoFocus />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleTypeChange('physical')} className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 ${type === 'physical' ? 'bg-orange-50 border-orange-400 text-orange-600' : 'border-stone-100 text-stone-400'}`}>หน้าร้าน</button>
                                        <button onClick={() => handleTypeChange('online')} className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 ${type === 'online' ? 'bg-blue-50 border-blue-400 text-blue-600' : 'border-stone-100 text-stone-400'}`}>Online</button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-stone-400 uppercase">ชื่อสถานที่ / สาขา</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18}/>
                                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full pl-10 p-3 bg-stone-50 border-2 border-stone-100 rounded-xl font-bold text-stone-700 outline-none focus:border-orange-400" placeholder="เช่น ปากซอย, แอปส้ม" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-stone-400 uppercase flex items-center gap-1">
                                            <CalendarClock size={12}/> {type === 'physical' ? 'ต้องสั่งล่วงหน้า (Pre-order)' : 'รอขนส่งกี่วัน (Delivery)'}
                                        </label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={leadTime} 
                                            onChange={e => setLeadTime(Number(e.target.value))} 
                                            className="w-full p-3 bg-stone-50 border-2 border-stone-100 rounded-xl font-bold text-stone-700 outline-none focus:border-orange-400" 
                                            placeholder={type === 'physical' ? "0" : "3"}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Map/Link Section */}
                            {type === 'physical' ? (
                                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-4">
                                    <h4 className="text-sm font-bold text-orange-700 flex items-center gap-2">
                                        <Navigation size={16}/> พิกัด & ระยะทาง (สำหรับการคำนวณ)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-stone-400 uppercase flex items-center gap-1">
                                                <LinkIcon size={12}/> Google Maps Link
                                            </label>
                                            <input 
                                                type="text" 
                                                value={mapUrl} 
                                                onChange={e => setMapUrl(e.target.value)} 
                                                className="w-full p-3 bg-white border-2 border-stone-200 rounded-xl font-medium text-stone-600 outline-none focus:border-orange-400 text-sm" 
                                                placeholder="https://maps.app.goo.gl/..." 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-stone-400 uppercase flex items-center gap-1">
                                                <Route size={12}/> ระยะทาง (กม.)
                                            </label>
                                            <input 
                                                type="number" 
                                                value={distanceKm} 
                                                onChange={e => setDistanceKm(Number(e.target.value))} 
                                                className="w-full p-3 bg-white border-2 border-stone-200 rounded-xl font-bold text-stone-700 outline-none focus:border-orange-400 text-sm" 
                                                placeholder="เช่น 5.5" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-4">
                                    <h4 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                                        <Globe size={16}/> ลิงก์ร้านค้า / แอป (Shop Link)
                                    </h4>
                                    <div>
                                        <label className="text-xs font-bold text-stone-400 uppercase flex items-center gap-1 mb-1">
                                            <LinkIcon size={12}/> URL ร้านค้า (Shopee/Lazada/LINE)
                                        </label>
                                        <input 
                                            type="text" 
                                            value={websiteUrl} 
                                            onChange={e => setWebsiteUrl(e.target.value)} 
                                            className="w-full p-3 bg-white border-2 border-stone-200 rounded-xl font-medium text-blue-600 outline-none focus:border-blue-400 text-sm" 
                                            placeholder="https://shopee.co.th/shop/..." 
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {supplier && !supplier.isHome && (
                                <div className="pt-6 border-t border-stone-100 text-center">
                                    <button 
                                        onClick={() => onDelete(supplier.id)} 
                                        className="text-red-400 text-sm font-bold flex items-center justify-center gap-2 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={16}/> ลบร้านค้านี้
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === TAB 2: CATALOG (Product-First) === */}
                    {activeTab === 'catalog' && (
                        <div className="flex flex-col lg:flex-row h-full animate-in fade-in slide-in-from-right-4">
                            
                            {/* LEFT: SOURCE (Inventory Source) */}
                            <div className="lg:w-[45%] flex flex-col gap-4 border-r border-stone-100 p-6 bg-stone-50/50">
                                <div>
                                    <h4 className="font-black text-stone-700 flex items-center gap-2 mb-1">
                                        <Package className="text-stone-400" size={20}/> เลือกสินค้าเข้าร้าน
                                    </h4>
                                    <p className="text-stone-400 text-xs font-bold">จากคลังวัตถุดิบกลาง (Pantry)</p>
                                </div>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16}/>
                                        <input 
                                            type="text" 
                                            placeholder="ค้นหาวัตถุดิบ..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 outline-none focus:border-orange-300"
                                        />
                                    </div>
                                    <div className="flex bg-white p-1 rounded-xl shrink-0 border border-stone-200">
                                        <button onClick={() => setFilterCategory('all')} className={`px-3 rounded-lg text-xs font-bold ${filterCategory === 'all' ? 'bg-stone-100 text-stone-800' : 'text-stone-400'}`}>All</button>
                                        <button onClick={() => setFilterCategory('ingredient')} className={`px-3 rounded-lg text-xs font-bold ${filterCategory === 'ingredient' ? 'bg-orange-100 text-orange-600' : 'text-stone-400'}`}><Wheat size={14}/></button>
                                        <button onClick={() => setFilterCategory('packaging')} className={`px-3 rounded-lg text-xs font-bold ${filterCategory === 'packaging' ? 'bg-blue-100 text-blue-600' : 'text-stone-400'}`}><Box size={14}/></button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                                    {availableItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl border border-stone-100 bg-white hover:border-orange-300 hover:shadow-md transition-all group cursor-pointer" onClick={() => addProduct(item)}>
                                            <div className="w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-stone-100">
                                                {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <Package size={20} className="text-stone-300"/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-stone-700 text-sm truncate">{item.name}</p>
                                                <div className="flex gap-2 text-[10px] text-stone-400 mt-0.5">
                                                    {item.subCategory && <span className="bg-stone-100 px-1.5 rounded text-stone-500">{item.subCategory}</span>}
                                                    {item.details && <span className="truncate max-w-[100px]">{item.details}</span>}
                                                </div>
                                            </div>
                                            <button className="w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-green-500 hover:text-white rounded-lg text-stone-400 transition-colors">
                                                <Plus size={18}/>
                                            </button>
                                        </div>
                                    ))}
                                    {availableItems.length === 0 && (
                                        <div className="text-center py-10 text-stone-300 text-xs">ไม่พบรายการ (หรือเลือกไปหมดแล้ว)</div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT: SHOP SHELVES (Current Products) */}
                            <div className="flex-1 flex flex-col gap-4 p-6 bg-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-black text-orange-600 flex items-center gap-2 text-lg">
                                        <Store size={20}/> สินค้าในร้านนี้
                                    </h4>
                                    <span className="text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">{products.length} รายการ</span>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-20">
                                    {selectedProductDetails.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-orange-100 bg-orange-50/20 hover:bg-white hover:shadow-md transition-all group">
                                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-stone-100 overflow-hidden">
                                                {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <Package size={24} className="text-stone-300"/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-stone-700 text-base truncate">{item.name}</p>
                                                {/* Details & Tags */}
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    {item.details && <span className="text-[10px] bg-white border border-stone-200 text-stone-500 px-1.5 py-0.5 rounded font-bold truncate max-w-[120px]">{item.details}</span>}
                                                    {item.subCategory && <span className="text-[10px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded border border-stone-100">{item.subCategory}</span>}
                                                    <span className="text-[10px] text-stone-400 font-bold">{item.totalQuantity} {item.unit}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Price Input (Hero) */}
                                            <div className="flex flex-col items-end">
                                                <label className="text-[8px] font-bold text-stone-400 uppercase mb-0.5">ราคาขาย</label>
                                                <div className="flex items-center bg-white border-2 border-orange-200 rounded-xl px-3 py-1.5 shadow-sm group-hover:border-orange-400 transition-colors">
                                                    <DollarSign size={14} className="text-orange-400 mr-1"/>
                                                    <input 
                                                        type="number" 
                                                        value={item.price} 
                                                        onChange={(e) => updateProductPrice(item.id, Number(e.target.value))}
                                                        className="w-20 text-right font-black text-stone-800 bg-transparent outline-none text-lg"
                                                    />
                                                </div>
                                            </div>

                                            <button onClick={() => removeProduct(item.id)} className="p-2 hover:bg-red-50 hover:text-red-500 text-stone-300 rounded-xl transition-colors opacity-50 group-hover:opacity-100">
                                                <X size={20}/>
                                            </button>
                                        </div>
                                    ))}
                                    {products.length === 0 && (
                                        <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-[2rem]">
                                            <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4 opacity-50"/>
                                            <p className="text-stone-400 font-bold text-lg">ร้านนี้ยังไม่มีสินค้า</p>
                                            <p className="text-sm text-stone-300">เลือกจากฝั่งซ้ายเพื่อวางขาย</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-stone-100 bg-white flex justify-end shrink-0 relative z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => onSave({ name, locationName: location, type, leadTime, mapUrl, websiteUrl, distanceKm: Number(distanceKm), products, image })} 
                        disabled={isUploading}
                        className="bg-stone-800 text-white px-10 py-4 rounded-2xl font-bold hover:bg-stone-900 shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 text-lg"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={24}/> : <Check size={24}/>} 
                        {isUploading ? 'กำลังอัปโหลด...' : 'บันทึกร้านค้า'}
                    </button>
                </div>
            </div>
        </div>
    );
};
