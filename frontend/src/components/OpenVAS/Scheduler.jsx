import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { openvasService } from '../../services/api';

const Scheduler = () => {
    const [scheduled, setScheduled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [day, setDay] = useState('Sunday');
    const [time, setTime] = useState('02:00');

    const handleSave = async () => {
        setLoading(true);
        try {
            await openvasService.scheduleScan({
                target_ip: "172.18.0.0/24", // Default lab range or should be dynamic
                target_name: "Weekly Auto Scan",
                frequency: "weekly",
                day: day,
                time: time
            });
            setScheduled(true);
            setTimeout(() => setScheduled(false), 3000);
        } catch (error) {
            console.error("Failed to schedule", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 h-full flex flex-col justify-center">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4 font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Automated Scanning
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Frequency</label>
                    <select
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-cyber-accent focus:outline-none"
                    >
                        <option value="Sunday">Every Sunday</option>
                        <option value="Monday">Every Monday</option>
                        <option value="Daily">Daily</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Time</label>
                    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded p-2 focus-within:border-cyber-accent">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="bg-transparent text-white text-sm w-full focus:outline-none"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-cyber-neon/10 hover:bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 px-4 py-2 rounded font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (scheduled ? <CheckCircle className="h-4 w-4" /> : null)}
                    {scheduled ? 'SAVED' : 'SAVE SCHEDULE'}
                </button>
            </div>

            <p className="text-[10px] text-gray-500 mt-4 italic text-center">
                System will automatically wake up and scan target assets at the specified time.
            </p>
        </div>
    );
};

export default Scheduler;
