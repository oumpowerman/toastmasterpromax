
import React, { useState, useEffect } from 'react';
import { X, ScanLine, Loader2, CheckCircle2, CheckSquare, Trash2, Receipt } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAlert } from '../AlertSystem';

export interface ScannedStockItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    totalPrice: number;
    selected: boolean;
}

interface InventoryAIScannerProps {
    onClose: () => void;
    onSave: (items: ScannedStockItem[]) => void;
}

const InventoryAIScanner: React.FC<InventoryAIScannerProps> = ({ onClose, onSave }) => {
    const { showAlert } = useAlert();
    const [analyzing, setAnalyzing] = useState(false);
    const [scannedItems, setScannedItems] = useState<ScannedStockItem[]>([]);
    const [hasApiKey, setHasApiKey] = useState(false);

    useEffect(() => {
        const checkKey = async () => {
            if (process.env.API_KEY || ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey())) {
                setHasApiKey(true);
            }
        };
        checkKey();
    }, []);

    const handleConnectApiKey = async () => {
        if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
            setHasApiKey(true);
        } else {
            await showAlert("Please configure API Key", 'warning');
        }
    };

    const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        setScannedItems([]);

        try {
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
                        { text: `Analyze this receipt image. 
                        Task: Extract a list of purchased items.
                        
                        For each item, extract:
                        1. "name": Item name (string) - Keep it short and clear.
                        2. "quantity": Quantity purchased (number) - Default to 1 if not specified.
                        3. "unit": Unit of measure (string) - Guess based on context (e.g., 'ชิ้น', 'แพ็ค', 'kg', 'ขวด'). If unsure use 'ชิ้น'.
                        4. "totalPrice": Total price for this line item (number).

                        Exclude: Discounts, Tax, Service Charge, Total Summary lines.
                        Return ONLY a raw JSON Array of objects. No markdown.` }
                    ]
                }
            });

            const text = response.text;
            const jsonMatch = text.match(/\[.*\]/s); // Find JSON Array
            
            if (jsonMatch) {
                const items = JSON.parse(jsonMatch[0]);
                // Map to internal structure
                const mappedItems = items.map((i: any, idx: number) => ({
                    id: `scan-${idx}-${Date.now()}`,
                    name: i.name,
                    quantity: i.quantity || 1,
                    unit: i.unit || 'ชิ้น',
                    totalPrice: i.totalPrice || 0,
                    selected: true
                }));
                setScannedItems(mappedItems);
            } else {
                await showAlert("AI ไม่สามารถอ่านรายการสินค้าได้ ลองใหม่อีกครั้งครับ", 'error');
            }

        } catch (error: any) {
            console.error(error);
            await showAlert("เกิดข้อผิดพลาดในการสแกน: " + error.message, 'error');
        } finally {
            setAnalyzing(false);
        }
    };

    const updateScannedItem = (id: string, field: keyof ScannedStockItem, value: any) => {
        setScannedItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const deleteScannedItem = (id: string) => {
        setScannedItems(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-800 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <ScanLine size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold font-cute">AI Restock Scanner</h3>
                            <p className="text-stone-300 text-xs">อ่านรายการสินค้าจากใบเสร็จ เพื่อรับของเข้าสต็อกทีละหลายรายการ</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20}/></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
                    
                    {!hasApiKey ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <p className="text-red-500 font-bold">⚠️ ต้องการ API Key ในการใช้งาน AI</p>
                            <button onClick={handleConnectApiKey} className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all">เชื่อมต่อ API Key</button>
                        </div>
                    ) : scannedItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            <label className="cursor-pointer group flex flex-col items-center gap-4">
                                <div className="w-32 h-32 rounded-full bg-white border-4 border-dashed border-stone-200 flex items-center justify-center group-hover:border-purple-400 group-hover:bg-purple-50 transition-all shadow-sm">
                                    {analyzing ? <Loader2 className="animate-spin text-purple-500" size={40}/> : <Receipt className="text-stone-300 group-hover:text-purple-500 transition-colors" size={40}/>}
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-stone-700 text-lg">{analyzing ? 'กำลังอ่านรายการสินค้า...' : 'จิ้มเพื่อถ่ายรูปใบเสร็จ'}</p>
                                    <p className="text-sm text-stone-400">{analyzing ? 'รอแป๊บนะ AI กำลังแกะลายมือ' : 'รองรับสลิป Makro, 7-11, BigC'}</p>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleScanReceipt} disabled={analyzing} />
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-stone-700">รายการที่อ่านได้ ({scannedItems.length})</h4>
                                <button onClick={() => setScannedItems([])} className="text-xs text-red-500 font-bold hover:underline">สแกนใหม่</button>
                            </div>
                            
                            <div className="space-y-3">
                                {scannedItems.map((item) => (
                                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${item.selected ? 'bg-white border-purple-100 shadow-sm' : 'bg-stone-100 border-transparent opacity-50'}`}>
                                        <button 
                                            onClick={() => updateScannedItem(item.id, 'selected', !item.selected)}
                                            className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${item.selected ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white border-stone-300'}`}
                                        >
                                            {item.selected && <CheckSquare size={14}/>}
                                        </button>
                                        
                                        <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-5">
                                                <input 
                                                    type="text" 
                                                    value={item.name} 
                                                    onChange={(e) => updateScannedItem(item.id, 'name', e.target.value)}
                                                    className="w-full bg-transparent font-bold text-stone-700 outline-none border-b border-transparent hover:border-stone-200 focus:border-purple-300 text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center gap-1">
                                                <input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => updateScannedItem(item.id, 'quantity', Number(e.target.value))}
                                                    className="w-full bg-stone-50 rounded-lg px-2 py-1 text-center font-bold text-stone-600 outline-none text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input 
                                                    type="text" 
                                                    value={item.unit} 
                                                    onChange={(e) => updateScannedItem(item.id, 'unit', e.target.value)}
                                                    className="w-full bg-stone-50 rounded-lg px-2 py-1 text-center text-xs font-bold text-stone-500 outline-none"
                                                />
                                            </div>
                                            <div className="col-span-3 text-right">
                                                <input 
                                                    type="number" 
                                                    value={item.totalPrice} 
                                                    onChange={(e) => updateScannedItem(item.id, 'totalPrice', Number(e.target.value))}
                                                    className="w-full text-right font-black text-stone-800 bg-transparent outline-none"
                                                />
                                            </div>
                                        </div>

                                        <button onClick={() => deleteScannedItem(item.id)} className="shrink-0 text-stone-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {scannedItems.length > 0 && (
                    <div className="p-6 bg-white border-t border-stone-100 flex items-center justify-between shrink-0">
                        <div className="text-xs text-stone-500">
                            เลือก {scannedItems.filter(i => i.selected).length} รายการ <br/>
                            <span className="font-bold text-stone-700 text-base">รวม ฿{scannedItems.filter(i => i.selected).reduce((sum, i) => sum + i.totalPrice, 0).toLocaleString()}</span>
                        </div>
                        <button 
                            onClick={() => onSave(scannedItems)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            <CheckCircle2 size={20} /> บันทึกเข้าสต็อก & บัญชี
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryAIScanner;
