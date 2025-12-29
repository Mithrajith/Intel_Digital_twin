import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertTriangle, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';

export function Overview() {
    const [state, setState] = useState(null);
    const [health, setHealth] = useState(null);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Machine State
                const stateRes = await fetch('http://localhost:8000/machine/state');
                if (stateRes.ok) setState(await stateRes.json());

                // Fetch Health Prediction
                const healthRes = await fetch('http://localhost:8000/machine/health');
                if (healthRes.ok) setHealth(await healthRes.json());

                // Fetch Recent Logs
                const logsRes = await fetch('http://localhost:8000/logs?limit=3');
                if (logsRes.ok) setLogs(await logsRes.json());

            } catch (error) {
                console.error("Failed to fetch overview data", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    // Derived values
    const healthScore = health ? Math.max(0, 100 - (health.anomaly_score * 50) - (health.failure_probability * 50)).toFixed(0) : 100;
    const runtimeHours = state ? (state.uptime_seconds / 3600).toFixed(1) : "0";
    const loadPercent = state ? Math.min(100, Math.round(state.power_consumption / 10)).toFixed(0) : "0"; // Mock scale for now
    const vibration = state ? state.vibration_level.toFixed(3) : "0.000";
    const temperature = state ? state.temperature_core.toFixed(1) : "0.0";
    const nextMaintenance = health ? Math.max(0, (health.rul_hours / 24)).toFixed(1) : "0";
    const predictedFailures = health ? (health.failure_probability > 0.5 ? 1 : 0) : 0;

    // Status color
    const statusColor = healthScore > 80 ? "text-green-500" : healthScore > 50 ? "text-yellow-500" : "text-red-500";
    const borderColor = healthScore > 80 ? "border-green-500" : healthScore > 50 ? "border-yellow-500" : "border-red-500";
    const variant = healthScore > 80 ? "success" : healthScore > 50 ? "warning" : "destructive";
    const statusText = healthScore > 80 ? "Normal" : healthScore > 50 ? "Warning" : "Critical";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Machine Overview</h1>
                    <p className="text-muted-foreground mt-1">Status of 2-axis robotic arm #RA-204 (Live)</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant={healthScore > 80 ? "success" : "warning"} className="text-sm px-3 py-1">
                        Status: {healthScore > 80 ? "Normal" : "Attention Needed"}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Main Health Score */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 p-6 rounded-lg border border-border bg-card flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-medium text-muted-foreground mb-4">Overall Health Score</h3>
                    <div className="relative flex items-center justify-center">
                        <div className={`h-40 w-40 rounded-full border-8 border-current opacity-20 flex items-center justify-center ${statusColor}`}>
                            <span className={`text-5xl font-bold ${statusColor}`}>{healthScore}</span>
                        </div>
                        {/* Simple decoration for the gauge */}
                        <div className={`absolute h-40 w-40 rounded-full border-8 ${borderColor} border-t-transparent border-l-transparent border-r-transparent rotate-45 transition-all duration-500`} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-5xl font-bold ${statusColor}`}>{healthScore}</span>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">System Health Condition</p>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Runtime Hours"
                        value={runtimeHours}
                        unit="h"
                        icon={Clock}
                        trend="up"
                        trendValue="Active"
                    />
                    <MetricCard
                        title="Current Load"
                        value={loadPercent}
                        unit="%"
                        icon={Zap}
                        trend="flat"
                        trendValue="Stable"
                    />
                    <MetricCard
                        title="Vibration Level"
                        value={vibration}
                        unit="g"
                        icon={Activity}
                        trend={parseFloat(vibration) > 1.0 ? "up" : "flat"}
                        trendValue={parseFloat(vibration) > 1.0 ? "High" : "Normal"}
                        status={parseFloat(vibration) > 2.0 ? "warning" : "success"}
                    />
                    <MetricCard
                        title="Core Temp"
                        value={temperature}
                        unit="°C"
                        icon={TrendingUp}
                        trend={parseFloat(temperature) > 60 ? "up" : "flat"}
                        trendValue={parseFloat(temperature) > 60 ? "Heating" : "Stable"}
                    />
                    <MetricCard
                        title="Next Maintenance"
                        value={nextMaintenance}
                        unit="days"
                        icon={CheckCircle}
                        status={nextMaintenance < 100 ? "warning" : "success"}
                    />
                    <MetricCard
                        title="Predicted Failures"
                        value={predictedFailures}
                        icon={AlertTriangle}
                        status={predictedFailures > 0 ? "destructive" : "success"}
                    />
                </div>
            </div>

            {/* Recent Alerts (Mini) */}
            <div className="rounded-lg border border-border bg-card">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Recent System Events</h3>
                </div>
                <div className="divide-y divide-border">
                    {health && health.alerts && health.alerts.length > 0 ? (
                        health.alerts.slice(0, 3).map((alert, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${alert.type === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                    <span className="text-sm">{alert.message}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Just now</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            No recent alerts. System nominal.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
