import React from 'react';

const RiskScore = ({ score }) => {
    let grade = 'F';
    let colorClass = 'cyan';
    let label = 'Critical';
    let borderColor = 'border-red-500/50';
    let textColor = 'text-red-500';

    if (score >= 80) {
        grade = 'A'; label = 'Excellent'; borderColor = 'border-cyber-success/50'; textColor = 'text-cyber-success'; colorClass = 'success';
    }
    else if (score >= 60) {
        grade = 'B'; label = 'Good'; borderColor = 'border-cyber-accent/50'; textColor = 'text-cyber-accent'; colorClass = 'accent';
    }
    else if (score >= 40) {
        grade = 'C'; label = 'Fair'; borderColor = 'border-cyber-warning/50'; textColor = 'text-cyber-warning'; colorClass = 'warning';
    }
    else if (score >= 20) {
        grade = 'D'; label = 'Poor'; borderColor = 'border-orange-500/50'; textColor = 'text-orange-500'; colorClass = 'orange';
    }

    return (
        <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden animate-fade-in">
            {/* Background Radial Glow */}
            <div className={`absolute inset-0 bg-cyber-${colorClass}/5 blur-3xl rounded-full scale-150`}></div>

            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-6 font-bold relative z-10">Security Health</h3>

            <div className="relative h-40 w-40 flex items-center justify-center mb-6">
                <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                    <circle
                        cx="80" cy="80" r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/5"
                    />
                    <circle
                        cx="80" cy="80" r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * score) / 100}
                        className={`${textColor} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="flex flex-col items-center justify-center z-10">
                    <span className={`text-6xl font-black ${textColor} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                        {grade}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${textColor}/80`}>
                        {label}
                    </span>
                </div>
            </div>

            <div className="w-full space-y-2 relative z-10">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-500 tracking-tighter uppercase">Operational Index</span>
                    <span className="text-sm font-mono font-bold text-white">{Math.round(score || 0)}/100</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r from-transparent via-${textColor.replace('text-', '')} to-transparent transition-all duration-1000`}
                        style={{ width: `${score}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default RiskScore;
