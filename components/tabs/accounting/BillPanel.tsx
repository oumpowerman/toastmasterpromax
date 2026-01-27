
import React, { useState, useMemo } from 'react';
import { Receipt, CheckCircle2, Plus, Minus, X, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { PAYMENT_CHANNELS } from '../../../constants';
import { Supplier } from '../../../types';
import { SmartScannerButton } from './SmartTransactionComponents';
import { StockDeductionItem } from './TransactionForm';
import { uploadImage } from '../../../lib/supabase';
import { GoogleGenAI } from "@google/genai";
import { useAlert } from '../../AlertSystem';

interface BillPanelProps {
    date: string; setDate: (d: string) => void;
    title: string; setTitle: (t: string) => void;
    paymentChannel: string; setPaymentChannel: (c: string) => void;
    supplierId: string; setSupplierId: (id: string) => void;
    category: string; setCategory: (c: string) => void;
    slipImage: string | null; setSlipImage: (url: string | null) => void;
    billItems: StockDeductionItem[];
    onUpdateItem: (id: string, updates: Partial<StockDeductionItem>) => void;
    onRemoveItem: (id: string) => void;
    suppliers: Supplier[];
    onAddSupplier?: (data: any) => void;
    onOpenAddSupplier?: () => void; // New Prop
    onAIResult: (items: any[]) => void;
    onSubmit: () => void;
    type: 'income' | 'expense';
}

const BillPanel: React.FC<BillPanelProps> = ({
    date, setDate, title, setTitle, paymentChannel, setPaymentChannel,
    supplierId, setSupplierId, category, setCategory, slipImage, setSlipImage,
    billItems, onUpdateItem, onRemoveItem, suppliers, onAddSupplier, onOpenAddSupplier, onAIResult, onSubmit, type
}) => {
    const { showAlert } = useAlert();
    const [isProcessingAI, setIsProcessingAI] = useState(false);

    const totalAmount = useMemo(() => 
        billItems.reduce((sum, item) => sum + ((item.costPerUnit || 0) * item.qty), 0)
    , [billItems]);

    // AI Logic
    const handleScan = async (file: File) => {
        setIsProcessingAI(true);
        try {
            // 1. Upload Slip
            const url = await uploadImage(file, 'slips');
            if (url) setSlipImage(url);

            // 2. Gemini Analysis
            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: file.type, data: base64Data } },
                        { text: `Analyze this receipt (Thai context). Return JSON Array of items:
                        [{ "name": "Item Name", "quantity": number, "totalPrice": number, "unit": "guessed unit" }]
                        Ignore discounts/tax lines.
                        ` }
                    ]
                }
            });

            const text = response.text;
            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch) {
                const items = JSON.parse(jsonMatch[0]);
                onAIResult(items);
            } else {
                await showAlert('AI อ่านข้อมูลไม่สำเร็จ ลองกรอกเองนะครับ', 'warning');
            }
        } catch (e) {
            console.error(e);
            await showAlert('เกิดข้อผิดพลาดในการสแกน', 'error');
        } finally {
            setIsProcessingAI(false);
        }
    };

    return (
        <div className="flex flex-col bg-white h-full overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative w-full min-h-0">
            <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6 min-h-0">
                
                {/* 1. Top Actions: AI & Slip */}
                {type === 'expense' && (
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <SmartScannerButton 
                                isProcessing={isProcessingAI}
                                onFileChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])}
                            />
                        </div>
                        {slipImage ? (
                            <div className="w-24 h-32 rounded-2xl border-2 border-stone-200 overflow-hidden relative group">
                                <img src={slipImage} className="w-full h-full object-cover" />
                                <button onClick={() => setSlipImage(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                            </div>
                        ) : (
                            <label className="w-24 h-32 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-orange-300 hover:text-orange-500 transition-all cursor-pointer">
                                <ImageIcon size={24} />
                                <span className="text-[10px] font-bold mt-1">แนบรูป</span>
                                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                    if(e.target.files?.[0]) {
                                        const url = await uploadImage(e.target.files[0], 'slips');
                                        if(url) setSlipImage(url);
                                    }
                                }}/>
                            </label>
                        )}
                    </div>
                )}

                {/* 2. Basic Form Info */}
                <div className="bg-stone-50 p-4 rounded-3xl border border-stone-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">วันที่</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border font-bold text-stone-600 text-sm outline-none focus:border-orange-400" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">จ่ายโดย</label>
                            <select value={paymentChannel} onChange={e => setPaymentChannel(e.target.value)} className="w-full px-3 py-2 rounded-xl border font-bold text-stone-600 text-sm outline-none focus:border-orange-400">
                                {PAYMENT_CHANNELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {type === 'expense' && (
                        <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">ร้านค้า (Supplier)</label>
                            <div className="flex gap-2">
                                <select 
                                    value={supplierId} 
                                    onChange={e => setSupplierId(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-xl border font-bold text-stone-600 text-sm outline-none focus:border-orange-400"
                                >
                                    <option value="">-- เลือกร้านค้า --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <button 
                                    onClick={onOpenAddSupplier}
                                    className="bg-white border border-stone-200 p-2 rounded-xl hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-colors"
                                    title="เพิ่มร้านค้าใหม่"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">หัวข้อบิล (Title)</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น ซื้อของเข้าร้าน..." className="w-full px-3 py-2 rounded-xl border font-bold text-stone-600 text-sm outline-none focus:border-orange-400 placeholder-stone-300" />
                    </div>
                </div>

                {/* 3. Items List */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-stone-400 uppercase flex items-center gap-1"><Receipt size={12}/> รายการในบิล</span>
                        <span className="text-xs font-bold text-stone-400">{billItems.length} รายการ</span>
                    </div>

                    {billItems.length === 0 ? (
                        <div className="text-center py-8 text-stone-300 border-2 border-dashed border-stone-100 rounded-2xl">
                            <p>ยังไม่มีสินค้า</p>
                            <p className="text-xs hidden md:block">เลือกจากฝั่งขวา 👉</p>
                            <p className="text-xs md:hidden">กดแท็บ 'เลือกสินค้า' ด้านบน</p>
                        </div>
                    ) : (
                        billItems.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-2 group relative hover:border-orange-300 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-stone-700 text-sm truncate">{item.name}</p>
                                        <div className="flex gap-1 mt-0.5">
                                            {item.isNew && <span className="text-[8px] bg-green-100 text-green-600 px-1.5 rounded-md font-bold">New</span>}
                                            {item.category === 'asset' && <span className="text-[8px] bg-purple-100 text-purple-600 px-1.5 rounded-md font-bold">Asset</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => onRemoveItem(item.id)} className="text-stone-300 hover:text-red-500"><X size={16}/></button>
                                </div>
                                <div className="flex justify-between items-center bg-stone-50 p-2 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onUpdateItem(item.id, { qty: Math.max(1, item.qty - 1) })} className="w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center text-stone-500 hover:text-red-500"><Minus size={12}/></button>
                                        <span className="text-sm font-black w-6 text-center">{item.qty}</span>
                                        <button onClick={() => onUpdateItem(item.id, { qty: item.qty + 1 })} className="w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center text-stone-500 hover:text-green-500"><Plus size={12}/></button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-stone-400">@</span>
                                        <input 
                                            type="number" 
                                            value={item.costPerUnit} 
                                            onChange={(e) => onUpdateItem(item.id, { costPerUnit: Number(e.target.value) })}
                                            className="w-16 bg-transparent text-right font-bold text-sm text-stone-700 outline-none border-b border-dashed border-stone-300 focus:border-orange-400"
                                        />
                                    </div>
                                    <span className="text-sm font-black text-stone-800 w-16 text-right">฿{(item.qty * (item.costPerUnit || 0)).toFixed(0)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer Total */}
            <div className="p-4 md:p-6 border-t border-stone-100 bg-stone-50 mt-auto shrink-0">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-stone-500 font-bold uppercase text-xs">ยอดรวมสุทธิ</span>
                    <span className="text-3xl md:text-4xl font-black text-stone-800 tracking-tighter">฿{totalAmount.toLocaleString()}</span>
                </div>
                <button 
                    onClick={onSubmit}
                    disabled={totalAmount <= 0}
                    className="w-full py-4 bg-stone-800 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-stone-900 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle2 size={24}/> บันทึกรายการ
                </button>
            </div>
        </div>
    );
};

export default BillPanel;
