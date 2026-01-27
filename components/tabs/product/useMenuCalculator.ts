
import { useMemo } from 'react';
import { MenuItem, HiddenCostPercentages } from '../../../types';

export const useMenuCalculator = (menu: MenuItem | undefined, hiddenPercentages: HiddenCostPercentages) => {
    
    const stats = useMemo(() => {
        if (!menu) return null;

        const baseCost = menu.ingredients.reduce((sum, i) => sum + i.cost, 0);
        const multiplier = (hiddenPercentages.waste + hiddenPercentages.promoLoss + hiddenPercentages.paymentFee) / 100;
        const realCost = baseCost * (1 + multiplier);
        const profit = menu.sellingPrice - realCost;
        const margin = menu.sellingPrice > 0 ? (profit / menu.sellingPrice) * 100 : 0;
        
        let grade = 'C';
        let gradeColor = 'bg-red-100 text-red-500 border-red-200';
        // Pastel Theme Colors (Background & Text)
        let themeColor = 'from-orange-200 to-amber-200'; 
        let textColor = 'text-orange-900';

        if (margin >= 50) { 
            grade = 'S'; 
            gradeColor = 'bg-purple-100 text-purple-600 border-purple-200';
            themeColor = 'from-purple-200 to-pink-200';
            textColor = 'text-purple-900';
        }
        else if (margin >= 40) { 
            grade = 'A'; 
            gradeColor = 'bg-green-100 text-green-600 border-green-200';
            themeColor = 'from-emerald-200 to-teal-200';
            textColor = 'text-teal-900';
        }
        else if (margin >= 25) { 
            grade = 'B'; 
            gradeColor = 'bg-blue-100 text-blue-600 border-blue-200';
            themeColor = 'from-sky-200 to-blue-200';
            textColor = 'text-blue-900';
        }
        else if (margin > 0) { 
            grade = 'C'; 
            gradeColor = 'bg-orange-100 text-orange-600 border-orange-200';
            themeColor = 'from-orange-200 to-amber-200';
            textColor = 'text-orange-900';
        } else {
            // Loss
            themeColor = 'from-red-200 to-rose-200';
            textColor = 'text-red-900';
        }

        return { baseCost, realCost, profit, margin, grade, gradeColor, themeColor, textColor };
    }, [menu, hiddenPercentages]);

    const priceSuggestions = useMemo(() => {
        if (!stats) return { low: 0, mid: 0, high: 0 };
        return {
            low: stats.realCost / (1 - 0.30), // 30% Margin
            mid: stats.realCost / (1 - 0.45), // 45% Margin
            high: stats.realCost / (1 - 0.60) // 60% Margin
        };
    }, [stats]);

    return { stats, priceSuggestions };
};
