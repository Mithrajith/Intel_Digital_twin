import { useState, useEffect, useRef } from 'react';

export function useSimulatedSensor(isPlaying = true, updateInterval = 1000) {
    const [data, setData] = useState([]);
    const timeRef = useRef(0);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            timeRef.current += 1;

            const newDataPoint = {
                time: new Date().toLocaleTimeString(),
                // Sine wave with noise
                jointAngle: 45 + 30 * Math.sin(timeRef.current * 0.1) + (Math.random() - 0.5) * 2,
                torque: 20 + 10 * Math.cos(timeRef.current * 0.1) + (Math.random() - 0.5) * 5,
                temperature: 40 + timeRef.current * 0.05 + (Math.random() - 0.5) * 1, // Slow rise
                vibration: 1 + Math.random() * 0.5,
            };

            setData(prevData => {
                const newData = [...prevData, newDataPoint];
                // Keep last 30 points
                if (newData.length > 30) {
                    return newData.slice(newData.length - 30);
                }
                return newData;
            });
        }, updateInterval);

        return () => clearInterval(interval);
    }, [isPlaying, updateInterval]);

    return data;
}
