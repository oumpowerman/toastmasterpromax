import React, { useState } from 'react';
import { X, Calculator, ArrowRight, Users, ShoppingBag, Store, Coins, HelpCircle, ChevronDown, ChevronUp, Map, Calendar, Minus } from 'lucide-react';

interface SimulationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimulationInfoModal: React.FC<SimulationInfoModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'revenue' | 'cost' | 'profit' | null>(null);

  if (!isOpen) return null;

  const toggleSection = (section: 'revenue' | 'cost' | 'profit') => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-cute">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col border-8 border-white overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-orange-50 p-6 border-b border-orange-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-sm rotate-3">
                    <HelpCircle size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-stone-800">คู่มือ: หน้าจอนี้คิดเลขยังไง? 🤔</h3>
                    <p className="text-stone-500 font-bold text-sm">Dashboard Simulator Guide</p>
                </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white hover:bg-stone-100 text-stone-400 flex items-center justify-center transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-stone-50/50">
            
            {/* Concept Card */}
            <div className="bg-white p-6 rounded-[2rem] border-2 border-stone-100 shadow-sm mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100%] -z-0"></div>
                <h4 className="text-lg font-black text-stone-700 mb-3 relative z-10 flex items-center gap-2">
                    <Map className="text-blue-500"/> นี่คือ "แผนที่" ไม่ใช่ "พื้นที่จริง"
                </h4>
                <p className="text-stone-600 leading-relaxed relative z-10">
                    หน้า Dashboard นี้คือ <span className="font-bold text-orange-500 bg-orange-50 px-1 rounded">ระบบจำลอง (Simulation)</span> ครับ <br/>
                    ตัวเลขทั้งหมดเกิดจากการ <strong>"สมมติ"</strong> ว่าถ้าลูกค้ามาตามเป้า เราจะได้กำไรเท่าไหร่? 
                    (ไม่ได้ดึงมาจากยอดขายจริงในหน้า POS/บัญชี นะครับ)
                </p>
                <div className="mt-4 flex gap-4 text-xs font-bold">
                    <div className="flex-1 bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-500">
                        ❌ ไม่แสดงยอดขายจริงวันนี้
                    </div>
                    <div className="flex-1 bg-green-50 p-3 rounded-xl border border-green-200 text-green-600">
                        ✅ ใช้สำหรับวางแผน & พยากรณ์อนาคต
                    </div>
                </div>
            </div>

            {/* Interactive Formula */}
            <div className="mb-4">
                <p className="text-center text-stone-400 font-bold text-sm uppercase mb-4 tracking-widest">--- แตะที่กล่องเพื่อดูที่มา (Drill Down) ---</p>
                
                <div className="flex flex-col md:flex-row items-stretch gap-2 justify-center">
                    
                    {/* 1. REVENUE BLOCK */}
                    <button 
                        onClick={() => toggleSection('revenue')}
                        className={`flex-1 p-4 rounded-2xl border-b-4 text-center transition-all relative group ${activeSection === 'revenue' ? 'bg-green-100 border-green-400 translate-y-1' : 'bg-white border-green-200 hover:-translate-y-1 hover:shadow-lg'}`}
                    >
                        <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white mx-auto mb-2 shadow-sm">
                            <Users size={20} />
                        </div>
                        <p className="text-green-600 font-black text-lg">รายรับ (Revenue)</p>
                        {activeSection === 'revenue' && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-100 rotate-45 border-b-4 border-r-4 border-green-100"></div>}
                    </button>

                    <div className="flex items-center justify-center text-stone-300 font-black text-2xl py-2 md:py-0"><Minus strokeWidth={4}/></div>

                    {/* 2. COST BLOCK */}
                    <button 
                        onClick={() => toggleSection('cost')}
                        className={`flex-1 p-4 rounded-2xl border-b-4 text-center transition-all relative group ${activeSection === 'cost' ? 'bg-red-100 border-red-400 translate-y-1' : 'bg-white border-red-200 hover:-translate-y-1 hover:shadow-lg'}`}
                    >
                        <div className="bg-red-500 w-10 h-10 rounded-full flex items-center justify-center text-white mx-auto mb-2 shadow-sm">
                            <ShoppingBag size={20} />
                        </div>
                        <p className="text-red-500 font-black text-lg">ต้นทุน (Total Cost)</p>
                        {activeSection === 'cost' && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-100 rotate-45 border-b-4 border-r-4 border-red-100"></div>}
                    </button>

                    <div className="flex items-center justify-center text-stone-300 font-black text-2xl py-2 md:py-0"><ArrowRight strokeWidth={4}/></div>

                    {/* 3. PROFIT BLOCK */}
                    <button 
                        onClick={() => toggleSection('profit')}
                        className={`flex-1 p-4 rounded-2xl border-b-4 text-center transition-all relative group ${activeSection === 'profit' ? 'bg-orange-100 border-orange-400 translate-y-1' : 'bg-white border-orange-200 hover:-translate-y-1 hover:shadow-lg'}`}
                    >
                        <div className="bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center text-white mx-auto mb-2 shadow-sm">
                            <Coins size={20} />
                        </div>
                        <p className="text-orange-500 font-black text-lg">กำไร (Profit)</p>
                        {activeSection === 'profit' && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-100 rotate-45 border-b-4 border-r-4 border-orange-100"></div>}
                    </button>
                </div>
            </div>

            {/* Drill Down Details Area */}
            {activeSection && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    
                    {/* REVENUE DETAIL */}
                    {activeSection === 'revenue' && (
                        <div className="bg-green-50 p-6 rounded-[2rem] border-2 border-green-200 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 bg-green-50 rotate-45 border-l-2 border-t-2 border-green-200"></div>
                            <h5 className="font-bold text-green-800 text-lg mb-4 flex items-center gap-2">
                                <Calculator size={20}/> สูตรคำนวณรายรับ (จำลอง)
                            </h5>
                            <div className="bg-white p-4 rounded-2xl border border-green-100 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">1</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-stone-700">จำนวนลูกค้า (Traffic)</p>
                                        <p className="text-xs text-stone-400">เอามาจากหน้า "จำลองกำไร" (คนเดินผ่าน x %Conversion)</p>
                                    </div>
                                </div>
                                <div className="flex justify-center text-stone-300"><X size={16}/></div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">2</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-stone-700">ราคาขายเฉลี่ย (Avg Price)</p>
                                        <p className="text-xs text-stone-400">เอามาจากราคาเมนูที่คุณตั้งในหน้า "Pricing"</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-green-600 text-xs font-bold mt-3 text-center">*ถ้าตัวเลขไม่ตรงใจ ให้ไปปรับที่หน้า Traffic ครับ</p>
                        </div>
                    )}

                    {/* COST DETAIL */}
                    {activeSection === 'cost' && (
                        <div className="bg-red-50 p-6 rounded-[2rem] border-2 border-red-200 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 bg-red-50 rotate-45 border-l-2 border-t-2 border-red-200"></div>
                            <h5 className="font-bold text-red-800 text-lg mb-4 flex items-center gap-2">
                                <Calculator size={20}/> ที่มาของต้นทุน (รวม 2 ส่วน)
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-red-100">
                                    <p className="text-red-500 font-bold mb-2 flex items-center gap-1"><Store size={16}/> ต้นทุนคงที่ (Fixed)</p>
                                    <ul className="text-xs text-stone-500 list-disc list-inside space-y-1">
                                        <li>ค่าเช่าที่ (เฉลี่ยรายวัน)</li>
                                        <li>ค่าแรงตัวเอง</li>
                                        <li>ค่าเสื่อมอุปกรณ์</li>
                                        <li>ค่าน้ำ/ไฟ เหมาจ่าย</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-red-100">
                                    <p className="text-red-500 font-bold mb-2 flex items-center gap-1"><ShoppingBag size={16}/> ต้นทุนผันแปร (Variable)</p>
                                    <ul className="text-xs text-stone-500 list-disc list-inside space-y-1">
                                        <li>ค่าวัตถุดิบ (ตามสูตร)</li>
                                        <li>ค่าแพ็คเกจจิ้ง</li>
                                        <li>ค่า Waste (ของเสีย)</li>
                                        <li>ค่า GP (ถ้ามี Delivery)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROFIT DETAIL */}
                    {activeSection === 'profit' && (
                        <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-orange-200 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 bg-orange-50 rotate-45 border-l-2 border-t-2 border-orange-200"></div>
                            <h5 className="font-bold text-orange-800 text-lg mb-4 flex items-center gap-2">
                                <Coins size={20}/> นี่คือกำไร "ประมาณการ"
                            </h5>
                            <div className="bg-white p-4 rounded-2xl border border-orange-100 text-center">
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    ตัวเลขนี้เอาไว้ตอบคำถามว่า: <br/>
                                    <span className="font-bold text-orange-500 text-lg">"ถ้าเปิดร้านวันนี้ ฉันจะรอดไหม?"</span>
                                </p>
                                <div className="mt-4 pt-4 border-t border-dashed border-stone-200">
                                    <p className="text-xs text-stone-400">
                                        💡 <strong>Tip:</strong> ถ้าอยากรู้กำไรจริงๆ ที่ขายได้วันนี้ <br/>
                                        ให้ไปดูที่เมนู <strong>"บัญชี & ยอดขาย"</strong> หรือ <strong>"รับออเดอร์ (POS)"</strong> แทนนะครับ
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default SimulationInfoModal;