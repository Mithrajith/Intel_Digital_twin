import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import { FileText, Download, Calendar, Search, Filter, RefreshCw, X } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export function Logs() {
    const [logs, setLogs] = useState([]);
    const [sensorData, setSensorData] = useState([]);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
        // Fetch sensor data for playback
        const fetchSensorData = async () => {
            try {
                const response = await fetch('http://localhost:8000/sensor-data');
                if (response.ok) {
                    const data = await response.json();
                    setSensorData(data);
                }
            } catch (error) {
                console.error('Error fetching sensor data:', error);
            }
        };

        useEffect(() => {
            fetchSensorData();
        }, []);

        // Playback effect
        useEffect(() => {
            let interval;
            if (isPlaying && sensorData.length > 0) {
                interval = setInterval(() => {
                    setPlaybackIndex((prev) => (prev < sensorData.length - 1 ? prev + 1 : prev));
                }, 500);
            }
            return () => clearInterval(interval);
        }, [isPlaying, sensorData]);
        // Chart data for playback
        const playbackData = sensorData.slice(0, playbackIndex + 1);
        const chartData = {
            labels: playbackData.map((d) => d.timestamp),
            datasets: [
                {
                    label: 'Temperature',
                    data: playbackData.map((d) => d.temperature),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                },
                {
                    label: 'Vibration',
                    data: playbackData.map((d) => d.vibration),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                },
                {
                    label: 'Pressure',
                    data: playbackData.map((d) => d.pressure),
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                },
                // Add ML prediction if available
                ...(playbackData[0] && playbackData[0].prediction !== undefined
                    ? [{
                        label: 'Prediction',
                        data: playbackData.map((d) => d.prediction),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    }]
                    : []),
            ],
        };
        // Playback controls
        const handleSliderChange = (e) => {
            setPlaybackIndex(Number(e.target.value));
            setIsPlaying(false);
        };
        const handlePlayPause = () => {
            setIsPlaying((prev) => !prev);
        };
        const handleStop = () => {
            setIsPlaying(false);
            setPlaybackIndex(0);
        };
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Fetch from Main Backend (8000) - Real System Logs
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
            setTimeout(() => setLoading(false), 500);
        }
    };

    useEffect(() => {
        fetchLogs();
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
        // Use the Main Backend (8000) for exporting sensor logs
        window.location.href = `http://localhost:8000/logs/export?start_time=${startDate ? new Date(startDate).getTime() / 1000 : ''}&end_time=${endDate ? new Date(endDate).getTime() / 1000 : ''}`;
    };

    const handleExportJSON = () => {
        if (filteredLogs.length === 0) return;

        const jsonContent = JSON.stringify(filteredLogs, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `system_logs_${new Date().toISOString().slice(0, 10)}.json`);
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
            {/* Historical Playback Section */}
            <div className="mb-8 p-4 rounded-lg border border-border bg-card shadow-sm">
                <h2 className="text-xl font-bold mb-2">Historical Playback</h2>
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={handlePlayPause} className="px-3 py-1 rounded bg-primary text-white">
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button onClick={handleStop} className="px-3 py-1 rounded bg-destructive text-white">Stop</button>
                    <input
                        type="range"
                        min={0}
                        max={sensorData.length - 1}
                        value={playbackIndex}
                        onChange={handleSliderChange}
                        className="w-1/2"
                        disabled={sensorData.length === 0}
                    />
                    <span className="text-sm text-muted-foreground">
                        {sensorData[playbackIndex]?.timestamp || 'No data'}
                    </span>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border h-[300px]">
                    {sensorData.length > 0 ? (
                        <Line 
                            data={chartData} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'top' } } 
                            }} 
                        />
                    ) : (
                        <div className="text-muted-foreground">No sensor data available for playback.</div>
                    )}
                </div>
            </div>
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

            {/* ...existing code... */}
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
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                                    Loading logs...
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
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
