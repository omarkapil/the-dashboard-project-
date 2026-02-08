import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Taskbar from '../components/dashboard/Taskbar';


const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-cyber-dark text-gray-100 font-sans selection:bg-cyber-accent selection:text-gray-900 transition-colors duration-500">
            {/* Background Glow Effects */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyber-vibrant/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyber-accent/10 blur-[120px] rounded-full"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="p-2 glass-card-interactive bg-cyber-accent/10 border-cyber-accent/20">
                            <ShieldCheck className="text-cyber-accent h-6 w-6 group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white group-hover:neon-text transition-all">
                            found <span className="text-cyber-accent">404</span>
                        </h1>
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
                        <a href="#" className="hover:text-white hover:neon-text transition-all">Command Center</a>
                        <a href="#" className="hover:text-white hover:neon-text transition-all">Engines</a>
                        <a href="#" className="hover:text-white hover:neon-text transition-all">Intelligence</a>
                        <a href="#" className="hover:text-white hover:neon-text transition-all">Infrastructure</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyber-accent to-cyber-vibrant p-[1px]">
                            <div className="h-full w-full rounded-full bg-cyber-dark flex items-center justify-center text-[10px] font-bold">ADM</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8 pb-20 relative z-10">
                {children}
            </main>

            <Taskbar />
        </div>
    );
};

export default Layout;
