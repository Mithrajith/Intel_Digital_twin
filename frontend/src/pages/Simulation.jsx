import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Box, Zap, Layers, Activity } from 'lucide-react';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';

export function Simulation() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(1);
    // Get live data to drive the simulation
    const data = useSimulatedSensor(isPlaying, 50); // Faster update for smooth animation

    const currentAngle = data.length > 0 ? data[data.length - 1].jointAngle : 45;
    const latest = data.length > 0 ? data[data.length - 1] : {};
    const temp = latest.temperature || 0;
    const vib = latest.vibration || 0;
    const torque = latest.torque || 0;
    const failureProb = latest.failure_probability || 0;

    // Determine failing part logic
    let failingPart = null;
    let failureReason = "";
    
    // Logic: If failure probability is significant, identify the contributor
    if (failureProb > 0.2) {
        if (temp > 60) {
            failingPart = 'motor'; // Base Joint
            failureReason = "Overheating";
        } else if (vib > 2.0) {
            failingPart = 'link2'; // Arm Link
            failureReason = "Structural Vibration";
        } else if (torque > 30) {
            failingPart = 'joint2'; // Elbow Joint
            failureReason = "Gearbox Strain";
        }
    }

    // Calculate arm position based on angle
    // Simple 2-link arm kinematics for visualization
    const origin = { x: 200, y: 300 };
    const L1 = 120;
    const L2 = 100;

    // Angle for Link 1 (Base) - let's make it slowly oscillate or static
    const theta1 = -90 * (Math.PI / 180); // Upward
    const p1 = {
        x: origin.x + L1 * Math.cos(theta1),
        y: origin.y + L1 * Math.sin(theta1)
    };

    // Angle for Link 2 (Joint) - Driven by sensor data (offset by currentAngle)
    // Map 0-90 degrees to physical angle
    const theta2 = (currentAngle - 90) * (Math.PI / 180);
    const p2 = {
        x: p1.x + L2 * Math.cos(theta2 + theta1), // Relative to link 1
        y: p1.y + L2 * Math.sin(theta2 + theta1)
    };

    // Helper for colors
    const getPartColor = (partName, defaultColor) => {
        if (failingPart === partName) return '#ef4444'; // Red for failure
        return defaultColor;
    };
    
    const getPartClass = (partName) => {
        if (failingPart === partName) return "animate-pulse";
        return "";
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Digital Twin Simulation</h1>
                    <p className="text-muted-foreground mt-1">Real-time kinematic mirror & Failure Localization</p>
                </div>
                <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={() => {
                            setIsPlaying(true);
                            setSpeed(1);
                        }}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title="Refresh Simulation"
                    >
                        <RotateCcw className="h-5 w-5" />
                    </button>
                    <div className="h-6 w-px bg-border mx-1" />
                    <span className="text-sm font-medium px-2">Speed: {speed}x</span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Main 3D/2D Viewport */}
                <div className="lg:col-span-2 bg-black/40 rounded-lg border border-border relative overflow-hidden flex items-center justify-center">
                    {/* Grid Background */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />

                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        <svg width="400" height="400" viewBox="0 0 400 400" className="overflow-visible">
                            {/* Base */}
                            <path d="M 150 350 L 250 350 L 230 300 L 170 300 Z" fill="#1f2937" stroke="#374151" strokeWidth="2" />

                            {/* Link 1 */}
                            <line
                                x1={origin.x} y1={origin.y}
                                x2={p1.x} y2={p1.y}
                                stroke="#4b5563"
                                strokeWidth="20"
                                strokeLinecap="round"
                            />

                            {/* Joint 1 (Motor) */}
                            <circle 
                                cx={origin.x} cy={origin.y} r="18" 
                                fill={getPartColor('motor', '#374151')} 
                                stroke="#9ca3af" strokeWidth="2"
                                className={getPartClass('motor')}
                            />
                            <text x={origin.x + 25} y={origin.y} fill="white" fontSize="10" opacity="0.5">Base Motor</text>

                            {/* Link 2 (The one moving) */}
                            <line
                                x1={p1.x} y1={p1.y}
                                x2={p2.x} y2={p2.y}
                                stroke={getPartColor('link2', '#4b5563')}
                                strokeWidth="16"
                                strokeLinecap="round"
                                className={`transition-colors duration-300 ${getPartClass('link2')}`}
                            />

                            {/* Joint 2 */}
                            <circle 
                                cx={p1.x} cy={p1.y} r="14" 
                                fill={getPartColor('joint2', '#374151')} 
                                stroke="#9ca3af" strokeWidth="2" 
                                className={getPartClass('joint2')}
                            />
                            <text x={p1.x + 20} y={p1.y} fill="white" fontSize="10" opacity="0.5">Elbow Joint</text>

                            {/* End Effector */}
                            <circle cx={p2.x} cy={p2.y} r="8" fill="#ef4444" />

                            {/* Failure Indicator Label on Model */}
                            {failingPart && (
                                <g>
                                    <rect x="280" y="50" width="110" height="60" rx="4" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" />
                                    <text x="290" y="70" fill="#ef4444" fontWeight="bold" fontSize="12">⚠ FAILURE RISK</text>
                                    <text x="290" y="90" fill="white" fontSize="10">Part: {failingPart.toUpperCase()}</text>
                                    <text x="290" y="102" fill="white" fontSize="10">Reason: {failureReason}</text>
                                </g>
                            )}
                        </svg>
                    </div>

                    {/* Overlay Info */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm p-3 rounded-md border border-white/10 text-xs font-mono">
                        <div>FPS: 60</div>
                        <div>Physics: Active</div>
                        <div>Sync: <span className="text-green-500">Live</span></div>
                    </div>
                </div>

                {/* Sidebar Controls/Stats */}
                <div className="space-y-4 overflow-y-auto">
                    {/* Diagnostics Panel */}
                    <div className={`p-4 rounded-lg border ${failingPart ? 'bg-red-500/10 border-red-500/50' : 'bg-card border-border'}`}>
                        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${failingPart ? 'text-red-500' : ''}`}>
                            <Activity className="h-4 w-4" /> Real-time Diagnostics
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">System Status</span>
                                <span className={`text-sm font-bold ${failingPart ? 'text-red-500' : 'text-green-500'}`}>
                                    {failingPart ? 'CRITICAL' : 'NOMINAL'}
                                </span>
                            </div>
                            {failingPart && (
                                <div className="bg-red-500/20 p-3 rounded text-xs text-red-200">
                                    Detected anomaly in <strong>{failingPart.toUpperCase()}</strong> due to {failureReason.toLowerCase()}.
                                    Recommended action: Inspect immediately.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Layers className="h-4 w-4" /> Simulation Layers
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" defaultChecked className="rounded border-gray-600" />
                                Show Wireframe
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" defaultChecked className="rounded border-gray-600" />
                                Stress Heatmap
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" className="rounded border-gray-600" />
                                Show Trajectory
                            </label>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Box className="h-4 w-4" /> Object Properties
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Joint Angle</span>
                                <span className="font-mono">{currentAngle.toFixed(1)}°</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Angular Velocity</span>
                                <span className="font-mono">12.4 rad/s</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payload Mass</span>
                                <span className="font-mono">2.5 kg</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Zap className="h-4 w-4" /> Physics Engine
                        </h3>
                        <div className="text-sm text-muted-foreground">
                            Using Verlet integration for rigid body dynamics.
                            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[75%]" />
                            </div>
                            <div className="flex justify-between mt-1 text-xs">
                                <span>Load</span>
                                <span>75%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
