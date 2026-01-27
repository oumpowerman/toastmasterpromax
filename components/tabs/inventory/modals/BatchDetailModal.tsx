
import React from 'react';
import { X, Armchair, Box, StickyNote, Clock, History } from 'lucide-react';
import { InventoryItem } from '../../../../types';

export const BatchDetailModal: React.FC<{
    item: InventoryItem | null;
    onClose: () => void;
}> = ({ item, onClose }) => {
    if (!item) return null;
    const isAsset = item.type === 'asset';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2.5rem] p-8 relative z-10 animate-in zoom-in-95 flex flex-col shadow-2xl border-4 border-white overflow-hidden">
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`p-2 rounded-xl ${isAsset ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                {isAsset ? <Armchair size={20}/> : <Box size={20}/>}
                            </span>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{isAsset ? 'Asset Detail' : 'Stock Detail'}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-stone-800 font-cute leading-tight">{item.name}</h3>
                        {item.notes && <p className="text-sm text-stone-500 mt-1 flex items-center gap-1"><StickyNote size={12}/> {item.notes}</p>}
                        {item.assetCode && <p className="text-xs font-mono font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded mt-1 w-fit">{item.assetCode}</p>}
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"><X size={20}/></button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 text-center">
                        <p className="text-[10px] text-stone-400 font-bold uppercase mb-1">คงเหลือ</p>
                        <p className="text-xl font-black text-stone-700">{item.quantity.toLocaleString()}</p>
                        <p className="text-[10px] text-stone-400">{item.unit}</p>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 text-center">
                        <p className="text-[10px] text-stone-400 font-bold uppercase mb-1">{isAsset ? 'ทุนซื้อ' : 'ทุนเฉลี่ย'}</p>
                        <p className="text-xl font-black text-stone-700">฿{item.costPerUnit?.toFixed(2)}</p>
                        <p className="text-[10px] text-stone-400">ต่อ{item.unit}</p>
                    </div>
                    {isAsset ? (
                        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-center">
                            <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">ค่าเสื่อม/วัน</p>
                            <p className="text-xl font-black text-purple-600">฿{item.dailyDepreciation?.toFixed(2)}</p>
                            <p className="text-[10px] text-purple-400">บาท</p>
                        </div>
                    ) : (
                        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 text-center">
                            <p className="text-[10px] text-stone-400 font-bold uppercase mb-1">มูลค่ารวม</p>
                            <p className="text-xl font-black text-green-600">฿{((item.quantity * (item.costPerUnit || 0))).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                            <p className="text-[10px] text-stone-400">บาท</p>
                        </div>
                    )}
                </div>

                {!isAsset && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                        <div className="flex items-center justify-between mb-3 sticky top-0 bg-white z-10 pb-2 border-b border-stone-50">
                            <h4 className="font-bold text-stone-700 flex items-center gap-2"><History size={18} className="text-orange-500"/> ประวัติล็อต (Batch History)</h4>
                            <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-lg">{item.batches?.length || 0} ล็อต</span>
                        </div>
                        <div className="space-y-3">
                            {!item.batches || item.batches.length === 0 ? (
                                <div className="text-center py-10 text-stone-300"><p>ไม่พบข้อมูลล็อตสินค้า</p></div>
                            ) : (
                                item.batches.map((batch, idx) => (
                                    <div key={batch.id} className="bg-white p-4 rounded-2xl border-2 border-stone-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-black text-white bg-stone-400 px-2 py-0.5 rounded-md">#{idx + 1}</span>
                                                    <span className="text-sm font-bold text-stone-600">เข้า: {new Date(batch.receivedDate).toLocaleDateString('th-TH', {day: 'numeric', month:'short', year: '2-digit'})}</span>
                                                </div>
                                                <div className="text-xs font-bold text-stone-400 flex items-center gap-1"><Clock size={12}/> {batch.expiryDate ? `หมดอายุ: ${new Date(batch.expiryDate).toLocaleDateString('th-TH')}` : 'ไม่ระบุวันหมด'}</div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-lg text-stone-800">{batch.quantity.toLocaleString()} <span className="text-xs font-normal text-stone-400">{item.unit}</span></p>
                                                <p className="text-xs text-stone-400">ทุน ฿{batch.costPerUnit}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
