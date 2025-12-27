import React from 'react';
import { Cpu, Database, GitBranch, Layers } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export function ModelInfo() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Intelligence</h1>
                <p className="text-muted-foreground mt-1">Machine Learning Model Specifications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" /> Active Model Architecture
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Primary Model</span>
                            <span className="font-mono">XGBoost Regressor (v2.4.1)</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Anomaly Detection</span>
                            <span className="font-mono">Isolation Forest</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Time Series Analysis</span>
                            <span className="font-mono">LSTM Network</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Last Retraining</span>
                            <span className="font-mono">2024-05-18 03:00 UTC</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" /> Data Pipeline
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Input Features</span>
                            <Badge variant="neutral">128 Vectors</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Sampling Rate</span>
                            <span className="font-mono">500 Hz</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Data Source</span>
                            <span className="font-mono">Synthetic (Simulink)</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Total Training Samples</span>
                            <span className="font-mono">14.2M</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" /> Reduced Order Model (ROM)
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    A high-fidelity Reduced Order Model is used for real-time physics simulation, reducing computational load by 93% while maintaining 99.1% accuracy relative to FEM benchmarks.
                </p>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[99.1%]" />
                </div>
                <div className="flex justify-between mt-1 text-xs">
                    <span>Accuracy vs FEM</span>
                    <span>99.1%</span>
                </div>
            </div>
        </div>
    );
}
