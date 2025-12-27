import { useState, useEffect, useRef } from 'react';

export function useSimulatedSensor(isPlaying = true, updateInterval = 1000, machineId = 'robot_01') {
    const [data, setData] = useState([]);
    const timeRef = useRef(0);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!isPlaying) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            return;
        }

        let intervalId = null;

        // Local simulation function
        const startLocalSimulation = () => {
             if (intervalId) clearInterval(intervalId);

             intervalId = setInterval(() => {
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
        };

        // Try to connect to WebSocket
        const connectWebSocket = () => {
            // Close existing connection if any
            if (wsRef.current) {
                wsRef.current.close();
            }

            console.log(`Attempting to connect to ws://localhost:8000/ws/machines/${machineId}`);
            const ws = new WebSocket(`ws://localhost:8000/ws/machines/${machineId}`);

            ws.onopen = () => {
                console.log(`Connected to ${machineId} stream`);
                if (intervalId) clearInterval(intervalId); // Stop local sim if connected
            };

            ws.onmessage = (event) => {
                try {
                    const rawData = JSON.parse(event.data);
                    
                    // Map backend data to frontend expected format
                    // Backend: joint_1_angle, temperature_core, vibration_level, power_consumption
                    // Frontend: jointAngle, temperature, torque, vibration
                    
                    const newDataPoint = {
                        time: new Date().toLocaleTimeString(),
                        jointAngle: rawData.joint_1_angle || rawData.axis_x_position || 0,
                        temperature: rawData.temperature_core || rawData.tool_temperature || rawData.bearing_temperature || 0,
                        torque: rawData.power_consumption || rawData.spindle_speed || rawData.motor_load || 0, // Mapping power/speed to torque for viz
                        vibration: rawData.vibration_level || rawData.vibration_spindle || 0
                    };

                    setData(prevData => {
                        const newData = [...prevData, newDataPoint];
                        if (newData.length > 30) {
                            return newData.slice(newData.length - 30);
                        }
                        return newData;
                    });
                } catch (e) {
                    console.error("Error parsing WS data", e);
                }
            };

            ws.onerror = (error) => {
                console.warn("WebSocket error, falling back to local simulation");
                // Don't close here, let onclose handle it or just start local sim
                startLocalSimulation();
            };

            ws.onclose = () => {
                console.log("WebSocket closed");
                wsRef.current = null;
                // If connection closes unexpectedly (and we are still playing), fall back to local simulation
                // We check ws.readyState to ensure we aren't in the middle of a manual close
                if (isPlaying) {
                   startLocalSimulation();
                }
            };

            wsRef.current = ws;
        };

        // Attempt connection
        connectWebSocket();

        // Cleanup
        return () => {
            if (wsRef.current) {
                // Prevent onclose from triggering fallback when we manually close
                wsRef.current.onclose = null;
                wsRef.current.close();
                wsRef.current = null;
            }
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPlaying, updateInterval, machineId]);

    return data;
}
