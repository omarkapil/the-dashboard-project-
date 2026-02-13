import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RiskChart = ({ data }) => {
    // data example: { 'CRITICAL': 2, 'HIGH': 5, 'MEDIUM': 10, 'LOW': 20 }
    // Convert to array for Recharts

    // Fallback data if no data provided
    const defaultData = [
        { name: 'Critical', value: 0, color: '#FF0055' }, // Cyber Red
        { name: 'High', value: 0, color: '#FF9900' },     // Orange
        { name: 'Medium', value: 0, color: '#FFFF00' },   // Yellow
        { name: 'Low', value: 0, color: '#00CCFF' },      // Cyber Blue
    ];

    const chartData = data ? [
        { name: 'Critical', value: data.CRITICAL || 0, color: '#FF0055' },
        { name: 'High', value: data.HIGH || 0, color: '#FF9900' },
        { name: 'Medium', value: data.MEDIUM || 0, color: '#FFFF00' },
        { name: 'Low', value: data.LOW || 0, color: '#00CCFF' },
    ] : defaultData;

    // Filter out zero values for better visual if needed, or keep them
    const activeData = chartData.filter(d => d.value > 0);
    const displayData = activeData.length > 0 ? activeData : [{ name: 'Safe', value: 1, color: '#00FF99' }];

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4 font-bold">Vulnerability Risk Distribution</h3>
            <div className="flex-grow min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={displayData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {displayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="text-2xl font-black text-white">{activeData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                        <p className="text-[10px] text-gray-400 uppercase">Issues</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskChart;
