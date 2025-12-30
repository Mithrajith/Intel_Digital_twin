import React, { useState, useEffect } from 'react';
import { Play, Pause, Activity, Zap, Thermometer, Wifi, Server } from 'lucide-react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { MetricCard } from '../components/common/MetricCard';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SHAPBarChart } from '../components/charts/SHAPBarChart';
import { useSHAPExplanation } from '../hooks/useSHAPExplanation';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function Dashboard() {
    const [isPlaying, setIsPlaying] = useState(true);
    const { refreshRate } = useChartRefreshRate();
    const [machines, setMachines] = useState([]);
    const [selectedMachineId, setSelectedMachineId] = useState('robot_01');

    const data = useSimulatedSensor(isPlaying, refreshRate, selectedMachineId);

    useEffect(() => {
        // Fetch available machines from backend only
        const fetchMachines = async () => {
            try {
                const response = await fetch('http://localhost:8000/machines');
                if (response.ok) {
                    const machineList = await response.json();
                    setMachines(machineList);
                } else {
                    // Fallback if backend is offline
                    console.error("Backend offline, no machines available");
                    setMachines([]);
                }
            } catch (error) {
                console.error("Could not fetch machines", error);
                setMachines([]);
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

    // SHAP explainability
    const { shap, loading: shapLoading, error: shapError, fetchSHAP } = useSHAPExplanation();

    const handleExplain = () => {
        if (data.length > 0) {
            const latestData = data[data.length - 1];
            // Use raw data if available (from WebSocket), otherwise construct from mapped fields
            // Send full raw data so backend can reconstruct all features (including joint velocities/torques)
            const features = latestData.raw ? latestData.raw : {
                temperature_core: latestData.temperature,
                vibration_level: latestData.vibration,
                power_consumption: latestData.torque, // Mapped from torque in hook
                joint_1_angle: latestData.jointAngle
            };
            fetchSHAP(features);
        }
        // Map frontend data to backend feature names
        // Backend expects: temperature, vibration, power, velocity, torque, angle
        const features = {
            angle: latestData.jointAngle || 0,
            temperature: latestData.temperature || 0,
            vibration: latestData.vibration || 0,
            power: latestData.torque || 0, // In useSimulatedSensor, torque is mapped from power/load
            torque: latestData.torque || 0, // Using same value for proxy
            velocity: 0 // Velocity not visualized in this dashboard card set
        };
        fetchSHAP(features);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Predictive Health</h1>
                    <p className="text-muted-foreground mt-1">Real-time AI analysis & sensor telemetry from {selectedMachineId}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-blue-500/10 p-1 rounded-md border border-blue-500/20">
                        <Server className="h-4 w-4 ml-2 text-blue-500" />
                        {machines.length > 0 ? (
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
                        ) : (
                            <span className="text-red-500 text-sm ml-2">No machines available</span>
                        )}
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

            {/* ML Predictions Panel - Promoted to Top */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Anomaly Score"
                    value={getLatestValue('anomaly_score')}
                    unit=""
                    status={Number(getLatestValue('anomaly_score')) > 0.7 ? 'warning' : 'neutral'}
                    className="border-blue-500/50 bg-blue-500/5"
                />
                <MetricCard
                    title="Failure Probability"
                    value={(Number(getLatestValue('failure_probability')) * 100).toFixed(1)}
                    unit="%"
                    status={Number(getLatestValue('failure_probability')) > 0.5 ? 'error' : 'neutral'}
                    className="border-red-500/50 bg-red-500/5"
                />
                <MetricCard
                    title="Remaining Useful Life"
                    value={getLatestValue('rul_hours')}
                    unit="hrs"
                    status={Number(getLatestValue('rul_hours')) < 50 ? 'warning' : 'neutral'}
                    className="border-green-500/50 bg-green-500/5"
                />
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

            {/* SHAP Explainability Panel */}
            <div className="my-6">
                <button
                    onClick={handleExplain}
                    className="mb-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                    disabled={shapLoading}
                >
                    {shapLoading ? 'Explaining...' : 'Explain Latest Prediction'}
                </button>
                {shapError && <div className="text-red-500 text-xs mb-2">{shapError}</div>}
                {shap && shap.shap_values && shap.feature_names && (
                    <SHAPBarChart
                        shapValues={shap.shap_values[0]}
                        featureNames={shap.feature_names}
                        baseValue={Array.isArray(shap.base_value) ? shap.base_value[1] : shap.base_value}
                    />
                )}
            </div>
        </div>
    );
}
