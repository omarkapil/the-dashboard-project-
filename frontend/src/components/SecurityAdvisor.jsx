import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SecurityAdvisor = () => {
    const { token } = useAuth();
    const [advice, setAdvice] = useState('');
    const [displayedText, setDisplayedText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/advisor', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setAdvice(data.advice);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching advice:", err);
                setAdvice("System offline. Unable to retrieve security insights.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!advice) return;

        let index = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(advice.slice(0, index + 1));
            index++;
            if (index >= advice.length) {
                clearInterval(intervalId);
            }
        }, 30); // Typing speed

        return () => clearInterval(intervalId);
    }, [advice]);

    return (
        <div className="card security-advisor" style={{
            borderLeft: '4px solid #00ff00',
            background: 'rgba(0, 20, 0, 0.3)',
            marginBottom: '20px'
        }}>
            <h3 style={{ color: '#00ff00', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🧠</span> Gemini Security Advisor
            </h3>
            <div className="terminal-text" style={{
                fontFamily: "'Courier New', monospace",
                color: '#e0e0e0',
                minHeight: '60px',
                lineHeight: '1.5',
                fontSize: '1.1rem'
            }}>
                {loading ? "Analyzing system security posture..." : displayedText}
                <span className="cursor" style={{ animation: 'blink 1s step-end infinite' }}>|</span>
            </div>
            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default SecurityAdvisor;
