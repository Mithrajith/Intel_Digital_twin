import React, { useState } from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, BellOff } from 'lucide-react';
import { AlertCard } from '../components/common/AlertCard';
import { Badge } from '../components/common/Badge';

export function Alerts() {
    const [activeTab, setActiveTab] = useState('active');

    const alertsData = [
        { id: 1, type: 'critical', title: 'Hydraulic Pressure Low', message: 'Main pump pressure below 200 PSI. Immediate check required.', time: '10:42 AM' },
        { id: 2, type: 'warning', title: 'Motor Temp Elevating', message: 'Joint #2 Motor temperature rising (55°C). Load reduction recommended.', time: '10:15 AM' },
        { id: 3, type: 'info', title: 'System Backup Complete', message: 'Daily log backup completed successfully.', time: '09:00 AM' },
        { id: 4, type: 'warning', title: 'Network Latency', message: 'Control loop latency > 100ms detected.', time: '08:45 AM' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
                    <p className="text-muted-foreground mt-1">Centralized warning management</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="error" className="text-sm px-3 py-1 animate-pulse">
                        2 Critical Issues
                    </Badge>
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
                {activeTab === 'active' ? (
                    alertsData.map(alert => (
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
                        <p>No historical alerts found for this session.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
