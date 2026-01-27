
import React from 'react';
import { AppState, Equipment } from '../../types';
import { MentorTip } from '../UI';
import SlipImporter from './master/SlipImporter';
// import AssetTable from './master/AssetTable'; // Removed
import FixedCostForm from './master/FixedCostForm';
import { ArrowRight, Box } from 'lucide-react';

interface MasterSetupProps {
  state: AppState;
  updateNestedState: (category: keyof AppState, field: string, value: any) => void;
  addEquipment: (category: string, initialData?: { name: string, price: number }) => void;
  updateEquipment: (id: string, field: keyof Equipment, value: any) => void;
  removeEquipment: (id: string) => void;
  results: any;
}

const MasterSetup: React.FC<MasterSetupProps> = ({ 
  state, 
  updateNestedState, 
  addEquipment, 
  // updateEquipment, 
  // removeEquipment
}) => {
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-bold text-stone-800 font-cute">ตั้งค่าร้าน (Master Setup) 🛠️</h2>
      
      <MentorTip 
        tips={[
            {
                title: "ระบบใหม่! จัดการสินทรัพย์ใน Inventory 🏢",
                desc: "เราได้ย้ายการจัดการ 'อุปกรณ์และสินทรัพย์' ไปรวมไว้ที่หน้า 'คลังสินค้า (Inventory)' แล้วครับ เพื่อให้จัดการง่ายในที่เดียวและคำนวณค่าเสื่อมได้ละเอียดขึ้น!"
            },
            {
                title: "ค่าเสื่อมราคาคือต้นทุนจริง! (Depreciation) 🏚️",
                desc: "ระบบจะยังคงคำนวณค่าเสื่อมจากรายการสินทรัพย์ที่คุณลงไว้ในคลังสินค้าอัตโนมัติ เพื่อนำไปหักเป็นต้นทุนรายวันครับ"
            }
        ]}
      />

      <SlipImporter 
        onAddEquipment={addEquipment} 
      />

      {/* Redirect Card */}
      <div className="bg-purple-50 border-2 border-purple-100 rounded-[2rem] p-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-purple-500 shadow-sm border border-purple-200">
                  <Box size={32}/>
              </div>
              <div>
                  <h3 className="text-xl font-bold text-purple-800">จัดการอุปกรณ์ & สินทรัพย์</h3>
                  <p className="text-stone-500 text-sm">โต๊ะ, ตู้, เตาปิ้ง, และอุปกรณ์ถาวรอื่นๆ</p>
              </div>
          </div>
          <div className="text-right">
              <p className="text-xs font-bold text-purple-400 uppercase mb-2">ย้ายไปรวมที่</p>
              <div className="flex items-center gap-2 text-lg font-black text-purple-700 bg-white px-4 py-2 rounded-xl border border-purple-200 shadow-sm">
                  เมนูคลังสินค้า (Inventory) <ArrowRight size={20}/>
              </div>
          </div>
      </div>

      <FixedCostForm 
        fixedCosts={state.fixedCosts}
        onChange={(field, value) => updateNestedState('fixedCosts', field, value)}
      />
    </div>
  );
};

export default MasterSetup;
