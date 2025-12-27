import React, { useState, useEffect } from 'react';
import { Play, Pause, Activity, Zap, Thermometer, Wifi, Server } from 'lucide-react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { MetricCard } from '../components/common/MetricCard';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function Dashboard() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [machines, setMachines] = useState([]);
    const [selectedMachineId, setSelectedMachineId] = useState('robot_01');
    
    const data = useSimulatedSensor(isPlaying, 1000, selectedMachineId);

    useEffect(() => {
        // Fetch available machines from backend
        const fetchMachines = async () => {
            try {
                const response = await fetch('http://localhost:8000/machines');
                if (response.ok) {
                    const machineList = await response.json();
                    setMachines(machineList);
                } else {
                    // Fallback if backend is offline
                    setMachines([
                        { id: 'robot_01', type: 'robotic_arm' },
                        { id: 'cnc_01', type: 'cnc_milling' },
                        { id: 'conveyor_01', type: 'conveyor_belt' }
                    ]);
                }
            } catch (error) {
                console.warn("Could not fetch machines, using defaults", error);
                setMachines([
                    { id: 'robot_01', type: 'robotic_arm' },
                    { id: 'cnc_01', type: 'cnc_milling' },
                    { id: 'conveyor_01', type: 'conveyor_belt' }
                ]);
            }
        };
        fetchMachines();
    }, []);

    const [visibleSensors, setVisibleSensors] = useState({
        jointAngle: true,
        torque: true,
        temperature: true,
        vibration: true,
    });

    const toggleSensor = (sensor) => {
        setVisibleSensors(prev => ({ ...prev, [sensor]: !prev[sensor] }));
    };

    const getLatestValue = (key) => {
        if (data.length === 0) return 0;
        return Number(data[data.length - 1][key]).toFixed(2);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Condition Monitoring</h1>
                    <p className="text-muted-foreground mt-1">Real-time sensor telemetry from {selectedMachineId}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-blue-500/10 p-1 rounded-md border border-blue-500/20">
                        <Server className="h-4 w-4 ml-2 text-blue-500" />
                        <select 
                            value={selectedMachineId}
                            onChange={(e) => {
                                setSelectedMachineId(e.target.value);
                                setIsPlaying(false); // Stop stream when changing machine
                            }}
                            className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer py-1 pr-8 text-blue-700 font-medium"
                        >
                            {machines.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.id.toUpperCase()} ({m.type.replace('_', ' ')})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                            isPlaying
                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        )}
                    >
                        {isPlaying ? <><Pause className="h-4 w-4" /> Stop Stream</> : <><Play className="h-4 w-4" /> Start Stream</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Joint Angle"
                    value={getLatestValue('jointAngle')}
                    unit="°"
                    status="neutral"
                />
                <MetricCard
                    title="Motor Torque"
                    value={getLatestValue('torque')}
                    unit="Nm"
                    icon={Zap}
                />
                <MetricCard
                    title="Temperature"
                    value={getLatestValue('temperature')}
                    unit="°C"
                    icon={Thermometer}
                    status={Number(getLatestValue('temperature')) > 50 ? 'warning' : 'neutral'}
                />
                <MetricCard
                    title="Vibration"
                    value={getLatestValue('vibration')}
                    unit="g"
                    icon={Activity}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {visibleSensors.jointAngle && (
                    <TimeSeriesChart
                        title="Joint Relative Angle"
                        data={data}
                        dataKey="jointAngle"
                        color="#3b82f6"
                        yDomain={[0, 90]}
                        threshold={80}
                    />
                )}
                {visibleSensors.torque && (
                    <TimeSeriesChart
                        title="Motor Torque output"
                        data={data}
                        dataKey="torque"
                        color="#f59e0b"
                        yDomain={[0, 40]}
                        threshold={35}
                    />
                )}
                {visibleSensors.temperature && (
                    <TimeSeriesChart
                        title="Core Temperature"
                        data={data}
                        dataKey="temperature"
                        color="#ef4444"
                        yDomain={[20, 100]}
                        threshold={60}
                    />
                )}
                {visibleSensors.vibration && (
                    <TimeSeriesChart
                        title="Vibration Sensor (X-Axis)"
                        data={data}
                        dataKey="vibration"
                        color="#10b981"
                        yDomain={[0, 5]}
                        threshold={3}
                    />
                )}
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-card border border-border">
                <h3 className="text-sm font-medium my-auto mr-4">Data Channels:</h3>
                {Object.keys(visibleSensors).map(key => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                        <input
                            type="checkbox"
                            checked={visibleSensors[key]}
                            onChange={() => toggleSensor(key)}
                            className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                        />
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                ))}
            </div>
        </div>
    );
}
