import React from 'react';

const RiskScore = ({ score }) => {
    // Score is 0-100 Health Score (100 = Perfect Security)
    // 80-100: A (Excellent)
    // 60-79: B (Good)
    // 40-59: C (Fair)
    // 20-39: D (Poor)
    // 0-19: F (Critical)

    let grade = 'F';
    let color = 'text-red-600';
    let label = 'Critical';

    if (score >= 80) { grade = 'A'; color = 'text-green-500'; label = 'Excellent'; }
    else if (score >= 60) { grade = 'B'; color = 'text-blue-500'; label = 'Good'; }
    else if (score >= 40) { grade = 'C'; color = 'text-yellow-500'; label = 'Fair'; }
    else if (score >= 20) { grade = 'D'; color = 'text-orange-500'; label = 'Poor'; }

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-cyber-light rounded-xl shadow-lg border border-gray-700 animate-fade-in">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Security Health</h3>
            <div className={`text-6xl font-black ${color} mb-1 drop-shadow-lg`}>
                {grade}
            </div>
            <p className={`text-sm font-bold ${color} mb-2`}>{label}</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div className={`h-2.5 rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${score}%` }}></div>
            </div>
            <p className="text-gray-500 text-xs mt-2">Score: {Math.round(score || 0)}/100</p>
        </div>
    );
};

export default RiskScore;
