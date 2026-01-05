import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, BellOff } from 'lucide-react';
import { AlertCard } from '../common/AlertCard';
import { Badge } from '../common/Badge';

export const RealTimeAlerts = ({ sensorData }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (sensorData.length > 0) {
      const latest = sensorData[sensorData.length - 1];
      const newAlerts = [];

      // Temperature alerts
      if (latest.temperature > 60) {
        newAlerts.push({
          id: `temp_${Date.now()}`,
          type: 'critical',
          title: 'High Temperature Alert',
          message: `Temperature reached ${latest.temperature.toFixed(1)}°C (Threshold: 60°C)`,
          timestamp: new Date().toLocaleTimeString(),
          machine: 'armpi_fpv_01'
        });
      }

      // Vibration alerts
      if (latest.vibration > 2.5) {
        newAlerts.push({
          id: `vib_${Date.now()}`,
          type: 'warning',
          title: 'High Vibration Alert', 
          message: `Vibration level at ${latest.vibration.toFixed(2)}g (Threshold: 2.5g)`,
          timestamp: new Date().toLocaleTimeString(),
          machine: 'armpi_fpv_01'
        });
      }

      // Failure probability alerts
      if (latest.failure_probability && latest.failure_probability > 0.7) {
        newAlerts.push({
          id: `fail_${Date.now()}`,
          type: 'critical',
          title: 'High Failure Risk',
          message: `Failure probability: ${(latest.failure_probability * 100).toFixed(1)}%`,
          timestamp: new Date().toLocaleTimeString(),
          machine: 'armpi_fpv_01'
        });
      }

      // Add new alerts (avoid duplicates)
      newAlerts.forEach(newAlert => {
        const exists = alerts.some(alert => 
          alert.type === newAlert.type && 
          alert.title === newAlert.title && 
          (Date.now() - new Date(alert.timestamp).getTime()) < 5000
        );
        if (!exists) {
          setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
        }
      });
    }
  }, [sensorData, alerts]);

  const criticalCount = alerts.filter(a => a.type === 'critical').length;

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Real-time Alerts ({alerts.length})</h3>
        {criticalCount > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {criticalCount} Critical
          </Badge>
        )}
      </div>

      {/* Active Alerts */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <p>All systems operating normally</p>
          </div>
        ) : (
          alerts.map(alert => (
            <AlertCard 
              key={alert.id}
              variant={alert.type}
              title={alert.title}
              message={alert.message}
              timestamp={alert.timestamp}
            />
          ))
        )}
      </div>
    </div>
  );
};