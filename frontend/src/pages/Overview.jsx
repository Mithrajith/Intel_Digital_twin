import React from 'react';
import { Activity, Clock, AlertTriangle, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';

export function Overview() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Machine Overview</h1>
                    <p className="text-muted-foreground mt-1">Status of 2-axis robotic arm #RA-204</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="success" className="text-sm px-3 py-1">
                        Status: Normal
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                        Last updated: Just now
                    </div>
                </div>
            </div>

            {/* Main Health Score */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 p-6 rounded-lg border border-border bg-card flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-medium text-muted-foreground mb-4">Overall Health Score</h3>
                    <div className="relative flex items-center justify-center">
                        <div className="h-40 w-40 rounded-full border-8 border-green-500/20 flex items-center justify-center">
                            <span className="text-5xl font-bold text-green-500">96</span>
                        </div>
                        {/* Simple decoration for the gauge */}
                        <div className="absolute h-40 w-40 rounded-full border-8 border-green-500 border-t-transparent border-l-transparent border-r-transparent rotate-45" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">Optimal Condition</p>
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
                        value="45"
                        unit="%"
                        icon={Zap}
                        trend="flat"
                        trendValue="Stable"
                    />
                    <MetricCard
                        title="Vibration Level"
                        value="1.2"
                        unit="mm/s"
                        icon={Activity}
                        trend="down"
                        trendValue="-0.1"
                        status="success"
                    />
                    <MetricCard
                        title="Motor Temp"
                        value="42"
                        unit="°C"
                        icon={TrendingUp}
                        trend="up"
                        trendValue="+1.2"
                    />
                    <MetricCard
                        title="Next Maintenance"
                        value="14"
                        unit="days"
                        icon={CheckCircle}
                    />
                    <MetricCard
                        title="Predicted Failures"
                        value="0"
                        icon={AlertTriangle}
                        status="success"
                    />
                </div>
            </div>

            {/* Recent Alerts (Mini) */}
            <div className="rounded-lg border border-border bg-card">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Recent System Events</h3>
                </div>
                <div className="divide-y divide-border">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-sm">Routine system check completed successfully.</span>
                            </div>
                            <span className="text-xs text-muted-foreground">2h ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
