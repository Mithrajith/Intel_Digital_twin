import React from 'react';
import { BrainCircuit, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { MetricCard } from '../components/common/MetricCard';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';

export function Predictions() {
    const { refreshRate } = useChartRefreshRate();
    const data = useSimulatedSensor(true, refreshRate);
    
    const latest = data.length > 0 ? data[data.length - 1] : {};
    const failureProb = latest.failure_probability || 0;
    const rul = latest.rul_hours || 0;
    const anomalyScore = latest.anomaly_score || 0;
    
    // Calculate circle offset
    const radius = 90;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference * (1 - failureProb);
    
    const isHealthy = failureProb < 0.5 && anomalyScore < 0.7;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Predictive Health</h1>
                    <p className="text-muted-foreground mt-1">Machine Learning Analysis Model v2.4 (XGBoost + LSTM)</p>
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
                                className={failureProb > 0.5 ? "text-red-500" : "text-green-500"}
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
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
                            <span className={`text-5xl font-bold ${failureProb > 0.5 ? "text-red-500" : "text-green-500"}`}>
                                {(failureProb * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        {failureProb > 0.5 
                            ? "High risk of failure detected. Maintenance recommended." 
                            : "System is operating within normal parameters. No immediate risks detected."}
                    </p>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <MetricCard
                        title="Remaining Useful Life"
                        value={rul.toFixed(0)}
                        unit="hours"
                        icon={ShieldCheck}
                        status={rul < 50 ? "warning" : "success"}
                    />
                    <MetricCard
                        title="Anomaly Score"
                        value={anomalyScore.toFixed(2)}
                        icon={AlertTriangle}
                        status={anomalyScore > 0.7 ? "error" : "success"}
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

            {/* Component Risk Heatmap (Conceptual) */}
            <h3 className="text-lg font-semibold mt-8 mb-4">Component Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Joint #1', 'Joint #2', 'Joint #3', 'Hydraulic Pump', 'Control Unit', 'Sensor Array'].map((component, idx) => (
                    <div key={component} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                        <span className="font-medium">{component}</span>
                        <Badge variant="success">Low Risk</Badge>
                    </div>
                ))}
            </div>
        </div>
    );
}
