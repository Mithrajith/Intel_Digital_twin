import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, BellOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { AlertCard } from '../components/common/AlertCard';
import { Badge } from '../components/common/Badge';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useChartRefreshRate } from '../hooks/useChartRefreshRate.jsx';

export function Alerts() {
    const [activeTab, setActiveTab] = useState('history');
    const { refreshRate } = useChartRefreshRate();
    const data = useSimulatedSensor(true, refreshRate);
    const [alerts, setAlerts] = useState([]);
    const [history, setHistory] = useState([]);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Fetch alert history from system logs
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('http://localhost:7000/logs');
                if (response.ok) {
                    const logs = await response.json();
                    // Filter logs that look like alerts or errors
                    const alertLogs = logs.filter(log => log.type === 'error' || log.type === 'warning' || log.event.includes('Injecting') || log.event.includes('Alert'));
                    setHistory(alertLogs);
                }
            } catch (error) {
                console.error("Failed to fetch alert history", error);
            }
        };

        fetchHistory();
        // Poll history occasionally to keep it updated
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, []);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHistory = history.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(history.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        if (data.length > 0) {
            const latest = data[data.length - 1];
            if (latest.raw && latest.raw.alerts && latest.raw.alerts.length > 0) {
                // Add new alerts
                const newAlerts = latest.raw.alerts.map(a => ({
                    id: Date.now() + Math.random(),
                    type: a.type,
                    title: a.title,
                    message: a.message,
                    time: new Date().toLocaleTimeString()
                }));
                
                setAlerts(prev => {
                    // Simple deduplication: don't add if title matches the last one within 5 seconds
                    // Or just check if the exact same alert is at the top
                    const lastAlert = prev.length > 0 ? prev[0] : null;
                    
                    const uniqueNewAlerts = newAlerts.filter(na => {
                        if (!lastAlert) return true;
                        // Avoid spamming the same alert
                        return na.title !== lastAlert.title || na.message !== lastAlert.message;
                    });
                    
                    if (uniqueNewAlerts.length === 0) return prev;
                    return [...uniqueNewAlerts, ...prev].slice(0, 20); // Keep last 20
                });
            }
        }
    }, [data]);

    const criticalCount = alerts.filter(a => a.type === 'critical').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
                    <p className="text-muted-foreground mt-1">Centralized warning management (Live Stream)</p>
                </div>
                <div className="flex items-center gap-2">
                    {criticalCount > 0 && (
                        <Badge variant="error" className="text-sm px-3 py-1 animate-pulse">
                            {criticalCount} Critical Issues
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center border-b border-border">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    All Alerts (Log)
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Live Issues
                </button>
            </div>

            <div className="space-y-4">
                {activeTab === 'active' ? (
                    alerts.length > 0 ? (
                        alerts.map(alert => (
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
                            <p>No active alerts detected in live stream.</p>
                        </div>
                    )
                ) : (
                    history.length > 0 ? (
                        <>
                            {currentHistory.map(log => (
                                <AlertCard
                                    key={log.id}
                                    variant={log.type === 'error' ? 'critical' : 'warning'}
                                    title={log.type === 'error' ? 'System Error' : 'System Event'}
                                    message={log.event}
                                    timestamp={new Date(log.timestamp).toLocaleTimeString()}
                                    className="border-l-4 opacity-80"
                                />
                            ))}
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
                                    <button
                                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    
                                    <span className="text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    
                                    <button
                                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No historical alerts found.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
