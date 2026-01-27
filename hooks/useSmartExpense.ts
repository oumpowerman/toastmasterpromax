
import { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LedgerItem, Supplier, InventoryItem, MenuItem } from '../types';
import { uploadImage } from '../lib/supabase';

// Helper Interface for Form Data
export interface SmartFormState {
    date: string;
    type: 'income' | 'expense';
    title: string;
    amount: string;
    category: string;
    channel: string;
    slipImage: string | null;
    
    // Asset Specifics
    lifespanDays: string;
    salvagePrice: string;
    
    // Stock Linking
    stockItems: any[]; // Items to add/deduct
}

export const useSmartExpense = (
    initialData: LedgerItem | undefined, 
    defaultType: 'income' | 'expense',
    defaultCategory: string | undefined,
    suppliers: Supplier[],
    inventory: InventoryItem[]
) => {
    // --- STATE ---
    const [formState, setFormState] = useState<SmartFormState>({
        date: new Date().toISOString().split('T')[0],
        type: defaultType,
        title: '',
        amount: '',
        category: defaultCategory || (defaultType === 'income' ? 'sales' : 'raw_material'),
        channel: 'cash',
        slipImage: null,
        lifespanDays: '365',
        salvagePrice: '0',
        stockItems: []
    });

    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [aiConfidence, setAiConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
    const [frequentSuppliers, setFrequentSuppliers] = useState<Supplier[]>([]);

    // --- INITIALIZE ---
    useEffect(() => {
        if (initialData) {
            setFormState({
                date: initialData.date,
                type: initialData.type,
                title: initialData.title,
                amount: initialData.amount.toString(),
                category: initialData.category,
                channel: initialData.channel || 'cash',
                slipImage: initialData.slipImage || null,
                lifespanDays: '365', // Default for edit
                salvagePrice: '0',
                stockItems: [] // Reset stock link on edit to avoid complexity
            });
        } else {
            // Suggest Suppliers based on history (mock logic for now, using top 4)
            setFrequentSuppliers(suppliers.slice(0, 4));
        }
    }, [initialData, suppliers]);

    // --- ACTIONS ---

    const updateField = (field: keyof SmartFormState, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectSupplier = (supplier: Supplier) => {
        setFormState(prev => ({
            ...prev,
            title: `ซื้อของจาก: ${supplier.name}`,
            category: 'raw_material', // Guess default
            // If we had history, we could auto-fill previous items here
        }));
    };

    const handleScanReceipt = async (file: File) => {
        setIsAIProcessing(true);
        setAiConfidence(null);

        try {
            // 1. Upload Image First
            const publicUrl = await uploadImage(file, 'slips');
            if (publicUrl) updateField('slipImage', publicUrl);

            // 2. Process with Gemini
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
                        { text: `Analyze this receipt (Thai context). Return JSON only:
                        {
                            "merchantName": "Shop Name",
                            "date": "YYYY-MM-DD",
                            "total": number,
                            "category": "raw_material" | "equipment" | "utilities" | "general",
                            "items": [{ "name": "Item Name", "price": number, "qty": number }]
                        }
                        If date is missing, use today.
                        ` }
                    ]
                }
            });

            const text = response.text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                
                setFormState(prev => ({
                    ...prev,
                    title: `ซื้อ: ${data.merchantName || 'ร้านค้าทั่วไป'}`,
                    date: data.date || new Date().toISOString().split('T')[0],
                    amount: data.total?.toString() || '',
                    category: data.category || 'general',
                    stockItems: (data.items || []).map((i: any) => ({
                        id: Date.now() + Math.random(),
                        name: i.name,
                        qty: i.qty || 1,
                        costPerUnit: i.qty ? i.price / i.qty : i.price,
                        type: 'inventory', // Default assumption
                        refId: 'new-item' // Marker for new item
                    }))
                }));
                setAiConfidence('high');
            } else {
                setAiConfidence('low');
            }

        } catch (error) {
            console.error("AI Scan Failed", error);
            setAiConfidence('low');
        } finally {
            setIsAIProcessing(false);
        }
    };

    return {
        formState,
        updateField,
        isAIProcessing,
        aiConfidence,
        frequentSuppliers,
        handleSelectSupplier,
        handleScanReceipt
    };
};
