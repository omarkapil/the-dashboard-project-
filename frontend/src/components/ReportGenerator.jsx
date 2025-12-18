import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ReportGenerator = () => {
    const { token } = useAuth();
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const response = await axios.get('http://localhost:5000/api/reports/generate', {
                responseType: 'blob',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'security_report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error generating report", error);
            alert("Failed to generate report");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <button onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Professional Report'}
        </button>
    );
};

export default ReportGenerator;
