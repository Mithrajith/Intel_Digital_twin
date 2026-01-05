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
import { AnalyticsSection } from '../components/analytics/AnalyticsSection';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function Dashboard() {
    const [isPlaying, setIsPlaying] = useState(true);
    const { refreshRate } = useChartRefreshRate();
    const [machines, setMachines] = useState([]);
    const [selectedMachineId, setSelectedMachineId] = useState('armpi_fpv_01');
    const [healthData, setHealthData] = useState(null);
    const [shapData, setSHAPData] = useState(null);

    const data = useSimulatedSensor(isPlaying, refreshRate, selectedMachineId);
    const { shap, loading: shapLoading, error: shapError, fetchSHAP } = useSHAPExplanation();

    // Static sensor configuration
    const sensors = {
        temperature: { label: 'Temperature', dataKey: 'temperature', unit: '°C', threshold: 60 },
        vibration: { label: 'Vibration', dataKey: 'vibration', unit: 'g', threshold: 2.5 },
        torque: { label: 'Torque', dataKey: 'torque', unit: 'Nm', threshold: 35 },
        jointAngle: { label: 'Joint Angle', dataKey: 'jointAngle', unit: '°', threshold: 80 }
    };

    useEffect(() => {
        // Fetch available machines from backend only
        const fetchMachines = async () => {
            try {
                const response = await fetch('http://localhost:7000/machines');
                if (response.ok) {
                    const machineList = await response.json();
                    setMachines(machineList);
                } else {
                    console.error("Backend offline, no machines available");
                    setMachines([]);
                }
            } catch (error) {
                console.error("Could not fetch machines", error);
                setMachines([]);
            }
        };

        // Fetch health data for predictions
        const fetchHealthData = async () => {
            try {
                const response = await fetch('http://localhost:7000/machine/health');
                if (response.ok) {
                    const health = await response.json();
                    setHealthData(health);
                    
                    // Fetch SHAP explanations if we have sensor data
                    if (data.length > 0) {
                        const latest = data[data.length - 1];
                        fetchSHAP({
                            temperature: latest.temperature || 25,
                            vibration: latest.vibration || 0,
                            power: latest.power || 0,
                            velocity: latest.velocity || 0,
                            torque: latest.torque || 0
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch health data", error);
            }
        };

        fetchMachines();
        fetchHealthData();
        
        // Poll health data regularly
        const healthInterval = setInterval(fetchHealthData, 5000);
        return () => clearInterval(healthInterval);
    }, [data, fetchSHAP]);

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
        if (data.length === 0) return "--";
        const latest = data[data.length - 1];
        const value = latest[key];
        if (value === undefined || value === null || isNaN(value)) return "--";
        return Number(value).toFixed(2);
    };

    const getHealthValue = (key, fallback = "--") => {
        if (!healthData) return fallback;
        const value = healthData[key];
        if (value === undefined || value === null || isNaN(value)) return fallback;
        return value;
    };

    const handleExplain = () => {
        if (data.length > 0) {
            const latestData = data[data.length - 1];
            const features = latestData.raw ? latestData.raw : {
                temperature: latestData.temperature || 25,
                vibration: latestData.vibration || 0,
                power: latestData.power || 0,
                velocity: latestData.velocity || 0,
                torque: latestData.torque || 0
            };
            fetchSHAP(features);
        }
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
                    value={getHealthValue('anomaly_score', 0).toFixed(3)}
                    unit=""
                    status={getHealthValue('anomaly_score', 0) > 0.7 ? 'warning' : 'neutral'}
                    className="border-blue-500/50 bg-blue-500/5"
                />
                <MetricCard
                    title="Failure Probability"
                    value={(getHealthValue('failure_probability', 0) * 100).toFixed(1)}
                    unit="%"
                    status={getHealthValue('failure_probability', 0) > 0.5 ? 'error' : 'neutral'}
                    className="border-red-500/50 bg-red-500/5"
                />
                <MetricCard
                    title="Remaining Useful Life"
                    value={getHealthValue('rul_hours', 0).toFixed(0)}
                    unit="hrs"
                    status={getHealthValue('rul_hours', 1000) < 50 ? 'warning' : 'neutral'}
                    className="border-green-500/50 bg-green-500/5"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(sensors).map(([key, sensor], index) => (
                    <MetricCard
                        key={key}
                        title={sensor.label}
                        value={getLatestValue(sensor.dataKey)}
                        unit={sensor.unit}
                        status={sensor.threshold && Number(getLatestValue(sensor.dataKey)) > sensor.threshold ? 'warning' : 'neutral'}
                    />
                ))}
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
            
            {/* Analytics Section */}
            <div className="mt-6">
                <AnalyticsSection data={data} machineId={selectedMachineId} />
            </div>
        </div>
    );
}
