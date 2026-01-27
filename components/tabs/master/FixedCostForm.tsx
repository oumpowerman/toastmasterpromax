
import React, { useState } from 'react';
import { Store, Info, X } from 'lucide-react';
import { FixedCosts } from '../../../types';
import { InputField } from '../../UI';

interface FixedCostFormProps {
  fixedCosts: FixedCosts;
  onChange: (field: string, value: number) => void;
}

const FixedCostForm: React.FC<FixedCostFormProps> = ({ fixedCosts, onChange }) => {
  const [showTransportHelp, setShowTransportHelp] = useState(false);

  return (
    <>
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-stone-100 p-8 relative">
        {fixedCosts.laborOwner === 0 && (
          <div className="absolute top-4 right-4 bg-red-100 text-red-500 text-xs font-bold px-3 py-1 rounded-full animate-bounce">
            ⚠️ อย่าลืมใส่ค่าแรงตัวเอง!
          </div>
        )}
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><Store className="text-blue-400" size={20}/> 2. ค่าใช้จ่ายคงที่ (Fixed Cost) 🏠</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <InputField label="ค่าเช่าบูธ (วัน)" value={fixedCosts.boothRent} onChange={v => onChange('boothRent', v)} prefix="฿" />
          <InputField 
             label="ค่าเดินทาง (วัน)" 
             value={fixedCosts.transport} 
             onChange={v => onChange('transport', v)} 
             prefix="฿" 
             onHelpClick={() => setShowTransportHelp(true)}
          />
          <InputField label="ค่าไฟพื้นฐาน (วัน)" value={fixedCosts.electricityBase} onChange={v => onChange('electricityBase', v)} prefix="฿" />
          <InputField label="ค่าแรงตัวเรา (วัน)" value={fixedCosts.laborOwner} onChange={v => onChange('laborOwner', v)} prefix="฿" />
        </div>
      </div>

      {showTransportHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowTransportHelp(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
             <div className="bg-blue-50 p-6 flex items-center gap-4 border-b border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                    <Info size={24} strokeWidth={2.5} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-blue-800">วิธีคิดค่าเดินทาง (Transport) 🛵</h3>
                   <p className="text-xs text-blue-600/70">รวมทุกอย่างที่ "ต้องจ่าย" เพื่อเปิดร้าน</p>
                </div>
                <button onClick={() => setShowTransportHelp(false)} className="ml-auto w-8 h-8 rounded-full bg-white/50 hover:bg-white text-blue-300 hover:text-blue-500 flex items-center justify-center transition-colors">
                  <X size={18} />
                </button>
             </div>
             <div className="p-8 space-y-6">
                 <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs shrink-0">1</div>
                    <div>
                        <p className="font-bold text-stone-700 mb-1">ค่าเดินทางไป-กลับร้าน (ทุกวัน)</p>
                        <p className="text-sm text-stone-500">ค่าน้ำมัน, ค่ารถเมล์, ค่า BTS ที่คุณต้องจ่ายเพื่อพาตัวเองไปเปิดร้าน ไม่ว่าจะขายได้หรือไม่ได้ <span className="text-green-600 font-bold">ให้นับรวมตรงนี้ครับ ✅</span></p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">2</div>
                    <div>
                        <p className="font-bold text-stone-700 mb-1">ค่าขนของ / จ้างรถ</p>
                        <p className="text-sm text-stone-500">ถ้าต้องจ้างรถขนของทุกวันก็นับรวมด้วยครับ</p>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FixedCostForm;
