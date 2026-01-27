
import React from 'react';
import { Box, Plus, Trash2, ArrowDown, PackageCheck, AlertTriangle, Clock, ChevronDown, ChevronUp, Minus, ScanLine, Wheat, Package, Armchair, Edit3, Calendar, StickyNote, Layers, Coins, Image as ImageIcon, Wrench, AlertCircle, History } from 'lucide-react';
import { InventoryItem } from '../../../types';

interface InventoryListProps {
    items: InventoryItem[];
    viewMode: 'grid' | 'list';
    onItemClick: (item: InventoryItem) => void;
    onAdjust: (item: InventoryItem, type: 'add' | 'remove') => void;
    onDelete: (id: string) => void;
    onEdit: (item: InventoryItem) => void; 
    expandedItemId: string | null;
    setExpandedItemId: (id: string | null) => void;
    onHistoryClick: (item: InventoryItem) => void; // NEW PROP
}

const getDaysUntilExpiry = (dateStr?: string) => {
    if (!dateStr) return 999;
    const expiry = new Date(dateStr);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// --- Helper: Status Badge ---
const AssetStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
        case 'repair': return <span className="text-[10px] font-bold bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-yellow-200"><Wrench size={10}/> ซ่อม</span>;
        case 'broken': return <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200"><AlertCircle size={10}/> เสีย</span>;
        case 'lost': return <span className="text-[10px] font-bold bg-stone-200 text-stone-500 px-2 py-0.5 rounded-full flex items-center gap-1 border border-stone-300">สูญหาย</span>;
        default: return <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200">ปกติ</span>;
    }
};

