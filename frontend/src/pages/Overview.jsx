import React from 'react';
import { Activity, Clock, AlertTriangle, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';

export function Overview() {
    const { refreshRate } = useChartRefreshRate();
    const data = useSimulatedSensor(true, refreshRate);
    
    const latest = data.length > 0 ? data[data.length - 1] : {};
    const failureProb = latest.failure_probability || 0;
    const rul = latest.rul_hours || 0;
    const temp = latest.temperature || 0;
    const vib = latest.vibration || 0;
    const torque = latest.torque || 0;
    
    // Calculate health score (0-100)
    const healthScore = Math.max(0, Math.min(100, (1 - failureProb) * 100));
    
    const getHealthColor = (score) => {
        if (score > 80) return "text-green-500";
        if (score > 50) return "text-yellow-500";
        return "text-red-500";
    };

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
                        Last updated: {latest.time || "Connecting..."}
                    </div>
                </div>
            </div>

            {/* Main Health Score */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 p-6 rounded-lg border border-border bg-card flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-medium text-muted-foreground mb-4">Overall Health Score</h3>
                    <div className="relative flex items-center justify-center">
                        <div className={`h-40 w-40 rounded-full border-8 ${healthScore > 80 ? "border-green-500/20" : "border-red-500/20"} flex items-center justify-center`}>
                            <span className={`text-5xl font-bold ${getHealthColor(healthScore)}`}>{healthScore.toFixed(0)}</span>
                        </div>
                        {/* Simple decoration for the gauge */}
                        <div className={`absolute h-40 w-40 rounded-full border-8 ${healthScore > 80 ? "border-green-500" : "border-red-500"} border-t-transparent border-l-transparent border-r-transparent rotate-45`} />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                        {healthScore > 80 ? "Optimal Condition" : "Degradation Detected"}
                    </p>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Runtime Hours"
                        value="1,248"
                        unit="h"
                        icon={Clock}
                        trend="up"
                        trendValue="+24h"
                    />
                    <MetricCard
                        title="Current Load"
                        value={torque.toFixed(1)}
                        unit="Nm"
                        icon={Zap}
                        trend="flat"
                        trendValue="Stable"
                    />
                    <MetricCard
                        title="Vibration Level"
                        value={vib.toFixed(2)}
                        unit="g"
                        icon={Activity}
                        trend={vib > 2 ? "up" : "flat"}
                        status={vib > 3 ? "error" : "success"}
                    />
                    <MetricCard
                        title="Motor Temp"
                        value={temp.toFixed(1)}
                        unit="°C"
                        icon={TrendingUp}
                        trend={temp > 50 ? "up" : "flat"}
                        status={temp > 60 ? "warning" : "neutral"}
                    />
                    <MetricCard
                        title="Next Maintenance"
                        value={(rul / 24).toFixed(1)}
                        unit="days"
                        icon={CheckCircle}
                        status={rul < 100 ? "warning" : "success"}
                    />
                    <MetricCard
                        title="Predicted Failures"
                        value={failureProb > 0.5 ? "High Risk" : "None"}
                        icon={AlertTriangle}
                        status={failureProb > 0.5 ? "error" : "success"}
                    />
                </div>
            </div>

            {/* Recent Alerts (Mini) */}
            <div className="rounded-lg border border-border bg-card">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Recent System Events</h3>
                </div>
                <div className="divide-y divide-border">
                    {latest.raw && latest.raw.alerts && latest.raw.alerts.length > 0 ? (
                        latest.raw.alerts.slice(0, 3).map((alert, i) => (
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
