
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { MentorTip } from '../../UI';
import { TrafficData, FixedCosts } from '../../../types';

interface StrategySectionProps {
    results: any;
    traffic: TrafficData;
    fixedCosts: FixedCosts;
}

const StrategySection: React.FC<StrategySectionProps> = ({ results, traffic, fixedCosts }) => {
    return (
        <div className="bg-[#FFF9F0] border-4 border-orange-100 p-8 rounded-[3rem] relative">
            <div className="absolute -top-6 left-8 bg-white px-4 py-2 rounded-2xl border-4 border-orange-100 shadow-sm flex items-center gap-2">
                <div className="bg-orange-100 p-1.5 rounded-full"><Lightbulb className="text-orange-500" size={20} strokeWidth={2.5} /></div>
                <h3 className="text-lg font-black text-stone-700">คำแนะนำจากกูรู (Guru Tips)</h3>
            </div>
            
            <div className="mt-4">
                <MentorTip 
                    tips={[
                        {
                            title: "ROI หัวใจนักลงทุน 🧠",
                            desc: `ระยะคืนทุน (Payback Period) คือตัวชี้วัดความเสี่ยงครับ ยิ่งสั้นยิ่งดี! ของคุณอยู่ที่ ${results.paybackDays === Infinity ? 'นานมาก' : Math.ceil(results.paybackDays) + ' วัน'} ถือว่า ${results.paybackDays < 180 ? 'ยอดเยี่ยม! ความเสี่ยงต่ำครับ' : 'ค่อนข้างนาน ลองหาวิธีเพิ่มยอดขายหรือลดต้นทุนดูนะครับ'}`
                        },
                        {
                            title: "เงินสดคือพระเจ้า (Cash Flow) 💵",
                            desc: "กำไรในกระดาษสวยหรู แต่ถ้าไม่มีเงินสดหมุนเวียนก็ลำบากครับ อย่าลืมกันเงินสำรองไว้เผื่อค่าใช้จ่ายฉุกเฉินอย่างน้อย 1 เดือนเสมอนะ"
                        },
                        {
                            title: "ลองกด Worst Case เล่นดู ☔️",
                            desc: "ปุ่ม Worst Case ด้านบนมีไว้เช็คความอึดครับ! ลองกดดูว่าถ้าวันไหนฝนตกหนัก ลูกค้าน้อย เรายังอยู่รอดไหม? ถ้ากำไรยังเป็นบวก แปลว่าร้านคุณแข็งแกร่งมาก!"
                        }
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Strategy Card 1 */}
                <div className="bg-white p-6 rounded-[2rem] border-2 border-stone-100 shadow-sm hover:-translate-y-1 transition-transform">
                    <p className="text-xs font-black text-stone-300 uppercase tracking-wider mb-2">สุขภาพการเงิน</p>
                    <p className="text-base font-bold leading-relaxed">
                        {results.paybackDays < 90 
                        ? <span className="text-green-500">🌟 สุดยอด! คืนทุนไวใน 3 เดือน นี่แหละธุรกิจในฝัน</span> 
                        : results.paybackDays < 180 
                        ? <span className="text-orange-500">👍 ปานกลาง คืนทุนใน 6 เดือน ต้องขยันหน่อยนะ</span> 
                        : <span className="text-red-500">⚠️ ระวัง! คืนทุนนานเกินไป ลองลด Cost ด่วน</span>}
                    </p>
                </div>
                {/* Strategy Card 2 */}
                <div className="bg-white p-6 rounded-[2rem] border-2 border-stone-100 shadow-sm hover:-translate-y-1 transition-transform">
                    <p className="text-xs font-black text-stone-300 uppercase tracking-wider mb-2">เป้าหมายรายชั่วโมง</p>
                    <p className="text-base font-bold text-stone-600 leading-relaxed">
                        ต้องปิ้งให้ทัน! ขายให้ได้เฉลี่ย <span className="text-blue-500 bg-blue-50 px-2 rounded-lg">{(results.unitsSold / traffic.openHours).toFixed(1)} ชิ้น/ชม.</span> ไม่งั้นเหนื่อยฟรี
                    </p>
                </div>
                {/* Strategy Card 3 */}
                <div className="bg-white p-6 rounded-[2rem] border-2 border-stone-100 shadow-sm hover:-translate-y-1 transition-transform">
                    <p className="text-xs font-black text-stone-300 uppercase tracking-wider mb-2">ระวังค่าเช่า</p>
                    <p className="text-base font-bold text-stone-600 leading-relaxed">
                        ค่าที่+น้ำไฟ ไม่ควรเกิน <span className="text-red-500 bg-red-50 px-2 rounded-lg">20%</span> ของยอดขาย (ตอนนี้ {( ((fixedCosts.boothRent+fixedCosts.electricityBase)/(results.revenue || 1))*100 ).toFixed(1)}%)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StrategySection;
