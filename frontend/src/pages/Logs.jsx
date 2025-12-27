import React from 'react';
import { FileText, Download, Calendar, Search, Filter } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export function Logs() {
    const logs = [
        { id: 10423, time: '2024-05-20 14:32:11', event: 'System Start', type: 'info', user: 'Admin' },
        { id: 10422, time: '2024-05-20 14:30:05', event: 'Sensor Calibration', type: 'success', user: 'System' },
        { id: 10421, time: '2024-05-20 12:15:44', event: 'Torque Spike Detected', type: 'warning', user: 'System' },
        { id: 10420, time: '2024-05-20 10:00:00', event: 'Maintenance Mode Enabled', type: 'info', user: 'Operator 1' },
        { id: 10419, time: '2024-05-19 18:45:22', event: 'System Shutdown', type: 'info', user: 'Admin' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
                    <p className="text-muted-foreground mt-1">Audit trail and data export</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export JSON</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 p-4 rounded-lg bg-card border border-border">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors">
                    <Calendar className="h-4 w-4" />
                    <span>Date Range</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors">
                    <Filter className="h-4 w-4" />
                    <span>Filter Type</span>
                </button>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Event</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-3 px-4 font-mono text-muted-foreground">#{log.id}</td>
                                <td className="py-3 px-4">{log.time}</td>
                                <td className="py-3 px-4 font-medium">{log.event}</td>
                                <td className="py-3 px-4">
                                    <Badge variant={log.type}>{log.type.toUpperCase()}</Badge>
                                </td>
                                <td className="py-3 px-4 text-muted-foreground">{log.user}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