// --- Sub-component: Batch Accordion (Stock) ---
const BatchAccordion: React.FC<{ item: InventoryItem }> = ({ item }) => (
    <div className="px-6 py-4 bg-stone-50 border-t border-dashed border-stone-200 text-xs animate-in slide-in-from-top-2 relative z-0">
        <p className="font-bold text-stone-400 mb-3 uppercase flex items-center gap-1"><ScanLine size={12}/> รายการล็อต (Batches)</p>
        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {item.batches?.map((batch, idx) => {
                const bDays = getDaysUntilExpiry(batch.expiryDate);
                return (
                    <div key={batch.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                        <div>
                            <span className="font-bold text-stone-600 block text-xs">Lot #{idx + 1}</span>
                            <span className={`text-[10px] font-bold ${bDays < 3 ? 'text-red-500' : 'text-stone-400'}`}>
                                {batch.expiryDate ? `หมดอายุ: ${new Date(batch.expiryDate).toLocaleDateString('th-TH')}` : 'ไม่ระบุวันหมดอายุ'}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="font-black text-stone-800 block text-sm">{batch.quantity}</span>
                            <span className="text-[10px] text-stone-400">ทุน ฿{batch.costPerUnit}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

// --- Sub-component: Asset Group Accordion (Hybrid Asset) ---
const AssetGroupAccordion: React.FC<{ 
    group: InventoryItem, 
    onDelete: (id: string) => void, 
    onEdit: (item: InventoryItem) => void 
}> = ({ group, onDelete, onEdit }) => (
    <div className="px-6 py-4 bg-purple-50/50 border-t border-dashed border-purple-200 text-xs animate-in slide-in-from-top-2 relative z-0">
        <div className="flex justify-between items-center mb-3">
            <p className="font-bold text-purple-400 uppercase flex items-center gap-1"><Layers size={12}/> รายการย่อย ({group.linkedAssets?.length})</p>
            <p className="font-bold text-purple-600 text-[10px] bg-white px-2 py-0.5 rounded border border-purple-100">รวมค่าเสื่อม: ฿{group.dailyDepreciation?.toFixed(2)}/วัน</p>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {group.linkedAssets?.map((asset, idx) => (
                <div key={asset.id} className={`bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex justify-between items-center group/row hover:border-purple-200 transition-colors ${asset.status === 'broken' ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 bg-purple-100 text-purple-500 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0">
                            #{idx + 1}
                        </div>
                        
                        {/* Asset Thumbnail */}
                        <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {asset.image ? (
                                <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={16} className="text-stone-300"/>
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-700 text-xs truncate max-w-[150px]">
                                    {asset.name} {asset.quantity > 1 && <span className="text-purple-600 bg-purple-50 px-1.5 rounded-full text-[10px] ml-1">x{asset.quantity}</span>}
                                </span>
                                <AssetStatusBadge status={asset.status || 'active'} />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                {asset.notes && <span className="text-[10px] text-stone-400 bg-stone-50 px-1.5 rounded border border-stone-200 truncate">{asset.notes}</span>}
                                <span className="text-[10px] text-stone-400">ทุน ฿{asset.costPerUnit?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity">
                        <button onClick={(e) => {e.stopPropagation(); onEdit(asset);}} className="p-1.5 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={12}/></button>
                        <button onClick={(e) => {e.stopPropagation(); onDelete(asset.id);}} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={12}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const InventoryList: React.FC<InventoryListProps> = ({ 
    items, viewMode, onItemClick, onAdjust, onDelete, onEdit, expandedItemId, setExpandedItemId, onHistoryClick
}) => {
    
    if (items.length === 0) {
        return (
            <div className="text-center py-20 bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200">
                <Box className="mx-auto text-stone-300 mb-4" size={64}/>
                <p className="text-stone-400 font-bold text-lg">ไม่พบรายการ</p>
                <p className="text-stone-300 text-sm">ลองเปลี่ยนคำค้นหา หรือเพิ่มรายการใหม่</p>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col gap-3">
                {items.map(item => {
                    const isAsset = item.type === 'asset';
                    const isAssetGroup = item.isGroup;
                    const isLow = !isAsset && item.quantity <= item.minLevel;
                    const stockPercent = !isAsset ? Math.min((item.quantity / (item.minLevel * 3)) * 100, 100) : 100;
                    const daysLeft = !isAsset ? getDaysUntilExpiry(item.expiryDate) : 999;
                    const isExpiring = !isAsset && daysLeft <= 3;
                    const isExpanded = expandedItemId === item.id;
                    const category = isAsset ? 'asset' : (item.category || 'ingredient');

                    return (
                        <div key={item.id} className="relative group">
                            <div 
                                className={`bg-white rounded-3xl border-2 p-4 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-all relative z-10 cursor-pointer ${isAsset ? 'border-purple-100 bg-purple-50/20' : isExpiring ? 'border-orange-200 bg-orange-50/20' : 'border-stone-100 hover:border-orange-200'}`} 
                                onClick={() => isAssetGroup ? setExpandedItemId(isExpanded ? null : item.id) : onItemClick(item)}
                            >
                                {/* Image */}
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 shrink-0 relative">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-stone-300">
                                            {isAsset ? <Armchair size={24} className="text-purple-300"/> : <Box size={24}/>}
                                        </div>
                                    )}
                                    {/* Category Badge Small */}
                                    <div className={`absolute bottom-0 right-0 p-1 rounded-tl-xl ${category === 'ingredient' ? 'bg-orange-400' : category === 'asset' ? 'bg-purple-500' : 'bg-blue-400'}`}>
                                        {category === 'ingredient' ? <Wheat size={10} className="text-white"/> : category === 'asset' ? <Armchair size={10} className="text-white"/> : <Package size={10} className="text-white"/>}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg text-stone-700 leading-relaxed py-1 line-clamp-1">{item.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-stone-400">
                                                {isAssetGroup ? (
                                                    <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                        <Coins size={10}/> มูลค่ารวม: ฿{(item.costPerUnit || 0).toLocaleString()}
                                                    </span>
                                                ) : isAsset ? (
                                                    <>
                                                        <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">ค่าเสื่อม: ฿{item.dailyDepreciation?.toFixed(2)}/วัน</span>
                                                        <AssetStatusBadge status={item.status || 'active'}/>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>ทุน ฿{item.costPerUnit?.toFixed(2)}</span>
                                                        <span>•</span>
                                                        <span>ขั้นต่ำ {item.minLevel}</span>
                                                    </>
                                                )}
                                            </div>
                                            {item.notes && !isAssetGroup && isAsset && (
                                                <p className="text-[10px] text-stone-500 mt-1 flex items-center gap-1 font-bold bg-white/50 px-1.5 rounded w-fit border border-stone-100">
                                                    <StickyNote size={10}/> {item.notes}
                                                </p>
                                            )}
                                        </div>
                                        {item.expiryDate && !isAsset && (
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${isExpiring ? 'bg-red-100 text-red-500 border-red-200' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                                                {daysLeft < 0 ? 'หมดอายุ' : `${daysLeft} วัน`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Qty & Actions */}
                                <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex flex-col items-end w-32">
                                        <span className={`font-black text-2xl leading-none ${isAsset ? 'text-purple-800' : 'text-stone-800'}`}>{item.quantity.toLocaleString()}</span>
                                        <span className="text-xs font-bold text-stone-400">{item.unit}</span>
                                        {!isAsset && (
                                            <div className="w-full h-2 bg-stone-100 rounded-full mt-1 overflow-hidden">
                                                <div className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${stockPercent}%` }}></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {!isAsset ? (
                                            <>
                                                {/* History Button (Small) - Added Title */}
                                                <button 
                                                    onClick={() => onHistoryClick(item)} 
                                                    className="w-10 h-10 rounded-xl bg-stone-100 text-stone-400 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center transition-colors"
                                                    title="ดูประวัติความเคลื่อนไหว"
                                                >
                                                    <History size={18}/>
                                                </button>
                                                
                                                <button onClick={() => onAdjust(item, 'add')} className="w-10 h-10 rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center transition-colors" title="รับของเข้า"><Plus size={18}/></button>
                                                <button onClick={() => onAdjust(item, 'remove')} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors" title="ตัดสต็อกออก"><Minus size={18}/></button>
                                                
                                                {/* Inline Expand for Batches (Stock Only) */}
                                                {item.batches && item.batches.length > 0 && (
                                                    <button onClick={() => setExpandedItemId(isExpanded ? null : item.id)} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${isExpanded ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400'}`}>
                                                        {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            /* Asset Group Expand Button */
                                            isAssetGroup ? (
                                                <button onClick={() => setExpandedItemId(isExpanded ? null : item.id)} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${isExpanded ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-purple-200 text-purple-400 hover:border-purple-400'}`}>
                                                    {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                                </button>
                                            ) : (
                                                /* Single Asset Actions */
                                                <div className="flex flex-col gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg bg-stone-100 text-stone-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"><Edit3 size={14}/></button>
                                                    <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg bg-stone-100 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Expand Logic */}
                            {isExpanded && !isAsset && <BatchAccordion item={item} />}
                            {isExpanded && isAssetGroup && <AssetGroupAccordion group={item} onDelete={onDelete} onEdit={onEdit} />}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Default: Grid Mode
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {items.map(item => {
                const isAsset = item.type === 'asset';
                const isAssetGroup = item.isGroup;
                const isExpanded = expandedItemId === item.id;
                
                const isLow = !isAsset && item.quantity <= item.minLevel;
                const stockPercent = !isAsset ? Math.min((item.quantity / (item.minLevel * 3)) * 100, 100) : 100;
                const daysLeft = !isAsset ? getDaysUntilExpiry(item.expiryDate) : 999;
                const isExpiring = !isAsset && daysLeft <= 3;
                const isExpired = !isAsset && daysLeft < 0;
                const category = isAsset ? 'asset' : (item.category || 'ingredient');
                
                return (
                    <div key={item.id} className="relative group">
                        <div className={`bg-white rounded-[2.5rem] border-2 transition-all flex flex-col hover:-translate-y-1 hover:shadow-lg duration-300 relative z-10 ${isAsset ? 'border-purple-100 shadow-purple-50' : isExpired ? 'border-red-300 bg-red-50' : isExpiring ? 'border-orange-200' : isLow ? 'border-red-100 shadow-red-50' : 'border-stone-100 hover:border-orange-200'}`}>
                            
                            {/* Top Section - Clickable */}
                            <div className="p-6 pb-4 flex flex-col h-full cursor-pointer" onClick={() => isAssetGroup ? setExpandedItemId(isExpanded ? null : item.id) : onItemClick(item)}>
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4 flex gap-1 z-10 pointer-events-none">
                                    {item.expiryDate && !isAsset && (
                                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${isExpired ? 'bg-red-500 text-white' : isExpiring ? 'bg-orange-100 text-orange-600 animate-pulse border border-orange-200' : 'bg-stone-100 text-stone-500'}`}>
                                            <Clock size={12}/> {isExpired ? 'หมดอายุ' : `${daysLeft} วัน`}
                                        </span>
                                    )}
                                    {isLow ? (
                                        <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse border border-red-200"><AlertTriangle size={12}/> เติมด่วน</span>
                                    ) : !isAsset && !item.expiryDate && (
                                        <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold border border-green-200"><PackageCheck size={12}/> ปกติ</span>
                                    )}
                                    {isAsset && (
                                        <span className="flex items-center gap-1 bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-[10px] font-bold border border-purple-200">
                                            <Armchair size={10}/> {isAssetGroup ? 'กลุ่มสินทรัพย์' : 'ทรัพย์สิน'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4 mb-2 flex-1">
                                    <div className="w-full h-40 rounded-3xl overflow-hidden shrink-0 border-2 border-stone-100 bg-stone-50 flex items-center justify-center relative self-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                {isAsset ? <Armchair size={40} className="text-purple-300"/> : <Box size={40} className="text-stone-300" />}
                                                <span className="text-[10px] font-bold text-stone-300">ไม่มีรูปภาพ</span>
                                            </div>
                                        )}
                                        {/* Category Badge Large */}
                                        <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-2xl text-[10px] font-bold text-white flex items-center gap-1 shadow-sm ${category === 'ingredient' ? 'bg-orange-400' : category === 'asset' ? 'bg-purple-500' : 'bg-blue-400'}`}>
                                            {category === 'ingredient' ? <><Wheat size={12}/> วัตถุดิบ</> : category === 'asset' ? <><Armchair size={12}/> สินทรัพย์</> : <><Package size={12}/> บรรจุภัณฑ์</>}
                                        </div>
                                    </div>

                                    <div className="mt-1">
                                        <h3 className="font-bold text-xl text-stone-700 leading-relaxed py-1 line-clamp-2" title={item.name}>
                                            {item.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            {isAssetGroup ? (
                                                <div className="flex items-center gap-2 text-xs text-stone-400 font-bold bg-stone-50 px-2 py-1 rounded-lg w-fit">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                                    มูลค่ารวม: ฿{(item.costPerUnit || 0).toLocaleString()}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs text-stone-400 font-bold bg-stone-50 px-2 py-1 rounded-lg w-fit">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isAsset ? 'bg-purple-400' : 'bg-stone-300'}`}></span>
                                                    {isAsset ? `ค่าเสื่อม: ฿${item.dailyDepreciation?.toFixed(2)}` : `ทุนเฉลี่ย: ฿${item.costPerUnit?.toFixed(2)}`}
                                                </div>
                                            )}
                                            
                                            {item.notes && isAsset && !isAssetGroup && (
                                                <span className="text-[10px] font-bold text-stone-500 bg-white border border-stone-100 px-2 py-1 rounded-lg flex items-center gap-1 truncate max-w-[120px]">
                                                    <StickyNote size={10}/> {item.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity Bar */}
                                <div className="space-y-2 mt-auto pt-4">
                                    <div className="flex justify-between items-end">
                                        <span className={`text-5xl font-black tracking-tight leading-none ${isAsset ? 'text-purple-800' : 'text-stone-800'}`}>
                                            {item.quantity.toLocaleString()} 
                                        </span>
                                        <span className="text-sm font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-lg mb-1">{item.unit}</span>
                                    </div>
                                    {!isAsset && (
                                        <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-100">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${stockPercent}%` }}></div>
                                        </div>
                                    )}
                                    {isAsset && <div className="w-full h-4 border-t-2 border-dashed border-purple-100"></div>}
                                </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex gap-2 rounded-b-[2.5rem]">
                                {isAssetGroup ? (
                                    <button onClick={() => setExpandedItemId(isExpanded ? null : item.id)} className={`flex-1 border py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${isExpanded ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50'}`}>
                                        {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                        {isExpanded ? 'ซ่อนรายการ' : 'ดูรายการย่อย'}
                                    </button>
                                ) : isAsset ? (
                                    <div className="flex-1 bg-stone-50 border border-stone-200 text-stone-400 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-default">
                                        <Armchair size={16}/> สินทรัพย์ถาวร (Fixed Asset)
                                    </div>
                                ) : (
                                    <>
                                        {/* History Button (Small Grid) - Added Title */}
                                        <button 
                                            onClick={() => onHistoryClick(item)} 
                                            className="w-10 bg-white border border-stone-200 text-stone-400 hover:text-blue-500 hover:border-blue-300 rounded-2xl flex items-center justify-center transition-colors shadow-sm"
                                            title="ดูประวัติความเคลื่อนไหว"
                                        >
                                            <History size={16}/>
                                        </button>
                                        
                                        <button onClick={() => onAdjust(item, 'add')} className="flex-1 bg-white border border-green-200 text-green-600 py-3 rounded-2xl font-bold text-sm hover:bg-green-500 hover:text-white hover:border-green-500 transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"><Plus size={16}/> รับเข้า</button>
                                        <button onClick={() => onAdjust(item, 'remove')} className="flex-1 bg-white border border-red-200 text-red-500 py-3 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"><ArrowDown size={16}/> ตัดออก</button>
                                    </>
                                )}
                                
                                {!isAssetGroup && (
                                    <div className="flex gap-1">
                                        <button onClick={() => onEdit(item)} className="w-10 bg-white border border-stone-200 text-stone-300 rounded-2xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-colors shadow-sm"><Edit3 size={16}/></button>
                                        <button onClick={() => onDelete(item.id)} className="w-10 bg-white border border-stone-200 text-stone-300 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"><Trash2 size={16}/></button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Inline Expansion Area */}
                        {isExpanded && isAssetGroup && <AssetGroupAccordion group={item} onDelete={onDelete} onEdit={onEdit} />}
                    </div>
                );
            })}
        </div>
    );
};

export default InventoryList;
