
import React from 'react';
import { Microscope, AlertTriangle, HelpCircle } from 'lucide-react';

interface DashboardHeaderProps {
    isWorstCase: boolean;
    onToggleWorstCase: () => void;
    onOpenInfo: () => void;
    onOpenDeepDive: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ isWorstCase, onToggleWorstCase, onOpenInfo, onOpenDeepDive }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[3rem] shadow-sm border-2 border-stone-100">
            <div className="pl-2 flex items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-stone-800 flex items-center gap-3 tracking-wide">
                        <span className="text-5xl animate-bounce">🧁</span>
                        Owner Dashboard
                    </h2>
                    <p className="text-stone-400 font-bold text-lg mt-1 ml-2">สรุปภาพรวมร้านแบบเข้าใจง่าย ✨</p>
                </div>
                
                <button 
                    onClick={onOpenInfo}
                    className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-200 hover:scale-110 transition-all shadow-sm"
                    title="หน้านี้คิดเลขยังไง?"
                >
                    <HelpCircle size={24} strokeWidth={2.5} />
                </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                <button 
                    onClick={onOpenDeepDive}
                    className="group flex items-center gap-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white px-6 py-3 rounded-full shadow-lg shadow-violet-200 hover:-translate-y-1 hover:shadow-xl transition-all font-bold text-base"
                >
                    <Microscope size={20} className="group-hover:rotate-12 transition-transform" />
                    วิเคราะห์เจาะลึก (Deep Dive)
                </button>

                <div className={`flex items-center gap-3 p-2 pr-5 rounded-full border-4 transition-all duration-300 ${isWorstCase ? 'bg-red-50 border-red-100' : 'bg-stone-50 border-stone-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${isWorstCase ? 'bg-red-400 text-white' : 'bg-white text-stone-300'}`}>
                       <AlertTriangle size={24} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className={`text-sm font-bold ${isWorstCase ? 'text-red-500' : 'text-stone-500'}`}>Worst Case</span>
                        <span className="text-[10px] text-stone-400 font-bold">{isWorstCase ? 'เปิด (จำลองยอดตก)' : 'ปิด (ปกติ)'}</span>
                    </div>
                    <button 
                        onClick={onToggleWorstCase}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ml-2 shadow-inner border-2 border-transparent ${isWorstCase ? 'bg-red-400' : 'bg-stone-300'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isWorstCase ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
