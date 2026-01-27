
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface FinancialChartsProps {
    results: any;
    fixedCostDaily: number;
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ results, fixedCostDaily }) => {
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border-2 border-orange-100 shadow-xl font-cute">
              <p className="font-bold text-stone-600 mb-1">{label}</p>
              <p className="text-lg font-black text-orange-500">
                ฿{payload[0].value.toLocaleString()}
              </p>
            </div>
          );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart Card */}
            <div className="bg-white p-8 rounded-[3rem] border-4 border-stone-100 shadow-sm h-[400px] flex flex-col">
                <h3 className="text-xl font-black text-stone-700 flex items-center gap-2 mb-6">
                    <div className="w-3 h-8 bg-green-400 rounded-full"></div>
                    รายรับ vs รายจ่าย
                </h3>
                <div className="flex-1 w-full font-cute">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                    { name: 'รายรับ', value: results.revenue },
                    { name: 'ต้นทุน', value: results.totalCost },
                    { name: 'กำไร', value: results.profit }
                    ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 14, fontFamily: 'Mali', fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12, fontFamily: 'Mali'}} />
                    <Tooltip cursor={{fill: '#fafafa', radius: 16}} content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[16, 16, 16, 16]} barSize={60}>
                        <Cell fill="#6EE7B7" /> {/* Green */}
                        <Cell fill="#FCA5A5" /> {/* Red */}
                        <Cell fill="#FDBA74" /> {/* Orange */}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart Card */}
            <div className="bg-white p-8 rounded-[3rem] border-4 border-stone-100 shadow-sm h-[400px] flex flex-col">
            <h3 className="text-xl font-black text-stone-700 flex items-center gap-2 mb-2">
                    <div className="w-3 h-8 bg-indigo-400 rounded-full"></div>
                    สัดส่วนต้นทุน (Cost Structure)
            </h3>
            <div className="flex items-center justify-center h-full">
                    <div className="w-1/2 h-full font-cute">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={[
                            { name: 'Fixed Cost', value: fixedCostDaily },
                            { name: 'Variable Cost', value: results.realCost * results.unitsSold }
                        ]}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                        >
                        <Cell fill="#A5B4FC" /> {/* Indigo */}
                        <Cell fill="#FDA4AF" /> {/* Rose */}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-6 flex flex-col justify-center gap-4">
                    <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-indigo-300 mt-1 shrink-0"></div>
                    <div>
                        <p className="text-xs text-stone-400 font-bold uppercase">Fixed Cost</p>
                        <p className="font-black text-stone-700 text-xl">฿{fixedCostDaily.toFixed(0)}</p>
                        <p className="text-[10px] text-stone-400 font-bold">ค่าที่, ค่าแรง, ค่าเสื่อม</p>
                    </div>
                    </div>
                    <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-rose-300 mt-1 shrink-0"></div>
                    <div>
                        <p className="text-xs text-stone-400 font-bold uppercase">Variable Cost</p>
                        <p className="font-black text-stone-700 text-xl">฿{(results.realCost * results.unitsSold).toFixed(0)}</p>
                        <p className="text-[10px] text-stone-400 font-bold">ค่าวัตถุดิบตามยอดขาย</p>
                    </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default FinancialCharts;
