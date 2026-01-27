
import React from 'react';
import { Store, FlaskConical, ArrowRight, Zap, Calculator } from 'lucide-react';

interface ModeSelectorProps {
    onSelectMode: (mode: 'real' | 'sim') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
    return (
        <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-6 font-cute">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10 animate-in slide-in-from-top-4 duration-700">
                    <h1 className="text-4xl md:text-6xl font-black text-stone-800 mb-4 tracking-tight">Toast Master Profit Pro</h1>
                    <p className="text-stone-500 text-lg md:text-xl font-bold">เลือกโหมดการทำงานของคุณ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* REAL STORE CARD */}
                    <button 
                        onClick={() => onSelectMode('real')}
                        className="group relative bg-white rounded-[3rem] p-8 md:p-12 text-left border-4 border-white shadow-xl shadow-stone-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:rotate-6 transition-transform">
                                <Store size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-3xl font-black text-stone-800 mb-2">หน้าร้านจริง</h2>
                            <h3 className="text-xl font-bold text-green-600 mb-4">(Operation Mode)</h3>
                            <p className="text-stone-500 mb-8 leading-relaxed font-medium">
                                สำหรับใช้งานประจำวัน ขายของ รับออเดอร์ เช็คสต็อก และลงบัญชีจริง
                            </p>
                            
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-stone-600 font-bold">
                                    <div className="bg-green-100 p-1 rounded-full"><Zap size={14} className="text-green-600"/></div>
                                    ระบบ POS รับออเดอร์
                                </li>
                                <li className="flex items-center gap-3 text-stone-600 font-bold">
                                    <div className="bg-green-100 p-1 rounded-full"><Zap size={14} className="text-green-600"/></div>
                                    เช็คสต็อก & จ่ายตลาด
                                </li>
                                <li className="flex items-center gap-3 text-stone-600 font-bold">
                                    <div className="bg-green-100 p-1 rounded-full"><Zap size={14} className="text-green-600"/></div>
                                    บัญชีรายรับ-รายจ่าย
                                </li>
                            </ul>

                            <div className="w-full py-4 rounded-2xl bg-green-500 text-white font-black text-xl flex items-center justify-center gap-3 group-hover:bg-green-600 transition-colors shadow-lg shadow-green-200">
                                เข้าสู่ร้าน <ArrowRight size={24}/>
                            </div>
                        </div>
                    </button>

                    {/* SIMULATION CARD */}
                    <button 
                        onClick={() => onSelectMode('sim')}
                        className="group relative bg-white rounded-[3rem] p-8 md:p-12 text-left border-4 border-white shadow-xl shadow-stone-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:-rotate-6 transition-transform">
                                <FlaskConical size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-3xl font-black text-stone-800 mb-2">ห้องทดลอง</h2>
                            <h3 className="text-xl font-bold text-purple-600 mb-4">(Simulation Lab)</h3>
                            <p className="text-stone-500 mb-8 leading-relaxed font-medium">
                                พื้นที่สำหรับเจ้าของร้าน วางแผนต้นทุน ปรับสูตร และคำนวณกำไรโดยไม่กระทบของจริง
                            </p>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-stone-600 font-bold">
                                    <div className="bg-purple-100 p-1 rounded-full"><Calculator size={14} className="text-purple-600"/></div>
                                    คำนวณต้นทุนอาหาร (Food Cost)
                                </li>
                                <li className="flex items-center gap-3 text-stone-600 font-bold">
                                    <div className="bg-purple-100 p-1 rounded-full"><Calculator size={14} className="text-purple-600"/></div>
                                    ตั้งราคาขาย & จุดคุ้มทุน
                                </li>
                                <li className="flex items-center gap-3 text-stone-600 font-bold">
                                    <div className="bg-purple-100 p-1 rounded-full"><Calculator size={14} className="text-purple-600"/></div>
                                    จำลองยอดขาย (Scenario)
                                </li>
                            </ul>

                            <div className="w-full py-4 rounded-2xl bg-purple-500 text-white font-black text-xl flex items-center justify-center gap-3 group-hover:bg-purple-600 transition-colors shadow-lg shadow-purple-200">
                                เริ่มวางแผน <ArrowRight size={24}/>
                            </div>
                        </div>
                    </button>
                </div>
                
                <p className="text-center text-stone-400 mt-8 font-bold text-sm">
                    © 2024 Toast Master Profit Pro • ระบบบริหารจัดการร้านขนมปังปิ้ง
                </p>
            </div>
        </div>
    );
};

export default ModeSelector;
