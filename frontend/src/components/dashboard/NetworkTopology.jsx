import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { scanService } from '../../services/api';
import { Loader, Move, ZoomIn, ZoomOut, RefreshCw, Smartphone, Server, Monitor, Radio, Shield } from 'lucide-react';
import AssetDetailPanel from './AssetDetailPanel';

const NetworkTopology = ({ refresh }) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const fgRef = useRef();

    useEffect(() => {
        fetchData();
    }, [refresh]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: scans } = await scanService.getScans();
            if (scans.length > 0) {
                const sortedScans = scans.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

                // Try to find the latest scan that actually has assets
                // This ensures the "Neural Network" doesn't look empty if a recent scan found nothing
                let targetScan = sortedScans.find(s => s.assets_count > 0);

                // Fallback to absolute latest if none have assets
                if (!targetScan) targetScan = sortedScans[0];

                const { data: details } = await scanService.getScanDetails(targetScan.id);
                transformDataToGraph(details);
            }
        } catch (error) {
            console.error("Failed to fetch topology", error);
        } finally {
            setLoading(false);
        }
    };

    const transformDataToGraph = (data) => {
        const nodes = [];
        const links = [];

        // Add Central Hub (The Scanner/Gateway)
        nodes.push({
            id: 'hub',
            name: 'found 404 Hub',
            group: 'gateway',
            val: 20
        });

        if (data.assets) {
            data.assets.forEach(asset => {
                const vulnCount = data.vulnerabilities?.filter(v => v.host === asset.ip_address).length || 0;

                nodes.push({
                    id: asset.id || asset.ip_address,
                    name: asset.hostname || asset.ip_address,
                    ip: asset.ip_address,
                    group: determineGroup(asset),
                    vulnCount: vulnCount,
                    status: vulnCount > 0 ? 'compromised' : 'secure',
                    val: 10 + (vulnCount * 2), // Bigger node if more vulns
                    details: asset
                });

                // Link to Hub (Star Topology for now, can be mesh if we had traceroute data)
                links.push({
                    source: 'hub',
                    target: asset.id || asset.ip_address,
                    value: 2
                });
            });
        }

        setGraphData({ nodes, links });
    };

    const determineGroup = (asset) => {
        const type = (asset.device_type || '').toLowerCase();
        const os = (asset.os_family || '').toLowerCase();

        // Primary: Device Type
        if (type.includes('server')) return 'server';
        if (type.includes('router') || type.includes('gateway') || type.includes('wap')) return 'router';
        if (type.includes('phone') || type.includes('mobile')) return 'mobile';

        // Fallback: OS Family
        if (os.includes('server') || os.includes('linux')) return 'server';
        if (os.includes('ios') || os.includes('android')) return 'mobile';
        if (os.includes('cisco') || os.includes('bsd')) return 'router';

        return 'desktop';
    };

    const getNodeColor = (node) => {
        if (node.id === 'hub') return '#38bdf8'; // cyber-accent
        if (node.vulnCount > 0) return '#ef4444'; // cyber-danger
        return '#10b981'; // cyber-success
    };

    const handleNodeClick = useCallback(node => {
        setSelectedNode(node);
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y);

        fgRef.current.centerAt(
            node.x * distRatio,
            node.y * distRatio,
            1200 // Smoother transition
        );
        fgRef.current.zoom(3.5, 2000);
    }, [fgRef]);

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[600px] glass-card border-dashed">
            <Loader className="h-10 w-10 text-cyber-neon animate-spin mb-4" />
            <span className="text-[10px] font-black text-cyber-neon/60 animate-pulse tracking-[0.3em] uppercase">Mapping Neural Network...</span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in relative z-10">
            {/* Graph Container */}
            <div className="lg:col-span-2 glass-card border-white/5 overflow-hidden relative" style={{ height: '600px' }}>
                <div className="absolute top-6 left-6 z-20">
                    <div className="px-4 py-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-glass">
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyber-accent shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Gateway Hub</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyber-success shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Operational</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyber-danger shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Infected</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                    <button
                        onClick={() => fgRef.current.zoomToFit(400)}
                        className="p-3 bg-black/60 backdrop-blur-md hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all hover:shadow-neon"
                        title="Zoom to Fit"
                    >
                        <ZoomOut className="h-4 w-4 text-cyber-neon" />
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-3 bg-black/60 backdrop-blur-md hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all hover:shadow-neon"
                        title="Refresh Stream"
                    >
                        <RefreshCw className="h-4 w-4 text-cyber-neon" />
                    </button>
                </div>

                <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel={(node) => `
                        <div class="p-2 bg-black/80 border border-white/10 rounded-lg backdrop-blur-md">
                            <div class="text-[10px] font-black text-cyber-neon mb-1 uppercase tracking-tighter">${node.name}</div>
                            <div class="text-[8px] text-gray-400 font-mono">${node.ip || 'INTERNAL HUB'}</div>
                        </div>
                    `}
                    nodeColor={getNodeColor}
                    nodeRelSize={7}
                    linkColor={() => 'rgba(56, 189, 248, 0.1)'}
                    linkWidth={1}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.005}
                    backgroundColor="#020617"
                    onNodeClick={handleNodeClick}
                    d3VelocityDecay={0.3}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        // SAFETY CHECK: Don't render if positions aren't set yet (prevents blank screen crash)
                        if (node.x === undefined || node.y === undefined) return;

                        const label = node.name;
                        const fontSize = 10 / globalScale;
                        const nodeColor = getNodeColor(node);
                        const size = node.val * 0.8;

                        // 1. Draw Outer Hexagonal Frame
                        ctx.beginPath();
                        for (let i = 0; i < 6; i++) {
                            const angle = (i * Math.PI) / 3;
                            const x = node.x + (size * 1.2) * Math.cos(angle);
                            const y = node.y + (size * 1.2) * Math.sin(angle);
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                        ctx.strokeStyle = `${nodeColor}44`;
                        ctx.lineWidth = 2 / globalScale;
                        ctx.stroke();

                        // 2. Animated Scanning Ring (Simulated with time)
                        const t = Date.now() / 1000;
                        const pulsate = Math.sin(t * 3) * 0.2 + 1;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size * (1.1 + pulsate * 0.1), 0, 2 * Math.PI);
                        ctx.strokeStyle = `${nodeColor}22`;
                        ctx.stroke();

                        // 3. Node Core (Gradient)
                        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size);
                        gradient.addColorStop(0, nodeColor);
                        gradient.addColorStop(1, `${nodeColor}66`);

                        ctx.fillStyle = gradient;
                        ctx.shadowColor = nodeColor;
                        ctx.shadowBlur = 10 / globalScale;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        // 4. Inner Detail (Small crosshair or symbol)
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                        ctx.lineWidth = 1 / globalScale;
                        ctx.beginPath();
                        ctx.moveTo(node.x - size / 3, node.y); ctx.lineTo(node.x + size / 3, node.y);
                        ctx.moveTo(node.x, node.y - size / 3); ctx.lineTo(node.x, node.y + size / 3);
                        ctx.stroke();

                        // 5. Label Rendering
                        if (globalScale > 2 || selectedNode?.id === node.id) {
                            ctx.font = `bold ${fontSize}px "Outfit", sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';

                            const textY = node.y + size + (fontSize * 1.5);

                            // Futuristic Label Background
                            const textWidth = ctx.measureText(label).width;
                            ctx.fillStyle = 'rgba(2, 6, 23, 0.8)';
                            ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
                            ctx.beginPath();
                            ctx.roundRect(node.x - textWidth / 2 - 6, textY - fontSize, textWidth + 12, fontSize * 2, 4);
                            ctx.fill();
                            ctx.stroke();

                            ctx.fillStyle = '#fff';
                            ctx.fillText(label, node.x, textY);
                        }
                    }}
                />
            </div>

            {/* Details Panel */}
            <div className={`transition-all duration-500 ${selectedNode && selectedNode.id !== 'hub' ? 'col-span-1 opacity-100 translate-x-0' : 'hidden lg:block lg:col-span-1 lg:opacity-20 translate-x-4 pointer-events-none'}`}>
                {selectedNode && selectedNode.id !== 'hub' ? (
                    <AssetDetailPanel
                        node={selectedNode}
                        onClose={() => {
                            setSelectedNode(null);
                            fgRef.current.zoomToFit(600);
                        }}
                    />
                ) : (
                    <div className="h-full glass-card border-dashed border-white/5 flex flex-col justify-center items-center text-center p-10 group/empty">
                        <div className="p-6 bg-white/5 rounded-full mb-6 group-hover/empty:scale-110 transition-transform duration-500">
                            <Move className="h-10 w-10 text-cyber-neon/40 group-hover/empty:text-cyber-neon transition-colors" />
                        </div>
                        <h3 className="text-white font-black text-xl mb-4 tracking-tighter uppercase">Infrastructure Insight</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-medium">
                            Synthesizing network topology... Click any <span className="text-cyber-neon">Node</span> to initiate high-resolution deep packet inspection.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkTopology;
