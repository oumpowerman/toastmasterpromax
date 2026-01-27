import React, { useState, useEffect, useMemo } from 'react';
import { Edit3, Plus, Save, Loader2, Image as ImageIcon, Wheat, FlaskConical, Box, Tag, Store, Coins, Scale, HelpCircle, Info, Flame, Calculator, X, IceCream, Beef, Milk, Carrot } from 'lucide-react';
import { IngredientLibraryItem } from '../../../types';
import { useAlert } from '../../AlertSystem';
import ImageCropper from '../ImageCropper';
import { uploadImage, base64ToBlob } from '../../../lib/supabase';

interface PantryFormProps {
    initialData: IngredientLibraryItem | null;
    centralIngredients: IngredientLibraryItem[];
    suppliers: { id: string; name: string }[];
    onSave: (data: any) => void;
    onCancel: () => void;
}

const PantryForm: React.FC<PantryFormProps> = ({ initialData, centralIngredients, suppliers, onSave, onCancel }) => {
    const { showAlert } = useAlert();

    // Form States
    const [type, setType] = useState<'single' | 'composite'>('single');
    const [category, setCategory] = useState<'ingredient' | 'packaging' | 'asset'>('ingredient');
    
    // NEW: Sub-Category State
    const [subCategory, setSubCategory] = useState<string>('general');

    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [image, setImage] = useState('');
    const [supplierId, setSupplierId] = useState('');
    
    // Single Item States
    const [bulkPrice, setBulkPrice] = useState<number | ''>('');
    const [totalQty, setTotalQty] = useState<number | ''>('');
    const [mode, setMode] = useState<'unit' | 'weight'>('weight');
    const [unitLabel, setUnitLabel] = useState('กรัม'); // Display Unit Name

    // Composite States
    const [compositeYield, setCompositeYield] = useState<number | ''>('');
    const [subItems, setSubItems] = useState<{ id: string; name: string; quantity: number; unit: string; cost: number }[]>([]);
    const [tempSubId, setTempSubId] = useState('');
    const [tempSubQty, setTempSubQty] = useState<number | ''>('');
    const [showYieldInfo, setShowYieldInfo] = useState(false);

    // Image Upload States
    const [tempImageForCrop, setTempImageForCrop] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize Form Data
    useEffect(() => {
        if (initialData) {
            setType(initialData.type || 'single');
            setCategory(initialData.category || 'ingredient');
            setSubCategory(initialData.subCategory || 'general'); // Restore subCategory
            setName(initialData.name);
            setDetails(initialData.details || '');
            setImage(initialData.image || '');
            setSupplierId(initialData.supplierId || '');

            if (initialData.type === 'composite') {
                setCompositeYield(initialData.totalQuantity || '');
                setUnitLabel(initialData.unit || 'กรัม'); // Restore composite unit
                setSubItems(initialData.subIngredients?.map(sub => ({
                    ...sub,
                    unit: sub.quantity < 10 && sub.cost > 10 ? 'ชิ้น' : 'กรัม'
                })) as any || []);
            } else {
                setBulkPrice(initialData.bulkPrice);
                setTotalQty(initialData.totalQuantity);
                setMode(initialData.unitType);
                setUnitLabel(initialData.unit || (initialData.unitType === 'unit' ? 'ชิ้น' : 'กรัม'));
            }
        } else {
            resetForm();
        }
    }, [initialData]);

    const resetForm = () => {
        setType('single');
        setCategory('ingredient');
        setSubCategory('general');
        setName('');
        setDetails('');
        setImage('');
        setSupplierId('');
        setBulkPrice('');
        setTotalQty('');
        setMode('weight');
        setUnitLabel('กรัม');
        setCompositeYield('');
        setSubItems([]);
        setTempSubId('');
        setTempSubQty('');
    };

    // --- Image Handling ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { 
            showAlert('ไฟล์ภาพใหญ่เกินไป (ต้องน้อยกว่า 10MB)', 'warning');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            setTempImageForCrop(event.target?.result as string);
            e.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBase64: string) => {
        setTempImageForCrop(null); 
        setIsUploading(true);
        try {
            const blob = await base64ToBlob(croppedBase64);
            const url = await uploadImage(blob, 'ingredients');
            if (url) {
                setImage(url);
            } else {
                showAlert('อัปโหลดรูปภาพไม่สำเร็จ', 'error');
            }
        } catch (e) {
            console.error(e);
            showAlert('เกิดข้อผิดพลาดในการอัปโหลด', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // --- Logic ---
    const formatNumber = (num: number | string) => typeof num === 'number' ? num : 0;

    const previewCost = useMemo(() => {
        const p = formatNumber(bulkPrice);
        const q = formatNumber(totalQty);
        return q > 0 ? p / q : 0;
    }, [bulkPrice, totalQty]);

    const selectedSubItem = useMemo(() => centralIngredients.find(i => i.id === tempSubId), [tempSubId, centralIngredients]);
    const selectedSubItemUnit = selectedSubItem?.unit || (selectedSubItem?.unitType === 'unit' ? 'ชิ้น' : 'กรัม');

    const handleAddSubIngredient = () => {
        const qty = formatNumber(tempSubQty);
        if (!tempSubId || qty <= 0 || !selectedSubItem) return;

        const rawCostPerUnit = selectedSubItem.costPerUnit || (selectedSubItem.bulkPrice / Math.max(1, selectedSubItem.totalQuantity));
        const totalCost = rawCostPerUnit * qty;

        setSubItems([...subItems, {
            id: tempSubId,
            name: selectedSubItem.name,
            quantity: qty,
            unit: selectedSubItemUnit,
            cost: totalCost
        }]);
        setCompositeYield(prev => formatNumber(prev) + qty);
        setTempSubId('');
        setTempSubQty('');
    };

    const totalCostBatch = useMemo(() => subItems.reduce((sum, item) => sum + item.cost, 0), [subItems]);
    const rawTotalWeight = useMemo(() => subItems.reduce((sum, item) => sum + item.quantity, 0), [subItems]);

    const handleFormSubmit = () => {
        if (!name) return;

        let payload: any = {
            name, details, category, type, image, supplierId,
            subCategory, // Persist Sub-Category
            unit: unitLabel // Persist Display Unit
        };

        if (type === 'composite') {
            payload = {
                ...payload,
                bulkPrice: totalCostBatch,
                totalQuantity: formatNumber(compositeYield),
                unitType: 'weight',
                usagePerUnit: 1,
                subIngredients: subItems
            };
        } else {
            payload = {
                ...payload,
                bulkPrice: formatNumber(bulkPrice),
                unitType: mode,
                totalQuantity: formatNumber(totalQty),
                usagePerUnit: 1
            };
        }
        onSave(payload);
        resetForm();
    };

    const subCategories = [
        { id: 'general', label: 'ทั่วไป', icon: Wheat },
        { id: 'bread', label: 'ขนมปัง', icon: Box },
        { id: 'topping', label: 'Topping', icon: IceCream },
        { id: 'meat', label: 'เนื้อสัตว์', icon: Beef },
        { id: 'dairy', label: 'นม/เนย', icon: Milk },
        { id: 'veg', label: 'ผัก/ผลไม้', icon: Carrot },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* 1. Type Switcher */}
            <div className="bg-stone-100 p-1.5 rounded-2xl flex relative">
                <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${type === 'single' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
                <button onClick={() => setType('single')} className={`flex-1 relative z-10 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${type === 'single' ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>
                    <Wheat size={16} /> วัตถุดิบเดี่ยว
                </button>
                <button onClick={() => setType('composite')} className={`flex-1 relative z-10 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${type === 'composite' ? 'text-purple-600' : 'text-stone-400 hover:text-stone-600'}`}>
                    <FlaskConical size={16} /> สูตรผสม (Mix)
                </button>
            </div>

            {/* Form Header */}
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-800 flex items-center gap-2 text-lg">
                    {initialData ? <Edit3 size={20} className="text-blue-500" /> : <Plus size={20} className="text-orange-500" />} 
                    {initialData ? 'แก้ไขรายการ' : (type === 'single' ? 'เพิ่มวัตถุดิบใหม่' : 'สร้างสูตรผสมใหม่')}
                </h4>
                {initialData && <button onClick={onCancel} className="text-xs text-red-500 underline font-bold">ยกเลิก</button>}
            </div>

            <div className="space-y-5">
                {/* Image & Basic Info */}
                <div className="flex gap-4 items-start">
                    <label className={`w-20 h-20 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all relative overflow-hidden group shrink-0 shadow-inner ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                        {isUploading ? <Loader2 className="animate-spin text-orange-400" size={24} /> : image ? (
                            <>
                                <img src={image} alt="preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="text-white" size={20} /></div>
                            </>
                        ) : (
                            <div className="text-center"><ImageIcon size={20} className="text-stone-300 mx-auto" /><span className="text-[10px] text-stone-400 font-bold block mt-1">รูป</span></div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                    </label>

                    <div className="flex-1 space-y-2">
                        <div>
                            <label className="text-xs font-bold text-stone-400 mb-1.5 block uppercase tracking-wide">ชื่อรายการ</label>
                            <input type="text" placeholder="เช่น ถาดกระดาษ" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border-2 border-stone-100 rounded-2xl outline-none focus:border-orange-300 font-bold text-stone-700 text-sm bg-stone-50 focus:bg-white transition-all" />
                        </div>
                        <div className="relative">
                            <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input type="text" placeholder="Spec/รุ่น/สี" value={details} onChange={e => setDetails(e.target.value)} className="w-full pl-8 pr-3 py-2 border-2 border-stone-100 rounded-xl outline-none focus:border-blue-300 text-xs font-bold text-stone-600 bg-stone-50 focus:bg-white transition-all placeholder-stone-300" />
                        </div>
                    </div>
                </div>

                {type === 'single' ? (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Supplier */}
                        <div>
                            <label className="text-xs font-bold text-stone-400 mb-1.5 block uppercase tracking-wide flex items-center gap-1"><Store size={12} /> ซื้อจากร้าน (Supplier)</label>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full px-4 py-2 border-2 border-stone-100 rounded-2xl outline-none focus:border-blue-300 font-bold text-stone-700 text-sm bg-stone-50 focus:bg-white transition-all">
                                <option value="">-- ไม่ระบุ --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="flex gap-3">
                            <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-3 flex items-center gap-3 transition-all ${category === 'ingredient' ? 'border-orange-400 bg-orange-50' : 'border-stone-100 hover:border-stone-200'}`}>
                                <input type="radio" name="cat" className="hidden" checked={category === 'ingredient'} onChange={() => setCategory('ingredient')} />
                                <div className={`p-2 rounded-full ${category === 'ingredient' ? 'bg-orange-400 text-white' : 'bg-stone-100 text-stone-400'}`}><Wheat size={16}/></div>
                                <span className={`text-sm font-bold ${category === 'ingredient' ? 'text-stone-800' : 'text-stone-400'}`}>ของสด</span>
                            </label>
                            <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-3 flex items-center gap-3 transition-all ${category === 'packaging' ? 'border-blue-400 bg-blue-50' : 'border-stone-100 hover:border-stone-200'}`}>
                                <input type="radio" name="cat" className="hidden" checked={category === 'packaging'} onChange={() => setCategory('packaging')} />
                                <div className={`p-2 rounded-full ${category === 'packaging' ? 'bg-blue-400 text-white' : 'bg-stone-100 text-stone-400'}`}><Box size={16}/></div>
                                <span className={`text-sm font-bold ${category === 'packaging' ? 'text-stone-800' : 'text-stone-400'}`}>บรรจุภัณฑ์</span>
                            </label>
                        </div>

                        {/* NEW: Sub-Category (Only show if Ingredient) */}
                        {category === 'ingredient' && (
                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                <p className="text-xs font-bold text-orange-500 mb-2 uppercase">ประเภทของสด (Sub-Category)</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {subCategories.map(sub => (
                                        <button 
                                            key={sub.id}
                                            onClick={() => setSubCategory(sub.id)}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${subCategory === sub.id ? 'bg-white border-orange-400 shadow-sm text-orange-600' : 'bg-white/50 border-transparent text-stone-400 hover:bg-white hover:border-stone-200'}`}
                                        >
                                            <sub.icon size={16} className="mb-1"/>
                                            <span className="text-[10px] font-bold">{sub.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Costing */}
                        <div className="bg-stone-50 p-5 rounded-[1.5rem] border border-stone-100 space-y-4">
                            <p className="text-sm font-bold text-stone-700 flex items-center gap-2 border-b border-stone-200 pb-2"><Coins size={16} className="text-orange-500"/> ข้อมูลการซื้อ (Buying Info)</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 mb-1 block">ซื้อมาหน่วยละ</label>
                                    <select className="w-full px-3 py-2 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-600 outline-none focus:border-orange-300 bg-white" value={mode} onChange={(e) => { const m = e.target.value as any; setMode(m); setUnitLabel(m === 'weight' ? 'กรัม' : 'ชิ้น'); }}>
                                        <option value="weight">ชั่ง นน. (g, ml, oz)</option>
                                        <option value="unit">นับจำนวน (ชิ้น)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 mb-1 block">ราคาที่ซื้อมา (บาท)</label>
                                    <input type="number" placeholder="เช่น 150" value={bulkPrice} onChange={e => setBulkPrice(Number(e.target.value))} className="w-full px-3 py-2 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-700 outline-none focus:border-orange-300 bg-white text-right" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 mb-1 block">ปริมาณใน 1 แพ็ค</label>
                                    <input type="number" placeholder={mode === 'weight' ? "เช่น 1000" : "เช่น 20"} value={totalQty} onChange={e => setTotalQty(Number(e.target.value))} className="w-full px-3 py-2 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-700 outline-none focus:border-orange-300 bg-white text-right" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 mb-1 block">หน่วย (Unit)</label>
                                    <div className="flex gap-1 flex-wrap">
                                        {mode === 'weight' ? ['กรัม','มล.','กก.', 'Oz'].map(u => <button key={u} onClick={() => setUnitLabel(u)} className={`px-2 py-1 rounded-lg text-xs font-bold border ${unitLabel === u ? 'bg-orange-100 border-orange-200 text-orange-600' : 'bg-white border-stone-200 text-stone-400'}`}>{u}</button>) 
                                        : ['ชิ้น','แผ่น','ใบ'].map(u => <button key={u} onClick={() => setUnitLabel(u)} className={`px-2 py-1 rounded-lg text-xs font-bold border ${unitLabel === u ? 'bg-orange-100 border-orange-200 text-orange-600' : 'bg-white border-stone-200 text-stone-400'}`}>{u}</button>)}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-orange-100/50 p-3 rounded-xl flex justify-between items-center border border-orange-100">
                                <span className="text-xs font-bold text-orange-400">ต้นทุนจริงเฉลี่ย:</span>
                                <span className="text-lg font-black text-orange-500">฿{previewCost.toFixed(4)} <span className="text-xs font-medium text-orange-400">/ {unitLabel}</span></span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* COMPOSITE FORM */
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-purple-50 p-5 rounded-[1.5rem] border-2 border-purple-100 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h5 className="font-bold text-purple-800 flex items-center gap-2 text-sm uppercase tracking-wide"><FlaskConical size={16}/> ส่วนผสม (Ingredients)</h5>
                                <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-purple-600 border border-purple-100 shadow-sm">รวม: ฿{totalCostBatch.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-2 mb-3 items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-purple-400 mb-1 block ml-1">วัตถุดิบตั้งต้น</label>
                                    <select value={tempSubId} onChange={e => setTempSubId(e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-purple-200 outline-none bg-white text-stone-700 font-bold h-[42px]">
                                        <option value="">+ เพิ่มวัตถุดิบ...</option>
                                        {centralIngredients.filter(i => i.id !== initialData?.id).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] font-bold text-purple-400 mb-1 block ml-1">ปริมาณที่ใช้</label>
                                    <div className="relative">
                                        <input type="number" placeholder="Qty" className="w-full text-sm p-2.5 rounded-xl border border-purple-200 outline-none text-center font-bold bg-white placeholder-purple-200 h-[42px]" value={tempSubQty} onChange={e => setTempSubQty(Number(e.target.value))} />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-400">{selectedSubItemUnit}</span>
                                    </div>
                                </div>
                                <button onClick={handleAddSubIngredient} disabled={!tempSubId || !tempSubQty} className="bg-purple-500 text-white w-12 rounded-xl hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm h-[42px]"><Plus size={20}/></button>
                            </div>
                            <div className="bg-white rounded-xl border border-purple-100 overflow-hidden min-h-[120px]">
                                <table className="w-full text-xs">
                                    <thead className="bg-purple-100/50 text-purple-500 font-bold uppercase">
                                        <tr><th className="text-left p-2 pl-3">รายการ</th><th className="text-center p-2">ปริมาณ</th><th className="text-right p-2 pr-3">ต้นทุนจริง</th><th className="w-8"></th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-purple-50">
                                        {subItems.length === 0 ? <tr><td colSpan={4} className="text-center py-8 text-purple-300 italic">ยังไม่มีส่วนผสม</td></tr> : subItems.map((sub, idx) => (
                                            <tr key={idx} className="group hover:bg-purple-50/50">
                                                <td className="p-2 pl-3 font-bold text-stone-600">{sub.name}</td>
                                                <td className="p-2 text-center text-stone-500">{sub.quantity} {sub.unit}</td>
                                                <td className="p-2 pr-3 text-right font-bold text-stone-600">฿{sub.cost.toFixed(2)}</td>
                                                <td className="p-2 text-center"><button onClick={() => setSubItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={12}/></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 pt-4 border-t-2 border-dashed border-purple-200">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-purple-800 block uppercase flex items-center gap-1"><Scale size={14}/> ได้ผลลัพธ์สุทธิ (Total Yield)</label>
                                    <button onClick={() => setShowYieldInfo(!showYieldInfo)} className="bg-purple-100 text-purple-500 p-1 rounded-full hover:bg-purple-200 transition-colors"><HelpCircle size={14} /></button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="number" placeholder="0" value={compositeYield} onChange={e => setCompositeYield(Number(e.target.value))} className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-xl text-lg font-black text-purple-900 outline-none focus:border-purple-400 bg-white" />
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs text-purple-500 font-bold bg-purple-100 px-3 py-2 rounded-xl border border-purple-200">หน่วย</div>
                                        <input type="text" value={unitLabel} onChange={e => setUnitLabel(e.target.value)} className="w-20 px-2 py-2 border-2 border-purple-200 rounded-xl text-center text-sm font-bold text-purple-900 outline-none" placeholder="กรัม"/>
                                    </div>
                                </div>
                                {showYieldInfo && (
                                    <div className="mt-3 bg-purple-100/50 p-3 rounded-xl border border-purple-100 text-xs text-purple-800 space-y-3 animate-in slide-in-from-top-2">
                                        <div className="flex gap-2"><Info size={14} className="shrink-0 mt-0.5 text-purple-500" /><div><span className="font-bold">Total Yield คืออะไร?</span><p className="opacity-80">คือปริมาณของที่ "ทำเสร็จแล้ว" พร้อมขายจริง (หลังหักระเหย/ตัดขอบ)</p></div></div>
                                        {rawTotalWeight > 0 && formatNumber(compositeYield) > 0 && (
                                            <div className="bg-white/60 p-2.5 rounded-lg border border-purple-100">
                                                <div className="flex justify-between mb-1 opacity-70"><span>น้ำหนักดิบรวม (Raw):</span><span className="font-bold">{rawTotalWeight.toLocaleString()}</span></div>
                                                <div className="flex justify-between mb-1.5 text-purple-700"><span>น้ำหนักสุก (Yield):</span><span className="font-bold">{formatNumber(compositeYield).toLocaleString()}</span></div>
                                                <div className="flex justify-between border-t border-purple-200 pt-1.5 text-orange-600 font-bold"><span className="flex items-center gap-1"><Flame size={12}/> น้ำหนักหายไป (Loss):</span><span>{(100 - (formatNumber(compositeYield)/rawTotalWeight * 100)).toFixed(1)}%</span></div>
                                            </div>
                                        )}
                                        <div className="flex gap-2 border-t border-purple-200/50 pt-2"><Calculator size={14} className="shrink-0 mt-0.5 text-purple-500" /><div className="w-full"><span className="font-bold block mb-1">คำนวณต้นทุนเฉลี่ย:</span><div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-purple-100 text-purple-900"><span className="opacity-70">(฿{totalCostBatch.toFixed(2)} ÷ {formatNumber(compositeYield)})</span><span className="font-black">= ฿{(totalCostBatch/Math.max(1, formatNumber(compositeYield))).toFixed(4)} / {unitLabel}</span></div></div></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <button onClick={handleFormSubmit} disabled={!name || isUploading} className={`w-full py-4 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:-translate-y-1 ${isUploading ? 'bg-stone-400 cursor-not-allowed' : initialData ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' : type === 'composite' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-stone-800 hover:bg-stone-900 shadow-stone-300'}`}>
                    {isUploading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />} 
                    {isUploading ? 'กำลังอัปโหลด...' : (initialData ? 'บันทึกการแก้ไข' : 'บันทึกเข้าคลัง')}
                </button>
            </div>

            {tempImageForCrop && <ImageCropper src={tempImageForCrop} onCancel={() => setTempImageForCrop(null)} onCrop={handleCropComplete} />}
        </div>
    );
};

export default PantryForm;