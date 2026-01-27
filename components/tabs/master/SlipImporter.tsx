
import React, { useState, useEffect } from 'react';
import { ScanLine, Sparkles, Loader2, Key, Receipt, CheckCircle2, X, Plus } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAlert } from '../../AlertSystem';
import { EQUIPMENT_CATEGORIES } from '../../../constants';

interface ScannedItem {
  name: string;
  price: number;
}

interface SlipImporterProps {
  onAddEquipment: (category: string, item: { name: string, price: number }) => void;
}

const categoryColors: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-500 border-orange-100 hover:bg-orange-100',
    blue: 'bg-blue-50 text-blue-500 border-blue-100 hover:bg-blue-100',
    amber: 'bg-amber-50 text-amber-500 border-amber-100 hover:bg-amber-100',
    stone: 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100',
    purple: 'bg-purple-50 text-purple-500 border-purple-100 hover:bg-purple-100',
};

const SlipImporter: React.FC<SlipImporterProps> = ({ onAddEquipment }) => {
  const { showAlert } = useAlert();
  const [analyzingSlip, setAnalyzingSlip] = useState(false);
  const [slipItems, setSlipItems] = useState<ScannedItem[]>([]);
  const [showSlipScanner, setShowSlipScanner] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [itemToAssign, setItemToAssign] = useState<ScannedItem | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (process.env.API_KEY && process.env.API_KEY.length > 0) {
          setHasApiKey(true);
          return;
      }
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkKey();
  }, []);

  const handleConnectApiKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        setTimeout(() => setHasApiKey(true), 1000); 
    } else {
        await showAlert("บน Localhost กรุณาตั้งค่า process.env.API_KEY ในไฟล์ .env หรือ Config ของคุณเพื่อใช้งานครับ", "warning");
    }
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingSlip(true);
    setSlipItems([]); 

    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
           parts: [
               { inlineData: { mimeType: file.type, data: base64Data } },
               { text: "Extract items from this receipt. Return ONLY a JSON array of objects with keys: 'name' (string) and 'price' (number). Ignore taxes/total. If item has quantity, calculate total price or unit price as best fit. Do not include markdown formatting like ```json" }
           ]
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const jsonMatch = text.match(/\[.*\]/s);
      let items = [];
      
      if (jsonMatch) {
          items = JSON.parse(jsonMatch[0]);
      } else {
          try {
             items = JSON.parse(text);
          } catch (e) {
             console.error("Parse Error", text);
             await showAlert("AI อ่านข้อมูลไม่สำเร็จ ลองถ่ายรูปให้ชัดขึ้นนะครับ", 'error');
             return;
          }
      }
      setSlipItems(items);

    } catch (error: any) {
      console.error("Error analyzing slip:", error);
      if (error.message && (error.message.includes("Requested entity was not found") || error.message.includes("API key not valid"))) {
          setHasApiKey(false);
          await showAlert("API Key ไม่ถูกต้อง หรือหมดอายุ กรุณาตรวจสอบการตั้งค่าครับ", 'error');
      } else {
          await showAlert("เกิดข้อผิดพลาด: " + (error instanceof Error ? error.message : "Unknown error"), 'error');
      }
    } finally {
      setAnalyzingSlip(false);
    }
  };

  const handleSlipItemClick = (item: ScannedItem) => {
      setItemToAssign(item);
  };

  const confirmAssignment = (category: string) => {
      if (itemToAssign) {
          onAddEquipment(category, { name: itemToAssign.name, price: itemToAssign.price });
          setSlipItems(prev => prev.filter(i => i !== itemToAssign));
          setItemToAssign(null);
      }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-stone-800 to-stone-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-8 opacity-10">
              <ScanLine size={120} />
          </div>
          
          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                      <Sparkles className="text-yellow-300" size={24} />
                  </div>
                  <h3 className="text-xl font-bold">AI Slip Scanner (beta)</h3>
              </div>
              <p className="text-stone-300 mb-6 max-w-lg">
                  ขี้เกียจพิมพ์เองใช่มั้ย? อัปโหลดรูปใบเสร็จแม็คโคร/โลตัส แล้วให้ AI ช่วยดึงรายการของมาให้จิ้มเลือกได้เลย!
              </p>

              {!showSlipScanner ? (
                  <button 
                    onClick={() => setShowSlipScanner(true)}
                    className="bg-white text-stone-800 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-400 hover:text-white transition-all"
                  >
                      <ScanLine size={18} /> เปิดเครื่องสแกน
                  </button>
              ) : (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between gap-4 mb-4">
                          {!hasApiKey ? (
                              <div className="flex flex-col md:flex-row items-center gap-4 w-full bg-stone-900/80 p-5 rounded-xl border-2 border-orange-400/50 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                                  <div className="p-3 bg-orange-500 rounded-full text-white animate-pulse shrink-0">
                                      <Key size={24} />
                                  </div>
                                  <div className="flex-1 text-center md:text-left">
                                      <p className="font-bold text-white text-base">⚠️ ต้องเชื่อมต่อ API Key ก่อนใช้งาน</p>
                                      <p className="text-xs text-stone-300 mt-1">
                                         หากใช้ Localhost กรุณาตั้งค่า process.env.API_KEY หรือกดปุ่มด้านขวา (สำหรับ Google Cloud Environment)
                                      </p>
                                  </div>
                                  <button 
                                    onClick={handleConnectApiKey}
                                    className="px-6 py-3 bg-white text-orange-600 rounded-xl font-black text-sm hover:bg-orange-50 hover:scale-105 transition-all shadow-lg whitespace-nowrap"
                                  >
                                    เลือก API Key (ฟรี)
                                  </button>
                              </div>
                          ) : (
                              <div className="flex items-center gap-4 w-full">
                                <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:-translate-y-0.5">
                                    {analyzingSlip ? <Loader2 className="animate-spin" size={20}/> : <Receipt size={20}/>}
                                    {analyzingSlip ? 'AI กำลังอ่านบิล...' : 'เลือกรูปใบเสร็จ'}
                                    <input type="file" accept="image/*" onChange={handleSlipUpload} className="hidden" disabled={analyzingSlip} />
                                </label>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white flex items-center gap-1">
                                        <CheckCircle2 size={14} className="text-green-400"/> API Key พร้อมใช้งาน
                                    </span>
                                    <span className="text-xs text-stone-400">
                                        {slipItems.length > 0 ? `เจอ ${slipItems.length} รายการ (จิ้มเลือกด้านล่าง)` : 'อัปโหลดรูปเพื่อเริ่มสแกน'}
                                    </span>
                                </div>
                              </div>
                          )}
                          <button onClick={() => setShowSlipScanner(false)} className="ml-auto text-stone-400 hover:text-white self-start bg-black/20 p-2 rounded-full hover:bg-black/40"><X size={20}/></button>
                      </div>

                      {/* Detected Items List */}
                      {slipItems.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {slipItems.map((item, idx) => (
                                  <button 
                                    key={idx}
                                    onClick={() => handleSlipItemClick(item)}
                                    className="bg-white text-stone-800 p-3 rounded-xl text-left hover:bg-orange-100 hover:scale-105 transition-all group relative border-2 border-transparent hover:border-orange-300 shadow-sm"
                                  >
                                      <div className="flex justify-between items-start">
                                          <span className="font-bold text-sm line-clamp-1">{item.name}</span>
                                          <Plus size={14} className="text-orange-400 opacity-0 group-hover:opacity-100" />
                                      </div>
                                      <span className="text-xs text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                                          ฿{item.price}
                                      </span>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>

      {/* Category Selection Modal for Scanned Items */}
      {itemToAssign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setItemToAssign(null)}></div>
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 p-6 animate-in zoom-in-95">
                <div className="text-center mb-6">
                    <p className="text-sm text-stone-400 font-bold uppercase mb-2">Assign to Category</p>
                    <h3 className="text-xl font-bold text-stone-800 font-cute">"{itemToAssign.name}"</h3>
                    <p className="text-orange-500 font-bold text-lg">฿{itemToAssign.price}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {EQUIPMENT_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => confirmAssignment(cat.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all hover:-translate-y-0.5 ${categoryColors[cat.color]}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {React.createElement(cat.icon, { size: 16 })}
                                <span className="font-bold text-xs">{cat.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setItemToAssign(null)}
                    className="w-full py-3 text-stone-400 font-bold text-sm hover:bg-stone-50 rounded-xl"
                >
                    ยกเลิก
                </button>
            </div>
        </div>
      )}
    </>
  );
};

export default SlipImporter;
