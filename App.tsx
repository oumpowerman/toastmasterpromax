
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Zap, FlaskConical } from 'lucide-react';
import { useToastMasterApp } from './hooks/useToastMasterApp';

// Components
import Sidebar from './components/Sidebar';
import AuthScreen from './components/Auth';
import ModeSelector from './components/ModeSelector'; // NEW

// Tabs
import RealDashboard from './components/tabs/RealDashboard'; 
import SimDashboard from './components/tabs/SimDashboard'; 
import MasterSetup from './components/tabs/MasterSetup';
import ProductCost from './components/tabs/ProductCost';
import Pricing from './components/tabs/Pricing';
import Traffic from './components/tabs/Traffic';
import Accounting from './components/tabs/Accounting';
import Inventory from './components/tabs/Inventory';
import PrepChecklist from './components/tabs/PrepChecklist';
import ShoppingRoute from './components/tabs/ShoppingRoute';
import OrderTaking from './components/tabs/OrderTaking';
import MigrationModal from './components/modals/MigrationModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showHelper, setShowHelper] = useState<string | null>(null);
  const [showMigration, setShowMigration] = useState(false);
  const [appMode, setAppMode] = useState<'real' | 'sim' | null>(null); 
  
  const { 
      state, 
      setState, 
      session, 
      loading, 
      saving, 
      results, 
      actions 
  } = useToastMasterApp();

  // --- SIMULATION INITIALIZATION ---
  useEffect(() => {
      if (appMode === 'sim' && !state.simulationDraft) {
          actions.initializeSimulation();
      }
  }, [appMode, state.simulationDraft]);

  // --- STATE INJECTION & ACTION WRAPPING ---
  // If in Sim mode, inject the 'simulationDraft' as the 'state' prop for components
  const derivedState = appMode === 'sim' && state.simulationDraft ? state.simulationDraft : state;
  
  // Wrap actions to target 'sim' when in Sim mode
  const derivedActions = useMemo(() => {
      if (appMode === 'real') return actions;
      return {
          ...actions,
          updateNestedState: (c: any, f: any, v: any) => actions.updateNestedState(c, f, v, 'sim'),
          updateMenu: (id: any, f: any, v: any) => actions.updateMenu(id, f, v, 'sim'),
          addIngredientToMenu: (mId: any, data: any) => actions.addIngredientToMenu(mId, data, 'sim'),
          updateIngredientInMenu: (mId: any, iId: any, f: any, v: any) => actions.updateIngredientInMenu(mId, iId, f, v, 'sim'),
          removeIngredientFromMenu: (mId: any, iId: any) => actions.removeIngredientFromMenu(mId, iId, 'sim'),
      };
  }, [appMode, actions]);

  if (loading) return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center flex-col gap-4">
          <Loader2 className="animate-spin text-orange-400" size={48} />
          <p className="font-cute text-stone-500 animate-pulse">กำลังโหลดข้อมูลร้าน...</p>
      </div>
  );

  if (!session) return <AuthScreen />;

  // 1. Mode Selection Screen
  if (!appMode) {
      return <ModeSelector onSelectMode={(mode) => { setAppMode(mode); setActiveTab('dashboard'); }} />;
  }

  // Visual Theme Logic
  const bgTheme = appMode === 'real' 
    ? 'bg-green-50/30' 
    : 'bg-[#f5f3ff] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]'; // Grid Pattern for Sim

  // 2. Main App Layout
  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${bgTheme} text-stone-600 font-sans relative transition-colors duration-500`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        saving={saving} 
        profit={results.profit}
        onOpenMigration={() => setShowMigration(true)}
        session={session}
        userRole={state.userRole}
        activeShopId={state.activeShopId}
        appMode={appMode} 
        onChangeMode={() => setAppMode(null)} 
      />

      <main className="flex-1 flex flex-col w-full overflow-hidden">
        {/* TOP STATUS BAR (WATERMARK) */}
        <div className={`w-full py-1.5 px-4 text-[10px] font-black tracking-widest text-center uppercase shadow-sm flex items-center justify-center gap-2 ${appMode === 'real' ? 'bg-green-500 text-white' : 'bg-purple-600 text-white'}`}>
            {appMode === 'real' ? (
                <><Zap size={12} fill="currentColor"/> LIVE STORE MODE (ระบบหน้าร้านจริง)</>
            ) : (
                <><FlaskConical size={12} fill="currentColor"/> SIMULATION LAB (โหมดจำลอง - ไม่กระทบของจริง)</>
            )}
        </div>

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1800px] mx-auto w-full">
            {/* DASHBOARDS */}
            {activeTab === 'dashboard' && appMode === 'real' && (
            <RealDashboard 
                state={state} 
                onAddLedgerItem={actions.addLedgerItem}
                onUpdateInventoryItem={actions.updateSingleItem}
            />
            )}
            {activeTab === 'dashboard' && appMode === 'sim' && (
            <SimDashboard 
                state={derivedState} 
                setState={setState} 
                results={results}
                onReset={actions.initializeSimulation}
                onApply={actions.applySimulationToReal}
            />
            )}

            {/* OPERATION TABS (Real) */}
            {activeTab === 'pos' && (
            <OrderTaking 
                state={state} 
                processOrder={actions.processOrder}
                updateOrderStatus={actions.updateOrderStatus}
            />
            )}
            {activeTab === 'checklist' && (
            <PrepChecklist 
                checklist={state.checklist || []}
                presets={state.checklistPresets || []} 
                equipment={state.equipment}
                menuItems={state.menuItems}
                inventory={state.inventory} 
                updateChecklist={actions.updateChecklist}
                updatePresets={actions.updateChecklistPresets} 
            />
            )}
            {activeTab === 'accounting' && (
            <Accounting 
                ledger={state.ledger || []}
                addLedgerItem={actions.addLedgerItem}
                updateLedgerItem={actions.updateLedgerItem}
                deleteLedgerItem={actions.deleteLedgerItem}
                state={state}
                menuItems={state.menuItems}
                inventory={state.inventory}
                updateInventory={actions.updateInventory}
                addSingleItem={actions.addSingleItem} // Passed
                addSupplier={actions.addSupplier} // NEW: Pass addSupplier
            />
            )}
            {activeTab === 'shopping' && (
            <ShoppingRoute 
                state={state}
                updateNestedState={actions.updateNestedState}
                addSupplier={actions.addSupplier}
                updateSupplier={actions.updateSupplier}
                removeSupplier={actions.removeSupplier}
                updateInventory={actions.updateInventory}
                addLedgerItem={actions.addLedgerItem}
                updateCentralIngredient={actions.updateCentralIngredient}
            />
            )}

            {/* SHARED / MIXED TABS */}
            {activeTab === 'inventory' && (
            <Inventory 
                inventory={state.inventory || []}
                updateInventory={actions.updateInventory}
                updateSingleItem={actions.updateSingleItem}
                addSingleItem={actions.addSingleItem}
                addLedgerItem={actions.addLedgerItem}
                deleteInventoryItem={actions.deleteCentralIngredient}
                taxonomy={state.assetTaxonomy}
                onUpdateTaxonomy={actions.updateAssetTaxonomy}
                activeShopId={state.activeShopId || session.user.id}
                isSimMode={appMode === 'sim'} // PASS SIM MODE PROP
            />
            )}

            {/* SIMULATION TABS (Sim) */}
            {activeTab === 'master' && (
            <MasterSetup 
                state={derivedState} 
                updateNestedState={derivedActions.updateNestedState}
                addEquipment={actions.addEquipment} // Shared?
                updateEquipment={actions.updateEquipment}
                removeEquipment={actions.removeEquipment}
                results={results}
            />
            )}
            {activeTab === 'product' && (
            <ProductCost 
                state={derivedState} 
                updateNestedState={derivedActions.updateNestedState}
                showHelper={showHelper}
                setShowHelper={setShowHelper}
                realCost={results.realCost}
                addMenu={actions.addMenu} // Shared creation, but update is targetted
                updateMenu={derivedActions.updateMenu}
                deleteMenu={actions.deleteMenu}
                addIngredientToMenu={derivedActions.addIngredientToMenu}
                updateIngredientInMenu={derivedActions.updateIngredientInMenu}
                removeIngredientFromMenu={derivedActions.removeIngredientFromMenu}
                addCentralIngredient={actions.addCentralIngredient} // Shared
                updateCentralIngredient={actions.updateCentralIngredient}
                deleteCentralIngredient={actions.deleteCentralIngredient}
                isSimMode={appMode === 'sim'} // PASS SIM MODE PROP
            />
            )}
            {activeTab === 'pricing' && (
            <Pricing state={derivedState} updateNestedState={derivedActions.updateNestedState} updateMenu={derivedActions.updateMenu} />
            )}
            {activeTab === 'traffic' && (
            <Traffic 
                state={derivedState} 
                updateNestedState={derivedActions.updateNestedState} 
                setTrafficScenario={actions.setTrafficScenario}
                results={results}
            />
            )}
        </div>
      </main>

      <MigrationModal 
        isOpen={showMigration} 
        onClose={() => setShowMigration(false)} 
        state={state} 
        userId={session.user.id} 
      />
    </div>
  );
};

export default App;
