<<<<<<< Updated upstream
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
=======
import React, { useState } from 'react';
import { FileText, Download, Calendar, Search, Filter, X } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export function Logs() {
    const [showDateRange, setShowDateRange] = useState(false);
    const [showTypeFilter, setShowTypeFilter] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);

    const logs = [
        { id: 10423, time: '2024-05-20 14:32:11', event: 'System Start', type: 'info', user: 'Admin' },
        { id: 10422, time: '2024-05-20 14:30:05', event: 'Sensor Calibration', type: 'success', user: 'System' },
        { id: 10421, time: '2024-05-20 12:15:44', event: 'Torque Spike Detected', type: 'warning', user: 'System' },
        { id: 10420, time: '2024-05-20 10:00:00', event: 'Maintenance Mode Enabled', type: 'info', user: 'Operator 1' },
        { id: 10419, time: '2024-05-19 18:45:22', event: 'System Shutdown', type: 'info', user: 'Admin' },
    ];
>>>>>>> Stashed changes

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.type.toLowerCase().includes(searchTerm.toLowerCase());

        const logDate = new Date(log.time.split(' ')[0]);
        const matchesDateRange = (!startDate || logDate >= new Date(startDate)) &&
                                (!endDate || logDate <= new Date(endDate));

        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(log.type);

        return matchesSearch && matchesDateRange && matchesType;
    });

    const availableTypes = [...new Set(logs.map(log => log.type))];

    const handleTypeToggle = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Timestamp', 'Event', 'Type', 'User'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                log.id,
                `"${log.time}"`,
                `"${log.event}"`,
                log.type,
                `"${log.user}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToJSON = () => {
        const jsonContent = JSON.stringify(filteredLogs, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
                    <p className="text-muted-foreground mt-1">Audit trail and data export</p>
                </div>
                <div className="flex gap-2">
<<<<<<< Updated upstream
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
=======
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors"
>>>>>>> Stashed changes
                    >
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
<<<<<<< Updated upstream
                    <button 
                        onClick={handleExportJSON}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
=======
                    <button
                        onClick={exportToJSON}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
                        className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowDateRange(!showDateRange)}
                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors"
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Date Range</span>
                    </button>
                    {showDateRange && (
                        <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-md shadow-lg p-4 z-10 w-80">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">Select Date Range</h4>
                                <button
                                    onClick={() => setShowDateRange(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            setStartDate('');
                                            setEndDate('');
                                        }}
                                        className="flex-1 px-3 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={() => setShowDateRange(false)}
                                        className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowTypeFilter(!showTypeFilter)}
                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors"
                    >
                        <Filter className="h-4 w-4" />
                        <span>Filter Type</span>
                        {selectedTypes.length > 0 && (
                            <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                                {selectedTypes.length}
                            </span>
                        )}
                    </button>
                    {showTypeFilter && (
                        <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-md shadow-lg p-4 z-10 w-64">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">Filter by Type</h4>
                                <button
                                    onClick={() => setShowTypeFilter(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {availableTypes.map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedTypes.includes(type)}
                                            onChange={() => handleTypeToggle(type)}
                                            className="rounded border-border"
                                        />
                                        <Badge variant={type} className="pointer-events-none">
                                            {type.toUpperCase()}
                                        </Badge>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-2 pt-3 mt-3 border-t border-border">
                                <button
                                    onClick={() => setSelectedTypes([])}
                                    className="flex-1 px-3 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={() => setShowTypeFilter(false)}
                                    className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                                    No logs found.
=======
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-3 px-4 font-mono text-muted-foreground">#{log.id}</td>
                                <td className="py-3 px-4">{log.time}</td>
                                <td className="py-3 px-4 font-medium">{log.event}</td>
                                <td className="py-3 px-4">
                                    <Badge variant={log.type}>{log.type.toUpperCase()}</Badge>
>>>>>>> Stashed changes
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
