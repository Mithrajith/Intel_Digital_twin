import React from 'react';
import { ArrowRight, Activity, Cpu, Bell, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/common/Badge';

export function Home() {
    return (
        <div className="flex flex-col gap-8 py-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center space-y-6 py-12">
                <Badge variant="info" className="mb-2">v1.0.0 Stable</Badge>
                <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
                    Technovate <span className="text-primary">Digital Twin</span>
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                    Predict machine failures before they happen. Advanced AI-driven predictive maintenance for industrial robotics.
                </p>

                <div className="flex gap-4 pt-4">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                    >
                        Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                        to="/overview"
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        View Machine Status
                    </Link>
                </div>
            </section>

            {/* System Flow */}
            <section className="py-12 border-t border-border">
                <h2 className="text-2xl font-semibold text-center mb-12">System Architecture</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto px-4">
                    {/* Step 1 */}
                    <Link to="/overview" className="flex flex-col items-center text-center group cursor-pointer">
                        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                            <Activity className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Real Machine</h3>
                        <p className="text-sm text-muted-foreground">Industrial robotic arm streaming telemetry</p>
                    </Link>

                    {/* Connector */}
                    <div className="hidden md:flex items-center justify-center text-muted-foreground">
                        <ArrowRight className="h-6 w-6" />
                    </div>

                    {/* Step 2 */}
                    <Link to="/simulation" className="flex flex-col items-center text-center group cursor-pointer">
                        <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                            <Box className="h-8 w-8 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Digital Twin</h3>
                        <p className="text-sm text-muted-foreground">Real-time simulation & state mirroring</p>
                    </Link>

                    {/* Connector */}
                    <div className="hidden md:flex items-center justify-center text-muted-foreground">
                        <ArrowRight className="h-6 w-6" />
                    </div>

                    {/* Step 3 */}
                    <Link to="/predictions" className="flex flex-col items-center text-center group cursor-pointer">
                        <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                            <Cpu className="h-8 w-8 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">AI Analysis</h3>
                        <p className="text-sm text-muted-foreground">Anomaly detection & RUL prediction</p>
                    </Link>

                    {/* Connector */}
                    <div className="hidden md:flex items-center justify-center text-muted-foreground">
                        <ArrowRight className="h-6 w-6" />
                    </div>

                    {/* Step 4 */}
                    <Link to="/alerts" className="flex flex-col items-center text-center group cursor-pointer">
                        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                            <Bell className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Alerts</h3>
                        <p className="text-sm text-muted-foreground">Instant notification of potential failures</p>
                    </Link>
                </div>
            </section>

            {/* Key Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
                <div className="p-6 rounded-lg bg-card border border-border">
                    <div className="text-sm text-muted-foreground mb-1">System Uptime</div>
                    <div className="text-3xl font-bold text-green-500">99.8%</div>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Predicted Failures</div>
                    <div className="text-3xl font-bold text-blue-500">0</div>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Avg. RUL</div>
                    <div className="text-3xl font-bold text-foreground">1,240 <span className="text-sm font-normal text-muted-foreground">hrs</span></div>
                </div>
            </section>
        </div>
    );
}
