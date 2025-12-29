import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, BellOff } from 'lucide-react';
import { AlertCard } from '../components/common/AlertCard';
import { Badge } from '../components/common/Badge';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';

export function Alerts() {
    const [activeTab, setActiveTab] = useState('active');
    const { refreshRate } = useChartRefreshRate();
    const data = useSimulatedSensor(true, refreshRate);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (data.length > 0) {
            const latest = data[data.length - 1];
            if (latest.raw && latest.raw.alerts && latest.raw.alerts.length > 0) {
                // Add new alerts
                const newAlerts = latest.raw.alerts.map(a => ({
                    id: Date.now() + Math.random(),
                    type: a.type,
                    title: a.title,
                    message: a.message,
                    time: new Date().toLocaleTimeString()
                }));
                
                setAlerts(prev => {
                    // Simple deduplication: don't add if title matches the last one within 5 seconds
                    // Or just check if the exact same alert is at the top
                    const lastAlert = prev.length > 0 ? prev[0] : null;
                    
                    const uniqueNewAlerts = newAlerts.filter(na => {
                        if (!lastAlert) return true;
                        // Avoid spamming the same alert
                        return na.title !== lastAlert.title || na.message !== lastAlert.message;
                    });
                    
                    if (uniqueNewAlerts.length === 0) return prev;
                    return [...uniqueNewAlerts, ...prev].slice(0, 50); // Keep last 50
                });
            }
        }
    }, [data]);

    const criticalCount = alerts.filter(a => a.type === 'critical').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
                    <p className="text-muted-foreground mt-1">Centralized warning management (Live Stream)</p>
                </div>
                <div className="flex items-center gap-2">
                    {criticalCount > 0 && (
                        <Badge variant="error" className="text-sm px-3 py-1 animate-pulse">
                            {criticalCount} Critical Issues
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center border-b border-border">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Active Alerts
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Alert History
                </button>
            </div>

            <div className="space-y-4">
                {alerts.length > 0 ? (
                    alerts.map(alert => (
                        <AlertCard
                            key={alert.id}
                            variant={alert.type}
                            title={alert.title}
                            message={alert.message}
                            timestamp={alert.time}
                            className="border-l-4"
                        />
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active alerts detected in live stream.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
