import React from 'react';

const TabNavigation = ({ activeTab, onTabChange, tabs }) => {
    return (
        <div className="flex gap-8 border-b border-gray-800 mb-8">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative pb-4 px-2 text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
                            ? 'text-white'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {tab.icon && <span className="text-lg">{tab.icon}</span>}
                        <span>{tab.label}</span>
                    </div>

                    {/* Active tab indicator with gradient */}
                    {activeTab === tab.id && (
                        <>
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#bf00ff] to-[#00f2ff]"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#bf00ff] to-[#00f2ff] blur-sm"></div>
                        </>
                    )}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;
