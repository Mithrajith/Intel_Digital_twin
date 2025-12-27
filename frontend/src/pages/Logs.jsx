import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Search, Filter, RefreshCw } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Add timestamp to prevent caching
            const response = await fetch(`http://localhost:8000/logs?_t=${new Date().getTime()}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            } else {
                console.error("Failed to fetch logs");
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            // Add a small delay to ensure the loading spinner is visible for at least a moment
            // This gives better feedback to the user that a refresh actually happened
            setTimeout(() => setLoading(false), 500);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Manual refresh only - removed auto-refresh interval
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.machine_id && log.machine_id.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = selectedType === 'all' || log.type === selectedType;
        
        let matchesDate = true;
        if (startDate) {
            matchesDate = matchesDate && new Date(log.timestamp) >= new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && new Date(log.timestamp) <= end;
        }

        return matchesSearch && matchesType && matchesDate;
    });

    const handleExportCSV = () => {
        if (filteredLogs.length === 0) return;

        const headers = ['ID', 'Timestamp', 'Event', 'Machine', 'Type', 'User'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                log.id,
                new Date(log.timestamp).toLocaleString(),
                `"${log.event.replace(/"/g, '""')}"`, // Escape quotes
                log.machine_id || '',
                log.type,
                log.user
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `system_logs_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportJSON = () => {
        if (filteredLogs.length === 0) return;

        const jsonContent = JSON.stringify(filteredLogs, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `system_logs_${new Date().toISOString().slice(0,10)}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
                    <p className="text-muted-foreground mt-1">Audit trail and data export</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchLogs}
                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card hover:bg-accent transition-colors shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card hover:bg-accent transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
                    <button 
                        onClick={handleExportJSON}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export JSON</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-card border border-border shadow-sm items-center">
                <div className="flex-1 min-w-[200px] relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all shadow-sm"
                    />
                </div>
                
                <div className="group flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:border-primary/50 hover:bg-accent/5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            className="bg-transparent border-none outline-none text-sm w-[130px] placeholder:text-muted-foreground cursor-pointer font-medium text-foreground/90 [color-scheme:dark]"
                            value={startDate}
                            max={endDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        />
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">to</span>
                        <input 
                            type="date" 
                            className="bg-transparent border-none outline-none text-sm w-[130px] cursor-pointer font-medium text-foreground/90 [color-scheme:dark]"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        />
                    </div>
                </div>

                <div className="group flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:border-primary/50 hover:bg-accent/5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                    <Filter className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <select 
                        className="bg-transparent border-none outline-none text-sm min-w-[120px] cursor-pointer font-medium text-foreground/90"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                    </select>
                </div>

                {(searchTerm || selectedType !== 'all' || startDate || endDate) && (
                    <button 
                        onClick={handleResetFilters}
                        className="text-sm font-medium text-muted-foreground hover:text-destructive px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors flex items-center gap-1"
                    >
                        <span>Clear</span>
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Event</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Machine</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                                    No logs found.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-4 font-mono text-muted-foreground">#{log.id}</td>
                                    <td className="py-3 px-4">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="py-3 px-4 font-medium">{log.event}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{log.machine_id || '-'}</td>
                                    <td className="py-3 px-4">
                                        <Badge variant={log.type}>{log.type.toUpperCase()}</Badge>
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground">{log.user}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
