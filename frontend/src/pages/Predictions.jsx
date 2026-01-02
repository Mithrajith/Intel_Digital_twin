// import React from 'react';
// import { BrainCircuit, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
// import { Badge } from '../components/common/Badge';
// import { MetricCard } from '../components/common/MetricCard';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { MetricCard } from '../components/common/MetricCard';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';

export function Predictions() {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const response = await fetch('http://localhost:7000/machine/health');
                if (response.ok) {
                    const data = await response.json();
                    setHealthData(data);
                }
            } catch (error) {
                console.error("Failed to fetch health data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, []);

    if (loading && !healthData) {
        return <div className="p-6 text-center text-muted-foreground">Loading prediction models...</div>;
    }

    const probabilityPercent = healthData ? (healthData.failure_probability * 100).toFixed(1) : 0;
    const rulCycles = healthData ? Math.round(healthData.rul_hours) : 0;
    const anomalyCount = healthData ? (healthData.anomaly_score > 0.7 ? 1 : 0) : 0;
    const statusColor = healthData?.failure_probability > 0.5 ? "text-red-500" : "text-green-500";
    const statusText = healthData?.failure_probability > 0.5 ? "Critical Risk Detected" : "System Normal";

    // Derived values to fix ReferenceErrors
    const isHealthy = healthData?.failure_probability < 0.5;
    const anomalyScore = healthData?.anomaly_score || 0;
    const radius = 84;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Predictive Health</h1>
                    <p className="text-muted-foreground mt-1">Machine Learning Analysis Model v2.4 (XGBoost)</p>
                </div>
                <Badge variant={isHealthy ? "success" : "warning"} className="text-sm px-3 py-1">
                    Confidence Score: 98.2%
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Probability Box */}
                <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center text-center justify-center min-h-[300px]">
                    <h3 className="text-lg font-medium text-muted-foreground mb-6">Failure Probability (Next 24h)</h3>
                    <div className="relative mb-6">
                        <svg className="h-48 w-48 transform -rotate-90">
                            <circle
                                className="text-muted/20"
                                strokeWidth="12"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="96"
                                cy="96"
                            />
                            <circle
                                className={statusColor}
                                strokeWidth="12"
                                strokeDasharray={90 * 2 * Math.PI}
                                strokeDashoffset={90 * 2 * Math.PI * (1 - (healthData?.failure_probability || 0))}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="96"
                                cy="96"
                                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                            />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <span className={`text-5xl font-bold ${statusColor}`}>{probabilityPercent}%</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        {statusText}. Based on real-time sensor fusion analysis.
                    </p>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <MetricCard
                        title="Remaining Useful Life"
                        value={rulCycles}
                        unit="hours"
                        icon={ShieldCheck}
                        status={rulCycles < 50 ? "warning" : "success"}
                    />
                    <MetricCard
                        title="Anomaly Score"
                        value={healthData?.anomaly_score?.toFixed(3) || "0.000"}
                        icon={AlertTriangle}
                        status={healthData?.anomaly_score > 0.7 ? "warning" : "success"}
                    />
                    <MetricCard
                        title="Model Accuracy"
                        value="99.1"
                        unit="%"
                        icon={BrainCircuit}
                    />
                    <MetricCard
                        title="Drift Detected"
                        value={anomalyScore > 0.8 ? "Yes" : "None"}
                        icon={HelpCircle}
                        status={anomalyScore > 0.8 ? "warning" : "neutral"}
                    />
                </div>
            </div>

            {/* Component Risk Heatmap */}
            <h3 className="text-lg font-semibold mt-8 mb-4">Component Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(healthData?.component_health || {}).map(([component, health]) => (
                    <div key={component} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                        <span className="font-medium capitalize">{component.replace('_', ' ')}</span>
                        <Badge variant={health < 0.5 ? "destructive" : "success"}>
                            {health < 0.5 ? "High Risk" : "Healthy"}
                        </Badge>
                    </div>
                ))}
                {Object.keys(healthData?.component_health || {}).length === 0 && (
                    <div className="p-4 text-muted-foreground">No component data available</div>
                )}
            </div>
        </div>
    );
}
