import React, { useState } from 'react';
import { Power, RotateCcw, AlertOctagon, Zap, ShieldAlert, Play, Pause } from 'lucide-react';
import { AlertCard } from '../components/common/AlertCard';

export function ControlPanel() {
    const [isRunning, setIsRunning] = useState(true);
    const [alerts, setAlerts] = useState([]);

    const handleAlert = (variant, message) => {
        const newAlert = {
            id: Date.now(),
            variant: variant,
            title: variant === 'critical' ? 'Critical Error' : 'System Alert',
            message: message,
            timestamp: new Date().toLocaleTimeString()
        };
        setAlerts(prev => [newAlert, ...prev]);
    };

    const clearAlerts = () => setAlerts([]);

    const sendCommand = async (command, parameters = {}) => {
        try {
            const response = await fetch('http://localhost:8000/machine/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    machine_id: 'robot_01',
                    command: command,
                    parameters: parameters
                })
            });
            if (!response.ok) throw new Error('Command failed');
            return await response.json();
        } catch (error) {
            console.error("Control error:", error);
            handleAlert('critical', `Command Failed: ${error.message}`);
        }
    };

    const handleInjectFault = async (type, message, severity = 0.8) => {
        await sendCommand('inject_fault', { type, severity });
        handleAlert(severity > 0.7 ? 'critical' : 'warning', message);
    };

    const injectFault = async (type, severity) => {
        try {
            await fetch('http://localhost:8000/machine/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: 'inject_fault',
                    parameters: { type, severity }
                })
            });
        } catch (error) {
            console.error("Failed to inject fault:", error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Control Panel</h1>
                    <p className="text-muted-foreground mt-1">Manual overrides and fault injection (Live Backend)</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="font-mono text-sm">{isRunning ? 'SYSTEM BUSY' : 'SYSTEM IDLE'}</span>
                </div>
            </div>

            {/* Emergency Section */}
            <div className="rounded-lg border border-red-900/50 bg-red-950/10 p-6">
                <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                    <AlertOctagon className="h-6 w-6" /> EMERGENCY CONTROLS
                </h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => { 
                            setIsRunning(false); 
                            sendCommand('stop');
                            handleAlert('critical', 'Emergency Stop Triggered by Operator'); 
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-md text-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] active:scale-95 transition-all"
                    >
                        EMERGENCY STOP
                    </button>
                    <button
                        onClick={() => {
                            sendCommand('stop');
                            handleAlert('warning', 'Soft Reset Initiated');
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-8 rounded-md text-lg active:scale-95 transition-all"
                    >
                        SOFT STOP
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Simulation Control */}
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Power className="h-5 w-5" /> Operation Control
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                setIsRunning(true);
                                sendCommand('start');
                            }}
                            className="flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-accent transition-colors gap-3"
                            disabled={isRunning}
                        >
                            <Play className="h-8 w-8 text-green-500" />
                            <span className="font-medium">Start Routine</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsRunning(false);
                                sendCommand('stop');
                            }}
                            className="flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-accent transition-colors gap-3"
                            disabled={!isRunning}
                        >
                            <Pause className="h-8 w-8 text-yellow-500" />
                            <span className="font-medium">Pause Routine</span>
                        </button>
                        <button
                            onClick={() => { 
                                setIsRunning(false); 
                                clearAlerts(); 
                                sendCommand('reset');
                            }}
                            className="col-span-2 flex items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors gap-3"
                        >
                            <RotateCcw className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">Reset System State</span>
                        </button>
                    </div>
                </div>

                {/* Fault Injection */}
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Zap className="h-5 w-5" /> Fault Injection (Testing)
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                handleAlert('warning', 'Injecting: Motor Overload conditions detected');
                                injectFault('motor_overload', 0.8);
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors text-orange-500"
                        >
                            <span className="font-medium flex items-center gap-2"><Zap className="h-4 w-4" /> Overload Motor #2</span>
                            <span className="text-xs border border-orange-500/30 px-2 py-1 rounded">INJECT</span>
                        </button>
                        <button
                            onClick={() => {
                                handleAlert('critical', 'Injecting: Hydraulic pressure loss imminent');
                                injectFault('hydraulic_loss', 0.9);
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-red-500"
                        >
                            <span className="font-medium flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Hydraulic Loss</span>
                            <span className="text-xs border border-red-500/30 px-2 py-1 rounded">INJECT</span>
                        </button>
                        <button
                            onClick={() => {
                                handleAlert('warning', 'Injecting: Sensor drift detected in Joint #1');
                                injectFault('sensor_drift', 0.4);
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-blue-500"
                        >
                            <span className="font-medium flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Sensor Drift</span>
                            <span className="text-xs border border-blue-500/30 px-2 py-1 rounded">INJECT</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Log / Alerts Feed */}
            {alerts.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Active Alerts</h3>
                        <button onClick={clearAlerts} className="text-sm text-muted-foreground hover:text-foreground">Clear All</button>
                    </div>
                    {alerts.map(alert => (
                        <AlertCard
                            key={alert.id}
                            variant={alert.variant}
                            title={alert.title}
                            message={alert.message}
                            timestamp={alert.timestamp}
                            onDismiss={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
