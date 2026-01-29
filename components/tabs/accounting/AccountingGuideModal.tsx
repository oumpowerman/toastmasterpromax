
import React, { useState } from 'react';
import { X, HelpCircle, ArrowUpRight, ArrowDownLeft, ScanLine, Split, ChevronDown, ChevronUp, PackageCheck, Zap } from 'lucide-react';

interface AccountingGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AccountingGuideModal: React.FC<AccountingGuideModalProps> = ({ isOpen, onClose }) => {
    const [openSection, setOpenSection] = useState<string | null>('overview');

    if (!isOpen) return null;

    const toggle = (id: string) => setOpenSection(openSection === id ? null : id);

    const sections = [
        {
            id: 'overview',
            title: 'หลักการลงบัญชี (Concept)',
            icon: <HelpCircle size={20} className="text-stone-500" />,
            content: (
                <div className="space-y-2 text-sm text-stone-600 leading-relaxed">
                    <p>ระบบบัญชีของ Toast Master ออกแบบมาให้ <strong>"เชื่อมต่อกับสต็อก"</strong> โดยอัตโนมัติครับ</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>รายรับ (Income):</strong> ส่วนใหญ่จะมาจากการขายหน้าร้าน (POS) แต่คุณสามารถบันทึก "รายได้อื่นๆ" เพิ่มเติมได้ที่นี่</li>
                        <li><strong>รายจ่าย (Expense):</strong> เมื่อคุณบันทึกการซื้อ "วัตถุดิบ" ระบบจะ <u>เพิ่มสต็อก</u> ให้ทันที ไม่ต้องไปคีย์ 2 รอบ</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'scan',
            title: 'AI Scan (สแกนบิล)',
            icon: <ScanLine size={20} className="text-purple-500" />,
            content: (
                <div className="space-y-3 text-sm text-stone-600">
                    <p>ฟีเจอร์เด็ดสำหรับคนขี้เกียจพิมพ์! 📸</p>
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 flex gap-3 items-center">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><ScanLine className="text-purple-500"/></div>
                        <div>
                            <p className="font-bold text-purple-700">ถ่ายรูปสลิป = จบ</p>
                            <p className="text-xs">AI จะอ่านชื่อสินค้าและราคาให้เอง คุณแค่ตรวจทานแล้วกดบันทึก</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'split',
            title: 'Split Mode (แยกหมวดหมู่)',
            icon: <Split size={20} className="text-blue-500" />,
            content: (
                <div className="space-y-2 text-sm text-stone-600">
                    <p>เจอปัญหาบิลเดียวมีทั้ง "ของสด" และ "น้ำยาล้างจาน" ใช่ไหมครับ?</p>
                    <p>ใช้ปุ่ม <span className="bg-stone-100 px-1.5 py-0.5 rounded font-bold text-stone-700">Split Mode</span> ในหน้าบันทึกรายจ่าย เพื่อระบุหมวดหมู่ให้แต่ละรายการแยกกันได้เลย</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div className="bg-orange-50 p-2 rounded border border-orange-100 text-center">หมู/ไก่ <br/><span className="font-bold text-orange-600">-▶ วัตถุดิบ</span></div>
                        <div className="bg-stone-100 p-2 rounded border border-stone-200 text-center">ทิชชู่ <br/><span className="font-bold text-stone-600">-▶ ของใช้</span></div>
                    </div>
                </div>
            )
        },
        {
            id: 'stock',
            title: 'การเชื่อมต่อสต็อก (Auto-Stock)',
            icon: <PackageCheck size={20} className="text-green-500" />,
            content: (
                <div className="space-y-2 text-sm text-stone-600">
                    <p>ทุกครั้งที่บันทึก <strong>"รายจ่าย"</strong> ประเภท:</p>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200">วัตถุดิบ</span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">บรรจุภัณฑ์</span>
                    </div>
                    <p className="mt-2">ระบบจะ <strong>"เพิ่มจำนวนของในคลัง"</strong> ให้ทันที และคำนวณต้นทุนเฉลี่ย (Weighted Average Cost) ใหม่ให้ด้วยครับ</p>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 border-4 border-white overflow-hidden font-cute">
                
                {/* Header */}
                <div className="p-6 bg-[#FFF9F2] border-b border-orange-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-500 shadow-sm border border-orange-200">
                            <Zap size={24} fill="currentColor"/>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-stone-800">คู่มือบัญชี Pro 📒</h3>
                            <p className="text-stone-500 text-xs font-bold">เทคนิคการใช้ระบบให้คุ้มค่า</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white hover:bg-stone-100 text-stone-400 flex items-center justify-center transition-colors shadow-sm">
                        <X size={20}/>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 custom-scrollbar space-y-4">
                    {sections.map(section => (
                        <div key={section.id} className="bg-white border-2 border-stone-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-orange-200 shadow-sm">
                            <button 
                                onClick={() => toggle(section.id)}
                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-stone-50 rounded-xl">{section.icon}</div>
                                    <span className="font-bold text-stone-700 text-sm">{section.title}</span>
                                </div>
                                {openSection === section.id ? <ChevronUp size={18} className="text-orange-400"/> : <ChevronDown size={18} className="text-stone-300"/>}
                            </button>
                            
                            {openSection === section.id && (
                                <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 fade-in">
                                    <div className="pl-[3.25rem]"> {/* Indent to align with text */}
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
                        เข้าใจแล้ว ลุยเลย! 🚀
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountingGuideModal;
