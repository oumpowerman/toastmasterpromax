
import { AppState } from '../../../types';
import { calculateEquipmentCostPerDay } from '../../../utils/calculations';

export const useDailyCostEngine = (state: AppState) => {
  
  // Future: This function can accept a 'date' parameter to calculate depreciation based on purchase date
  const calculateDailyCosts = (targetDate: string = new Date().toISOString().split('T')[0]) => {
      const costs = [];

      // 1. Rent
      if (state.fixedCosts.boothRent > 0) {
          costs.push({
              title: 'ค่าเช่าที่',
              amount: state.fixedCosts.boothRent,
              category: 'rent'
          });
      }

      // 2. Labor
      if (state.fixedCosts.laborOwner > 0) {
          costs.push({
              title: 'ค่าแรงตัวเอง',
              amount: state.fixedCosts.laborOwner,
              category: 'labor'
          });
      }

      // 3. Utilities (Base)
      if (state.fixedCosts.electricityBase > 0) {
          costs.push({
              title: 'ค่าไฟ/น้ำ (เหมา)',
              amount: state.fixedCosts.electricityBase,
              category: 'utilities'
          });
      }

      // 4. Depreciation (Equipment)
      // Fixed: Pass both legacy equipment AND new inventory to catch all assets
      const dailyDepreciation = calculateEquipmentCostPerDay(state.equipment, state.inventory);
      
      if (dailyDepreciation > 0) {
          costs.push({
              title: 'ค่าเสื่อมอุปกรณ์ (รายวัน)',
              amount: Number(dailyDepreciation.toFixed(2)),
              category: 'equipment',
              note: 'Auto-calculated from Assets'
          });
      }

      const totalAmount = costs.reduce((sum, item) => sum + item.amount, 0);

      return {
          costs,
          totalAmount
      };
  };

  return { calculateDailyCosts };
};
