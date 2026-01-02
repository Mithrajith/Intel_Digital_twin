import React, { useState, useEffect, useRef, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

const RealTimeCharts = ({ machineId = 'robot_01' }) => {
  const [data, setData] = useState({
    timestamps: [],
    temperature: [],
    vibration: [],
    power: []
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [refreshRate, setRefreshRate] = useState(100); // ms
  const [maxPoints, setMaxPoints] = useState(100);
  const [selectedMetrics, setSelectedMetrics] = useState({
    temperature: true,
    vibration: true,
    power: true
  });
  
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      wsRef.current = new WebSocket(`ws://localhost:7000/ws/machines/${machineId}`);
      
      wsRef.current.onmessage = (event) => {
        if (!isPlaying) return;
        
        const newData = JSON.parse(event.data);
        const timestamp = new Date(newData.timestamp * 1000);
        
        setData(prev => {
          const updated = {
            timestamps: [...prev.timestamps, timestamp],
            temperature: [...prev.temperature, newData.temperature_core || 0],
            vibration: [...prev.vibration, newData.vibration_level || 0],
            power: [...prev.power, newData.power_consumption || 0]
          };
          
          // Keep only the last maxPoints
          Object.keys(updated).forEach(key => {
            if (updated[key].length > maxPoints) {
              updated[key] = updated[key].slice(-maxPoints);
            }
          });
          
          return updated;
        });
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [machineId, isPlaying, maxPoints]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const clearData = () => {
    setData({
      timestamps: [],
      temperature: [],
      vibration: [],
      power: []
    });
  };

  const generatePlotData = () => {
    const traces = [];
    
    if (selectedMetrics.temperature) {
      traces.push({
        x: data.timestamps,
        y: data.temperature,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Temperature (°C)',
        line: { color: '#ef4444', width: 2 },
        marker: { size: 3 },
        yaxis: 'y'
      });
    }
    
    if (selectedMetrics.vibration) {
      traces.push({
        x: data.timestamps,
        y: data.vibration,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Vibration (g)',
        line: { color: '#3b82f6', width: 2 },
        marker: { size: 3 },
        yaxis: 'y2'
      });
    }
    
    if (selectedMetrics.power) {
      traces.push({
        x: data.timestamps,
        y: data.power,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Power (W)',
        line: { color: '#10b981', width: 2 },
        marker: { size: 3 },
        yaxis: 'y3'
      });
    }
    
    return traces;
  };

  const layout = {
    title: {
      text: `Real-time Sensor Data - ${machineId}`,
      font: { size: 16 }
    },
    showlegend: true,
    legend: {
      x: 0,
      y: 1,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: 'rgba(0,0,0,0.1)',
      borderwidth: 1
    },
    xaxis: {
      title: 'Time',
      type: 'date',
      showgrid: true
    },
    yaxis: {
      title: 'Temperature (°C)',
      titlefont: { color: '#ef4444' },
      tickfont: { color: '#ef4444' },
      side: 'left'
    },
    yaxis2: {
      title: 'Vibration (g)',
      titlefont: { color: '#3b82f6' },
      tickfont: { color: '#3b82f6' },
      overlaying: 'y',
      side: 'right'
    },
    yaxis3: {
      title: 'Power (W)',
      titlefont: { color: '#10b981' },
      tickfont: { color: '#10b981' },
      overlaying: 'y',
      side: 'right',
      anchor: 'free',
      position: 0.95
    },
    margin: { t: 50, r: 100, b: 50, l: 60 },
    height: 500,
    plot_bgcolor: 'rgba(0,0,0,0.05)',
    paper_bgcolor: 'white'
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToAdd: [
      {
        name: 'Multi-Variable Overlay',
        icon: { width: 500, height: 600, path: 'M0,0 L500,0 L500,600 L0,600 Z M100,100 L400,100 L400,200 L100,200 Z M100,300 L400,300 L400,400 L100,400 Z' },
        click: () => setSelectedMetrics(prev => ({ temperature: true, vibration: true, power: true }))
      }
    ],
    modeBarButtonsToRemove: ['select2d', 'lasso2d'],
    scrollZoom: true,
    doubleClick: 'reset+autosize',
    toImageButtonOptions: {
      format: 'png',
      filename: `realtime_data_${new Date().toISOString().split('T')[0]}`,
      height: 600,
      width: 1200,
      scale: 2
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlayback}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isPlaying ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
            {isPlaying ? 'Pause' : 'Resume'}
          </button>
          
          <button
            onClick={clearData}
            className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw size={16} className="mr-2" />
            Clear
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">
            Max Points:
            <input
              type="number"
              value={maxPoints}
              onChange={(e) => setMaxPoints(parseInt(e.target.value) || 100)}
              className="ml-2 w-20 px-2 py-1 border border-gray-300 rounded"
              min="10"
              max="1000"
            />
          </label>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Show:</span>
            {Object.entries(selectedMetrics).map(([metric, enabled]) => (
              <label key={metric} className="flex items-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setSelectedMetrics(prev => ({
                    ...prev,
                    [metric]: e.target.checked
                  }))}
                  className="mr-1"
                />
                <span className="text-sm capitalize">{metric}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative">
        <Plot
          data={generatePlotData()}
          layout={layout}
          config={config}
          style={{ width: '100%' }}
        />
      </div>
      
      {/* Status */}
      <div className="mt-4 text-sm text-gray-600">
        Status: {isPlaying ? '🟢 Live' : '⏸️ Paused'} | 
        Data points: {data.timestamps.length} | 
        Last update: {data.timestamps.length > 0 ? data.timestamps[data.timestamps.length - 1].toLocaleTimeString() : 'N/A'}
      </div>
    </div>
  );
};

export default RealTimeCharts;