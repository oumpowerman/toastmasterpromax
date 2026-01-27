
import { Equipment, AppState, AssetCategory } from './types';
import { Flame, Utensils, Armchair, Box, Banknote, Smartphone, Bike } from 'lucide-react';

export const DEFAULT_EQUIPMENT_TEMPLATE: Omit<Equipment, 'id'>[] = [
    { name: 'เตาปิ้งขนมปัง (มือหนึ่ง)', category: 'cooking', purchasePrice: 2500, resalePrice: 500, lifespanDays: 365 },
    { name: 'โต๊ะพับ + ป้ายร้าน', category: 'furniture', purchasePrice: 1500, resalePrice: 200, lifespanDays: 730 },
    { name: 'อุปกรณ์ครัว (มีด/เขียง/โหล)', category: 'prep', purchasePrice: 1000, resalePrice: 0, lifespanDays: 365 }
];

export const EQUIPMENT_CATEGORIES = [
  { id: 'cooking', label: 'อุปกรณ์ทำอาหาร', icon: Flame, color: 'orange', desc: 'เตา, แก๊ส, ตะแกรง' },
  { id: 'prep', label: 'อุปกรณ์เตรียม/ภาชนะ', icon: Utensils, color: 'blue', desc: 'มีด, เขียง, โหลใส่ของ' },
  { id: 'furniture', label: 'เฟอร์นิเจอร์/ร้าน', icon: Armchair, color: 'amber', desc: 'โต๊ะ, เก้าอี้, ป้ายไฟ' },
  { id: 'other', label: 'อื่นๆ/จิปาถะ', icon: Box, color: 'stone', desc: 'เครื่องคิดเลข, ปลั๊กพ่วง' },
];

export const DEFAULT_ASSET_TAXONOMY: AssetCategory[] = [
    { 
        id: 'cat_kitchen', 
        name: 'อุปกรณ์ครัว (Kitchenware)', 
        isSystem: true, 
        types: ['มีด', 'เขียง', 'หม้อ', 'กระทะ', 'ภาชนะ', 'เครื่องปั่น'] 
    },
    { 
        id: 'cat_electrical', 
        name: 'เครื่องใช้ไฟฟ้า (Electrical)', 
        isSystem: true, 
        types: ['เตาปิ้ง', 'ตู้เย็น', 'เครื่องคิดเงิน', 'พัดลม', 'หลอดไฟ'] 
    },
    { 
        id: 'cat_furniture', 
        name: 'เฟอร์นิเจอร์ (Furniture)', 
        isSystem: true, 
        types: ['โต๊ะ', 'เก้าอี้', 'ชั้นวาง', 'เคาน์เตอร์', 'ป้ายร้าน'] 
    },
    { 
        id: 'cat_decor', 
        name: 'ตกแต่ง (Decor)', 
        isSystem: true, 
        types: ['ต้นไม้', 'กรอบรูป', 'ไฟประดับ'] 
    },
    { 
        id: 'cat_misc', 
        name: 'อื่นๆ (Miscellaneous)', 
        isSystem: true, 
        types: ['เครื่องเขียน', 'ทำความสะอาด'] 
    }
];

export const INITIAL_STATE: AppState = {
  equipment: [], 
  fixedCosts: { boothRent: 300, transport: 100, electricityBase: 50, laborOwner: 0 },
  menuItems: [],
  centralIngredients: [],
  suppliers: [], 
  ledger: [], 
  inventory: [],
  checklist: [],
  checklistPresets: [],
  orders: [], 
  hiddenPercentages: { waste: 10, promoLoss: 5, paymentFee: 0 },
  pricing: { basePrice: 29, promoType: 'none', bundleQty: 2, bundlePrice: 50 },
  traffic: { openHours: 5, customersPerHour: 60, conversionRate: 20, avgUnitPerBill: 1.2 },
  isWorstCase: false,
  assetTaxonomy: DEFAULT_ASSET_TAXONOMY,
  simulationDraft: null // Initialize as null
};

// --- ACCOUNTING CONSTANTS ---

export const ACCOUNTING_CATEGORIES = {
  income: [
    { id: 'sales', label: 'ยอดขายหน้าร้าน', color: 'text-green-600' },
    { id: 'delivery', label: 'ยอดขาย Delivery', color: 'text-emerald-600' },
    { id: 'other_income', label: 'รายรับอื่นๆ', color: 'text-teal-600' },
  ],
  expense: [
    { id: 'raw_material', label: 'ซื้อวัตถุดิบ (ของสด)', color: 'text-red-600' },
    { id: 'packaging', label: 'บรรจุภัณฑ์', color: 'text-orange-600' },
    { id: 'waste', label: 'ของเสีย/ทำตก (Waste)', color: 'text-rose-500' }, 
    { id: 'marketing', label: 'แจกฟรี/แถม (Gift)', color: 'text-pink-500' }, 
    { id: 'rent', label: 'ค่าเช่าที่', color: 'text-rose-600' },
    { id: 'utilities', label: 'ค่าน้ำ/ไฟ/แก๊ส', color: 'text-yellow-600' },
    { id: 'labor', label: 'ค่าจ้างพนักงาน', color: 'text-purple-600' },
    { id: 'equipment', label: 'ซื้ออุปกรณ์เพิ่ม', color: 'text-blue-600' },
    { id: 'general', label: 'เบ็ดเตล็ด/ทั่วไป', color: 'text-stone-500' },
  ]
};

export const PAYMENT_CHANNELS = [
    { id: 'cash', label: 'เงินสด', icon: Banknote, color: 'bg-green-100 text-green-600 border-green-200', autoTitle: 'ยอดขายเงินสด', autoCat: 'sales' },
    { id: 'transfer', label: 'โอนเงิน', icon: Smartphone, color: 'bg-blue-100 text-blue-600 border-blue-200', autoTitle: 'ยอดขายโอนเงิน', autoCat: 'sales' },
    { id: 'delivery', label: 'Delivery', icon: Bike, color: 'bg-orange-100 text-orange-600 border-orange-200', autoTitle: 'ยอดขาย Delivery', autoCat: 'delivery' },
];
