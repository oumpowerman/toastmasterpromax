
import React, { useState } from 'react';
import { AppState } from '../../types';
import { calculateTotalFixedCostPerDay } from '../../utils/calculations';

// Imported Modular Components
import DashboardHeader from './dashboard/DashboardHeader';
import KPIGrid from './dashboard/KPIGrid';
import TargetCalculator from './dashboard/TargetCalculator';
import StrategySection from './dashboard/StrategySection';
import FinancialCharts from './dashboard/FinancialCharts';

// Modals
import BusinessInsightsModal from '../BusinessInsightsModal';
import MetricDetailModal from '../modals/MetricDetailModal'; 
import SimulationInfoModal from '../modals/SimulationInfoModal'; 

interface DashboardProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  results: any;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setState, results }) => {
  const [showInsights, setShowInsights] = useState(false);
  const [showSimInfo, setShowSimInfo] = useState(false); 
  
  // State for KPI Card Modal
  const [activeMetric, setActiveMetric] = useState<'profit' | 'payback' | 'hourly' | 'safety' | null>(null);

  // --- Logic Section (Do Not Touch) ---
  const fixedCost = calculateTotalFixedCostPerDay(state);
  const avgContribution = results.contribution; 
  // ------------------------------------

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cute pb-20">
            
            {/* 1. Header Section */}
            <DashboardHeader 
                isWorstCase={state.isWorstCase}
                onToggleWorstCase={() => setState(s => ({...s, isWorstCase: !s.isWorstCase}))}
                onOpenInfo={() => setShowSimInfo(true)}
                onOpenDeepDive={() => setShowInsights(true)}
            />

            {/* 2. KPI Cards Grid */}
            <KPIGrid 
                results={results} 
                onCardClick={setActiveMetric} 
            />

            {/* 3. Target Calculator */}
            <TargetCalculator 
                fixedCost={fixedCost}
                avgContribution={avgContribution}
                openHours={state.traffic.openHours}
            />

            {/* 4. Strategy Area */}
            <StrategySection 
                results={results} 
                traffic={state.traffic} 
                fixedCosts={state.fixedCosts} 
            />

            {/* 5. Charts Section */}
            <FinancialCharts 
                results={results} 
                fixedCostDaily={fixedCost} 
            />

            {/* --- Modals --- */}
            
            {/* General Insights Modal */}
            <BusinessInsightsModal 
                isOpen={showInsights} 
                onClose={() => setShowInsights(false)} 
                state={state} 
                results={results} 
            />

            {/* Simulation Info Modal */}
            <SimulationInfoModal
                isOpen={showSimInfo}
                onClose={() => setShowSimInfo(false)}
            />

            {/* Detailed Metric Modal */}
            <MetricDetailModal 
                isOpen={!!activeMetric}
                onClose={() => setActiveMetric(null)}
                metric={activeMetric}
                state={state}
                results={results}
            />
    </div>
  );
};

export default Dashboard;
