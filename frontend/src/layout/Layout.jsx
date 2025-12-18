import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Taskbar from '../components/dashboard/Taskbar';


const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-cyber-dark text-gray-100 font-sans selection:bg-cyber-accent selection:text-gray-900">
            {/* Header */}
            <header className="bg-cyber-light border-b border-gray-700 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-cyber-accent h-8 w-8" />
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            SME <span className="text-cyber-accent">CyberGuard</span>
                        </h1>
                    </div>
                    <nav className="flex gap-6 text-sm font-medium text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Dashboard</a>
                        <a href="#" className="hover:text-white transition-colors">Scans</a>
                        <a href="#" className="hover:text-white transition-colors">Settings</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 pb-12">
                {children}
            </main>

            <Taskbar />
        </div>
    );
};

export default Layout;
