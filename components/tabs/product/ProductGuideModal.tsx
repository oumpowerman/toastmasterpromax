
import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown, ChevronUp, Layers, Link, AlertTriangle, Tag, Zap, Utensils } from 'lucide-react';

interface ProductGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProductGuideModal: React.FC<ProductGuideModalProps> = ({ isOpen, onClose }) => {
    const [openSection, setOpenSection] = useState<string | null>('structure');

    if (!isOpen) return null;

    const toggle = (id: string) => setOpenSection(openSection === id ? null : id);

    const sections = [
        {
            id: 'structure',
            title: 'โครงสร้างต้นทุน (Cost Structure)',
            icon: <Layers size={20} className="text-blue-500" />,
            content: (
                <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
                    <p>ใน Toast Master เราคำนวณต้นทุนแบบ <strong>"Real Cost"</strong> ครับ ซึ่งประกอบด้วย:</p>
                    <div className="bg-stone-100 p-3 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-stone-500">1. Base Cost</span>
                            <span className="text-xs">ค่าวัตถุดิบตามสูตรเป๊ะๆ</span>
                        </div>
                        <div className="flex justify-between items-center text-red-500 font-bold">
                            <span className="text-xs">+ 2. Hidden Cost</span>
                            <span className="text-xs">ค่าแฝง (ของเสีย/GP)</span>
                        </div>
                        <div className="border-t border-stone-300 pt-1 flex justify-between items-center text-stone-800 font-black">
                            <span>= Real Cost</span>
                            <span>ต้นทุนจริงที่ใช้คำนวณกำไร</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'link',
            title: 'การผูกสูตร (Recipe Linking)',
            icon: <Link size={20} className="text-orange-500" />,
            content: (
                <div className="space-y-2 text-sm text-stone-600">
                    <p>ฟีเจอร์สำคัญ! เพื่อให้ระบบ <strong>"ตัดสต็อกอัตโนมัติ"</strong> 📦</p>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                        <li>ตอนเพิ่มวัตถุดิบ ให้กดปุ่ม <span className="bg-stone-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">เลือกจากคลัง</span></li>
                        <li>ระบบจะดึง <strong>"ราคาต้นทุนล่าสุด"</strong> มาคำนวณให้เสมอ</li>
                        <li>เมื่อขายเมนูนี้ ระบบจะไปลดจำนวนวัตถุดิบในคลังทันที</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'hidden',
            title: 'ค่าแฝงคืออะไร? (Hidden Costs)',
            icon: <AlertTriangle size={20} className="text-red-500" />,
            content: (
                <div className="space-y-3 text-sm text-stone-600">
                    <p>เงินที่หายไปโดยไม่รู้ตัวครับ ประกอบด้วย:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-orange-50 p-2 rounded border border-orange-100">
                            <span className="font-bold text-orange-600 block">Waste (ของเสีย)</span>
                            เช่น ตัดขอบขนมปัง, ซอสติดก้นขวด, ปิ้งไหม้
                        </div>
                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                            <span className="font-bold text-blue-600 block">GP / Fee</span>
                            ค่าธรรมเนียม App Delivery หรือบัตรเครดิต
                        </div>
                    </div>
                    <p className="text-[10px] text-stone-400">*ตั้งค่า % เหล่านี้ได้ที่กล่องด้านขวาล่างครับ</p>
                </div>
            )
        },
        {
            id: 'grade',
            title: 'เกรดเมนู (Menu Grading)',
            icon: <Tag size={20} className="text-purple-500" />,
            content: (
                <div className="space-y-2 text-sm text-stone-600">
                    <p>ระบบช่วยประเมินความคุ้มค่าของเมนู (Margin):</p>
                    <div className="space-y-1 text-xs font-bold">
                        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded flex items-center justify-center bg-purple-100 text-purple-600">S</span> กำไร {'>'} 50% (ดีเยี่ยม!)</div>
                        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded flex items-center justify-center bg-green-100 text-green-600">A</span> กำไร {'>'} 40% (น่าพอใจ)</div>
                        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded flex items-center justify-center bg-orange-100 text-orange-600">C</span> กำไร {'<'} 25% (ต้องระวัง)</div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 border-4 border-white overflow-hidden font-cute">
                
                {/* Header */}
                <div className="p-6 bg-[#F0FDFA] border-b border-green-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2.5 rounded-2xl text-green-600 shadow-sm border border-green-200">
                            <Utensils size={24} fill="currentColor" className="text-green-500/20 stroke-green-600"/>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-stone-800">คู่มือจัดการเมนู 👨‍🍳</h3>
                            <p className="text-stone-500 text-xs font-bold">เทคนิควิศวกรรมเมนู (Menu Engineering)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white hover:bg-stone-100 text-stone-400 flex items-center justify-center transition-colors shadow-sm">
                        <X size={20}/>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 custom-scrollbar space-y-4">
                    {sections.map(section => (
                        <div key={section.id} className="bg-white border-2 border-stone-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-green-200 shadow-sm">
                            <button 
                                onClick={() => toggle(section.id)}
                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-stone-50 rounded-xl">{section.icon}</div>
                                    <span className="font-bold text-stone-700 text-sm">{section.title}</span>
                                </div>
                                {openSection === section.id ? <ChevronUp size={18} className="text-green-500"/> : <ChevronDown size={18} className="text-stone-300"/>}
                            </button>
                            
                            {openSection === section.id && (
                                <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 fade-in">
                                    <div className="pl-[3.25rem]">
                                        {section.content}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-stone-100 text-center">
                    <button onClick={onClose} className="w-full py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 transition-colors">
                        เข้าใจแล้ว เริ่มปรุงสูตรเลย! 🔥
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductGuideModal;
