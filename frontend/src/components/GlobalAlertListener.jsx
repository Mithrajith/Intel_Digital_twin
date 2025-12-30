import React, { useEffect, useRef } from 'react';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import { useToast } from '../contexts/ToastContext';

export function GlobalAlertListener() {
    const { addToast } = useToast();
    // Use a slower refresh rate for global alerts to avoid overwhelming the user
    const data = useSimulatedSensor(true, 2000); 
    const lastAlertRef = useRef(null);

    useEffect(() => {
        if (data.length > 0) {
            const latest = data[data.length - 1];
            
            if (latest.raw && latest.raw.alerts && latest.raw.alerts.length > 0) {
                // Get the most critical alert
                // Prioritize critical over warning
                const criticalAlerts = latest.raw.alerts.filter(a => a.type === 'critical');
                const warningAlerts = latest.raw.alerts.filter(a => a.type === 'warning');
                
                const activeAlerts = [...criticalAlerts, ...warningAlerts];
                
                if (activeAlerts.length > 0) {
                    const topAlert = activeAlerts[0];
                    const alertKey = `${topAlert.title}-${topAlert.message}`;
                    
                    // Only show if it's different from the last one we showed
                    // or if it's been a while (e.g. 10 seconds) - but here we just check equality for simplicity
                    // to avoid spamming the same toast every second.
                    
                    // A better approach: Store a timestamp of when we last showed this specific alert key
                    const now = Date.now();
                    const lastShown = lastAlertRef.current ? lastAlertRef.current[alertKey] : 0;
                    
                    if (!lastShown || (now - lastShown > 10000)) { // 10 seconds cooldown
                        addToast({
                            type: topAlert.type,
                            title: topAlert.title,
                            message: topAlert.message,
                            duration: 5000
                        });
                        
                        lastAlertRef.current = {
                            ...lastAlertRef.current,
                            [alertKey]: now
                        };
                    }
                }
            }
        }
    }, [data, addToast]);

    return null; // This component doesn't render anything visible
}
