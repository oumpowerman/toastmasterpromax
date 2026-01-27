
import { AppState, Equipment, LedgerItem, InventoryItem } from '../types';

// Updated: Now calculates from unified inventory items tagged as 'asset'
export const calculateEquipmentCostPerDay = (equipment: Equipment[], inventory: InventoryItem[] = []): number => {
  // 1. Calculate from Legacy Equipment array (if any)
  const legacyCost = equipment.reduce((sum, item) => {
    const daily = (item.purchasePrice - item.resalePrice) / item.lifespanDays;
    return sum + (isNaN(daily) ? 0 : daily);
  }, 0);

  // 2. Calculate from New Inventory Assets
  const inventoryAssetCost = inventory
    .filter(i => i.type === 'asset')
    .reduce((sum, item) => {
        // Use pre-calculated dailyDepreciation if available, or calculate on fly
        if (item.dailyDepreciation) return sum + item.dailyDepreciation;
        
        const cost = item.costPerUnit || 0; // Purchase Price
        const salvage = item.salvagePrice || 0;
        const life = item.lifespanDays || 365;
        const qty = item.quantity || 1;
        
        const daily = ((cost - salvage) / life) * qty;
        return sum + (isNaN(daily) ? 0 : daily);
    }, 0);

  return legacyCost + inventoryAssetCost;
};

export const calculateTotalInvestment = (equipment: Equipment[], inventory: InventoryItem[] = []): number => {
  const legacyInv = equipment.reduce((sum, item) => sum + item.purchasePrice, 0);
  const assetInv = inventory
    .filter(i => i.type === 'asset')
    .reduce((sum, i) => sum + ((i.costPerUnit || 0) * (i.quantity || 1)), 0);
    
  return legacyInv + assetInv;
};

export const calculateTotalFixedCostPerDay = (state: AppState): number => {
  // Pass both equipment list and inventory to cover both data sources
  const equipDaily = calculateEquipmentCostPerDay(state.equipment, state.inventory);
  
  return state.fixedCosts.boothRent + 
         state.fixedCosts.transport + 
         state.fixedCosts.electricityBase + 
         state.fixedCosts.laborOwner + 
         equipDaily;
};

// Calculate AVERAGE base cost across all menus
export const calculateBaseCostPerUnit = (state: AppState): number => {
  if (state.menuItems.length === 0) return 0;
  
  const totalBaseCost = state.menuItems.reduce((sum, menu) => {
    const menuCost = menu.ingredients.reduce((iSum, ingredient) => iSum + ingredient.cost, 0);
    return sum + menuCost;
  }, 0);

  return totalBaseCost / state.menuItems.length;
};

export const calculateRealCostPerUnit = (state: AppState): number => {
  const base = calculateBaseCostPerUnit(state);
  const p = state.hiddenPercentages;
  const totalHiddenPercent = (p.waste + p.promoLoss + p.paymentFee) / 100;
  return base + (base * totalHiddenPercent);
};

// Calculate AVERAGE selling price across all menus
export const calculateAvgPricePerUnit = (state: AppState): number => {
  if (state.menuItems.length === 0) return 0;

  const avgBasePrice = state.menuItems.reduce((sum, menu) => sum + menu.sellingPrice, 0) / state.menuItems.length;
  
  const { promoType, bundleQty, bundlePrice } = state.pricing;
  
  if (promoType === 'bundle' && bundleQty > 0) {
    // We assume a mix of 50/50 for calculation purposes unless specified
    const bundleAvg = bundlePrice / bundleQty;
    return (avgBasePrice + bundleAvg) / 2;
  }
  return avgBasePrice;
};

export const calculateUnitsPerDay = (state: AppState): number => {
  let { openHours, customersPerHour, conversionRate, avgUnitPerBill } = state.traffic;
  
  if (state.isWorstCase) {
    customersPerHour *= 0.7;
    conversionRate *= 0.8;
  }

  return openHours * customersPerHour * (conversionRate / 100) * avgUnitPerBill;
};

export const calculateFinancials = (state: AppState) => {
  const realCost = calculateRealCostPerUnit(state);
  const unitsSold = calculateUnitsPerDay(state);
  const avgPrice = calculateAvgPricePerUnit(state);
  const fixedCost = calculateTotalFixedCostPerDay(state);
  const totalInvestment = calculateTotalInvestment(state.equipment, state.inventory);

  const totalVariableCost = realCost * unitsSold;
  const totalCost = fixedCost + totalVariableCost;
  const revenue = avgPrice * unitsSold;
  const profit = revenue - totalCost;
  const contribution = avgPrice - realCost;
  const breakEvenUnits = contribution > 0 ? fixedCost / contribution : Infinity;
  const minPrice = realCost + (unitsSold > 0 ? fixedCost / unitsSold : 0);
  
  // Payback Period (Days) = Total Investment / Daily Profit
  const paybackDays = profit > 0 ? totalInvestment / profit : Infinity;

  return {
    revenue,
    totalCost,
    profit,
    profitPerHour: profit / state.traffic.openHours,
    breakEvenUnits,
    unitsSold,
    contribution,
    minPrice,
    realCost,
    totalInvestment,
    paybackDays
  };
};

// --- NEW: Ledger / Accounting Logic Refactored ---
export const calculateAccountingStats = (ledger: LedgerItem[], dateRange: { start: string, end: string }) => {
    const filteredLedger = ledger.filter(l => l.date >= dateRange.start && l.date <= dateRange.end);
    
    // Group by Date for display
    const groupedLedger: Record<string, LedgerItem[]> = {};
    filteredLedger.forEach(item => {
        if (!groupedLedger[item.date]) groupedLedger[item.date] = [];
        groupedLedger[item.date].push(item);
    });
    const sortedGroupedLedger = Object.entries(groupedLedger).sort((a, b) => b[0].localeCompare(a[0]));

    // Aggregates
    const income = filteredLedger.filter(l => l.type === 'income').reduce((sum, l) => sum + l.amount, 0);
    const expense = filteredLedger.filter(l => l.type === 'expense').reduce((sum, l) => sum + l.amount, 0);
    const profit = income - expense;
    const netMargin = income > 0 ? (profit / income) * 100 : 0;
    
    // Averages
    const activeDays = new Set(filteredLedger.filter(l => l.type === 'income').map(l => l.date)).size;
    const avgDailyIncome = activeDays > 0 ? income / activeDays : 0;

    // Top Expense Category
    const expenseByCategory: Record<string, number> = {};
    filteredLedger.filter(l => l.type === 'expense').forEach(l => {
        expenseByCategory[l.category] = (expenseByCategory[l.category] || 0) + l.amount;
    });
    const topExpense = Object.entries(expenseByCategory).sort((a,b) => b[1] - a[1])[0];

    return {
        filteredLedger,
        sortedGroupedLedger,
        income,
        expense,
        profit,
        netMargin,
        avgDailyIncome,
        topExpense
    };
};
