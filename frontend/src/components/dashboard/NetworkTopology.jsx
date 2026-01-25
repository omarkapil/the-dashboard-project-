import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { scanService } from '../../services/api';
import { Loader, Move, ZoomIn, ZoomOut, RefreshCw, Smartphone, Server, Monitor, Radio, Shield } from 'lucide-react';

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
                const latest = scans.sort((a, b) => b.id - a.id)[0];
                const { data: details } = await scanService.getScanDetails(latest.id);
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
            name: 'PentesterFlow Hub',
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
        if (type.includes('server')) return 'server';
        if (type.includes('mobile')) return 'mobile';
        if (type.includes('router') || type.includes('gateway')) return 'router';
        return 'desktop';
    };

    const getNodeColor = (node) => {
        if (node.id === 'hub') return '#06b6d4'; // Cyan
        if (node.vulnCount > 0) return '#ef4444'; // Red
        return '#22c55e'; // Green
    };

    const handleNodeClick = useCallback(node => {
        setSelectedNode(node);
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.centerAt(
            node.x * distRatio,
            node.y * distRatio,
            1000 // Transition ms
        );
        fgRef.current.zoom(3, 2000);
    }, [fgRef]);

    if (loading) return (
        <div className="flex justify-center items-center h-96 bg-gray-900 rounded-xl border border-gray-700">
            <Loader className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Graph Container */}
            <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden relative" style={{ height: '600px' }}>
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <div className="bg-gray-800/80 p-2 rounded-lg text-xs text-gray-300 backdrop-blur-sm border border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Gateway
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Secure
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Vulnerable
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                    <button onClick={() => fgRef.current.zoomToFit(400)} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600">
                        <ZoomOut className="h-4 w-4" />
                    </button>
                    <button onClick={fetchData} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>

                <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeColor={getNodeColor}
                    nodeRelSize={6}
                    linkColor={() => '#374151'} // gray-700
                    backgroundColor="#111827" // gray-900
                    onNodeClick={handleNodeClick}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Shadow
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                        ctx.fill();

                        ctx.fillStyle = getNodeColor(node);
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.val * 0.8, 0, 2 * Math.PI, false);
                        ctx.fill();

                        // Only draw text if focused
                        if (globalScale > 1.5 || selectedNode?.id === node.id) {
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#fff';
                            ctx.fillText(label, node.x, node.y + node.val + 2);
                        }
                    }}
                />
            </div>

            {/* Details Panel */}
            <div className="bg-cyber-light rounded-xl border border-gray-700 p-6 h-fit">
                {selectedNode && selectedNode.id !== 'hub' ? (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700">
                            <div className="p-3 bg-gray-800 rounded-lg">
                                {selectedNode.group === 'server' && <Server className="h-6 w-6 text-purple-400" />}
                                {selectedNode.group === 'mobile' && <Smartphone className="h-6 w-6 text-pink-400" />}
                                {selectedNode.group === 'desktop' && <Monitor className="h-6 w-6 text-blue-400" />}
                                {selectedNode.group === 'router' && <Radio className="h-6 w-6 text-yellow-400" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedNode.name}</h3>
                                <p className="text-gray-400 text-sm font-mono">{selectedNode.ip}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                <span className="text-gray-400">Security Status</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedNode.vulnCount > 0 ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                                    {selectedNode.vulnCount > 0 ? 'Compromised' : 'Secure'}
                                </span>
                            </div>

                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-2 mb-2 text-gray-400">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-sm font-bold uppercase">Vulnerabilities</span>
                                </div>
                                <div className="text-3xl font-bold text-white">{selectedNode.vulnCount}</div>
                                <p className="text-xs text-gray-500 mt-1">Found in last scan</p>
                            </div>

                            {selectedNode.details.os_name && (
                                <div className="p-4 rounded-xl border border-gray-700">
                                    <span className="text-gray-500 text-xs uppercase block mb-1">Operating System</span>
                                    <span className="text-white">{selectedNode.details.os_name}</span>
                                </div>
                            )}

                            {selectedNode.details.mac_address && (
                                <div className="p-4 rounded-xl border border-gray-700">
                                    <span className="text-gray-500 text-xs uppercase block mb-1">MAC Address</span>
                                    <span className="text-white font-mono">{selectedNode.details.mac_address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Move className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Select a node in the graph to view device details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkTopology;
