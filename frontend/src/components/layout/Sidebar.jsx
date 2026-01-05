import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Activity,
    LineChart,
    BrainCircuit,
    Box,
    Sliders,
    FileText,
    AlertTriangle,
    Info,
    Settings
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Activity, label: 'Machine Overview', path: '/overview' },
    { icon: LineChart, label: 'Live Dashboard', path: '/dashboard' },
    { icon: BrainCircuit, label: 'AI Predictions', path: '/predictions' },
    { icon: Box, label: 'Simulation', path: '/simulation' },
    { icon: Sliders, label: 'Control Panel', path: '/control' },
    { icon: FileText, label: 'Logs & Export', path: '/logs' },
    { icon: AlertTriangle, label: 'Alerts', path: '/alerts' },
    { icon: Info, label: 'Model Info', path: '/model-info' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Activity className="h-6 w-6 text-primary mr-2" />
                <h1 className="text-xl font-bold tracking-tight text-primary">Technovate</h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="text-xs font-medium text-muted-foreground">
                        System Online
                    </div>
                </div>
            </div>
        </aside>
    );
}
