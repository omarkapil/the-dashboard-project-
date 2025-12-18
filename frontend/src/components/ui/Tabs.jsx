import React, { useState } from 'react';

const Tabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="flex border-b border-gray-700 mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                            ? 'border-cyber-accent text-cyber-accent'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {tab.icon}
                        {tab.label}
                    </div>
                </button>
            ))}
        </div>
    );
};

export default Tabs;
