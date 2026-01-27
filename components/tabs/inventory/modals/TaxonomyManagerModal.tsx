
import React, { useState } from 'react';
import { X, CheckSquare, Edit3, Settings2 } from 'lucide-react';
import { AssetCategory } from '../../../../types';

export const TaxonomyManagerModal: React.FC<{
    taxonomy: AssetCategory[];
    onUpdate: (newTax: AssetCategory[]) => void;
    onClose: () => void;
}> = ({ taxonomy, onUpdate, onClose }) => {
    const [editCatId, setEditCatId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [newType, setNewType] = useState('');

    const handleRenameCat = (id: string, name: string) => {
        const updated = taxonomy.map(c => c.id === id ? { ...c, name } : c);
        onUpdate(updated);
        setEditCatId(null);
    };

    const handleAddType = (catId: string, typeName: string) => {
        if (!typeName) return;
        const updated = taxonomy.map(c => 
            c.id === catId ? { ...c, types: [...c.types, typeName] } : c
        );
        onUpdate(updated);
        setNewType('');
    };

    const handleDeleteType = (catId: string, typeName: string) => {
        const updated = taxonomy.map(c => 
            c.id === catId ? { ...c, types: c.types.filter(t => t !== typeName) } : c
        );
        onUpdate(updated);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 h-[80vh] flex flex-col shadow-2xl border-4 border-white animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-100">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Settings2 size={20} className="text-purple-500"/> จัดการหมวดหมู่ (Taxonomy)</h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                    {taxonomy.map(cat => (
                        <div key={cat.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                            {/* Cat Header */}
                            <div className="flex justify-between items-center mb-3">
                                {editCatId === cat.id ? (
                                    <div className="flex gap-2 flex-1 mr-2">
                                        <input autoFocus className="flex-1 px-2 py-1 rounded border outline-none text-sm" value={editName} onChange={e => setEditName(e.target.value)} />
                                        <button onClick={() => handleRenameCat(cat.id, editName)} className="text-green-500"><CheckSquare size={16}/></button>
                                    </div>
                                ) : (
                                    <h4 className="font-bold text-stone-700">{cat.name}</h4>
                                )}
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditCatId(cat.id); setEditName(cat.name); }} className="text-stone-400 hover:text-blue-500"><Edit3 size={14}/></button>
                                </div>
                            </div>

                            {/* Types Tags */}
                            <div className="flex flex-wrap gap-2">
                                {cat.types.map(t => (
                                    <span key={t} className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-stone-500 border border-stone-200 flex items-center gap-1 group">
                                        {t}
                                        <button onClick={() => handleDeleteType(cat.id, t)} className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                                    </span>
                                ))}
                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-dashed border-stone-300">
                                    <input 
                                        placeholder="+ เพิ่ม" 
                                        className="w-12 text-xs bg-transparent outline-none"
                                        onKeyDown={(e) => { if(e.key === 'Enter') handleAddType(cat.id, (e.target as any).value); }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
