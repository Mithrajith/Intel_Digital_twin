import React, { useState } from 'react';
import { Sliders, Bell, Eye, Database, RefreshCw, Smartphone } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';

export function Settings() {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const { refreshRate, setRefreshRate } = useChartRefreshRate();
    const [temperatureThreshold, setTemperatureThreshold] = useState(85);
    const [vibrationThreshold, setVibrationThreshold] = useState(2.5);
    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
                <p className="text-muted-foreground mt-1">Configure dashboard parameters and thresholds</p>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <section className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Eye className="h-4 w-4" /> View Preferences
                    </h3>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div className="space-y-1">
                            <div className="font-medium text-sm">Dark Mode</div>
                            <div className="text-xs text-muted-foreground">Use engineering-grade dark theme</div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">{isDarkMode ? 'On' : 'Off'}</span>
                            <div
                                onClick={toggleDarkMode}
                                className={`h-6 w-11 rounded-full relative cursor-pointer transition-colors ${
                                    isDarkMode ? 'bg-primary' : 'bg-muted'
                                }`}
                            >
                                <div
                                    className={`h-5 w-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${
                                        isDarkMode ? 'right-0.5' : 'left-0.5'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div className="space-y-1">
                            <div className="font-medium text-sm">Chart Refresh Rate</div>
                            <div className="text-xs text-muted-foreground">Update frequency for real-time graphs</div>
                        </div>
                        <select
                            value={refreshRate}
                            onChange={(e) => setRefreshRate(Number(e.target.value))}
                            className="bg-background border border-border rounded-md px-2 py-1 text-sm"
                        >
                            <option value={1000}>1s (High Performance)</option>
                            <option value={5000}>5s (Standard)</option>
                            <option value={10000}>10s (Balanced)</option>
                            <option value={30000}>30s (Low Bandwidth)</option>
                        </select>
                    </div>
                </section>

                {/* Alert Thinking */}
                <section className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Threshold Configuration
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Temperature Critical Threshold</span>
                                <span className="font-mono">{temperatureThreshold}°C</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="150"
                                step="1"
                                value={temperatureThreshold}
                                onChange={(e) => setTemperatureThreshold(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Vibration Warning Level</span>
                                <span className="font-mono">{vibrationThreshold} g</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.1"
                                value={vibrationThreshold}
                                onChange={(e) => setVibrationThreshold(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-red-500" /> Danger Zone
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Resetting the application will clear all local logs and user preferences.
                    </p>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-md text-sm font-medium transition-colors"
                    >
                        Reset Application State
                    </button>
                </section>
            </div>
        </div>
    );
}
