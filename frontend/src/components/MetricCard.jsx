import React from 'react';

const MetricCard = ({ label, value, unit, gradient = 'purple', icon, trend }) => {
    const gradientClasses = {
        purple: 'gradient-card-purple',
        cyan: 'gradient-card-cyan',
        red: 'bg-gradient-to-br from-red-500 to-pink-600',
        green: 'bg-gradient-to-br from-green-500 to-emerald-600',
        yellow: 'bg-gradient-to-br from-yellow-500 to-orange-500'
    };

    return (
        <div className={`${gradientClasses[gradient]} rounded-2xl p-6 shadow-lg transition-transform hover:scale-105`}>
            <div className="flex justify-between items-start mb-4">
                <div className="metric-label text-white/80 text-sm uppercase tracking-wider">
                    {label}
                </div>
                {icon && <span className="text-2xl opacity-80">{icon}</span>}
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-bold text-white">
                    {value}
                </span>
                {unit && <span className="text-xl text-white/70">{unit}</span>}
            </div>

            {trend && (
                <div className="mt-3 flex items-center gap-2">
                    <span className={`text-sm ${trend > 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                    <span className="text-xs text-white/60">vs last period</span>
                </div>
            )}
        </div>
    );
};

export default MetricCard;
