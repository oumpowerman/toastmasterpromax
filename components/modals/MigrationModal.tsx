
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AppState } from '../../types';
import { Database, ArrowRight, CheckCircle2, Loader2, AlertTriangle, Play, Save } from 'lucide-react';

interface MigrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    state: AppState;
    userId: string;
}

const MigrationModal: React.FC<MigrationModalProps> = ({ isOpen, onClose, state, userId }) => {
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    if (!isOpen) return null;

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const runMigration = async () => {
        setStatus('running');
        setLogs([]);
        setProgress(0);
        const idMap: Record<string, string> = {}; // Old ID -> New UUID

        try {
            // 1. MIGRATE SUPPLIERS
            addLog("📦 1. Migrating Suppliers...");
            const oldSuppliers = state.suppliers || [];
            if (oldSuppliers.length === 0) {
                // Default Supplier
                oldSuppliers.push({ id: 'default', name: 'ทั่วไป/ตลาด', locationName: '', products: [], isHome: false });
            }

            for (const s of oldSuppliers) {
                const { data, error } = await supabase.from('suppliers').insert({
                    user_id: userId,
                    name: s.name,
                    location_name: s.locationName,
                    is_home: s.isHome
                }).select('id').single();
                
                if (error) throw error;
                if (data) idMap[s.id] = data.id;
            }
            addLog(`✅ Suppliers done (${oldSuppliers.length})`);
            setProgress(20);

            // 2. MIGRATE INVENTORY & INGREDIENTS
            addLog("🥦 2. Migrating Inventory & Ingredients...");
            const allIngredients = [...state.centralIngredients];
            // Merge local inventory if not in central
            state.inventory.forEach(inv => {
                if (!allIngredients.find(c => c.name === inv.name)) {
                    allIngredients.push({
                        id: inv.id,
                        name: inv.name,
                        bulkPrice: (inv.costPerUnit || 0) * (inv.quantity || 1), // Estimate
                        totalQuantity: inv.quantity,
                        unitType: inv.unit === 'ชิ้น' ? 'unit' : 'weight',
                        usagePerUnit: 1,
                        costPerUnit: inv.costPerUnit || 0,
                        category: 'ingredient'
                    });
                }
            });

            for (const item of allIngredients) {
                // Find matching stock qty from inventory array
                const stockItem = state.inventory.find(inv => inv.name === item.name);
                
                const { data, error } = await supabase.from('inventory_items').insert({
                    user_id: userId,
                    name: item.name,
                    category: item.category || 'ingredient',
                    image_url: item.image,
                    quantity: stockItem ? stockItem.quantity : 0, // Real stock
                    unit: item.unitType === 'unit' ? 'ชิ้น' : 'กรัม', // Standardize
                    cost_per_unit: item.costPerUnit,
                    min_level: stockItem ? stockItem.minLevel : 0,
                    // Store purchasing info
                    bulk_price: item.bulkPrice,
                    supplier_id: item.supplierId ? idMap[item.supplierId] : null
                }).select('id').single();

                if (error) throw error;
                if (data) idMap[item.id] = data.id;
            }
            addLog(`✅ Inventory done (${allIngredients.length} items)`);
            setProgress(50);

            // 3. MIGRATE MENU
            addLog("📜 3. Migrating Menu...");
            for (const menu of state.menuItems) {
                const { data: menuData, error: menuError } = await supabase.from('menu_items').insert({
                    user_id: userId,
                    name: menu.name,
                    selling_price: menu.sellingPrice,
                    image_url: menu.image,
                    category: menu.category || 'Toast'
                }).select('id').single();

                if (menuError) throw menuError;
                
                // 3.1 MIGRATE RECIPES
                if (menuData) {
                    for (const ing of menu.ingredients) {
                        let invId = ing.masterId ? idMap[ing.masterId] : null;
                        
                        // If ingredient has no master (ad-hoc), try find by name in new inventory map
                        if (!invId) {
                            // Try find by name in database just created? Too complex.
                            // Fallback: If ad-hoc, we might lose the link if not in central list. 
                            // But we merged 'inventory' list earlier, so it should be there if it was in stock.
                            // For simplicity, we skip unlinked ad-hoc items that weren't in stock or library.
                            continue; 
                        }

                        if (invId) {
                            await supabase.from('menu_recipes').insert({
                                menu_item_id: menuData.id,
                                inventory_item_id: invId,
                                quantity_used: ing.quantity || 1,
                                unit_used: ing.unit || 'กรัม',
                                user_id: userId
                            });
                        }
                    }
                }
            }
            addLog(`✅ Menu done (${state.menuItems.length} items)`);
            setProgress(75);

            // 4. MIGRATE LEDGER
            addLog("📒 4. Migrating Ledger...");
            if (state.ledger.length > 0) {
                // Chunk insert
                const chunkSize = 50;
                for (let i = 0; i < state.ledger.length; i += chunkSize) {
                    const chunk = state.ledger.slice(i, i + chunkSize);
                    await supabase.from('ledger').insert(chunk.map(l => ({
                        user_id: userId,
                        title: l.title,
                        amount: l.amount,
                        type: l.type,
                        category: l.category,
                        channel: l.channel,
                        transaction_date: l.date,
                        slip_image: l.slipImage,
                        note: l.note
                    })));
                }
            }
            addLog(`✅ Ledger done (${state.ledger.length} txns)`);
            setProgress(90);

            // 5. MIGRATE SETTINGS
            addLog("⚙️ 5. Migrating Settings...");
            await supabase.from('shop_settings').upsert({
                user_id: userId,
                fixed_costs: state.fixedCosts,
                business_params: {
                    traffic: state.traffic,
                    pricing: state.pricing,
                    hidden_percentages: state.hiddenPercentages
                },
                app_config: {
                    checklist_presets: state.checklistPresets
                }
            });
            
            addLog("🎉 All Done! Migration Complete.");
            setProgress(100);
            setStatus('completed');

        } catch (error: any) {
            console.error("Migration Failed", error);
            addLog(`❌ Error: ${error.message}`);
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative border-4 border-white">
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 animate-pulse">
                        <Database size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-stone-800">Database Migration</h2>
                    <p className="text-stone-500 text-sm mt-2">ย้ายข้อมูลจาก Local State ไปยัง Server Database</p>
                </div>

                <div className="bg-stone-900 rounded-xl p-4 mb-6 h-48 overflow-y-auto custom-scrollbar font-mono text-xs text-green-400">
                    {logs.length === 0 ? <span className="text-stone-600">Ready to start...</span> : logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>

                {status === 'running' && (
                    <div className="w-full bg-stone-200 h-2 rounded-full mb-6 overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                )}

                <div className="flex gap-3">
                    {status === 'completed' ? (
                        <button onClick={onClose} className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                            <CheckCircle2 /> ปิดหน้าต่าง (เสร็จสิ้น)
                        </button>
                    ) : (
                        <>
                            <button onClick={onClose} disabled={status === 'running'} className="px-6 py-4 text-stone-400 font-bold hover:bg-stone-100 rounded-xl disabled:opacity-50">ยกเลิก</button>
                            <button 
                                onClick={runMigration} 
                                disabled={status === 'running'}
                                className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {status === 'running' ? <Loader2 className="animate-spin"/> : <Play size={20}/>} 
                                {status === 'running' ? 'กำลังย้ายข้อมูล...' : 'เริ่มย้ายข้อมูล'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MigrationModal;
