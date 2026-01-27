
import React, { useState } from 'react';
import { AppState } from '../../types';
import { calculateTotalFixedCostPerDay } from '../../utils/calculations';
import { FlaskConical, Save, RotateCcw, CheckCircle2 } from 'lucide-react';

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
import { useAlert } from '../AlertSystem';

interface SimDashboardProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  results: any;
  onReset: () => void; // New
  onApply: () => void; // New
}

const SimDashboard: React.FC<SimDashboardProps> = ({ state, setState, results, onReset, onApply }) => {
  const { showConfirm, showAlert } = useAlert();
  const [showInsights, setShowInsights] = useState(false);
  const [showSimInfo, setShowSimInfo] = useState(false); 
  
  // State for KPI Card Modal
  const [activeMetric, setActiveMetric] = useState<'profit' | 'payback' | 'hourly' | 'safety' | null>(null);

  // --- Logic Section ---
  const fixedCost = calculateTotalFixedCostPerDay(state);
  const avgContribution = results.contribution; 
  // --------------------

  const handleApply = async () => {
      if (await showConfirm("ยืนยันนำข้อมูลจำลองไปใช้จริง? (ราคาขายและต้นทุนในหน้าร้านจะเปลี่ยนตามนี้)")) {
          onApply();
          await showAlert("บันทึกข้อมูลลงระบบจริงเรียบร้อย!", "success");
      }
  };

  const handleReset = async () => {
      if (await showConfirm("รีเซ็ตข้อมูลจำลองทั้งหมดกลับเป็นค่าปัจจุบัน?")) {
          onReset();
          await showAlert("รีเซ็ตเรียบร้อย เริ่มจำลองใหม่ได้เลย", "success");
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cute pb-20 relative">
            
            {/* Simulation Control Bar (NEW) */}
            <div className="bg-purple-100 border-2 border-purple-200 text-purple-800 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm animate-pulse"><FlaskConical size={24} className="text-purple-600"/></div>
                    <div>
                        <p className="font-bold text-lg leading-none">Simulation Lab</p>
                        <p className="text-xs opacity-70 mt-1">คุณกำลังปรับแต่ง "ข้อมูลจำลอง" (Draft)</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                        onClick={handleReset}
                        className="flex-1 md:flex-none py-2 px-4 rounded-xl border-2 border-purple-200 hover:bg-white hover:text-red-500 transition-all text-xs font-bold flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={14}/> รีเซ็ตค่า
                    </button>
                    <button 
                        onClick={handleApply}
                        className="flex-1 md:flex-none py-2 px-6 rounded-xl bg-purple-600 text-white shadow-lg hover:bg-purple-700 hover:-translate-y-0.5 transition-all text-sm font-bold flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={16}/> ใช้จริง (Apply)
                    </button>
                </div>
            </div>

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

export default SimDashboard;
