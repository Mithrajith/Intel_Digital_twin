import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Box, Zap, Layers, Activity } from 'lucide-react';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';
import { RobotScene } from '../components/3d/RobotArm';

export function Simulation() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(1);
    // Get live data to drive the simulation
    const data = useSimulatedSensor(isPlaying, 50); // Faster update for smooth animation

    // Extract joint angles from data
    const latest = data.length > 0 ? data[data.length - 1] : {};
    
    // Map sensor data to joint angles (fallback to 0 if missing)
    // Note: Backend sends 'joint_1_angle' etc. in raw object, but useSimulatedSensor might map it differently
    // Let's check the raw data structure from useSimulatedSensor
    const raw = latest.raw || {};
    
    const jointAngles = {
        joint_1: raw.joint_1_angle !== undefined ? raw.joint_1_angle : 0,
        joint_2: raw.joint_2_angle !== undefined ? raw.joint_2_angle : -15,
        joint_3: raw.joint_3_angle !== undefined ? raw.joint_3_angle : 45,
        joint_4: raw.joint_4_angle !== undefined ? raw.joint_4_angle : 30,
        joint_5: raw.joint_5_angle !== undefined ? raw.joint_5_angle : 0
    };

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
                {/* Main 3D Viewport */}
                <div className="lg:col-span-2 bg-black/40 rounded-lg border border-border relative overflow-hidden flex items-center justify-center min-h-[500px]">
                    <RobotScene jointAngles={jointAngles} />
                    
                    {/* Overlay Info */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-2 rounded text-xs text-white font-mono">
                        <div>J1: {jointAngles.joint_1.toFixed(1)}°</div>
                        <div>J2: {jointAngles.joint_2.toFixed(1)}°</div>
                        <div>J3: {jointAngles.joint_3.toFixed(1)}°</div>
                        <div>J4: {jointAngles.joint_4.toFixed(1)}°</div>
                        <div>J5: {jointAngles.joint_5.toFixed(1)}°</div>
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
                                <span className="text-muted-foreground">Joint 1 Angle</span>
                                <span className="font-mono">{jointAngles.joint_1.toFixed(1)}°</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Joint 2 Angle</span>
                                <span className="font-mono">{jointAngles.joint_2.toFixed(1)}°</span>
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
